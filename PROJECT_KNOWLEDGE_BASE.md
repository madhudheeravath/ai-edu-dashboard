# 📘 Project Knowledge Base: AI Dependency vs. Human Creativity

**Source**: Final Project Report
**Generated**: 2025-11-26

---

## 1. Executive Summary
**Core Conflict**: The tension between Generative AI usage in education and the preservation of original human creativity.
**Proposed Solution**: An IS/IT-based role-based analytics platform ("AI-Edu Dashboard") that monitors AI use, creativity scores, and grading outcomes.
**Goal**: Foster a balanced, data-driven approach where AI is used responsibly without stifling critical thinking.

## 2. Problem Context
- **Stakeholders**:
    - **Students**: Confused by ambiguous policies, fear false accusations, tempted by AI for efficiency.
    - **Faculty**: Struggle to detect AI, grade inconsistently, need tools to distinguish aid from cheating.
    - **Administrators**: Need holistic data to form evidence-based policies.
- **Key Insight**: AI usage is skyrocketing (53% in 2024 -> 88% in 2025 projected), often correlating with higher grades but lower originality.

## 3. The Solution: AI-Edu Dashboard
A web-based application providing transparency and feedback rather than just punitive detection.

### 3.1 Key Features
#### **Student Portal**
- **Dashboard**: View assignments, deadlines, and personal AI usage stats.
- **Workflow**: Draft -> AI Chat (Guidance) -> Reflection -> Final Submission.
- **AI Chatbot**: Embedded assistant for brainstorming/editing (avoids external tools).
- **Analytics**: Tracks "Creativity vs. AI Usage" trends to promote self-regulation.

#### **Faculty Portal**
- **Submissions View**: List of students with AI Risk Flags (Green/Yellow/Red).
- **Detailed Assessment**: View Draft vs. Final, Time Logged, Creativity Score, and Student Reflections.
- **Analytics**: Class-wide trends, AI adoption rates, detection accuracy gaps.

### 3.2 Architecture
- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS.
- **Backend**: Next.js API Routes (Node.js).
- **Database**: PostgreSQL (Neon) via Prisma ORM.
- **AI Service**: `DetectGPT-Lite` microservice (Python/FastAPI) for AI detection.
- **Auth**: NextAuth.js (Role-based: Student/Faculty).

## 4. Data Design & Generation (Synthetic Data)
Since real institutional data was unavailable, a robust synthetic dataset (12,500 records) was generated using Python (Pandas, Faker).

### **Generation Logic**
| Entity | Logic / Distribution |
| :--- | :--- |
| **Students** (3,500) | **Year**: 1 (30%), 2 (25%), 3 (25%), 4 (20%). <br> **First-Gen**: 41%. <br> **AI Awareness**: Lower mean/higher variance for first-gen. |
| **Faculty** (150) | **Dept**: STEM-heavy (CS: 32, Sciences: 24). <br> **AI Literacy**: Higher in CS (3.5/5) vs Arts (2.8/5). |
| **Assignments** (500) | **Types**: Research (38%), Essay (24%), Project (20%), Probset (18%). <br> **AI Allowed**: 73%. |
| **Submissions** | **AI Usage**: 45-65% base rate. <br> **Scores**: AI users get +0.1-0.8 grade boost but -0.4-0.6 creativity drop. |
| **AI Detection** | **Accuracy**: 95% true positive rate. <br> **False Positives**: 2% on human work. |

## 5. Research Findings (from Synthetic Data)
1.  **The Trade-off**: Heavy AI users have **10% higher grades** but **6% lower creativity scores**.
2.  **Reflection Impact**: Students who complete structured reflections show **significantly less creativity decline**, suggesting metacognition mitigates the negative effects of AI.
3.  **Detection Gaps**: Faculty only correctly identify AI in **37.7%** of cases flagged by the system.
4.  **Equity**: First-generation students use AI less (41.8% vs 49.8%) but achieve equal grades when they do, suggesting AI can be an equalizer if access is fair.
5.  **Cramming**: AI usage spikes in the 48h before deadlines.

## 6. Success Metrics (KPIs)
- **Engagement**: Weekly login rates.
- **Integrity**: "Honesty Rate" (Self-reported AI vs. Detected AI). Goal: >85%.
- **Outcomes**: Creativity scores stability.
- **System**: <2s response time, 99.5% uptime.

## 7. Ethical Considerations
- **Privacy**: FERPA compliance, encrypted data.
- **Bias**: Acknowledging DetectGPT bias against non-native speakers; mitigating via "Confidence Scores" and human review (reflections).
- **Access**: Embedded tools ensure equitable access regardless of student financial status.

## 8. Future Roadmap
1.  **Institutional Pilots**: Test in 3-5 diverse universities.
2.  **LMS Integration**: Plugins for Canvas/Blackboard.
3.  **Algorithm Refinement**: Improve detection for non-native speakers.
4.  **Scaling**: Tiered licensing model.
