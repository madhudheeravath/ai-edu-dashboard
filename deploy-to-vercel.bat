@echo off
echo =========================================
echo AI Education Dashboard - Vercel Deployment
echo =========================================
echo.

echo Step 1: Installing Vercel CLI...
call npm install -g vercel
echo.

echo Step 2: Logging in to Vercel...
echo (A browser window will open)
call vercel login
echo.

echo Step 3: Deploying to Vercel...
echo (Follow the prompts)
call vercel
echo.

echo =========================================
echo Deployment initiated!
echo =========================================
echo.
echo IMPORTANT: After deployment completes, you need to:
echo 1. Set up a PostgreSQL database (Supabase/Neon)
echo 2. Add environment variables in Vercel dashboard
echo 3. Deploy Python service separately to Railway
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions
echo =========================================
pause
