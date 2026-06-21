-- AlterTable
ALTER TABLE "Fixture" ADD COLUMN     "proposedBy" TEXT,
ADD COLUMN     "proposedDate" TIMESTAMP(3),
ADD COLUMN     "schedulingNotes" TEXT,
ADD COLUMN     "schedulingStatus" TEXT NOT NULL DEFAULT 'PENDING';
