// Trusted operator only. Never exposed as a web route. Revokes existing sessions when a role changes.
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
const [email, role] = process.argv.slice(2);
if (!email || !["admin", "editor", "remove"].includes(role))
  throw Error(
    "Usage: node --env-file=.env.local scripts/set-catalog-role.mjs <verified-email> admin|editor|remove",
  );
const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credential:
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      ? cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        })
      : applicationDefault(),
});
const auth = getAuth(app),
  user = await auth.getUserByEmail(email);
if (!user.emailVerified) throw Error("Verify this email before granting a catalog role.");
const claims = { ...user.customClaims };
if (role === "remove") delete claims.zeebaranRole;
else claims.zeebaranRole = role;
await auth.setCustomUserClaims(user.uid, claims);
await auth.revokeRefreshTokens(user.uid);
console.log("Role changed; existing sessions revoked. The account must sign in again.");
