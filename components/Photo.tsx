import { ContentText } from "@/features/cms/Content";
import { ContentImage as Image } from "@/features/cms/Content";
import type { SceneVariant } from "./Scene";
import { ImagePlaceholder } from "@/features/media/ImagePlaceholder";

type Props = {
  src?: string;
  alt?: string;
  variant?: SceneVariant;
  seed?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/** Authored photograph, with a quiet reusable icon when no photograph is available. */
export function Photo({
  src,
  alt = "",
  className = "",
  priority,
  sizes = "(min-width:1024px) 40vw, 100vw",
}: Props) {
  return (
    <div
      data-field-photo={src && !className.includes("absolute") ? "" : undefined}
      className={`${className.includes("absolute") ? "" : "relative"} isolate overflow-hidden bg-forest ${className}`}
    >
      <ContentText>
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
          <ImagePlaceholder fill alt={alt} />
        )}
      </ContentText>
    </div>
  );
}
