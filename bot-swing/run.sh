#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
    echo "[ERRO] Python3 nao encontrado."
    echo "Mac: brew install python3   |   Linux: sudo apt install python3 python3-venv"
    exit 1
fi

if [ ! -d ".venv" ]; then
    echo "[setup] Criando ambiente virtual..."
    python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate

if [ ! -f ".venv/.deps_ok" ] || ! cmp -s requirements.txt ".venv/.deps_ok"; then
    echo "[setup] Instalando dependencias..."
    python -m pip install --upgrade pip >/dev/null
    pip install -r requirements.txt
    cp requirements.txt ".venv/.deps_ok"
fi

python bot.py "$@"
