-- Initialize Comic Trans Studio Database

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");

-- Projects table
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sourceLang" TEXT NOT NULL DEFAULT 'ja',
    "targetLang" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Project_ownerId_updatedAt_idx" ON "Project"("ownerId", "updatedAt" DESC);

-- Chapters table
CREATE TABLE IF NOT EXISTS "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Chapter_projectId_orderIndex_idx" ON "Chapter"("projectId", "orderIndex");

-- Pages table
CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapterId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "backgroundSrc" TEXT,
    "inpaintedImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE,
    UNIQUE("chapterId", "orderIndex")
);

CREATE INDEX IF NOT EXISTS "Page_chapterId_idx" ON "Page"("chapterId");

-- TextBoxes table
CREATE TABLE IF NOT EXISTS "TextBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'i-text',
    "text" TEXT NOT NULL,
    "left" REAL NOT NULL,
    "top" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "angle" REAL NOT NULL,
    "fontSize" REAL NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "fill" TEXT NOT NULL,
    "lineHeight" REAL NOT NULL,
    "originalText" TEXT,
    "geometry" TEXT,
    "style" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE,
    UNIQUE("pageId", "stableId")
);

CREATE INDEX IF NOT EXISTS "TextBox_pageId_idx" ON "TextBox"("pageId");
