/**
 * Backup the static `out/` export (if it exists) and remove
 * WordPress / Apache leftover artifacts from the project.
 *
 * Run once:  node scripts/backup-and-clean-wp.mjs
 */
import { existsSync } from "node:fs";
import { rm, mkdir, readdir, copyFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { execSync } from "node:child_process";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "out");
const BACKUP_DIR = join(ROOT, "backups");
const HTACCESS_SCRIPT = join(ROOT, "scripts", "write-static-htaccess.mjs");

async function backupOutDir() {
  if (!existsSync(OUT_DIR)) {
    console.log("No out/ directory found — nothing to back up.");
    return;
  }

  await mkdir(BACKUP_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const zipName = `static-export-backup-${stamp}.zip`;
  const zipPath = join(BACKUP_DIR, zipName);

  try {
    // Use PowerShell Compress-Archive on Windows
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${OUT_DIR}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: "inherit" }
    );
    console.log(`Backup created: ${zipPath}`);
  } catch {
    console.error("Backup compression failed. Skipping removal.");
    process.exit(1);
  }
}

async function removeWordPressLeftovers() {
  // 1. Remove write-static-htaccess.mjs
  if (existsSync(HTACCESS_SCRIPT)) {
    await rm(HTACCESS_SCRIPT);
    console.log("Removed: scripts/write-static-htaccess.mjs");
  }

  // 2. Remove .htaccess from out/ if it exists
  const htaccess = join(OUT_DIR, ".htaccess");
  if (existsSync(htaccess)) {
    await rm(htaccess);
    console.log("Removed: out/.htaccess");
  }

  console.log("WordPress / Apache leftover cleanup complete.");
}

async function main() {
  console.log("=== Static Export Backup & WordPress Cleanup ===\n");
  await backupOutDir();
  await removeWordPressLeftovers();
  console.log("\nDone. Remember to also remove the 'postbuild' script from package.json.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
