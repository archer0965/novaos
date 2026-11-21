#!/usr/bin/env node
/**
 * NovaOS ecosystem site audit (Playwright)
 *
 * Checks 5 product sites for:
 * - HTTP 404/500 (and other 4xx/5xx) on homepage navigation
 * - Console errors
 * - Paid / upgrade CTA hrefs (ECPay or known upgrade destinations)
 * - Residual 「審核中」「待審核」「金流審核」copy
 * - Desktop + mobile homepage screenshots → ./audit-screenshots
 *
 * Usage:
 *   node scripts/audit-sites.js
 *   npm run audit:sites
 */

const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const SHOT_DIR = path.join(ROOT, "audit-screenshots");
const REPORT_PATH = path.join(ROOT, "audit-report.json");
const MANIFEST_PATH = path.join(ROOT, "ecosystem", "sites.json");

function loadSites() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const list = [];
  if (manifest.hub) {
    list.push({
      id: manifest.hub.id,
      name: `${manifest.hub.name}（主站）`,
      url: manifest.hub.url,
    });
  }
  for (const s of manifest.sites || []) {
    list.push({ id: s.id, name: s.name, url: s.url });
  }
  return list;
}

const SITES = loadSites();

const VIEWPORTS = [
  {
    id: "desktop",
    label: "Desktop",
    viewport: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
    userAgent: undefined,
  },
  {
    id: "mobile",
    label: "Mobile",
    // iPhone 14-like; fall back if device descriptor missing
    device: devices["iPhone 14"] || devices["iPhone 13"] || null,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
];

/**
 * CTA text that implies paid upgrade / checkout.
 * Keep narrow to avoid nav labels like「方案」「旗艦版預覽」.
 */
const PAY_CTA_RE =
  /(付費|升級|綠界付款|前往結帳|立即結帳|確認付款|購買方案|立即購買|立即升級|線上付款|綠界結帳)/i;

/** Acceptable destinations for paid CTAs */
const ACCEPTABLE_HREF_RE =
  /ecpay|payment\.ecpay\.com\.tw|paycheck\.com\.de|taiwanbiz\.vercel\.app\/(pricing|signup|login|register)|novastore[^/]*\/(signup|login|dashboard\/pass|#pricing)|docmate[^/]*\/(login|signup|dashboard\/upgrade)|\/(signup|login|register|dashboard\/pass|upgrade|checkout|billing)(\?|#|$)/i;

const FORBIDDEN_COPY = ["審核中", "金流審核中", "待審核", "金流審核"];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function absolutize(href, base) {
  if (!href) return null;
  const h = href.trim();
  if (
    !h ||
    h.startsWith("#") ||
    h.startsWith("javascript:") ||
    h.startsWith("mailto:") ||
    h.startsWith("tel:")
  ) {
    return h;
  }
  try {
    return new URL(h, base).toString();
  } catch {
    return h;
  }
}

function evaluateHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
    return {
      ok: false,
      reason: "缺少可導向的 href（可能僅靠 JS / form POST）",
    };
  }
  if (ACCEPTABLE_HREF_RE.test(href)) {
    return { ok: true, reason: "符合綠界／升級／登入結帳路徑" };
  }
  // External product sites often deep-link to hub upgrade — still flag if unknown
  return {
    ok: false,
    reason: "未偵測到 ecpay 或已知升級／結帳路徑",
  };
}

async function collectPayCtas(page, pageUrl) {
  return page.evaluate(
    ({ payReSource, pageUrl: base }) => {
      const payRe = new RegExp(payReSource, "i");
      const nodes = Array.from(
        document.querySelectorAll("a, button, [role='button'], input[type='submit']")
      );
      const out = [];
      for (const el of nodes) {
        const text = (
          el.innerText ||
          el.getAttribute("aria-label") ||
          el.getAttribute("value") ||
          el.getAttribute("title") ||
          ""
        )
          .replace(/\s+/g, " ")
          .trim();
        if (!text || text.length > 60) continue;
        // Skip FAQ / prose that merely mentions 付費
        if (/[？?]/.test(text) || /嗎[？?]?$/.test(text)) continue;
        if (!payRe.test(text)) continue;

        let href =
          el.getAttribute("href") ||
          el.getAttribute("formaction") ||
          el.closest("a")?.getAttribute("href") ||
          "";
        // data-* used by some CTAs
        href =
          href ||
          el.getAttribute("data-href") ||
          el.getAttribute("data-url") ||
          "";

        out.push({
          tag: el.tagName.toLowerCase(),
          text,
          href: href || null,
        });
      }
      // de-dupe
      const seen = new Set();
      return out.filter((item) => {
        const key = `${item.tag}|${item.text}|${item.href}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    { payReSource: PAY_CTA_RE.source, pageUrl }
  );
}

async function findForbiddenCopy(page) {
  return page.evaluate((phrases) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const hits = [];
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const raw = (node.nodeValue || "").replace(/\s+/g, " ").trim();
      if (!raw) continue;
      for (const phrase of phrases) {
        if (raw.includes(phrase)) {
          const key = `${phrase}|${raw.slice(0, 120)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          hits.push({ phrase, snippet: raw.slice(0, 160) });
        }
      }
    }
    return hits;
  }, FORBIDDEN_COPY);
}

