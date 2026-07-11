"""
Setup Compra - Scanner de sinais sobre todos os pares spot de uma exchange.

Replica fielmente a logica do indicador Pine "Setup Compra":
  - RSI(14) entre rsi_min e rsi_max (Wilder smoothing, igual ta.rsi do Pine)
  - Close dentro de +/- distance_pct% da EMA(80) (igual ta.ema do Pine)
  - Volume change vs SMA(20) do volume entre vol_min% e vol_max%
  - Trigger: high atual > high da barra anterior

Filtro BTC (informativo, nao corta sinais):
  - BTC daily close > EMA(20) -> bullish
  - BTC current low >= previous low -> estrutura ascendente

Uso:
    python bot.py                    # scan unico, lista, salva, sai
    python bot.py --loop             # roda a cada fechamento de 4h UTC
    python bot.py --validate BTCUSDT # debug: imprime todos os valores intermediarios
"""

from __future__ import annotations

import argparse
import json
import logging
import platform
import sys
import time
import traceback
from datetime import datetime, timezone, timedelta
from logging.handlers import RotatingFileHandler
from pathlib import Path

import ccxt
import pandas as pd


HERE = Path(__file__).resolve().parent
CONFIG_PATH = HERE / "config.json"
OUTPUT_PATH = HERE / "sinais.txt"
LOG_PATH = HERE / "bot.log"
ERRORS_PATH = HERE / "erros.log"


# ------------------------------------------------------------------
# Logging - bot.log (info+) e erros.log (warnings+)
# ------------------------------------------------------------------

logger = logging.getLogger("setup_compra")


def setup_logging(verbose: bool = False) -> None:
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    logger.handlers.clear()

    fmt = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    full_handler = RotatingFileHandler(
        LOG_PATH, maxBytes=2_000_000, backupCount=3, encoding="utf-8"
    )
    full_handler.setLevel(logging.DEBUG)
    full_handler.setFormatter(fmt)
    logger.addHandler(full_handler)

    error_handler = RotatingFileHandler(
        ERRORS_PATH, maxBytes=2_000_000, backupCount=3, encoding="utf-8"
    )
    error_handler.setLevel(logging.WARNING)
    error_handler.setFormatter(fmt)
    logger.addHandler(error_handler)


def log_run_header(cfg: dict, mode: str) -> None:
    logger.info("=" * 70)
    logger.info(f"NOVA EXECUCAO - modo: {mode}")
    logger.info(f"OS: {platform.system()} {platform.release()} | Python: {platform.python_version()}")
    logger.info(f"ccxt: {ccxt.__version__} | pandas: {pd.__version__}")
    logger.info(f"config: {json.dumps(cfg, ensure_ascii=False)}")
    logger.info("=" * 70)


# ------------------------------------------------------------------
# Calculo dos indicadores - implementacao identica ao Pine v5
# ------------------------------------------------------------------

def pine_ema(series: pd.Series, length: int) -> pd.Series:
    """ta.ema do Pine: alpha = 2/(length+1), seed nao-ajustado."""
    return series.ewm(alpha=2.0 / (length + 1), adjust=False).mean()


def pine_sma(series: pd.Series, length: int) -> pd.Series:
    """ta.sma do Pine."""
    return series.rolling(window=length, min_periods=length).mean()


def pine_rma(series: pd.Series, length: int) -> pd.Series:
    """ta.rma do Pine (Wilder smoothing): alpha = 1/length."""
    return series.ewm(alpha=1.0 / length, adjust=False).mean()


def pine_rsi(close: pd.Series, length: int = 14) -> pd.Series:
    """ta.rsi do Pine: usa RMA (Wilder) sobre ganhos e perdas."""
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = pine_rma(gain, length)
    avg_loss = pine_rma(loss, length)
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


SUPPORTED_MA_TYPES = ("EMA", "SMA")


def compute_ma(series: pd.Series, ma_type: str, length: int) -> pd.Series:
    """Despacha calculo de media baseado no tipo configurado."""
    ma_type = ma_type.upper()
    if ma_type == "EMA":
        return pine_ema(series, length)
    if ma_type == "SMA":
        return pine_sma(series, length)
    raise ValueError(
        f"ma.type '{ma_type}' nao suportado. Use um destes: {', '.join(SUPPORTED_MA_TYPES)}"
    )


