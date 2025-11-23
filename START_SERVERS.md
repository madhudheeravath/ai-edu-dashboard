# 🚀 STARTING THE APPLICATION - BOTH SERVERS REQUIRED

**⚠️ CRITICAL: Both servers are MANDATORY and must run together!**

**The application uses DetectGPT as the ONLY AI detection method. There is no fallback.**
**If the Python service is not running, AI detection will NOT work.**

---

## ✅ METHOD 1: One-Click Start (RECOMMENDED)

**From the `ai-edu-dashboard` folder:**

```bash
cd c:\Users\madhu\Shivani\ai-edu-dashboard
.\start-all.bat
```

**This will open 2 terminal windows:**
1. ✅ Next.js Server (port 3000)
2. ✅ AI Detection Service (port 8000)

---

## 🖥️ METHOD 2: Manual Start (2 Terminals)

### **Terminal 1 - Next.js App**
```bash
cd c:\Users\madhu\Shivani\ai-edu-dashboard
npm run dev
```

### **Terminal 2 - AI Detection Service**
```bash
cd c:\Users\madhu\Shivani\ai-edu-dashboard\python-service
.\venv\Scripts\Activate.ps1
python main.py
```

---

## ⚠️ BOTH SERVERS ARE REQUIRED

### **Next.js Server (Port 3000)**
- Frontend application
- Student/Faculty portals
- Database operations
- File uploads
- **REQUIRED**

### **Python AI Detection (Port 8000)**
- DetectGPT AI content detection using GPT-2 perplexity
- Real-time analysis of student submissions
- Primary and ONLY detection method (no fallback)
- **ABSOLUTELY REQUIRED** - App will show errors without it

---

## ✅ VERIFY BOTH ARE RUNNING

**Check in browser:**

1. **Next.js:** http://localhost:3000
   - Should show login page

2. **AI Detection:** http://localhost:8000
   - Should show JSON status:
   ```json
   {
     "status": "running",
     "service": "DetectGPT AI Detection",
     "device": "cpu",
     "model": "gpt2"
   }
   ```

---

## 🛑 STOPPING SERVERS

**If started with `start-all.bat`:**
- Close the 2 terminal windows that opened

**If started manually:**
- Press `Ctrl + C` in each terminal

---

## ⚠️ COMMON ERRORS

### **Error: "start-all.bat not found"**
**Solution:** You're in the wrong directory!
```bash
# Wrong location
C:\Users\madhu\Shivani> start-all.bat  ❌

# Correct location
C:\Users\madhu\Shivani\ai-edu-dashboard> start-all.bat  ✅
```

### **Error: "venv not found" in Python**
**Solution:** Set up Python virtual environment first
```bash
cd python-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### **Error: "Port 3000 already in use"**
**Solution:** Stop the existing Next.js server
```bash
Get-Process -Name node | Stop-Process -Force
```

### **Error: "Port 8000 already in use"**
**Solution:** Stop the existing Python server
```bash
Get-Process -Name python | Where-Object {$_.Path -like "*python-service*"} | Stop-Process -Force
```

---

## 📋 STARTUP CHECKLIST

Before using the application, verify:

- [ ] Both terminal windows are open
- [ ] Next.js shows "Ready in X.Xs" message
- [ ] Python shows "Uvicorn running on http://0.0.0.0:8000"
- [ ] http://localhost:3000 loads
- [ ] http://localhost:8000 shows AI service status
- [ ] No error messages in either terminal

---

## 🎯 RECOMMENDED WORKFLOW

**Every time you want to use the application:**

1. Navigate to project folder:
   ```bash
   cd c:\Users\madhu\Shivani\ai-edu-dashboard
   ```

2. Start both servers:
   ```bash
   .\start-all.bat
   ```

3. Wait for both to fully start (~10 seconds)

4. Open browser to http://localhost:3000

5. When done, close both terminal windows

---

## 💡 WHY BOTH SERVERS ARE NEEDED

**Next.js Server:**
- Handles web interface
- Manages user authentication
- Processes database queries
- Serves student/faculty portals

**Python AI Detection:**
- Analyzes submitted assignments
- Detects AI-generated content
- Calculates confidence scores
- Provides detailed text analysis

**Without Python server:** Students can submit, but AI detection won't work!

---

## ✅ READY!

**Both servers are now running. You can:**
- Login as student/faculty
- Create assignments
- Submit work
- Get real-time AI detection
- View analytics

**Access at:** http://localhost:3000 🚀
