@echo off
echo ========================================
echo DetectGPT Service Setup (Windows)
echo ========================================
echo.

REM Change to the directory where this batch file is located
cd /d "%~dp0"
echo Working directory: %CD%
echo.

echo Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    echo Please ensure Python 3.8+ is installed
    pause
    exit /b 1
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing dependencies...
echo This may take several minutes as it downloads PyTorch and models...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the service:
echo   1. Run: start-service.bat
echo   2. Or manually: venv\Scripts\activate.bat && python main.py
echo.
echo The service will run on: http://localhost:8000
echo API docs will be at: http://localhost:8000/docs
echo.
pause
