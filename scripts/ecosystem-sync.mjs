#!/usr/bin/env node
/**
 * Sync sibling product repos into ecosystem/sites/ (gitignored).
 * Each site keeps its own .git — edits push back to that site's remote,
 * so the hub repo never absorbs sibling history (no cross-project conflicts).
 *
 * Usage: node scripts/ecosystem-sync.mjs
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "ecosystem", "sites.json");
/**
 * Checkouts live OUTSIDE the Next.js app tree so TypeScript / next build
 * never typechecks sibling products (avoids path alias collisions).
 * Default: /agent/ecosystem-sites
 */
const SITES_DIR =
  process.env.NOVAOS_ECOSYSTEM_SITES_DIR ||
  path.resolve(ROOT, "..", "ecosystem-sites");

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (res.status !== 0) {
    const err = (res.stderr || res.stdout || "").trim();
    throw new Error(`${cmd} ${args.join(" ")} failed: ${err}`);
  }
  return (res.stdout || "").trim();
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function resolveFallback(rel) {
  if (!rel) return null;
  return path.resolve(ROOT, rel);
}

function syncSite(site) {
  const dest = path.join(SITES_DIR, site.id);
  ensureDir(SITES_DIR);

  if (fs.existsSync(path.join(dest, ".git"))) {
    console.log(`↑  ${site.id}: pull existing checkout`);
    try {
      run("git", ["fetch", "--all", "--prune"], dest);
      run("git", ["pull", "--ff-only"], dest);
      console.log(`   ok ${dest}`);
      return { id: site.id, status: "pulled", dest };
    } catch (err) {
      console.warn(`   pull skipped: ${err.message}`);
      return { id: site.id, status: "pull-failed", dest, error: err.message };
    }
  }

  if (site.repo) {
    console.log(`↓  ${site.id}: clone ${site.repo}`);
    try {
      run("git", ["clone", site.repo, dest], ROOT);
      console.log(`   ok ${dest}`);
      return { id: site.id, status: "cloned", dest };
    } catch (err) {
      console.warn(`   clone failed: ${err.message}`);
      // fall through to local fallback
    }
  }

  const fallback = resolveFallback(site.localFallback);
  if (fallback && fs.existsSync(fallback)) {
    console.log(`⇄  ${site.id}: link local fallback ${fallback}`);
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    // Prefer copy of git worktree via clone --local when it is a git repo
    if (fs.existsSync(path.join(fallback, ".git"))) {
      try {
        run("git", ["clone", fallback, dest], ROOT);
        console.log(`   ok local-clone ${dest}`);
        return { id: site.id, status: "local-clone", dest };
      } catch (err) {
        console.warn(`   local-clone failed: ${err.message}`);
      }
    }
    fs.cpSync(fallback, dest, { recursive: true });
    console.log(`   ok copy ${dest}`);
    return { id: site.id, status: "copied", dest };
  }

  console.log(`·  ${site.id}: no repo/fallback — skip`);
  return { id: site.id, status: "skipped" };
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  ensureDir(SITES_DIR);

  console.log("NovaOS ecosystem sync");
  console.log(`manifest: ${path.relative(ROOT, MANIFEST)}`);
  console.log(`target:   ${path.relative(ROOT, SITES_DIR)}`);
  console.log("");

  const results = [];
  for (const site of manifest.sites || []) {
    results.push(syncSite(site));
  }

  const summaryPath = path.join(SITES_DIR, "_sync-summary.json");
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        results,
      },
      null,
      2
    )
  );

  console.log("\nDone.");
  console.log(`Summary → ${path.relative(ROOT, summaryPath)}`);
  console.log(
    `Edit under ${SITES_DIR}/<id>, then commit+push inside that folder (its own git).`
  );
}

main();