# ------------------------------------------------------------------
# Config + exchange
# ------------------------------------------------------------------

SUPPORTED_TIMEFRAMES = ("5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M")

DEFAULT_CONFIG = {
    "exchange": "binance",
    "quote_filter": "USDT",
    "timeframe": "4h",
    "rsi": {"length": 14, "min": 40.0, "max": 57.0},
    "ma": {"type": "EMA", "length": 80},
    "distance_pct": 2.0,
    "volume": {"length": 20, "min": 0.0, "max": 500.0},
    "btc": {
        "symbol": "BTC/USDT",
        "timeframe": "1d",
        "ma_length": 20,
        "ma_type": "EMA",
    },
    "fetch_limit": 200,
    "request_delay_ms": 200,
}


def deep_merge_defaults(user: dict, defaults: dict) -> dict:
    """Preenche recursivamente chaves faltantes do user com os defaults.

    Importante: faz merge profundo. Se o usuario tiver `ma: {type: SMA}`
    sem o length, o length vem do default em vez de sumir.
    """
    result = dict(user)
    for k, v in defaults.items():
        if k not in result:
            result[k] = v
        elif isinstance(v, dict) and isinstance(result[k], dict):
            result[k] = deep_merge_defaults(result[k], v)
    return result


def validate_config(cfg: dict) -> None:
    """Valida campos cuja entrada errada causaria erro confuso depois."""
    tf = cfg.get("timeframe")
    if tf not in SUPPORTED_TIMEFRAMES:
        raise SystemExit(
            f"[erro config] timeframe '{tf}' nao suportado.\n"
            f"  Use um destes: {', '.join(SUPPORTED_TIMEFRAMES)}"
        )

    ma_type = str(cfg.get("ma", {}).get("type", "")).upper()
    if ma_type not in SUPPORTED_MA_TYPES:
        raise SystemExit(
            f"[erro config] ma.type '{ma_type}' nao suportado.\n"
            f"  Use um destes: {', '.join(SUPPORTED_MA_TYPES)}"
        )

    btc_ma_type = str(cfg.get("btc", {}).get("ma_type", "")).upper()
    if btc_ma_type not in SUPPORTED_MA_TYPES:
        raise SystemExit(
            f"[erro config] btc.ma_type '{btc_ma_type}' nao suportado.\n"
            f"  Use um destes: {', '.join(SUPPORTED_MA_TYPES)}"
        )


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        CONFIG_PATH.write_text(json.dumps(DEFAULT_CONFIG, indent=2), encoding="utf-8")
        print(f"[info] config.json criado com defaults em {CONFIG_PATH}")
        return dict(DEFAULT_CONFIG)
    with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
        cfg = json.load(fh)
    cfg = deep_merge_defaults(cfg, DEFAULT_CONFIG)
    validate_config(cfg)
    return cfg


def init_exchange(name: str):
    if not hasattr(ccxt, name):
        raise SystemExit(f"Exchange '{name}' nao suportada por CCXT.")
    klass = getattr(ccxt, name)
    ex = klass({"enableRateLimit": True, "timeout": 20000})
    return ex


def list_spot_pairs(exchange, quote_filter: str) -> list[str]:
    markets = exchange.load_markets()
    pairs: list[str] = []
    for sym, m in markets.items():
        if not m.get("spot"):
            continue
        if not m.get("active", True):
            continue
        if quote_filter and quote_filter.upper() != "ALL":
            if m.get("quote") != quote_filter.upper():
                continue
        pairs.append(sym)
    pairs.sort()
    return pairs


def fetch_ohlcv_df(exchange, symbol: str, timeframe: str, limit: int) -> pd.DataFrame:
    raw = exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
    df = pd.DataFrame(raw, columns=["ts", "open", "high", "low", "close", "volume"])
    df["dt"] = pd.to_datetime(df["ts"], unit="ms", utc=True)
    return df


def is_bar_closed(timestamp_ms: int, timeframe: str) -> bool:
    """Verifica se a barra cujo open eh timestamp_ms ja fechou."""
    tf_ms = ccxt.Exchange.parse_timeframe(timeframe) * 1000
    now_ms = int(time.time() * 1000)
    return (timestamp_ms + tf_ms) <= now_ms


