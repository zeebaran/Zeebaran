import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, getDoc, setDoc, doc } from "firebase/firestore";
const app = initializeApp({
  apiKey: "fake-api-key",
  projectId: "demo-catalog-rules",
  appId: "demo-rules",
});
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8396);
for (const collection of [
  "catalogEntries",
  "catalogPublished",
  "catalogAudit",
  "catalogAssets",
  "cmsMedia",
]) {
  for (const action of ["read", "write"]) {
    try {
      if (action === "read") await getDoc(doc(db, collection, "probe"));
      else await setDoc(doc(db, collection, "probe"), { name: "Not allowed" });
      throw Error("Unexpected direct-client permission: " + collection + " " + action);
    } catch (e) {
      if (e.code !== "permission-denied") throw e;
      console.log("Denied direct client", action, collection);
    }
  }
}
process.exit(0);
