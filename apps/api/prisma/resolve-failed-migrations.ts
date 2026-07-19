/**
 * Script de résolution des migrations Prisma échouées en production.
 *
 * Usage :
 *   tsx prisma/resolve-failed-migrations.ts           # exécution normale
 *   tsx prisma/resolve-failed-migrations.ts --dry-run # simulation sans modification
 *
 * Protections :
 *   - Fonctionne en production ET en développement (avec avertissement)
 *   - Mode --dry-run pour simuler sans modifier la DB
 *   - Logs explicites à chaque étape
 *   - Vérifie l'état réel de la DB avant toute action
 *   - Ne supprime JAMAIS une migration sans vérification préalable
 */

import { PrismaClient } from "@prisma/client";

const isDryRun = process.argv.includes("--dry-run");
const prisma = new PrismaClient();

// Liste des migrations susceptibles d'être dans un état "failed"
// et leur condition de résolution associée
const MIGRATIONS_TO_CHECK = [
  {
    name: "20260718000000_catechumen_extended_fields",
    // Colonne témoin : si elle existe, la migration a été (au moins partiellement) appliquée
    checkColumn: {
      table: "Catechumen",
      column: "birthplace" // PostgreSQL stocke les noms de colonnes en minuscules
    },
    // Table témoin : si elle existe, la partie CREATE TABLE a été appliquée
    checkTable: "CatechumenDocument"
  }
] as const;

type MigrationRow = {
  migration_name: string;
  finished_at: Date | null;
  logs: string | null;
  applied_steps_count: number;
};

async function checkMigrationStatus(name: string): Promise<MigrationRow | null> {
  const rows = await prisma.$queryRaw<MigrationRow[]>`
    SELECT migration_name, finished_at, logs, applied_steps_count
    FROM "_prisma_migrations"
    WHERE migration_name = ${name}
  `;
  return rows[0] ?? null;
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND lower(table_name)  = lower(${table})
        AND lower(column_name) = lower(${column})
    ) AS "exists"
  `;
  return rows[0]?.exists ?? false;
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND lower(table_name) = lower(${table})
    ) AS "exists"
  `;
  return rows[0]?.exists ?? false;
}

function log(level: "info" | "warn" | "error" | "success", message: string) {
  const prefix = {
    info: "[resolve] ℹ",
    warn: "[resolve] ⚠",
    error: "[resolve] ✗",
    success: "[resolve] ✓"
  }[level];
  if (level === "error") {
    console.error(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

async function main() {
  if (isDryRun) {
    log("warn", "=== MODE DRY-RUN : aucune modification ne sera effectuée ===");
  }

  log("info", `Environnement : ${process.env.NODE_ENV ?? "non défini"}`);
  log("info", "Vérification des migrations Prisma…");

  // Vérifier que la table _prisma_migrations existe
  const prismaTableExists = await tableExists("_prisma_migrations");
  if (!prismaTableExists) {
    log("info", "Table _prisma_migrations absente — base de données vierge. Rien à résoudre.");
    return;
  }

  let resolvedCount = 0;
  let skippedCount = 0;

  for (const migration of MIGRATIONS_TO_CHECK) {
    log("info", `Vérification : ${migration.name}`);

    const row = await checkMigrationStatus(migration.name);

    if (!row) {
      log("info", `→ Migration absente de _prisma_migrations — prisma migrate deploy l'appliquera.`);
      skippedCount++;
      continue;
    }

    if (row.finished_at !== null) {
      log("success", `→ Migration déjà appliquée (finished_at: ${row.finished_at.toISOString()}).`);
      skippedCount++;
      continue;
    }

    // Migration trouvée avec finished_at = NULL → état "failed" ou "pending"
    log("warn", `→ Migration en état échoué/incomplet détectée.`);
    if (row.logs) {
      log("warn", `→ Logs d'erreur : ${row.logs.substring(0, 200)}…`);
    }

    // Vérifier l'état réel de la base de données
    const colExists = await columnExists(
      migration.checkColumn.table,
      migration.checkColumn.column
    );
    const tblExists = await tableExists(migration.checkTable);

    log("info", `→ Colonne ${migration.checkColumn.table}.${migration.checkColumn.column} : ${colExists ? "présente" : "absente"}`);
    log("info", `→ Table ${migration.checkTable} : ${tblExists ? "présente" : "absente"}`);

    if (colExists && tblExists) {
      // Les changements sont en DB → marquer comme applied
      log("warn", `→ Changements déjà appliqués en DB. Marquage de la migration comme "applied"…`);

      if (isDryRun) {
        log("warn", `[DRY-RUN] UPDATE _prisma_migrations SET finished_at=NOW() WHERE migration_name='${migration.name}'`);
      } else {
        await prisma.$executeRaw`
          UPDATE "_prisma_migrations"
          SET
            finished_at         = NOW(),
            applied_steps_count = 1,
            logs                = NULL
          WHERE migration_name = ${migration.name}
            AND finished_at IS NULL
        `;
        log("success", `→ Migration marquée comme applied avec succès.`);
      }
      resolvedCount++;
    } else if (!colExists && !tblExists) {
      // Rien n'a été appliqué → supprimer l'entrée failed pour permettre le rejeu
      log("warn", `→ Aucun changement en DB. Suppression de l'entrée failed pour permettre le rejeu…`);

      if (isDryRun) {
        log("warn", `[DRY-RUN] DELETE FROM _prisma_migrations WHERE migration_name='${migration.name}'`);
      } else {
        await prisma.$executeRaw`
          DELETE FROM "_prisma_migrations"
          WHERE migration_name = ${migration.name}
            AND finished_at IS NULL
        `;
        log("success", `→ Entrée supprimée. prisma migrate deploy pourra rejouer la migration.`);
      }
      resolvedCount++;
    } else {
      // État partiellement appliqué — situation ambiguë, ne pas agir automatiquement
      log("error", `→ État PARTIELLEMENT appliqué détecté (col: ${colExists}, tbl: ${tblExists}).`);
      log("error", `→ Intervention manuelle requise.`);
      log("error", `→ Commande Prisma : npx prisma migrate resolve --applied ${migration.name}`);
      log("error", `→ Ou pour rejeu  : npx prisma migrate resolve --rolled-back ${migration.name}`);
      process.exit(1);
    }
  }

  if (isDryRun) {
    log("warn", `=== DRY-RUN terminé : ${resolvedCount} résolution(s) simulée(s), ${skippedCount} ignorée(s) ===`);
  } else {
    log("success", `Résolution terminée : ${resolvedCount} migration(s) résolue(s), ${skippedCount} ignorée(s).`);
  }
}

main()
  .catch((err) => {
    log("error", `Erreur inattendue : ${err instanceof Error ? err.message : String(err)}`);
    if (process.env.NODE_ENV === "development" && err instanceof Error) {
      console.error(err.stack);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