def closed_bar_index(df: pd.DataFrame, timeframe: str) -> int:
    """Retorna o indice da ultima barra fechada (skip barra em formacao)."""
    last_idx = len(df) - 1
    if last_idx < 0:
        return -1
    if is_bar_closed(int(df.iloc[last_idx]["ts"]), timeframe):
        return last_idx
    return last_idx - 1


# ------------------------------------------------------------------
# Analise por simbolo
# ------------------------------------------------------------------

def analyze_symbol(df: pd.DataFrame, cfg: dict, timeframe: str) -> dict | None:
    """Roda toda a logica do indicador Setup Compra na ultima barra fechada."""
    if len(df) < cfg["ma"]["length"] + 5:
        return None

    close = df["close"]
    high = df["high"]
    volume = df["volume"]

    ma_value = compute_ma(close, cfg["ma"]["type"], cfg["ma"]["length"])
    rsi_value = pine_rsi(close, cfg["rsi"]["length"])
    vol_ma = pine_sma(volume, cfg["volume"]["length"])
    vol_change = ((volume - vol_ma) / vol_ma) * 100.0

    idx = closed_bar_index(df, timeframe)
    if idx < 1:
        return None

    rsi_v = rsi_value.iloc[idx]
    ma_v = ma_value.iloc[idx]
    close_v = close.iloc[idx]
    vol_change_v = vol_change.iloc[idx]
    high_v = high.iloc[idx]
    high_prev = high.iloc[idx - 1]

    if pd.isna(rsi_v) or pd.isna(ma_v) or pd.isna(vol_change_v):
        return None

    distance_pct = (close_v - ma_v) / ma_v * 100.0
    upper_limit = ma_v * (1 + cfg["distance_pct"] / 100.0)
    lower_limit = ma_v * (1 - cfg["distance_pct"] / 100.0)

    rsi_cond = cfg["rsi"]["min"] <= rsi_v <= cfg["rsi"]["max"]
    price_cond = lower_limit <= close_v <= upper_limit
    vol_cond = cfg["volume"]["min"] <= vol_change_v <= cfg["volume"]["max"]
    base_cond = rsi_cond and price_cond and vol_cond
    trigger = high_v > high_prev
    buy_signal = base_cond and trigger

    return {
        "ts": int(df.iloc[idx]["ts"]),
        "dt": df.iloc[idx]["dt"].to_pydatetime(),
        "close": float(close_v),
        "rsi": float(rsi_v),
        "ema": float(ma_v),
        "distance_pct": float(distance_pct),
        "vol_change_pct": float(vol_change_v),
        "high": float(high_v),
        "high_prev": float(high_prev),
        "rsi_cond": bool(rsi_cond),
        "price_cond": bool(price_cond),
        "vol_cond": bool(vol_cond),
        "trigger": bool(trigger),
        "buy_signal": bool(buy_signal),
    }


# ------------------------------------------------------------------
# Filtro BTC (informativo)
# ------------------------------------------------------------------

def get_btc_status(exchange, cfg: dict) -> dict:
    btc_cfg = cfg["btc"]
    try:
        df = fetch_ohlcv_df(exchange, btc_cfg["symbol"], btc_cfg["timeframe"], 200)
    except Exception as err:
        return {"error": str(err)}

    ma_type = btc_cfg["ma_type"].upper()
    ma = compute_ma(df["close"], ma_type, btc_cfg["ma_length"])

    idx = closed_bar_index(df, btc_cfg["timeframe"])
    if idx < 1:
        return {"error": "barras insuficientes"}

    close_v = float(df["close"].iloc[idx])
    ma_v = float(ma.iloc[idx])
    low_v = float(df["low"].iloc[idx])
    low_prev = float(df["low"].iloc[idx - 1])

    return {
        "close": close_v,
        "ma": ma_v,
        "ma_label": f"{ma_type}{btc_cfg['ma_length']}",
        "tf": btc_cfg["timeframe"],
        "bullish": close_v > ma_v,
        "structure_bullish": low_v >= low_prev,
        "low": low_v,
        "low_prev": low_prev,
    }


# ------------------------------------------------------------------
# Modos de execucao
# ------------------------------------------------------------------

