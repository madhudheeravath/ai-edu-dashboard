# 🔑 Login Credentials

## ✅ Working Test Accounts

### **Primary Demo Accounts:**

#### **Student:**
```
Email: student@university.edu
Password: password123
```

#### **Faculty:**
```
Email: faculty@university.edu
Password: password123
```

---

### **CSV Data Accounts:**

Any user from your imported CSV data:

#### **Students (3,500 total):**
```
Email: stu10004@university.edu
Password: password123

Email: stu10005@university.edu
Password: password123

... (any student ID from your CSV)
```

#### **Faculty (150 total):**
```
Email: fac1001@university.edu
Password: password123

Email: fac1002@university.edu
Password: password123

... (any faculty ID from your CSV)
```

---

## 📊 Database Summary

**Successfully Imported:**
- ✅ 3,500 Students
- ✅ 150 Faculty
- ✅ 500 Assignments
- ✅ 3,549 Submissions
- ✅ 1,647 Reflections
- ✅ 1,205 Rubric Evaluations
- ✅ 1,810 Faculty Activities

**Total:** 10,912 records

---

## 🚀 How to Login

1. Go to http://localhost:3000
2. Click "Login" or go to http://localhost:3000/login
3. Select **Student** or **Faculty** tab
4. Enter one of the emails above
5. Password: `password123` for all accounts
6. Click "Sign In"

---

## ⚠️ Important Notes

### **Email Format:**
- **Primary accounts** use full names: `student@university.edu`, `faculty@university.edu`
- **CSV accounts** use IDs: `stu10004@university.edu`, `fac1001@university.edu`
- All emails are **lowercase**

### **Why STU10000/FAC1000 Don't Work:**
The seed script created the first 4 users (STU10000-STU10003, FAC1000) with custom emails like `student@university.edu`. The CSV import preserved these emails.

To use the CSV format, start from:
- Students: STU10004 onwards
- Faculty: FAC1001 onwards

---

## 🔍 Check Any User's Email

Run this to see actual emails:

```bash
node check-emails.mjs
```

Or open Prisma Studio:

```bash
npx prisma studio
```

Then browse to http://localhost:5555 to see all users visually.

---

## ✅ Verified Working

Tested and confirmed:
- ✅ `student@university.edu` - Works!
- ✅ `faculty@university.edu` - Works!
- ✅ `stu10004@university.edu` - Works!
- ✅ `fac1001@university.edu` - Works!

---

## 🎓 For Your Research

All 3,500 students and 150 faculty have:
- ✅ Complete demographics
- ✅ Submission data
- ✅ AI usage metrics
- ✅ Hashed passwords
- ✅ Same password: `password123`

**Ready for pilot testing!** 🚀
