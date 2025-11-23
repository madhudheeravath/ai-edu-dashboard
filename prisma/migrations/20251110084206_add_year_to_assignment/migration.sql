-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "major" TEXT NOT NULL,
    "firstGen" BOOLEAN NOT NULL,
    "priorGpa" REAL NOT NULL,
    "gender" TEXT NOT NULL,
    "aiAwareness" REAL NOT NULL,
    "enrollmentDate" DATETIME NOT NULL,
    "semester" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "expYears" REAL NOT NULL,
    "aiLiteracy" REAL NOT NULL,
    "dashboardAdoption" DATETIME NOT NULL,
    "numCourses" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 1,
    "dueDate" DATETIME NOT NULL,
    "aiAllowed" BOOLEAN NOT NULL,
    "aiLockedUntilDraft" BOOLEAN NOT NULL,
    "createdDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("facultyId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "submissionDate" DATETIME NOT NULL,
    "usesAi" BOOLEAN NOT NULL,
    "aiAccessHours" REAL NOT NULL,
    "draftScore" REAL NOT NULL,
    "finalScore" REAL NOT NULL,
    "creativityScore" REAL NOT NULL,
    "aiDetected" BOOLEAN NOT NULL,
    "aiConfidence" REAL NOT NULL,
    "timeHours" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "aiAssistanceType" TEXT,
    "criticalThinkingScore" REAL NOT NULL,
    "satisfactionLevel" REAL NOT NULL,
    "draftContent" TEXT,
    "finalContent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("assignmentId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("studentId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("facultyId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reflectionId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "depthScore" REAL NOT NULL,
    "words" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reflection_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("submissionId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reflection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("studentId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RubricEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rubricId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "originality" REAL NOT NULL,
    "effort" REAL NOT NULL,
    "facultyAiIdentified" BOOLEAN NOT NULL,
    "assessmentDate" DATETIME NOT NULL,
    "finalGrade" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RubricEvaluation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("submissionId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RubricEvaluation_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("facultyId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacultyActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "resource" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacultyActivity_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("facultyId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "ChatMessage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("studentId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIDetectionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "aiLikelihood" INTEGER NOT NULL,
    "humanLikelihood" INTEGER NOT NULL,
    "confidence" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "sentenceCount" INTEGER NOT NULL,
    "avgWordsPerSentence" REAL NOT NULL,
    "vocabularyRichness" REAL NOT NULL,
    "readabilityScore" REAL NOT NULL,
    "hasAIMarkers" BOOLEAN NOT NULL,
    "formalityLevel" TEXT NOT NULL,
    "sentenceVariation" REAL NOT NULL,
    "hasPersonalTouch" BOOLEAN NOT NULL,
    "wordsAdded" INTEGER NOT NULL,
    "wordsRemoved" INTEGER NOT NULL,
    "percentageChange" REAL NOT NULL,
    "significantlyModified" BOOLEAN NOT NULL,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_facultyId_key" ON "Faculty"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_email_key" ON "Faculty"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_assignmentId_key" ON "Assignment"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_submissionId_key" ON "Submission"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_reflectionId_key" ON "Reflection"("reflectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_submissionId_key" ON "Reflection"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricEvaluation_rubricId_key" ON "RubricEvaluation"("rubricId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricEvaluation_submissionId_key" ON "RubricEvaluation"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyActivity_activityId_key" ON "FacultyActivity"("activityId");
