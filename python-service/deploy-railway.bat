@echo off
echo =========================================
echo Deploying Python AI Service to Railway
echo =========================================
echo.

echo Step 1: Installing Railway CLI...
call npm install -g @railway/cli

echo.
echo Step 2: Logging in to Railway...
echo (Browser will open for authentication)
call railway login

echo.
echo Step 3: Initializing Railway project...
call railway init

echo.
echo Step 4: Deploying to Railway...
call railway up

echo.
echo =========================================
echo Deployment Complete!
echo =========================================
echo.
echo Copy the URL from Railway dashboard
echo Then add it to Vercel as DETECTGPT_SERVICE_URL
echo.
pause