async function auditPage({ browser, site, viewport }) {
  const consoleErrors = [];
  const pageErrors = [];
  const httpFailures = [];

  const contextOptions = viewport.device
    ? { ...viewport.device }
    : {
        viewport: viewport.viewport,
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
        userAgent: viewport.userAgent,
      };

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message || String(err));
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 400) {
      const req = res.request();
      // Focus on document / same-origin navigations + XHR for homepage load noise filter
      if (req.resourceType() === "document" || status === 404 || status >= 500) {
        httpFailures.push({
          status,
          url: res.url(),
          resourceType: req.resourceType(),
        });
      }
    }
  });

  let navStatus = null;
  let navOk = false;
  let finalUrl = site.url;

  try {
    const response = await page.goto(site.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    navStatus = response?.status() ?? null;
    finalUrl = page.url();
    navOk = Boolean(response && response.ok());
    // Allow SPA hydration / client fetch settle
    await page.waitForTimeout(2500);
  } catch (err) {
    pageErrors.push(`navigation failed: ${err.message || err}`);
  }

  const shotName = `${slug(site.id)}-${viewport.id}.png`;
  const shotPath = path.join(SHOT_DIR, shotName);
  try {
    await page.screenshot({ path: shotPath, fullPage: true });
  } catch (err) {
    pageErrors.push(`screenshot failed: ${err.message || err}`);
  }

  const rawCtas = await collectPayCtas(page, finalUrl).catch(() => []);
  const payCtas = rawCtas.map((cta) => {
    const abs = absolutize(cta.href, finalUrl);
    const verdict = evaluateHref(abs || cta.href);
    return {
      ...cta,
      absoluteHref: abs,
      hrefOk: verdict.ok,
      hrefNote: verdict.reason,
    };
  });

  const forbiddenHits = await findForbiddenCopy(page).catch(() => []);

  // Document-level HTTP failure on the homepage itself
  const homepageHttpBad =
    navStatus === 404 ||
    navStatus === 500 ||
    (typeof navStatus === "number" && navStatus >= 400);

  const docHttpFails = httpFailures.filter(
    (f) => f.resourceType === "document" || f.status === 404 || f.status >= 500
  );

  await context.close();

  return {
    siteId: site.id,
    siteName: site.name,
    url: site.url,
    finalUrl,
    viewport: viewport.id,
    viewportLabel: viewport.label,
    navStatus,
    navOk: navOk && !homepageHttpBad,
    homepageHttpBad,
    httpFailures: docHttpFails.slice(0, 30),
    consoleErrors: [...new Set(consoleErrors)].slice(0, 40),
    pageErrors: [...new Set(pageErrors)].slice(0, 20),
    payCtas,
    forbiddenHits,
    screenshot: path.relative(ROOT, shotPath),
  };
}

function printResult(r) {
  const flag = (ok) => (ok ? "PASS" : "FAIL");
  console.log(`\n=== ${r.siteName} · ${r.viewportLabel} ===`);
  console.log(`URL: ${r.url}`);
  console.log(`HTTP: ${flag(r.navOk)} (status=${r.navStatus})`);
  console.log(
    `Console errors: ${flag(r.consoleErrors.length === 0 && r.pageErrors.length === 0)} (${r.consoleErrors.length + r.pageErrors.length})`
  );
  if (r.consoleErrors.length) {
    r.consoleErrors.slice(0, 5).forEach((e) => console.log(`  · console: ${e}`));
  }
  if (r.pageErrors.length) {
    r.pageErrors.slice(0, 5).forEach((e) => console.log(`  · page: ${e}`));
  }

  const badHref = r.payCtas.filter((c) => !c.hrefOk);
  console.log(
    `Paid/Upgrade CTAs: found ${r.payCtas.length}, suspect href ${badHref.length}`
  );
  r.payCtas.slice(0, 12).forEach((c) => {
    console.log(
      `  · [${c.hrefOk ? "ok" : "??"}] "${c.text}" → ${c.absoluteHref || c.href || "(none)"} (${c.hrefNote})`
    );
  });

  console.log(
    `Forbidden copy: ${flag(r.forbiddenHits.length === 0)} (${r.forbiddenHits.length})`
  );
  r.forbiddenHits.forEach((h) => {
    console.log(`  · 「${h.phrase}」… ${h.snippet}`);
  });

  console.log(`Screenshot: ${r.screenshot}`);
}

function summarize(results) {
  const summary = {
    sites: SITES.length,
    runs: results.length,
    httpFails: results.filter((r) => !r.navOk).length,
    consoleFails: results.filter(
      (r) => r.consoleErrors.length + r.pageErrors.length > 0
    ).length,
    forbiddenFails: results.filter((r) => r.forbiddenHits.length > 0).length,
    ctaSuspect: results.reduce(
      (n, r) => n + r.payCtas.filter((c) => !c.hrefOk).length,
      0
    ),
  };
  return summary;
}

async function main() {
  ensureDir(SHOT_DIR);
  console.log("NovaOS site audit starting…");
  console.log(`Screenshots → ${SHOT_DIR}`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const site of SITES) {
      for (const viewport of VIEWPORTS) {
        process.stdout.write(
          `\nAuditing ${site.name} (${viewport.label})… `
        );
        const result = await auditPage({ browser, site, viewport });
        results.push(result);
        console.log(result.navOk ? "done" : "HTTP issue");
        printResult(result);
      }
    }
  } finally {
    await browser.close();
  }

  const summary = summarize(results);
  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    results,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  console.log("\n========== SUMMARY ==========");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Full report: ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Screenshots: ${path.relative(ROOT, SHOT_DIR)}/`);

  const hardFail =
    summary.httpFails > 0 || summary.forbiddenFails > 0;
  process.exitCode = hardFail ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
