import Link from "next/link";

/** Italic serif wordmark, as in the approved Home design. The plant mark is kept for favicon/OG use. */
export function Logo({ light = false, dot = false }: { light?: boolean; dot?: boolean }) {
  return (
    <Link href="/" aria-label="Zeebaran home" className="group flex items-center gap-2">
      <span
        className={`font-serif text-2xl font-semibold italic tracking-tight transition-colors ${
          light ? "!text-[1.875rem] font-bold text-white" : "text-forest group-hover:text-green"
        }`}
      >
        zeebaran
      </span>
      {dot && <span className="size-2.5 rounded-full bg-leaf" aria-hidden />}
    </Link>
  );
}
