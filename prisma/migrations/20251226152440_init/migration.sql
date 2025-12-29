-- CreateEnum
CREATE TYPE "Emotion" AS ENUM ('happy', 'content', 'neutral', 'stressed', 'sad', 'angry');

-- CreateTable
CREATE TABLE "EmotionVote" (
    "id" TEXT NOT NULL,
    "emotion" "Emotion" NOT NULL,
    "day" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "identityHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionAggregate" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "emotion" "Emotion" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmotionAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmotionVote_identityHash_day_key" ON "EmotionVote"("identityHash", "day");

-- CreateIndex
CREATE UNIQUE INDEX "EmotionAggregate_day_hour_emotion_key" ON "EmotionAggregate"("day", "hour", "emotion");
