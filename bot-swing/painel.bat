@echo off
setlocal
cd /d "%~dp0"

REM ---- Verifica Python ----
where python >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERRO] Python nao encontrado.
    echo.
    echo Instale o Python 3 em: https://www.python.org/downloads/
    echo IMPORTANTE: na tela de instalacao, marque a caixa "Add python.exe to PATH"
    echo.
    pause
    exit /b 1
)

REM ---- Cria venv se nao existir ----
if not exist ".venv\Scripts\python.exe" (
    echo [setup] Criando ambiente virtual...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERRO] Falha ao criar venv.
        pause
        exit /b 1
    )
)

call ".venv\Scripts\activate.bat"

REM ---- Instala dependencias se mudou requirements.txt ----
if not exist ".venv\.deps_ok" goto install
fc /b requirements.txt ".venv\.deps_ok" >nul 2>nul
if errorlevel 1 goto install
goto run

:install
echo [setup] Instalando dependencias (pode demorar 2-3 min na primeira vez)...
python -m pip install --upgrade pip >nul
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)
copy /y requirements.txt ".venv\.deps_ok" >nul

:run
echo.
echo [painel] Abrindo em http://localhost:8501
echo [painel] Pressione Ctrl+C nesta janela para fechar o painel.
echo.
streamlit run painel.py
