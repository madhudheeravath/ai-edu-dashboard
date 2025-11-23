# 🚀 Quick Database Setup with Neon (5 Minutes)

## Why Neon Instead of Supabase?
- ✅ Instant setup (no 20-minute wait)
- ✅ Works immediately
- ✅ Better for serverless (Vercel)
- ✅ Generous free tier

---

## 📝 **Step-by-Step Setup:**

### **1. Create Neon Account (1 minute)**
1. Go to: https://neon.tech
2. Click "Sign Up" 
3. Sign in with GitHub or Google
4. No credit card required!

### **2. Create Database (30 seconds)**
1. Click "Create Project"
2. Project Name: `ai-edu-dashboard`
3. Region: Choose closest to you
4. Click "Create Project"

### **3. Get Connection String (30 seconds)**
1. After creation, you'll see "Connection String"
2. Click "Copy" next to the Prisma connection string
3. It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### **4. Update Vercel (1 minute)**
Run this in your terminal (replace with your actual connection string):
```bash
echo "YOUR_NEON_CONNECTION_STRING" | vercel env rm DATABASE_URL production
echo "YOUR_NEON_CONNECTION_STRING" | vercel env add DATABASE_URL production
```

### **5. Initialize Database (2 minutes)**
```bash
$env:DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
npx prisma db push --accept-data-loss
node quick-restore-data.js
```

### **6. Redeploy Vercel**
```bash
vercel --prod --yes
```

---

## ✅ **Done!**

Your app will be fully functional at:
https://ai-edu-dashboard-b6xpwe4iu-madhuxx24-8951s-projects.vercel.app

Login with:
- Student: `stu10004@university.edu` / `password123`
- Faculty: `fac1000@university.edu` / `password123`

---

## 🔄 **OR Continue with Supabase:**

If you prefer Supabase, you need to:
1. Go to Supabase dashboard
2. Settings → Database
3. Check "Connection Pooling" settings
4. Ensure "Transaction" mode is enabled for Prisma
5. Verify the password is correct

Then retry:
```bash
$env:DATABASE_URL="postgresql://postgres:Kaika%40123@db.yovwgyatesvxxlfdjwpb.supabase.co:5432/postgres"
npx prisma db push --accept-data-loss
```
