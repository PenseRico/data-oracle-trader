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

REM ---- Ativa venv e instala dependencias ----
call ".venv\Scripts\activate.bat"

REM Instala somente se a marca de instalacao estiver ausente ou requirements mudou
if not exist ".venv\.deps_ok" goto install
fc /b requirements.txt ".venv\.deps_ok" >nul 2>nul
if errorlevel 1 goto install
goto run

:install
echo [setup] Instalando dependencias...
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
python bot.py %*
echo.
pause
