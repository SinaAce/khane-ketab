"use client";

import type { ReactNode } from "react";

function renderInline(text: string) {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-teal-brand">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-rose-700 dark:text-rose-300"
          dir="ltr"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export function DocsBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length) {
      nodes.push(
        <ul key={key++} className="my-2 list-disc space-y-2 pr-5 text-sm leading-relaxed">
          {listItems.map((item, i) => (
            <li key={i} className="break-words">
              {renderInline(item.replace(/^-\s*/, ""))}
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      nodes.push(
        <h3 key={key++} className="mb-2 mt-5 border-r-4 border-teal-brand pr-2 text-base font-bold text-teal-brand">
          {renderInline(trimmed.slice(3))}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      nodes.push(
        <h4 key={key++} className="mb-1 mt-3 text-sm font-bold text-foreground">
          {renderInline(trimmed.slice(4))}
        </h4>,
      );
      continue;
    }

    if (trimmed.startsWith("| ") && trimmed.includes("|")) {
      flushList();
      nodes.push(
        <p key={key++} className="my-1 overflow-x-auto font-mono text-xs text-muted" dir="ltr">
          {trimmed}
        </p>,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed);
      continue;
    }

    if (trimmed.startsWith("→ ")) {
      flushList();
      nodes.push(
        <p key={key++} className="my-0.5 pr-4 text-xs leading-relaxed text-muted">
          {renderInline(trimmed)}
        </p>,
      );
      continue;
    }

    flushList();
    nodes.push(
      <p key={key++} className="my-2 break-words text-sm leading-relaxed text-foreground/90">
        {renderInline(trimmed)}
      </p>,
    );
  }
  flushList();

  return <div className="docs-body">{nodes}</div>;
}
