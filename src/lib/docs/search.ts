import type { DocEntry } from "./types";

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function searchDocs(query: string, entries: DocEntry[]): DocEntry[] {
  const words = query
    .trim()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 1);

  if (!words.length) return [];

  const scored: { entry: DocEntry; score: number }[] = [];

  for (const entry of entries) {
    const title = normalize(entry.title);
    const path = normalize(entry.filePath ?? "");
    const keywords = normalize(entry.keywords.join(" "));
    const body = normalize(entry.body);
    const haystack = `${title} ${path} ${keywords} ${body}`;

    let score = 0;
    let allMatch = true;

    for (const raw of words) {
      const word = normalize(raw);
      if (!word) continue;

      if (haystack.includes(word)) {
        if (title.includes(word)) score += 15;
        else if (path.includes(word)) score += 12;
        else if (keywords.includes(word)) score += 8;
        else score += 3;
      } else {
        allMatch = false;
        break;
      }
    }

    if (allMatch && score > 0) scored.push({ entry, score });
  }

  return scored.sort((a, b) => b.score - a.score).map((s) => s.entry);
}

export function highlightSnippet(entry: DocEntry, query: string, maxLen = 120): string {
  const words = query.trim().split(/\s+/).filter(Boolean);
  const text = entry.body.replace(/\n+/g, " ");
  if (!words.length) return text.slice(0, maxLen) + (text.length > maxLen ? "…" : "");

  const lower = text.toLowerCase();
  let idx = -1;
  for (const w of words) {
    const i = lower.indexOf(w.toLowerCase());
    if (i >= 0 && (idx < 0 || i < idx)) idx = i;
  }
  if (idx < 0) return text.slice(0, maxLen) + "…";

  const start = Math.max(0, idx - 40);
  const snippet = text.slice(start, start + maxLen);
  return (start > 0 ? "…" : "") + snippet + (start + maxLen < text.length ? "…" : "");
}
