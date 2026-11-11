import ts from "typescript";
import fs from "node:fs";
const pages = {
  "": "home",
  platform: "platform",
  mission: "mission",
  products: "products",
  "zeebaran-hub": "zeebaran-hub",
  innovation: "innovation",
  impact: "impact",
  partnerships: "partnerships",
  governance: "governance",
  about: "about",
  contact: "contact",
  "contact/simple": "contact-simple",
};
for (const [route, key] of Object.entries(pages)) {
  const f = "app/" + (route ? route + "/" : "") + "page.tsx";
  let s = fs.readFileSync(f, "utf8");
  if (s.includes("PageContent")) continue;
  const ast = ts.createSourceFile(f, s, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fn = ast.statements.find(
    (n) =>
      ts.isFunctionDeclaration(n) &&
      n.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword),
  );
  const ret = fn?.body?.statements.find(ts.isReturnStatement);
  if (!ret?.expression) throw Error(f);
  const expr = ret.expression;
  const a = expr.getStart(ast),
    b = expr.end;
  s =
    s.slice(0, a) +
    '(<PageContent page="' +
    key +
    '">{' +
    s.slice(a, b) +
    "}</PageContent>)" +
    s.slice(b);
  fs.writeFileSync(f, 'import {PageContent} from "@/features/cms/server/public";\n' + s);
}
