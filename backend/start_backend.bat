@echo off
echo Ativando ambiente virtual...
call .venv\Scripts\activate
echo.
echo Iniciando backend Python...
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause