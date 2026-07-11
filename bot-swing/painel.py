"""
Painel Streamlit para o bot Setup Compra.

Reaproveita toda a logica do bot.py:
- Formulario de configuracao na sidebar (salva em config.json)
- Botao "Rodar Varredura" que executa cmd_scan equivalente em foreground
  com barra de progresso ao vivo
- Tabela de sinais filtravel/ordenavel
- Status do BTC
- Historico de sinais.txt

Uso:
    streamlit run painel.py
"""

from __future__ import annotations

import json
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import streamlit as st

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import bot  # noqa: E402  (importa o codigo do bot.py ao lado)


# ------------------------------------------------------------------
# Setup da pagina
# ------------------------------------------------------------------

st.set_page_config(
    page_title="Setup Compra - Painel",
    page_icon=None,
    layout="wide",
)

# Inicializa estado da sessao
for key, default in [
    ("last_signals", None),
    ("last_btc", None),
    ("last_run_time", None),
    ("last_total", 0),
    ("last_errors", []),
    ("last_elapsed", 0.0),
    ("scan_running", False),
]:
    if key not in st.session_state:
        st.session_state[key] = default


def save_config(new_cfg: dict) -> None:
    """Valida e grava em config.json."""
    bot.validate_config(new_cfg)
    bot.CONFIG_PATH.write_text(json.dumps(new_cfg, indent=2), encoding="utf-8")


def load_current_config() -> dict:
    return bot.load_config()


# ------------------------------------------------------------------
# Sidebar - formulario de configuracao
# ------------------------------------------------------------------

cfg = load_current_config()

st.sidebar.title("Configuracao")
st.sidebar.caption("Tudo aqui salva no config.json. Defaults vem do indicador Pine Setup Compra.")

tf_options = list(bot.SUPPORTED_TIMEFRAMES)
ma_type_options = list(bot.SUPPORTED_MA_TYPES)

with st.sidebar.form("config_form", clear_on_submit=False):
    st.subheader("Exchange")
    exchange = st.text_input("Exchange (ccxt id)", value=cfg["exchange"])
    quote = st.text_input("Quote asset (USDT, USDC, ALL)", value=cfg["quote_filter"])
    timeframe = st.selectbox(
        "Timeframe",
        options=tf_options,
        index=tf_options.index(cfg["timeframe"]) if cfg["timeframe"] in tf_options else 4,
    )

    st.subheader("RSI")
    rsi_length = st.number_input("Periodo RSI", min_value=2, max_value=200, value=int(cfg["rsi"]["length"]), step=1)
    rsi_min = st.number_input("RSI minimo", min_value=0.0, max_value=100.0, value=float(cfg["rsi"]["min"]), step=1.0)
    rsi_max = st.number_input("RSI maximo", min_value=0.0, max_value=100.0, value=float(cfg["rsi"]["max"]), step=1.0)

    st.subheader("Media movel")
    ma_type = st.selectbox(
        "Tipo",
        options=ma_type_options,
        index=ma_type_options.index(cfg["ma"]["type"].upper()) if cfg["ma"]["type"].upper() in ma_type_options else 0,
    )
    ma_length = st.number_input("Periodo MA", min_value=2, max_value=500, value=int(cfg["ma"]["length"]), step=1)
    distance_pct = st.number_input("Distancia +/- % do close ate a MA", min_value=0.0, max_value=50.0,
                                   value=float(cfg["distance_pct"]), step=0.1)

    st.subheader("Volume")
    vol_length = st.number_input("Periodo SMA do volume", min_value=2, max_value=200,
                                 value=int(cfg["volume"]["length"]), step=1)
    vol_min = st.number_input("Volume change minimo (%)", min_value=-100.0, max_value=10000.0,
                              value=float(cfg["volume"]["min"]), step=10.0)
    vol_max = st.number_input("Volume change maximo (%)", min_value=-100.0, max_value=10000.0,
                              value=float(cfg["volume"]["max"]), step=10.0)

    st.subheader("Filtro BTC (informativo)")
    btc_symbol = st.text_input("Simbolo BTC", value=cfg["btc"]["symbol"])
    btc_tf = st.selectbox(
        "Timeframe BTC",
        options=tf_options,
        index=tf_options.index(cfg["btc"]["timeframe"]) if cfg["btc"]["timeframe"] in tf_options else 5,
    )
    btc_ma_type = st.selectbox(
        "Tipo MA BTC",
        options=ma_type_options,
        index=ma_type_options.index(cfg["btc"]["ma_type"].upper()) if cfg["btc"]["ma_type"].upper() in ma_type_options else 0,
    )
    btc_ma_length = st.number_input("Periodo MA BTC", min_value=2, max_value=500,
                                    value=int(cfg["btc"]["ma_length"]), step=1)

    st.subheader("Avancado")
    fetch_limit = st.number_input("Fetch limit (candles por par)", min_value=50, max_value=1500,
                                  value=int(cfg.get("fetch_limit", 200)), step=50)
    request_delay_ms = st.number_input("Delay entre requests (ms)", min_value=0, max_value=5000,
                                       value=int(cfg.get("request_delay_ms", 200)), step=50)

    saved = st.form_submit_button("Salvar configuracao", use_container_width=True, type="primary")

