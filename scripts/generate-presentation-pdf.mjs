/**
 * Generate defense presentation PDF → public/docs/
 * Run: node scripts/generate-presentation-pdf.mjs
 */
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PRESENTATION } from "./presentation-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "docs");
const OUTPUT = path.join(OUT_DIR, "presentation.pdf");
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/</g, "&lt;");
}

function mdInline(text) {
  return esc(text).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

function renderContent(text) {
  const lines = text.trim().split("\n");
  let html = "";
  let inTable = false;

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    if (t.startsWith("|") && t.includes("|")) {
      if (!inTable) {
        html += "<table>";
        inTable = true;
      }
      if (t.includes("---")) continue;
      const cells = t.split("|").filter((c) => c.trim());
      const tag = html.includes("<tr>") && !html.endsWith("</tr>") ? "td" : "th";
      if (html.includes("<table>") && !html.includes("<tr>")) {
        html += "<tr>" + cells.map((c) => `<th>${mdInline(c.trim())}</th>`).join("") + "</tr>";
      } else if (t.match(/^\|/)) {
        html += "<tr>" + cells.map((c) => `<td>${mdInline(c.trim())}</td>`).join("") + "</tr>";
      }
      continue;
    }
    if (inTable) {
      html += "</table>";
      inTable = false;
    }

    if (t.startsWith("- ") || t.startsWith("✅")) {
      html += `<li>${mdInline(t.replace(/^-\s*/, ""))}</li>`;
    } else {
      html += `<p>${mdInline(t)}</p>`;
    }
  }
  if (inTable) html += "</table>";
  return html.replace(/(<li>.*<\/li>)+/g, (m) => `<ul>${m}</ul>`);
}

const sectionsHtml = PRESENTATION.sections
  .map(
    (s) => `
<section class="section">
  <h2>${esc(s.title)}</h2>
  ${renderContent(s.content)}
</section>`,
  )
  .join("");

const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8">
<style>
@page { size: A4; margin: 14mm 16mm; }
body { font-family: Tahoma, 'B Nazanin', Arial; font-size: 11pt; line-height: 1.75; color: #111; }
.cover { text-align: center; page-break-after: always; padding-top: 80px; }
.cover h1 { font-size: 28pt; color: #0d5c63; margin-bottom: 8px; }
.cover .sub { font-size: 14pt; color: #444; margin-bottom: 40px; }
.cover .meta { font-size: 12pt; line-height: 2; color: #333; }
.cover .url { margin-top: 50px; font-size: 11pt; color: #0d7377; direction: ltr; }
.section { page-break-inside: avoid; margin-bottom: 16px; }
h2 { font-size: 14pt; color: #fff; background: linear-gradient(135deg,#0d5c63,#0d7377); padding: 8px 14px; border-radius: 6px; margin: 20px 0 10px; page-break-after: avoid; }
p { margin: 6px 0; text-align: justify; }
ul { margin: 8px 0; padding-right: 22px; }
li { margin: 4px 0; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
th, td { border: 1px solid #bbb; padding: 6px 10px; text-align: right; }
th { background: #e0f2f1; color: #0d5c63; }
b { color: #0d5c63; }
.footer { text-align: center; margin-top: 30px; color: #0d5c63; font-size: 12pt; page-break-before: always; padding-top: 40px; }
</style></head><body>

<div class="cover">
  <h1>${esc(PRESENTATION.title)}</h1>
  <p class="sub">${esc(PRESENTATION.subtitle)}</p>
  <div class="meta">
    <p><b>دانشگاه:</b> ${esc(PRESENTATION.university)}</p>
    <p><b>دانشجو:</b> ${esc(PRESENTATION.student)}</p>
    <p><b>استاد راهنما:</b> ${esc(PRESENTATION.advisor)}</p>
    <p><b>متن ارائه دفاع — از اول تا آخر پروژه</b></p>
  </div>
  <p class="url">${esc(PRESENTATION.url)}</p>
</div>

${sectionsHtml}

<div class="footer">
  <p><b>پایان ارائه — موفق باشید! 🎓</b></p>
  <p>${esc(PRESENTATION.url)}/docs</p>
</div>
</body></html>`;

fs.mkdirSync(OUT_DIR, { recursive: true });
const tmp = path.join(__dirname, "_presentation.html");
fs.writeFileSync(tmp, html, "utf8");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto(`file:///${tmp.replace(/\\/g, "/")}`, { waitUntil: "networkidle0" });
await page.pdf({
  path: OUTPUT,
  format: "A4",
  printBackground: true,
  margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
});
await browser.close();

const kb = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
console.log(`✅ PDF: ${OUTPUT} (${kb} KB)`);
