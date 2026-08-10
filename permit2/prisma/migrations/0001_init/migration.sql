-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('WORK', 'ACCESS', 'ACTIVITY', 'SAFETY', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "PermitType" NOT NULL,
    "applicant_name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "status" "PermitStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "rejection_reason" TEXT,
    "revocation_reason" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permit_status_history" (
    "id" TEXT NOT NULL,
    "permit_id" TEXT NOT NULL,
    "status" "PermitStatus" NOT NULL,
    "event" VARCHAR(50) NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permit_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "permits_status_idx" ON "permits"("status");

-- CreateIndex
CREATE INDEX "permits_type_idx" ON "permits"("type");

-- CreateIndex
CREATE INDEX "permits_created_at_idx" ON "permits"("created_at");

-- CreateIndex
CREATE INDEX "permits_updated_at_idx" ON "permits"("updated_at");

-- CreateIndex
CREATE INDEX "permits_start_date_idx" ON "permits"("start_date");

-- CreateIndex
CREATE INDEX "permits_created_by_idx" ON "permits"("created_by");

-- CreateIndex
CREATE INDEX "permits_status_type_idx" ON "permits"("status", "type");

-- CreateIndex
CREATE INDEX "permit_status_history_permit_id_idx" ON "permit_status_history"("permit_id");

-- CreateIndex
CREATE INDEX "permit_status_history_created_at_idx" ON "permit_status_history"("created_at");

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permit_status_history" ADD CONSTRAINT "permit_status_history_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permit_status_history" ADD CONSTRAINT "permit_status_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
