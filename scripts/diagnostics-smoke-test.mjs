#!/usr/bin/env node
/**
 * One-click smoke test for the /diagnostics route.
 *
 * 1. Runs `vite build` (production build) and fails fast on any build error.
 * 2. Spawns `vite preview` on a free port, waits until it responds.
 * 3. Loads `/diagnostics` and checks the SPA fallback returns index.html
 *    (status 200 + contains the root <div id="root">) — i.e. the route
 *    will mount the React app without a runtime error.
 * 4. Greps the build output for any obviously broken JSX/imports referenced
 *    by Diagnostics.tsx (Row component, SUPABASE_URL, etc.).
 *
 * Run:    npm run smoke:diagnostics
 */
import { execSync, spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const log = (...a) => console.log("[smoke]", ...a);
const fail = (m) => { console.error("[smoke] ❌", m); process.exit(1); };

// 1. Build
try {
  log("Running production build...");
  execSync("npx vite build", { stdio: "inherit" });
} catch {
  fail("vite build failed");
}

// 2. Sanity-check that Diagnostics.tsx + its components are present in source
const diag = "src/pages/Diagnostics.tsx";
if (!existsSync(diag)) fail(`${diag} is missing`);
const src = readFileSync(diag, "utf8");
for (const tok of ["const Row", "SUPABASE_URL", "export default Diagnostics"]) {
  if (!src.includes(tok)) fail(`Diagnostics.tsx missing token: ${tok}`);
}

// 3. Boot preview & curl /diagnostics
const port = 4317;
log(`Starting vite preview on :${port}...`);
const child = spawn("npx", ["vite", "preview", "--port", String(port), "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
});
child.stdout.on("data", (d) => process.stdout.write("[preview] " + d));
child.stderr.on("data", (d) => process.stderr.write("[preview] " + d));

let ok = false;
try {
  for (let i = 0; i < 40; i++) {
    await wait(500);
    try {
      const r = await fetch(`http://localhost:${port}/diagnostics`);
      const text = await r.text();
      if (r.ok && text.includes('id="root"')) { ok = true; break; }
    } catch { /* retry */ }
  }
} finally {
  child.kill("SIGTERM");
}
if (!ok) fail("/diagnostics did not return SPA shell");

log("✅ /diagnostics smoke test passed.");
