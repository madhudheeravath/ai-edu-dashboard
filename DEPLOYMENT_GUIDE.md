# 🚀 Deployment Guide - AI Education Dashboard

## ⚠️ Important Notes

This application has **two components** that need to be deployed:
1. **Next.js Frontend/Backend** (Port 3000)
2. **Python AI Detection Service** (Port 8000)

---

## 📋 Prerequisites

Before deploying, you need:
- [ ] GitHub account
- [ ] Vercel account (free) - for Next.js app
- [ ] Railway/Render account (free) - for Python service
- [ ] PostgreSQL database (free tier on Supabase/Neon)

---

## 🎯 Deployment Options

### **Option 1: Vercel (Recommended for Next.js)**

#### Step 1: Prepare the Repository

```bash
# Initialize git if not already done
cd c:\Users\madhu\Shivani\ai-edu-dashboard
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/ai-edu-dashboard.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Step 3: Set Environment Variables in Vercel

Add these environment variables in Vercel dashboard:

```env
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate_random_secret_here
OPENAI_API_KEY=your_openai_or_openrouter_key
DETECTGPT_SERVICE_URL=https://your-python-service-url.railway.app
```

#### Step 4: Update Database to PostgreSQL

Your current SQLite database won't work in production. Update `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

Then run:
```bash
npx prisma db push
```

---

### **Option 2: Deploy Python AI Detection Service**

#### Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Configure:
   - **Root Directory**: `python-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
6. Add environment variables:
   ```
   PORT=8000
   ```
7. Copy the Railway URL (e.g., `https://your-app.railway.app`)
8. Update `DETECTGPT_SERVICE_URL` in Vercel

---

### **Option 3: All-in-One Cloud Platform**

#### Using Render.com

**Deploy Next.js:**
1. Create new "Web Service"
2. Connect GitHub repo
3. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Add all env variables

**Deploy Python Service:**
1. Create another "Web Service"
2. Same repo, but set:
   - **Root Directory**: `python-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`

---

## 🗄️ Database Setup (PostgreSQL)

### Free PostgreSQL Options:

1. **Supabase** (Recommended)
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy connection string
   - Update `DATABASE_URL`

2. **Neon**
   - Go to [neon.tech](https://neon.tech)
   - Create database
   - Copy connection string

3. **Railway**
   - Add PostgreSQL to your Railway project
   - Copy connection URL

### Migrate Database:

```bash
# Update your DATABASE_URL in .env
DATABASE_URL="postgresql://..."

# Run migrations
npx prisma db push

# Import your data
node quick-restore-data.js
```

---

## ⚙️ Environment Variables Summary

### Next.js App (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=random-secret-min-32-chars
OPENAI_API_KEY=your-api-key
DETECTGPT_SERVICE_URL=https://python-service.railway.app
```

### Python Service (.env)
```env
PORT=8000
```

---

## 🧪 Testing After Deployment

1. Visit your deployed URL
2. Test login with credentials from `LOGIN_CREDENTIALS.md`
3. Test AI detection by submitting an assignment
4. Check analytics and dashboards

---

## 🐛 Troubleshooting

### "Database connection failed"
- Verify DATABASE_URL is correct
- Ensure database is accessible from Vercel
- Check if Prisma schema is pushed: `npx prisma db push`

### "AI Detection not working"
- Verify DETECTGPT_SERVICE_URL is set correctly
- Check Python service logs on Railway/Render
- Test Python service URL directly: `https://your-service.railway.app`

### "NextAuth error"
- Ensure NEXTAUTH_URL matches your deployed URL
- NEXTAUTH_SECRET must be at least 32 characters
- Generate new secret: `openssl rand -base64 32`

### "Build failed"
- Check Node version (needs 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

---

## 🎉 Quick Deploy Commands

```bash
# 1. Setup Git
git init
git add .
git commit -m "Deploy AI Education Dashboard"

# 2. Create GitHub repo and push
# (Do this via GitHub website)

# 3. Deploy to Vercel
npm i -g vercel
vercel login
vercel

# Follow prompts and set environment variables
```

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/guides/database/using-prisma-with-postgresql)
- [Railway Docs](https://docs.railway.app/)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created
- [ ] Next.js app deployed to Vercel
- [ ] Python service deployed to Railway
- [ ] Environment variables configured
- [ ] Database migrated (`npx prisma db push`)
- [ ] Data imported (`node quick-restore-data.js`)
- [ ] Test login functionality
- [ ] Test AI detection
- [ ] Test student/faculty dashboards

---

**Need Help?** Check the logs in your deployment platform or contact support.
