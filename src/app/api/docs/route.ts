import { NextResponse } from "next/server";
import { DOC_ENTRIES } from "@/lib/docs/entries";
import { searchDocs, highlightSnippet } from "@/lib/docs/search";
import { CATEGORY_LABELS, type DocCategory } from "@/lib/docs/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") as DocCategory | null;

  if (id) {
    const entry = DOC_ENTRIES.find((e) => e.id === id);
    if (!entry) {
      return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
    }
    return NextResponse.json({ entry });
  }

  if (q.trim()) {
    const results = searchDocs(q, DOC_ENTRIES).slice(0, 40).map((entry) => ({
      id: entry.id,
      category: entry.category,
      categoryLabel: CATEGORY_LABELS[entry.category],
      title: entry.title,
      filePath: entry.filePath,
      snippet: highlightSnippet(entry, q, 160),
    }));
    return NextResponse.json({ results, total: results.length, query: q });
  }

  let list = DOC_ENTRIES;
  if (category && category in CATEGORY_LABELS) {
    list = list.filter((e) => e.category === category);
  }

  const index = list.map((entry) => ({
    id: entry.id,
    category: entry.category,
    categoryLabel: CATEGORY_LABELS[entry.category],
    title: entry.title,
    filePath: entry.filePath,
  }));

  return NextResponse.json({
    index,
    total: index.length,
    count: DOC_ENTRIES.length,
  });
}
