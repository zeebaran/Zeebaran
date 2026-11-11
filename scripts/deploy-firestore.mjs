// Idempotent deployment through the documented APIs. Does not grant IAM roles or delete extra indexes.
import { cert } from "firebase-admin/app";
import fs from "node:fs/promises";
const project = process.argv.find((v) => v.startsWith("--project="))?.slice(10);
if (!project || project !== process.env.FIREBASE_PROJECT_ID)
  throw Error("Pass --project matching FIREBASE_PROJECT_ID.");
if (process.argv.includes("--ttl"))
  throw Error("Managed TTL is disabled for the Spark configuration.");
const credential = cert({
  projectId: project,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
});
const token = (await credential.getAccessToken()).access_token,
  headers = { Authorization: "Bearer " + token, "Content-Type": "application/json" },
  definition = JSON.parse(await fs.readFile("firestore.indexes.json", "utf8"));
const base =
  "https://firestore.googleapis.com/v1/projects/" +
  project +
  "/databases/(default)/collectionGroups/";
async function request(url, method = "GET", data) {
  const r = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(30000),
    }),
    result = await r.json();
  if (!r.ok)
    throw Error(
      "HTTP " + r.status + ": " + (result.error?.message || "Deployment failed").split("\n")[0],
    );
  return result;
}
for (const group of [...new Set(definition.indexes.map((i) => i.collectionGroup))]) {
  const current = await request(base + group + "/indexes");
  for (const index of definition.indexes.filter((i) => i.collectionGroup === group)) {
    const signature = (i) =>
      JSON.stringify({
        queryScope: i.queryScope,
        fields: i.fields.filter((f) => f.fieldPath !== "__name__"),
      });
    if (current.indexes?.some((i) => signature(i) === signature(index))) {
      console.log("Index exists:", group, index.fields.map((f) => f.fieldPath).join(", "));
      continue;
    }
    await request(base + group + "/indexes", "POST", {
      queryScope: index.queryScope,
      fields: index.fields,
    });
    console.log("Index requested:", group, index.fields.map((f) => f.fieldPath).join(", "));
  }
}
for (const field of definition.fieldOverrides) {
  const url = base + field.collectionGroup + "/fields/" + encodeURIComponent(field.fieldPath),
    body = {
      indexConfig: {
        indexes: field.indexes.map((i) => ({
          queryScope: i.queryScope,
          fields: [
            {
              fieldPath: field.fieldPath,
              ...(i.order ? { order: i.order } : { arrayConfig: i.arrayConfig }),
            },
          ],
        })),
      },
    };
  if (field.ttl) throw Error("Managed TTL is not supported by this Spark deployment.");
  await request(url + "?updateMask=indexConfig", "PATCH", body);
  console.log("Field indexing configured:", field.collectionGroup, field.fieldPath);
}
if (process.argv.includes("--rules")) {
  const rulesBase = "https://firebaserules.googleapis.com/v1/projects/" + project;
  const ruleset = await request(rulesBase + "/rulesets", "POST", {
    source: {
      files: [{ name: "firestore.rules", content: await fs.readFile("firestore.rules", "utf8") }],
    },
  });
  const name = "projects/" + project + "/releases/cloud.firestore";
  await request(rulesBase + "/releases/cloud.firestore", "PATCH", {
    release: { name, rulesetName: ruleset.name },
    updateMask: "rulesetName",
  });
  console.log("Firestore rules deployed.");
}
console.log("Index builds are asynchronous. Verify every declared index is READY before release.");
