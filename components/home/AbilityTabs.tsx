"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ContentText } from "@/features/cms/Content";
import { homeAbility } from "@/lib/home-ability";

export function AbilityTabs() {
  const [active, setActive] = useState(0);
  const id = useId(),
    buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % homeAbility.length;
        break;
      case "ArrowLeft":
        next = (index - 1 + homeAbility.length) % homeAbility.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = homeAbility.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }
  return (
    <div className="home-ability-tabs">
      <div className="home-ability-copy">
        {homeAbility.map((item, index) => (
          <div
            key={item.title}
            id={`${id}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${index}`}
            hidden={active !== index}
            tabIndex={0}
            className="home-ability-panel space-y-6"
          >
            {item.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-body text-forest/80">
                <ContentText>{paragraph}</ContentText>
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="home-ability-controls" role="tablist" aria-label="Orchard capabilities">
        {homeAbility.map((item, index) => (
          <button
            key={item.title}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => navigate(event, index)}
          >
            <ContentText>{item.title}</ContentText>
          </button>
        ))}
      </div>
      <div className="home-ability-quotes">
        {homeAbility.map((item, index) => (
          <blockquote
            key={item.title}
            hidden={active !== index}
            className="border-l-2 border-leaf pl-4 pt-4 font-serif text-small italic text-forest/80"
          >
            <ContentText>{item.quote}</ContentText>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
