"use client";
import { useEffect } from "react";
import { PageHero } from "@/components/sections";
import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <PageHero
      eyebrow="Something went wrong"
      title="That did not {go to plan.}"
      actions={
        <>
          <button
            onClick={reset}
            className="rounded-full bg-green px-6 py-3 text-[0.8125rem] font-semibold text-white transition hover:bg-forest"
          >
            Try again
          </button>
          <Button href="/" variant="ghost">
            Back to home
          </Button>
        </>
      }
    >
      <p>An unexpected error occurred. You can try again, or return to the home page.</p>
    </PageHero>
  );
}
