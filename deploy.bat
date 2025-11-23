@echo off
echo =========================================
echo AI Education Dashboard - Deployment
echo =========================================
echo.

echo This will deploy your application to:
echo 1. Vercel (Next.js App)
echo 2. Railway/Render (Python AI Service)
echo.

echo Step 1: Deploying to Vercel...
echo.
echo A browser window will open for authentication.
echo Follow the prompts in the terminal.
echo.
pause

vercel

echo.
echo =========================================
echo Vercel Deployment Complete!
echo =========================================
echo.

echo IMPORTANT: Complete these manual steps:
echo.
echo 1. Deploy Python service to Railway:
echo    - Go to https://railway.app
echo    - Upload the python-service folder
echo    - Copy the deployment URL
echo.
echo 2. Add environment variables in Vercel:
echo    - Go to your Vercel dashboard
echo    - Settings -^> Environment Variables
echo    - Add DATABASE_URL, NEXTAUTH_SECRET, etc.
echo    - Add DETECTGPT_SERVICE_URL with Railway URL
echo.
echo 3. Setup PostgreSQL database:
echo    - Create database on Supabase/Neon
echo    - Add connection string to Vercel
echo.
echo 4. Redeploy in Vercel dashboard to apply changes
echo.
echo See QUICK_DEPLOY.md for detailed instructions
echo.
echo =========================================
pause