if saved:
    new_cfg = {
        "exchange": exchange.strip().lower() or "binance",
        "quote_filter": quote.strip().upper() or "USDT",
        "timeframe": timeframe,
        "rsi": {"length": int(rsi_length), "min": float(rsi_min), "max": float(rsi_max)},
        "ma": {"type": ma_type, "length": int(ma_length)},
        "distance_pct": float(distance_pct),
        "volume": {"length": int(vol_length), "min": float(vol_min), "max": float(vol_max)},
        "btc": {
            "symbol": btc_symbol.strip(),
            "timeframe": btc_tf,
            "ma_length": int(btc_ma_length),
            "ma_type": btc_ma_type,
        },
        "fetch_limit": int(fetch_limit),
        "request_delay_ms": int(request_delay_ms),
    }
    try:
        save_config(new_cfg)
        st.sidebar.success("config.json salvo.")
        time.sleep(0.5)
        st.rerun()
    except SystemExit as err:
        st.sidebar.error(str(err))
    except Exception as err:
        st.sidebar.error(f"Falha ao salvar: {err}")


# ------------------------------------------------------------------
# Cabecalho
# ------------------------------------------------------------------

st.title("Setup Compra - Painel")

cfg = load_current_config()  # recarrega caso tenha salvado
st.caption(
    f"Config ativa: **{cfg['exchange'].upper()}** {cfg['quote_filter']} {cfg['timeframe']}  |  "
    f"{cfg['ma']['type']}{cfg['ma']['length']} +/- {cfg['distance_pct']}%  |  "
    f"RSI({cfg['rsi']['length']}) {cfg['rsi']['min']:g}-{cfg['rsi']['max']:g}  |  "
    f"Vol SMA{cfg['volume']['length']} {cfg['volume']['min']:g}%-{cfg['volume']['max']:g}%"
)


# ------------------------------------------------------------------
# Botoes de acao
# ------------------------------------------------------------------

col_run, col_clear, col_validate = st.columns([1, 1, 2])

run_btn = col_run.button(
    "Rodar varredura",
    type="primary",
    use_container_width=True,
    disabled=st.session_state.scan_running,
)
clear_btn = col_clear.button(
    "Limpar resultado",
    use_container_width=True,
    disabled=st.session_state.scan_running,
)
validate_symbol = col_validate.text_input(
    "Validar 1 simbolo (ex: BTCUSDT)",
    value="",
    label_visibility="collapsed",
    placeholder="Validar 1 simbolo (ex: BTCUSDT) - opcional",
)
validate_btn = col_validate.button("Validar simbolo", use_container_width=True,
                                    disabled=st.session_state.scan_running or not validate_symbol.strip())


if clear_btn:
    st.session_state.last_signals = None
    st.session_state.last_btc = None
    st.session_state.last_run_time = None
    st.session_state.last_total = 0
    st.session_state.last_errors = []
    st.session_state.last_elapsed = 0.0
    st.rerun()


# ------------------------------------------------------------------
# Acao: rodar varredura completa
# ------------------------------------------------------------------

