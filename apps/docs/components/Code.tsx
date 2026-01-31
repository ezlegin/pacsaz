import * as React from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import { cn } from "@repo/ui/lib/utils";

export async function Code({
  code,
  className,
  title,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  const highlightedCode = await highlightCode(code);
  return (
    <div
      className={cn("bg-[#1f2028] rounded-md border flex flex-col", className)}
    >
      {title && (
        <span className="p-1.5 px-3 bg-white/5 w-full rounded-t-md">
          <div>{title}</div>
        </span>
      )}
      <div className="p-4 px-5">
        <section
          dangerouslySetInnerHTML={{
            __html: highlightedCode,
          }}
        />
      </div>
    </div>
  );
}

async function highlightCode(code: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      keepBackground: false,
      grid: true,
      defaultLang: "ts",
    })
    .use(rehypeStringify)
    .process(code);

  return String(file);
}
