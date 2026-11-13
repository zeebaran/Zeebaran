import { UserRound } from "lucide-react";
import { AssetImage } from "@/features/media/AssetImage";
import type { TeamMember } from "./model";
import styles from "./team.module.css";
export function TeamPortrait({
  member,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
}: {
  member: TeamMember;
  sizes?: string;
}) {
  return (
    <div className={styles.portrait}>
      {member.image ? (
        <AssetImage
          src={member.image.src}
          alt={member.name}
          fill
          sizes={sizes}
          className={styles.photo}
        />
      ) : (
        <div
          className={styles.placeholder}
          aria-label={`Portrait of ${member.name} not yet available`}
          role="img"
        >
          <UserRound size={44} strokeWidth={1} />
          <span>
            {member.name
              .replace(/^(Mr\.|Dr\.)\s*/, "")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </span>
        </div>
      )}
    </div>
  );
}
