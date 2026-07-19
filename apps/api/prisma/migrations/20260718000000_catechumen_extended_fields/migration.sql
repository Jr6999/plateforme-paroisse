-- Migration : Champs étendus du catéchumène + modèle CatechumenDocument
-- Cathédrale Saint Sauveur de Natitingou
--
-- NOTE : Cette migration utilise uniquement du SQL standard compatible
-- avec prisma migrate deploy. Pas de IF NOT EXISTS (non standard Prisma).
-- La migration est idempotente via le mécanisme de résolution Prisma.

-- Nouveaux champs optionnels sur la table Catechumen
ALTER TABLE "Catechumen" ADD COLUMN "birthPlace"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "email"            TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "neighborhood"     TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "profession"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "educationLevel"   TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "maritalStatus"    TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "fatherName"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "motherName"       TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "emergencyContact" TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "emergencyPhone"   TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "communityId"      TEXT;
ALTER TABLE "Catechumen" ADD COLUMN "registrationDate" TIMESTAMP(3);

-- Contrainte de clé étrangère communityId → Community
ALTER TABLE "Catechumen"
  ADD CONSTRAINT "Catechumen_communityId_fkey"
  FOREIGN KEY ("communityId")
  REFERENCES "Community"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Index sur communityId
CREATE INDEX "Catechumen_communityId_idx" ON "Catechumen"("communityId");

-- Index supplémentaires manquants dans l'init
CREATE INDEX "User_createdAt_idx"              ON "User"("createdAt");
CREATE INDEX "Announcement_category_idx"       ON "Announcement"("category");
CREATE INDEX "Announcement_communityId_idx"    ON "Announcement"("communityId");
CREATE INDEX "Comment_announcementId_idx"      ON "Comment"("announcementId");
CREATE INDEX "Comment_parentId_idx"            ON "Comment"("parentId");
CREATE INDEX "Reaction_announcementId_idx"     ON "Reaction"("announcementId");
CREATE INDEX "Reaction_commentId_idx"          ON "Reaction"("commentId");
CREATE INDEX "Event_communityId_idx"           ON "Event"("communityId");
CREATE INDEX "RefreshToken_userId_idx"         ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx"      ON "RefreshToken"("expiresAt");
CREATE INDEX "Catechumen_lastName_firstName_idx" ON "Catechumen"("lastName", "firstName");
CREATE INDEX "Attendance_kind_status_idx"      ON "Attendance"("kind", "status");
CREATE INDEX "AuditLog_createdAt_idx"          ON "AuditLog"("createdAt");
CREATE INDEX "Notification_userId_readAt_idx"  ON "Notification"("userId", "readAt");
CREATE INDEX "Message_communityId_createdAt_idx" ON "Message"("communityId", "createdAt");
CREATE INDEX "Message_receiverId_readAt_idx"   ON "Message"("receiverId", "readAt");
CREATE INDEX "MediaAsset_type_idx"             ON "MediaAsset"("type");
CREATE INDEX "MediaAsset_galleryId_idx"        ON "MediaAsset"("galleryId");
CREATE INDEX "Document_entityType_entityId_idx" ON "Document"("entityType", "entityId");
CREATE INDEX "SacredRhythm_level_startAt_idx"  ON "SacredRhythm"("level", "startAt");
CREATE INDEX "SacramentRecord_sacrament_idx"   ON "SacramentRecord"("sacrament");
CREATE INDEX "Leader_roleType_status_idx"      ON "Leader"("roleType", "status");
CREATE INDEX "ParishHistory_status_occurredAt_idx" ON "ParishHistory"("status", "occurredAt");
CREATE INDEX "CommunityMember_role_idx"        ON "CommunityMember"("role");

-- Nouveau modèle CatechumenDocument
CREATE TABLE "CatechumenDocument" (
  "id"           TEXT         NOT NULL,
  "catechumenId" TEXT         NOT NULL,
  "title"        TEXT         NOT NULL,
  "url"          TEXT         NOT NULL,
  "mimeType"     TEXT         NOT NULL,
  "sizeBytes"    INTEGER,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CatechumenDocument_pkey" PRIMARY KEY ("id")
);

-- Clé étrangère CatechumenDocument → Catechumen
ALTER TABLE "CatechumenDocument"
  ADD CONSTRAINT "CatechumenDocument_catechumenId_fkey"
  FOREIGN KEY ("catechumenId")
  REFERENCES "Catechumen"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Index sur CatechumenDocument
CREATE INDEX "CatechumenDocument_catechumenId_idx"
  ON "CatechumenDocument"("catechumenId");