def run_scan(cfg: dict) -> None:
    """Executa scan inline com progresso visivel no painel."""
    st.session_state.scan_running = True
    bot.setup_logging(verbose=False)
    bot.log_run_header(cfg, "scan (painel)")

    progress = st.progress(0.0, text="Carregando lista de mercados...")
    status_box = st.empty()

    try:
        ex = bot.init_exchange(cfg["exchange"])
        pairs = bot.list_spot_pairs(ex, cfg["quote_filter"])
        total = len(pairs)
        if total == 0:
            status_box.warning("Nenhum par encontrado para essa combinacao exchange/quote.")
            return

        status_box.info(f"{total} pares encontrados. Buscando status BTC...")
        btc = bot.get_btc_status(ex, cfg)

        delay = cfg.get("request_delay_ms", 200) / 1000.0
        signals: list[dict] = []
        errors: list[tuple[str, str]] = []
        started = time.time()

        for i, sym in enumerate(pairs, 1):
            try:
                df = bot.fetch_ohlcv_df(ex, sym, cfg["timeframe"], cfg["fetch_limit"])
                res = bot.analyze_symbol(df, cfg, cfg["timeframe"])
                if res and res["buy_signal"]:
                    res["symbol"] = sym
                    signals.append(res)
            except Exception as err:
                errors.append((sym, str(err)[:120]))

            if i % 5 == 0 or i == total:
                pct = i / total
                elapsed = time.time() - started
                progress.progress(
                    pct,
                    text=f"{i}/{total} ({elapsed:.0f}s)  -  sinais: {len(signals)}  -  erros: {len(errors)}",
                )

            time.sleep(delay)

        elapsed_total = time.time() - started
        progress.progress(1.0, text=f"Concluido em {elapsed_total:.0f}s")

        st.session_state.last_signals = signals
        st.session_state.last_btc = btc
        st.session_state.last_run_time = datetime.now(timezone.utc)
        st.session_state.last_total = total
        st.session_state.last_errors = errors
        st.session_state.last_elapsed = elapsed_total

        bot.save_report(signals, btc, cfg, total, len(errors))

        if signals:
            status_box.success(f"{len(signals)} sinal(is) encontrado(s) em {total} pares ({elapsed_total:.0f}s).")
        else:
            status_box.info(f"Nenhum sinal de compra. {total} pares varridos em {elapsed_total:.0f}s.")
    except Exception as err:
        status_box.error(f"Falha na varredura: {err}")
        st.code(traceback.format_exc())
    finally:
        st.session_state.scan_running = False


if run_btn:
    run_scan(cfg)


# ------------------------------------------------------------------
# Acao: validar 1 simbolo (igual ao --validate)
# ------------------------------------------------------------------

if validate_btn and validate_symbol.strip():
    with st.spinner(f"Validando {validate_symbol.upper()}..."):
        try:
            ex = bot.init_exchange(cfg["exchange"])
            ex.load_markets()
            sym = validate_symbol.strip().replace("-", "/").upper()
            if "/" not in sym and sym.endswith(cfg["quote_filter"].upper()):
                base = sym[: -len(cfg["quote_filter"])]
                sym = f"{base}/{cfg['quote_filter']}".upper()
            if sym not in ex.markets:
                st.error(f"Simbolo {sym} nao encontrado em {cfg['exchange']}.")
            else:
                df = bot.fetch_ohlcv_df(ex, sym, cfg["timeframe"], cfg["fetch_limit"])
                res = bot.analyze_symbol(df, cfg, cfg["timeframe"])
                if res is None:
                    st.error("Dados insuficientes para esse simbolo.")
                else:
                    bar_dt = res["dt"].astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
                    cols = st.columns(4)
                    cols[0].metric("RSI", f"{res['rsi']:.4f}",
                                   "OK" if res["rsi_cond"] else "fora")
                    cols[1].metric(f"{cfg['ma']['type']}{cfg['ma']['length']}", f"{res['ema']:.6f}")
                    cols[2].metric("Close", f"{res['close']:.6f}",
                                   f"{res['distance_pct']:+.4f}%")
                    cols[3].metric("Vol change", f"{res['vol_change_pct']:+.2f}%",
                                   "OK" if res["vol_cond"] else "fora")

                    st.markdown(f"**Barra:** {bar_dt}  |  **High atual:** {res['high']:.6f}  |  "
                                f"**High anterior:** {res['high_prev']:.6f}  |  "
                                f"**high>high[1]:** {'SIM' if res['trigger'] else 'NAO'}")
                    if res["buy_signal"]:
                        st.success(f"BUY SIGNAL ATIVO em {sym}.")
                    else:
                        st.info(f"Sem sinal em {sym} na ultima barra fechada.")
        except Exception as err:
            st.error(f"Falha ao validar: {err}")
            st.code(traceback.format_exc())


