# AI Education Dashboard

> **Higher Purpose, Greater Good** - Balancing AI Assistance with Human Creativity in Education

## 🎯 Project Overview

A premium web application designed to address student over-dependence on AI tools while fostering creativity and independent learning. Features include:

- **Student Portal** with AI chatbot (locked until draft submission)
- **Faculty Dashboard** with analytics and rubric-based grading
- **Reflection System** for metacognitive development
- **AI Detection & Monitoring** tools
- **Equity-Focused Analytics** tracking first-gen student outcomes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ with pip
- PostgreSQL database (or use SQLite for development)
- OpenAI/OpenRouter API key

### Installation

```bash
# 1. Install Node dependencies
npm install

# 2. Setup Python AI Detection Service
cd python-service
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
cd ..

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Import sample data
node quick-restore-data.js
```

### Running the Application

**⚠️ CRITICAL: Both servers must run together!**

```bash
# Option 1: One-click start (Recommended)
.\start-all.bat

# Option 2: Manual start (2 terminals)
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Python AI Detection
cd python-service
.\venv\Scripts\Activate.ps1
python main.py
```

Visit:
- **Next.js App**: `http://localhost:3000`
- **AI Detection API**: `http://localhost:8000`

## 📁 Project Structure

```
ai-edu-dashboard/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (student)/         # Student portal
│   ├── (faculty)/         # Faculty dashboard
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── student/          # Student-specific
│   ├── faculty/          # Faculty-specific
│   └── shared/           # Shared components
├── lib/                   # Utilities
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma
└── public/               # Static assets
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL / SQLite
- **AI Detection**: Python FastAPI + DetectGPT (GPT-2 Perplexity)
- **AI Chatbot**: OpenAI GPT-4 / OpenRouter
- **Auth**: NextAuth.js

### Architecture

This application uses a **dual-server architecture**:

1. **Next.js Server (Port 3000)**: Frontend, API routes, database operations
2. **Python AI Detection Service (Port 8000)**: DetectGPT-based AI content detection using GPT-2 perplexity scores

**Both servers must run concurrently. There is no fallback detection method.**

## 📊 Features

### Student Portal
- ✅ Dashboard with assignment overview
- ✅ AI chatbot with draft verification
- ✅ Submission workflow (draft → AI → reflection → final)
- ✅ Personal analytics and progress tracking

### Faculty Dashboard
- ✅ Class overview and analytics
- ✅ Rubric-based grading interface
- ✅ AI detection dashboard
- ✅ Student performance monitoring

## 🔐 Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_education_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
OPENAI_API_KEY="sk-your-key-here"
```

## 📝 Default Login Credentials

After seeding, use:

**Student:**
- Email: `student@university.edu`
- Password: `password123`

**Faculty:**
- Email: `faculty@university.edu`
- Password: `password123`

## 🎨 Design System

- **Primary Color**: Sky Blue (#0ea5e9)
- **Typography**: Inter (body), Poppins (headings)
- **Components**: shadcn/ui with custom styling
- **Animations**: Framer Motion for smooth transitions

## 📈 Development Roadmap

- [x] Phase 1: Foundation & Setup
- [ ] Phase 2: Authentication System
- [ ] Phase 3: Student Dashboard
- [ ] Phase 4: AI Chatbot Implementation
- [ ] Phase 5: Faculty Dashboard
- [ ] Phase 6: Analytics & Reporting
- [ ] Phase 7: Polish & Deployment

## 🤝 Contributing

This is a Master Research Project for Saint Louis University.

## 📄 License

Academic Use Only

## 👤 Author

Master's Student - Saint Louis University
Focus: AI Dependency vs. Human Creativity in Education
