import { AdminRequestError } from "./client";

/** Keep server authorization errors visible; never expose raw Firebase internals. */
export function adminAuthError(error: unknown, action: "signin" | "reset" = "signin") {
  if (error instanceof AdminRequestError) return error.message;
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const messages: Record<string, string> = {
    "auth/unauthorized-domain":
      "This website is not authorised for sign-in in Firebase. Contact the administrator.",
    "auth/operation-not-allowed":
      "This sign-in method is not enabled in Firebase. Contact the administrator.",
    "auth/popup-blocked":
      "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
    "auth/popup-closed-by-user": "The sign-in window closed before completion. You can try again.",
    "auth/cancelled-popup-request": "A sign-in window is already open. Complete it or try again.",
    "auth/network-request-failed":
      "The sign-in service could not be reached. Check your connection and retry.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential":
      "The email or password is incorrect. Try again or use Set or reset password.",
    "auth/wrong-password":
      "The email or password is incorrect. Try again or use Set or reset password.",
    "auth/user-not-found":
      "The email or password is incorrect. Try again or use Set or reset password.",
    "auth/user-disabled": "This account is disabled. Contact the administrator.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes before trying again.",
    "auth/account-exists-with-different-credential":
      "Use the sign-in method already linked to your account.",
  };
  // Password recovery must not reveal whether an address has an account.
  if (action === "reset" && code === "auth/user-not-found")
    return "If this account is registered, you can request a secure password link.";
  return (
    messages[code] ||
    (action === "reset"
      ? "The password link could not be sent. Please try again."
      : "Sign-in could not complete. Please try again.")
  );
}
