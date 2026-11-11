import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098")
  throw Error("Use the disposable auth emulator only.");
const app = initializeApp({ projectId: "demo-zeebaran-admin" }),
  auth = getAuth(app);
for (const [email, password] of [
  ["zeebaran00@gmail.com", "Local-fixture-Only-786!"],
  ["outsider@example.test", "Local-fixture-Only-786!"],
]) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { emailVerified: true, password });
  } catch {
    user = await auth.createUser({ email, password, emailVerified: true });
  }
  console.log("Emulator fixture ready", email);
}
