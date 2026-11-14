"use client";
import { AssetImage } from "@/features/media/AssetImage";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  setPersistence,
  inMemoryPersistence,
  signOut,
  connectAuthEmulator,
} from "firebase/auth";
import { ArrowRight, Leaf, ShieldCheck, Mail, KeyRound } from "lucide-react";
import { adminRequest, authConfigured, firebasePublic } from "@/features/admin/client";
export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function login(google: boolean) {
    setError("");
    setPending(true);
    let auth;
    try {
      auth = getAuth(getApps()[0] || initializeApp(firebasePublic));
      if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST && !auth.emulatorConfig)
        connectAuthEmulator(auth, "http://" + process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST, {
          disableWarnings: true,
        });
      await setPersistence(auth, inMemoryPersistence);
      const credential = google
        ? await signInWithPopup(auth, new GoogleAuthProvider())
        : await signInWithEmailAndPassword(auth, email, password);
      await adminRequest("/api/admin/session", { idToken: await credential.user.getIdToken() });
      await signOut(auth);
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      if (auth) await signOut(auth).catch(() => {});
      const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
      const messages: Record<string, string> = {
        "auth/operation-not-allowed": "This sign-in method is not enabled. Use Google to continue.",
        "auth/popup-blocked":
          "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
        "auth/popup-closed-by-user":
          "The sign-in window closed before completion. You can try again.",
        "auth/network-request-failed":
          "The sign-in service could not be reached. Check your connection and retry.",
      };
      setError(
        e instanceof Error && e.message.includes("administration")
          ? e.message
          : messages[code] || "Sign-in could not complete. Check your account and try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <main id="main" tabIndex={-1} className="admin-login">
      <div className="admin-login-story">
        <Link href="/" className="admin-wordmark">
          zeebaran
        </Link>
        <div>
          <span className="admin-eyebrow">THE EDITORIAL DESK</span>
          <h1>
            Strong roots.
            <br />
            <em>A living story.</em>
          </h1>
          <p>
            A considered place to look after the words, imagery and field stories that shape
            Zeebaran.
          </p>
          <div
            className="admin-login-photo"
            role="img"
            aria-label="An orchard in the Kashmir valley"
          >
            <AssetImage
              src="asset:banners/home/home-desktop-2400x1140-new-webp"
              alt=""
              fill
              sizes="410px"
              className="object-cover"
            />
          </div>
          <small>KASHMIR · CULTIVATED WITH CARE</small>
        </div>
        <span className="admin-login-note">
          <Leaf size={15} /> One platform. A shared responsibility.
        </span>
      </div>
      <div className="admin-login-form">
        <span className="admin-kicker">
          <ShieldCheck size={16} /> AUTHORISED ACCESS
        </span>
        <h2>Welcome to the desk.</h2>
        <p>Sign in with your authorised Zeebaran account.</p>
        {!authConfigured && (
          <div className="admin-notice" role="status">
            Firebase sign-in is awaiting the registered web-app configuration. Editing stays
            protected until the connection is ready.
          </div>
        )}
        <button
          className="admin-btn admin-google"
          disabled={!authConfigured || pending}
          onClick={() => void login(true)}
        >
          <span className="inline-flex items-center gap-3">
            {/* Official Firebase UI asset, served locally without a third-party request. */}
            <Image src="/brand/google.svg" alt="" width={20} height={20} className="shrink-0" />
            Continue with Google
          </span>
          <ArrowRight size={16} />
        </button>
        <div className="admin-divider">
          <span>or use your email</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void login(false);
          }}
        >
          <label>
            <span>
              <Mail size={14} /> Email address
            </span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@zeebaran.com"
              disabled={pending || !authConfigured}
            />
          </label>
          <label>
            <span>
              <KeyRound size={14} /> Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending || !authConfigured}
            />
          </label>
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          <button className="admin-btn admin-primary" disabled={!authConfigured || pending}>
            {pending ? "Verifying your account…" : "Open the editorial desk"}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="admin-security-note">
          <ShieldCheck size={15} /> Access is verified on the server. Only approved administrators
          can edit or publish.
        </p>
        <Link href="/" className="admin-back">
          ← Back to Zeebaran
        </Link>
      </div>
    </main>
  );
}