# ------------------------------------------------------------------
# Resultado da ultima varredura
# ------------------------------------------------------------------

st.divider()
st.subheader("Ultima varredura")

if st.session_state.last_run_time is None:
    st.caption("Nenhuma varredura nesta sessao ainda. Clique em 'Rodar varredura' para comecar.")
else:
    run_time_str = st.session_state.last_run_time.strftime("%Y-%m-%d %H:%M UTC")
    btc = st.session_state.last_btc

    info_cols = st.columns(4)
    info_cols[0].metric("Pares varridos", st.session_state.last_total)
    info_cols[1].metric("Sinais", len(st.session_state.last_signals or []))
    info_cols[2].metric("Erros", len(st.session_state.last_errors or []))
    info_cols[3].metric("Tempo", f"{st.session_state.last_elapsed:.0f}s")

    st.caption(f"Concluida em {run_time_str}")

    if btc and "error" not in btc:
        b1 = "BULLISH" if btc["bullish"] else "BEARISH"
        b2 = "ASCENDENTE" if btc["structure_bullish"] else "DESCENDENTE"
        st.markdown(f"**BTC {btc['tf']} {btc['ma_label']}:** {b1}  |  **Estrutura:** {b2}  |  "
                    f"close={btc['close']:.2f}  ma={btc['ma']:.2f}")
    elif btc and "error" in btc:
        st.warning(f"BTC status indisponivel: {btc['error']}")

    signals = st.session_state.last_signals or []
    if signals:
        df_sig = pd.DataFrame(signals)
        ma_label = f"{cfg['ma']['type']}{cfg['ma']['length']}"
        df_show = pd.DataFrame({
            "Par": df_sig["symbol"],
            "Close": df_sig["close"],
            "RSI": df_sig["rsi"].round(2),
            ma_label: df_sig["ema"],
            "Dist %": df_sig["distance_pct"].round(2),
            "Vol % vs SMA": df_sig["vol_change_pct"].round(2),
            "High": df_sig["high"],
            "High prev": df_sig["high_prev"],
        }).sort_values("Dist %").reset_index(drop=True)
        st.dataframe(df_show, use_container_width=True, hide_index=True)
    else:
        st.info("Nenhum sinal de compra na ultima varredura.")

    if st.session_state.last_errors:
        with st.expander(f"{len(st.session_state.last_errors)} erros ignorados"):
            for sym, msg in st.session_state.last_errors[:100]:
                st.text(f"{sym}: {msg}")


# ------------------------------------------------------------------
# Historico
# ------------------------------------------------------------------

st.divider()
with st.expander("Historico (sinais.txt)"):
    if bot.OUTPUT_PATH.exists():
        content = bot.OUTPUT_PATH.read_text(encoding="utf-8")
        # Mostra so as ultimas 10000 chars pra nao travar a pagina
        if len(content) > 10000:
            st.caption(f"Mostrando os ultimos 10.000 chars de {len(content)} totais.")
            st.code(content[-10000:], language=None)
        else:
            st.code(content, language=None)
    else:
        st.caption("Sem historico ainda. Rode uma varredura.")


# ------------------------------------------------------------------
# Logs
# ------------------------------------------------------------------

with st.expander("Logs recentes (erros.log)"):
    if bot.ERRORS_PATH.exists():
        content = bot.ERRORS_PATH.read_text(encoding="utf-8")
        if not content.strip():
            st.caption("Nenhum erro registrado.")
        else:
            st.code(content[-5000:] if len(content) > 5000 else content, language=None)
    else:
        st.caption("Nenhum log de erro ainda.")
