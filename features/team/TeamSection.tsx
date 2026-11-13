"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X, Phone } from "lucide-react";
import { useTeamEntries } from "@/features/cms/Content";
import { Dialog } from "@/features/admin/Dialog";
import { phoneDigits } from "@/features/site/model";
import { defaultTeam, type TeamMember } from "./model";
import { TeamPortrait } from "./TeamPortrait";
import styles from "./team.module.css";
export function TeamSection() {
  const entries = useTeamEntries() ?? defaultTeam;
  const members = entries.filter((m) => m.enabled);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = members.find((m) => m.id === selectedId);
  if (!members.length) return <div data-team-section />;
  return (
    <section className={styles.section} id="team" data-team-section>
      <div className="home-wrap">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>OUR PEOPLE</p>
            <h2>
              People behind <span className="accent-leaf">the work.</span>
            </h2>
          </div>
          <p>A shared commitment to growers, grounded in the work we do every day.</p>
        </div>
        <div className={styles.grid}>
          {members.map((member) => (
            <article key={member.id} className={styles.card} data-team-member={member.id}>
              <button
                type="button"
                className={styles.profileButton}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setSelectedId(member.id);
                }}
                aria-label={`View profile of ${member.name}`}
                aria-haspopup="dialog"
              >
                <TeamPortrait member={member} />
                <div className={styles.cardBody}>
                  <p className={styles.role}>{member.role}</p>
                  <h3>{member.name}</h3>
                  <p className={styles.summary}>{member.summary}</p>
                  <span className={styles.profileLink}>
                    View profile <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
      {selected && (
        <MemberProfile
          member={selected}
          onClose={() => {
            setSelectedId(null);
            requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
          }}
        />
      )}
    </section>
  );
}
function MemberProfile({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const specialisations = member.specialisations.filter((item) => item.trim());
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <Dialog label={`Profile of ${member.name}`} onClose={onClose} className={styles.dialog}>
      <div className={styles.profileToolbar}>
        <button
          type="button"
          className={styles.close}
          aria-label="Close team profile"
          onClick={onClose}
          autoFocus
        >
          <X size={20} />
        </button>
      </div>
      <div className={styles.profileLayout}>
        <aside className={styles.profileAside}>
          <TeamPortrait member={member} sizes="(max-width: 639px) 90vw, 320px" />
          <div>
            <p className={styles.eyebrow}>ZEEBARAN TEAM</p>
            <h2>{member.name}</h2>
            <p className={styles.profileRole}>{member.role}</p>
            <p className={styles.company}>{member.organisation}</p>
            {member.phone && (
              <a className={styles.phone} href={"tel:+" + phoneDigits(member.phone)}>
                <Phone size={14} />
                {member.phone}
              </a>
            )}
          </div>
        </aside>
        <div className={styles.biography}>
          <p className={styles.eyebrow}>PROFILE</p>
          {member.biography
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          {!!specialisations.length && (
            <div className={styles.specialisations}>
              <h3>Expertise &amp; responsibilities</h3>
              <ul>
                {specialisations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {(member.philosophy || member.vision) && (
            <dl className={styles.values}>
              {member.philosophy && (
                <div>
                  <dt>Leadership philosophy</dt>
                  <dd>{member.philosophy}</dd>
                </div>
              )}
              {member.vision && (
                <div>
                  <dt>Company vision</dt>
                  <dd>{member.vision}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </Dialog>
  );
}
