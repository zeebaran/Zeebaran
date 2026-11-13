import { AssetImage as Image } from "@/features/media/AssetImage";
import { partnerLabel, type PartnerEntry } from "@/features/cms/partners";
import styles from "./partner-strip.module.css";
export function PartnerMark({
  partner,
  prominent = false,
}: {
  partner: PartnerEntry;
  prominent?: boolean;
}) {
  if (partner.mode === "image" && partner.image)
    return (
      <Image
        className={styles.logo}
        src={partner.image.src}
        alt={partnerLabel(partner)}
        width={prominent ? 460 : 144}
        height={prominent ? 260 : 44}
        sizes={prominent ? "230px" : "144px"}
      />
    );
  return (
    <span className={styles.mark} data-font={partner.font} data-preset={partner.preset}>
      {partner.preset === "fruit-control" && (
        <i className={styles.fruitSeal} aria-hidden="true">
          FC
        </i>
      )}
      {partner.preset === "fiedlin" && <i className={styles.fieldMark} aria-hidden="true" />}
      {partner.preset === "incofin" && <i className={styles.financeMark} aria-hidden="true" />}
      <span className={styles.wordmark}>
        <span>{partner.name}</span>
        {partner.subtitle && <small>{partner.subtitle}</small>}
      </span>
    </span>
  );
}
