-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT,
    "role" TEXT,
    "tagline" TEXT,
    "bio" TEXT,
    "yearsLearning" INTEGER,
    "currentlyBuilding" TEXT,
    "technologies" JSONB,
    "skills" JSONB,
    "projects" JSONB,
    "experience" JSONB,
    "githubUsername" TEXT,
    "contactEmail" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "calendly" TEXT,
    "discord" TEXT,
    "resumeUrl" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_slug_key" ON "UserProfile"("slug");

-- CreateIndex
CREATE INDEX "UserProfile_slug_idx" ON "UserProfile"("slug");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
