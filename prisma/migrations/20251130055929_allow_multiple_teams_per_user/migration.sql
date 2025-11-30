-- DropIndex
DROP INDEX "team_members_userId_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_job_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "startedAt" DATETIME,
    "blockedAt" DATETIME,
    "blockedReason" TEXT,
    "blockedNote" TEXT,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "photoUrl" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "completedById" TEXT,
    CONSTRAINT "job_steps_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "job_steps_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "job_steps_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_job_steps" ("blockedAt", "blockedNote", "blockedReason", "completedAt", "completedById", "description", "id", "isCompleted", "jobId", "notes", "order", "photoUrl", "startedAt", "title") SELECT "blockedAt", "blockedNote", "blockedReason", "completedAt", "completedById", "description", "id", "isCompleted", "jobId", "notes", "order", "photoUrl", "startedAt", "title" FROM "job_steps";
DROP TABLE "job_steps";
ALTER TABLE "new_job_steps" RENAME TO "job_steps";
CREATE TABLE "new_job_sub_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "startedAt" DATETIME,
    "blockedAt" DATETIME,
    "blockedReason" TEXT,
    "blockedNote" TEXT,
    "order" INTEGER NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    CONSTRAINT "job_sub_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "job_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "job_sub_steps_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_job_sub_steps" ("blockedAt", "blockedNote", "blockedReason", "completedAt", "id", "isCompleted", "order", "startedAt", "stepId", "title") SELECT "blockedAt", "blockedNote", "blockedReason", "completedAt", "id", "isCompleted", "order", "startedAt", "stepId", "title" FROM "job_sub_steps";
DROP TABLE "job_sub_steps";
ALTER TABLE "new_job_sub_steps" RENAME TO "job_sub_steps";
CREATE TABLE "new_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "customerId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "scheduledDate" DATETIME,
    "scheduledEndDate" DATETIME,
    "completedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "acceptanceStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "acceptedById" TEXT,
    "acceptedAt" DATETIME,
    CONSTRAINT "jobs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jobs_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "jobs_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_jobs" ("completedDate", "createdAt", "creatorId", "customerId", "description", "id", "latitude", "location", "longitude", "priority", "scheduledDate", "scheduledEndDate", "status", "title", "updatedAt") SELECT "completedDate", "createdAt", "creatorId", "customerId", "description", "id", "latitude", "location", "longitude", "priority", "scheduledDate", "scheduledEndDate", "status", "title", "updatedAt" FROM "jobs";
DROP TABLE "jobs";
ALTER TABLE "new_jobs" RENAME TO "jobs";
CREATE TABLE "new_step_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "subStepId" TEXT,
    CONSTRAINT "step_photos_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "job_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "step_photos_subStepId_fkey" FOREIGN KEY ("subStepId") REFERENCES "job_sub_steps" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "step_photos_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_step_photos" ("id", "stepId", "uploadedAt", "uploadedById", "url") SELECT "id", "stepId", "uploadedAt", "uploadedById", "url" FROM "step_photos";
DROP TABLE "step_photos";
ALTER TABLE "new_step_photos" RENAME TO "step_photos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
