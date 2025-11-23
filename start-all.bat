@echo off
echo ========================================
echo Starting AI Education Dashboard
echo ========================================
echo.

echo [1/2] Starting Next.js Server (port 3000)...
start "Next.js Server" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting AI Detection Service (port 8000)...
start "AI Detection Service" cmd /k "cd python-service && .\venv\Scripts\Activate.ps1 && python main.py"

echo.
echo ========================================
echo ✅ Both servers started!
echo ========================================
echo.
echo 📱 Next.js App: http://localhost:3000
echo 🤖 AI Detection: http://localhost:8000
echo.
echo To stop: Close the separate terminal windows
echo ========================================
