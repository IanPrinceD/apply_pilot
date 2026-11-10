-- AlterTable
ALTER TABLE "Task" ADD COLUMN "message" TEXT;
ALTER TABLE "Task" ADD COLUMN "progress" JSONB;
ALTER TABLE "Task" ADD COLUMN "screenshotPath" TEXT;

-- CreateTable
CREATE TABLE "WorkerState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "state" TEXT NOT NULL DEFAULT 'IDLE',
    "loggedIn" BOOLEAN NOT NULL DEFAULT false,
    "currentTaskId" TEXT,
    "message" TEXT,
    "heartbeatAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "site" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "dedupeHash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "salary" TEXT,
    "description" TEXT,
    "score" INTEGER,
    "scoreJson" JSONB,
    "easyApply" BOOLEAN NOT NULL DEFAULT false,
    "postedText" TEXT,
    "searchKeyword" TEXT,
    "descriptionFetchedAt" DATETIME,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("company", "dedupeHash", "description", "externalId", "firstSeenAt", "id", "location", "salary", "score", "scoreJson", "site", "title", "updatedAt", "url") SELECT "company", "dedupeHash", "description", "externalId", "firstSeenAt", "id", "location", "salary", "score", "scoreJson", "site", "title", "updatedAt", "url" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_dedupeHash_idx" ON "Job"("dedupeHash");
CREATE UNIQUE INDEX "Job_site_externalId_key" ON "Job"("site", "externalId");
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "filters" JSONB NOT NULL,
    "dailyCap" INTEGER NOT NULL DEFAULT 10,
    "mode" TEXT NOT NULL DEFAULT 'REVIEW',
    "threshold" INTEGER NOT NULL DEFAULT 70,
    "indeedSite" TEXT NOT NULL DEFAULT 'us',
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleTime" TEXT NOT NULL DEFAULT '09:00',
    "lastScheduledRunAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("dailyCap", "filters", "id", "mode", "threshold", "updatedAt") SELECT "dailyCap", "filters", "id", "mode", "threshold", "updatedAt" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
