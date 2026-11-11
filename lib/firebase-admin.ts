import "server-only";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { initializeFirestore } from "firebase-admin/firestore";
export function firebase() {
  const existing = getApps().find((app) => app.name === "zeebaran");
  if (existing) return existing;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const app = initializeApp(
    {
      projectId,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      credential:
        clientEmail && privateKey
          ? cert({ projectId, clientEmail, privateKey })
          : applicationDefault(),
    },
    "zeebaran",
  );
  // All current operations are request/response. REST avoids loading gRPC and
  // measured better warm-read latency; the SDK retains transaction semantics.
  // A deployment can explicitly opt back into gRPC without changing credentials.
  initializeFirestore(app, { preferRest: process.env.FIRESTORE_PREFER_REST !== "false" });
  return app;
}
