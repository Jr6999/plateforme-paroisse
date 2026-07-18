-- Migration : Champs étendus du catéchumène + modèle CatechumenDocument
-- Cathédrale Saint Sauveur de Natitingou

-- Nouveaux champs sur Catechumen
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "birthPlace"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "email"            TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "neighborhood"     TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "profession"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "educationLevel"   TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "maritalStatus"    TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "fatherName"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "motherName"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "emergencyContact" TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "emergencyPhone"   TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "communityId"      TEXT;
ALTER TABLE "Catechumen" ADD COLUMN IF NOT EXISTS "registrationDate" TIMESTAMP(3);

-- Relation communityId → Community
ALTER TABLE "Catechumen"
  ADD CONSTRAINT IF NOT EXISTS "Catechumen_communityId_fkey"
  FOREIGN KEY ("communityId")
  REFERENCES "Community"("id")
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "Catechumen_communityId_idx" ON "Catechumen"("communityId");

-- Nouveau modèle CatechumenDocument
CREATE TABLE IF NOT EXISTS "CatechumenDocument" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
  "catechumenId" TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "url"          TEXT NOT NULL,
  "mimeType"     TEXT NOT NULL,
  "sizeBytes"    INTEGER,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CatechumenDocument_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CatechumenDocument"
  ADD CONSTRAINT IF NOT EXISTS "CatechumenDocument_catechumenId_fkey"
  FOREIGN KEY ("catechumenId")
  REFERENCES "Catechumen"("id")
  ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "CatechumenDocument_catechumenId_idx"
  ON "CatechumenDocument"("catechumenId");