def cmd_validate(symbol_arg: str, cfg: dict) -> int:
    """Imprime todos os valores intermediarios para cruzar com TradingView."""
    log_run_header(cfg, f"validate {symbol_arg}")
    exchange = init_exchange(cfg["exchange"])
    exchange.load_markets()

    # Aceita BTCUSDT, BTC/USDT, BTC-USDT
    symbol = symbol_arg.replace("-", "/").upper()
    if "/" not in symbol and symbol.endswith(cfg["quote_filter"].upper()):
        base = symbol[: -len(cfg["quote_filter"])]
        symbol = f"{base}/{cfg['quote_filter']}".upper()

    if symbol not in exchange.markets:
        print(f"[erro] simbolo {symbol} nao encontrado em {cfg['exchange']}")
        logger.error(f"simbolo {symbol} nao encontrado em {cfg['exchange']}")
        return 2

    df = fetch_ohlcv_df(exchange, symbol, cfg["timeframe"], cfg["fetch_limit"])
    res = analyze_symbol(df, cfg, cfg["timeframe"])
    if res is None:
        print("[erro] dados insuficientes para esse simbolo")
        logger.error(f"dados insuficientes para {symbol}")
        return 2

    btc = get_btc_status(exchange, cfg)
    logger.info(f"validate {symbol}: rsi={res['rsi']:.4f} ema={res['ema']:.6f} close={res['close']:.6f} "
                f"dist={res['distance_pct']:+.4f}% vol={res['vol_change_pct']:+.4f}% "
                f"trigger={res['trigger']} buy={res['buy_signal']}")

    bar_dt = res["dt"].astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    print()
    print(f"=== VALIDACAO {symbol} {cfg['timeframe']} ===")
    print(f"Ultima barra fechada: {bar_dt}")
    print()
    print(f"  RSI({cfg['rsi']['length']})        : {res['rsi']:.4f}     (faixa: {cfg['rsi']['min']} a {cfg['rsi']['max']})")
    print(f"  {cfg['ma']['type']}({cfg['ma']['length']})        : {res['ema']:.6f}")
    print(f"  Close           : {res['close']:.6f}")
    print(f"  Distancia {cfg['ma']['type']:<3}   : {res['distance_pct']:+.4f}%   (limite: +/- {cfg['distance_pct']:.2f}%)")
    print(f"  Vol change %    : {res['vol_change_pct']:+.4f}%   (faixa: {cfg['volume']['min']}% a {cfg['volume']['max']}%)")
    print(f"  High atual      : {res['high']:.6f}")
    print(f"  High anterior   : {res['high_prev']:.6f}")
    print(f"  high > high[1]  : {'SIM' if res['trigger'] else 'NAO'}")
    print()
    print(f"  Cond RSI        : {'OK' if res['rsi_cond'] else 'X'}")
    print(f"  Cond Preco      : {'OK' if res['price_cond'] else 'X'}")
    print(f"  Cond Volume     : {'OK' if res['vol_cond'] else 'X'}")
    print(f"  Trigger         : {'OK' if res['trigger'] else 'X'}")
    print()
    print(f"  ==> BUY SIGNAL  : {'ATIVO' if res['buy_signal'] else 'INATIVO'}")
    print()

    if "error" not in btc:
        print(f"  BTC {btc['tf']} {btc['ma_label']:<5}: close={btc['close']:.2f} ma={btc['ma']:.2f}  -> {'BULLISH' if btc['bullish'] else 'BEARISH'}")
        print(f"  BTC {btc['tf']} estrutura : low={btc['low']:.2f} low[1]={btc['low_prev']:.2f}  -> {'ASCENDENTE' if btc['structure_bullish'] else 'DESCENDENTE'}")
    else:
        print(f"  BTC status: erro ({btc['error']})")
    print()
    print("Cruze esses numeros com o Data Window do TradingView no mesmo par e timeframe.")
    print("Os valores devem bater com no minimo 4 casas decimais de precisao.")
    return 0


