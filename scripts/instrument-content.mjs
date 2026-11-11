import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
const skip = new Set(["components/SiteFrame.tsx", "components/FieldTrace.tsx"]);
const tags = new Set([
  "p",
  "span",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "small",
  "a",
  "button",
  "li",
  "dt",
  "dd",
  "legend",
  "label",
  "figcaption",
  "strong",
  "em",
  "blockquote",
  "footer",
]);
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((x) =>
      x.isDirectory()
        ? walk(path.join(dir, x.name))
        : x.name.endsWith(".tsx")
          ? [path.join(dir, x.name)]
          : [],
    );
}
for (const f of walk("components")) {
  if (skip.has(f) || f === "components/Motion.tsx") continue;
  let text = fs.readFileSync(f, "utf8");
  if (text.includes("ContentText")) continue;
  const file = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
    edits = [];
  function visit(node) {
    if (ts.isJsxElement(node) && tags.has(node.openingElement.tagName.getText(file))) {
      for (const child of node.children) {
        if (ts.isJsxText(child) && child.getText(file).trim())
          edits.push([child.getStart(file), "<ContentText>"], [child.end, "</ContentText>"]);
        else if (
          ts.isJsxExpression(child) &&
          child.expression &&
          !ts.isJsxElement(child.expression) &&
          !ts.isJsxSelfClosingElement(child.expression)
        )
          edits.push([child.getStart(file), "<ContentText>"], [child.end, "</ContentText>"]);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  edits.sort((a, b) => b[0] - a[0]);
  for (const [at, value] of edits) text = text.slice(0, at) + value + text.slice(at);
  text = text.replace(
    /import Image from "next\/image";/,
    'import { ContentImage as Image } from "@/features/cms/Content";',
  );
  if (edits.length) text = 'import { ContentText } from "@/features/cms/Content";\n' + text;
  // Client directives must remain first.
  if (text.includes('"use client";')) text = '"use client";\n' + text.replace('"use client";', "");
  fs.writeFileSync(f, text);
}
