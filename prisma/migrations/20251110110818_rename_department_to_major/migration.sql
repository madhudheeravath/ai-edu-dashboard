/*
  Warnings:

  - You are about to drop the column `department` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Faculty` table. All the data in the column will be lost.
  - Added the required column `major` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `major` to the `Faculty` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 1,
    "dueDate" DATETIME NOT NULL,
    "aiAllowed" BOOLEAN NOT NULL,
    "aiLockedUntilDraft" BOOLEAN NOT NULL,
    "createdDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("facultyId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Assignment" ("aiAllowed", "aiLockedUntilDraft", "assignmentId", "createdAt", "createdDate", "description", "dueDate", "facultyId", "id", "title", "type", "updatedAt", "year", "major") SELECT "aiAllowed", "aiLockedUntilDraft", "assignmentId", "createdAt", "createdDate", "description", "dueDate", "facultyId", "id", "title", "type", "updatedAt", "year", "department" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
CREATE UNIQUE INDEX "Assignment_assignmentId_key" ON "Assignment"("assignmentId");
CREATE TABLE "new_Faculty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "expYears" REAL NOT NULL,
    "aiLiteracy" REAL NOT NULL,
    "dashboardAdoption" DATETIME NOT NULL,
    "numCourses" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Faculty" ("aiLiteracy", "createdAt", "dashboardAdoption", "email", "expYears", "facultyId", "id", "name", "numCourses", "password", "updatedAt", "major") SELECT "aiLiteracy", "createdAt", "dashboardAdoption", "email", "expYears", "facultyId", "id", "name", "numCourses", "password", "updatedAt", "department" FROM "Faculty";
DROP TABLE "Faculty";
ALTER TABLE "new_Faculty" RENAME TO "Faculty";
CREATE UNIQUE INDEX "Faculty_facultyId_key" ON "Faculty"("facultyId");
CREATE UNIQUE INDEX "Faculty_email_key" ON "Faculty"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
