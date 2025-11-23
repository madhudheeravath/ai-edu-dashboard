@echo off
echo ========================================
echo Starting DetectGPT Service...
echo ========================================
echo.

REM Change to the directory where this batch file is located
cd /d "%~dp0"
echo Working directory: %CD%
echo.

if not exist venv (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo API Documentation: http://localhost:8000/docs
echo ========================================
echo.

python main.py