def cmd_scan(cfg: dict) -> int:
    log_run_header(cfg, "scan")
    exchange = init_exchange(cfg["exchange"])
    print(f"[info] exchange: {cfg['exchange']}  |  quote: {cfg['quote_filter']}  |  tf: {cfg['timeframe']}")
    logger.info(f"exchange={cfg['exchange']} quote={cfg['quote_filter']} tf={cfg['timeframe']}")

    print("[info] carregando lista de mercados...")
    try:
        pairs = list_spot_pairs(exchange, cfg["quote_filter"])
    except Exception as err:
        logger.error(f"falha ao carregar mercados: {err}")
        logger.error(traceback.format_exc())
        print(f"[ERRO] falha ao carregar mercados: {err}")
        print(f"[ERRO] detalhes em {LOG_PATH.name}")
        return 1

    print(f"[info] {len(pairs)} pares spot encontrados.")
    logger.info(f"{len(pairs)} pares spot listados")

    print("[info] buscando status do BTC (filtro informativo)...")
    btc = get_btc_status(exchange, cfg)
    if "error" in btc:
        print(f"[aviso] BTC status indisponivel: {btc['error']}")
        logger.warning(f"BTC status indisponivel: {btc['error']}")

    delay = cfg.get("request_delay_ms", 200) / 1000.0
    signals: list[dict] = []
    errors: list[tuple[str, str]] = []
    rate_limit_hits = 0
    started = time.time()

    for i, sym in enumerate(pairs, 1):
        try:
            df = fetch_ohlcv_df(exchange, sym, cfg["timeframe"], cfg["fetch_limit"])
            res = analyze_symbol(df, cfg, cfg["timeframe"])
            if res and res["buy_signal"]:
                res["symbol"] = sym
                signals.append(res)
                logger.info(f"BUY signal: {sym} close={res['close']} rsi={res['rsi']:.2f} dist={res['distance_pct']:+.2f}% vol={res['vol_change_pct']:+.2f}%")
        except ccxt.RateLimitExceeded as err:
            rate_limit_hits += 1
            logger.warning(f"rate limit em {sym}: {err}")
            time.sleep(2.0)
        except Exception as err:
            err_short = str(err)[:120]
            errors.append((sym, err_short))
            logger.error(f"erro em {sym}: {err_short}")
            logger.debug(traceback.format_exc())

        if i % 50 == 0 or i == len(pairs):
            elapsed = time.time() - started
            print(f"[scan] {i}/{len(pairs)}  ({elapsed:.0f}s)  sinais={len(signals)}  erros={len(errors)}")

        time.sleep(delay)

    elapsed_total = time.time() - started
    logger.info(f"varredura concluida em {elapsed_total:.0f}s | sinais={len(signals)} | erros={len(errors)} | rate_limits={rate_limit_hits}")

    print_report(signals, btc, cfg, len(pairs), len(errors))
    save_report(signals, btc, cfg, len(pairs), len(errors))

    if errors:
        print(f"[aviso] {len(errors)} erros (primeiros 5 abaixo, todos em {ERRORS_PATH.name}):")
        for sym, msg in errors[:5]:
            print(f"   - {sym}: {msg}")
    return 0


def print_report(signals, btc, cfg, total_scanned, errors_count):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    signals_sorted = sorted(signals, key=lambda r: r["distance_pct"])

    print()
    print("=" * 78)
    print(f"RELATORIO SETUP COMPRA  |  {cfg['exchange'].upper()} {cfg['quote_filter']} {cfg['timeframe']}  |  {now}")
    print("=" * 78)
    if "error" not in btc:
        b1 = "BULLISH" if btc["bullish"] else "BEARISH"
        b2 = "ASCENDENTE" if btc["structure_bullish"] else "DESCENDENTE"
        print(f"BTC {btc['tf']} {btc['ma_label']}: {b1}  |  Estrutura: {b2}")
    print(f"Pares varridos: {total_scanned}  |  Sinais: {len(signals)}  |  Erros: {errors_count}")
    print("-" * 78)

    if not signals_sorted:
        print("Nenhum sinal de compra na barra atual.")
        print("=" * 78)
        return

    ma_label = f"{cfg['ma']['type']}{cfg['ma']['length']}"
    header = f"{'#':<3} {'PAR':<16} {'CLOSE':>14} {'RSI':>7} {'DIST%':>8} {'VOL%':>9} {ma_label:>14}"
    print(header)
    print("-" * len(header))
    for i, s in enumerate(signals_sorted, 1):
        print(f"{i:<3} {s['symbol']:<16} {s['close']:>14.6f} {s['rsi']:>7.2f} "
              f"{s['distance_pct']:>+7.2f}% {s['vol_change_pct']:>+8.2f}% {s['ema']:>14.6f}")
    print("=" * 78)


