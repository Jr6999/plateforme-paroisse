/**
 * Script de résolution des migrations Prisma échouées en production.
 * Exécuté avant `prisma migrate deploy` via le Start Command Render.
 *
 * Cas traité : migration 20260718000000_catechumen_extended_fields
 * marquée "failed" dans _prisma_migrations alors que les colonnes
 * ont déjà été créées partiellement ou totalement.
 *
 * Stratégie :
 * 1. Vérifier si la migration est marquée "failed"
 * 2. Vérifier si les colonnes cibles existent déjà en DB
 * 3. Si colonnes présentes → marquer la migration comme "applied"
 * 4. Si colonnes absentes → supprimer l'entrée failed pour laisser
 *    prisma migrate deploy la rejouer proprement
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MIGRATION_NAME = "20260718000000_catechumen_extended_fields";

async function main() {
  console.log("[resolve] Vérification des migrations échouées…");

  // Vérifier si la migration est marquée failed
  const failed = await prisma.$queryRaw<{ migration_name: string; finished_at: Date | null }[]>`
    SELECT migration_name, finished_at
    FROM "_prisma_migrations"
    WHERE migration_name = ${MIGRATION_NAME}
      AND finished_at IS NULL
  `;

  if (failed.length === 0) {
    console.log("[resolve] Aucune migration échouée détectée — rien à faire.");
    return;
  }

  console.log(`[resolve] Migration échouée trouvée : ${MIGRATION_NAME}`);

  // Vérifier si la colonne birthPlace existe déjà (indicateur que la migration a été partiellement appliquée)
  const columnExists = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'Catechumen'
        AND column_name = 'birthPlace'
    ) AS "exists"
  `;

  const tableExists = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'CatechumenDocument'
    ) AS "exists"
  `;

  const colExists = columnExists[0]?.exists ?? false;
  const tblExists = tableExists[0]?.exists ?? false;

  if (colExists && tblExists) {
    // Les changements sont déjà en base → marquer la migration comme applied
    console.log("[resolve] Colonnes et table présentes → marquage de la migration comme applied…");
    await prisma.$executeRaw`
      UPDATE "_prisma_migrations"
      SET
        finished_at     = NOW(),
        applied_steps_count = 1,
        logs            = NULL
      WHERE migration_name = ${MIGRATION_NAME}
        AND finished_at IS NULL
    `;
    console.log("[resolve] ✓ Migration marquée comme applied.");
  } else {
    // Les changements ne sont pas en base → supprimer l'entrée failed
    // pour que prisma migrate deploy puisse rejouer la migration proprement
    console.log("[resolve] Colonnes absentes → suppression de l'entrée failed pour permettre le rejeu…");
    await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations"
      WHERE migration_name = ${MIGRATION_NAME}
        AND finished_at IS NULL
    `;
    console.log("[resolve] ✓ Entrée supprimée — prisma migrate deploy peut s'exécuter.");
  }
}

main()
  .catch((err) => {
    console.error("[resolve] Erreur :", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
