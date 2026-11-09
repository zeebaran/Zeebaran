import Image from "next/image";
import { Scene, type SceneVariant } from "./Scene";

type Props = {
  src?: string;
  alt?: string;
  variant?: SceneVariant;
  seed?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/** Real photo when `src` is given, otherwise brand-palette placeholder artwork. */
export function Photo({
  src,
  alt = "",
  variant = "rows",
  seed = 7,
  className = "",
  priority,
  sizes = "(min-width:1024px) 40vw, 100vw",
}: Props) {
  return (
    <div
      className={`${className.includes("absolute") ? "" : "relative"} isolate overflow-hidden bg-forest ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <Scene variant={variant} seed={seed} />
      )}
    </div>
  );
}