def save_report(signals, btc, cfg, total_scanned, errors_count):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    signals_sorted = sorted(signals, key=lambda r: r["distance_pct"])

    lines: list[str] = []
    lines.append("=" * 78)
    lines.append(f"RELATORIO SETUP COMPRA  |  {cfg['exchange'].upper()} {cfg['quote_filter']} {cfg['timeframe']}  |  {now}")
    lines.append("=" * 78)
    if "error" not in btc:
        b1 = "BULLISH" if btc["bullish"] else "BEARISH"
        b2 = "ASCENDENTE" if btc["structure_bullish"] else "DESCENDENTE"
        lines.append(f"BTC {btc['tf']} {btc['ma_label']}: {b1}  |  Estrutura: {b2}")
    lines.append(f"Pares varridos: {total_scanned}  |  Sinais: {len(signals)}  |  Erros: {errors_count}")
    lines.append("-" * 78)

    if not signals_sorted:
        lines.append("Nenhum sinal de compra na barra atual.")
    else:
        ma_label = f"{cfg['ma']['type']}{cfg['ma']['length']}"
        lines.append(f"{'#':<3} {'PAR':<16} {'CLOSE':>14} {'RSI':>7} {'DIST%':>8} {'VOL%':>9} {ma_label:>14}")
        lines.append("-" * 78)
        for i, s in enumerate(signals_sorted, 1):
            lines.append(f"{i:<3} {s['symbol']:<16} {s['close']:>14.6f} {s['rsi']:>7.2f} "
                         f"{s['distance_pct']:>+7.2f}% {s['vol_change_pct']:>+8.2f}% {s['ema']:>14.6f}")
    lines.append("=" * 78)
    lines.append("")

    with open(OUTPUT_PATH, "a", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"[info] relatorio acrescentado em {OUTPUT_PATH}")


# ------------------------------------------------------------------
# Loop: aguarda fechamento de cada barra do timeframe
# ------------------------------------------------------------------

def seconds_until_next_bar(timeframe: str, buffer_seconds: int = 30) -> int:
    """Retorna segundos ate o proximo fechamento de barra UTC + buffer."""
    tf_seconds = ccxt.Exchange.parse_timeframe(timeframe)
    now = datetime.now(timezone.utc)
    epoch = int(now.timestamp())
    remainder = epoch % tf_seconds
    sleep_for = tf_seconds - remainder + buffer_seconds
    return sleep_for


def cmd_loop(cfg: dict) -> int:
    print(f"[loop] iniciando. Timeframe = {cfg['timeframe']}.")
    print("[loop] Ctrl+C para parar.")
    while True:
        cmd_scan(cfg)
        sleep_for = seconds_until_next_bar(cfg["timeframe"])
        next_run = datetime.now(timezone.utc) + timedelta(seconds=sleep_for)
        print(f"[loop] proxima varredura em {sleep_for}s ({next_run.strftime('%Y-%m-%d %H:%M UTC')})")
        try:
            time.sleep(sleep_for)
        except KeyboardInterrupt:
            print("\n[loop] interrompido pelo usuario.")
            return 0


# ------------------------------------------------------------------
# Entrypoint
# ------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Setup Compra - scanner de sinais")
    parser.add_argument("--loop", action="store_true",
                        help="Roda continuamente, varre a cada fechamento de barra")
    parser.add_argument("--validate", metavar="SYMBOL",
                        help="Modo debug: imprime todos os valores intermediarios para 1 simbolo")
    parser.add_argument("--verbose", action="store_true",
                        help="Logs em nivel DEBUG (mais verboso em bot.log)")
    args = parser.parse_args()

    setup_logging(verbose=args.verbose)

    cfg = load_config()

    if args.validate:
        return cmd_validate(args.validate, cfg)
    if args.loop:
        return cmd_loop(cfg)
    return cmd_scan(cfg)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n[bot] interrompido.")
        if logger.handlers:
            logger.info("interrompido pelo usuario (Ctrl+C)")
        sys.exit(130)
    except Exception as fatal_err:
        print(f"\n[ERRO FATAL] {fatal_err}")
        print(f"[ERRO FATAL] detalhes em {LOG_PATH.name} e {ERRORS_PATH.name}")
        if logger.handlers:
            logger.critical(f"ERRO FATAL: {fatal_err}")
            logger.critical(traceback.format_exc())
        else:
            traceback.print_exc()
        try:
            input("\nPressione Enter para fechar...")
        except Exception:
            pass
        sys.exit(1)
