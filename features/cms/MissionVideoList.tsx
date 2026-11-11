"use client";
import { Item, Stagger } from "@/components/Motion";
import { useMissionSections } from "./Content";
import { MissionVideoCard } from "./MissionVideoCard";
import { missionVideoSections, type MissionSectionId } from "./mission-videos";
export function MissionVideoList({ section }: { section: MissionSectionId }) {
  const entries = useMissionSections()[section],
    definition = missionVideoSections.find((s) => s.id === section)!;
  return (
    <Stagger gap={0.1} className="flex flex-wrap gap-6">
      {entries.map((entry) => (
        <Item
          key={entry.id}
          className={
            "min-w-0 grow basis-full md:basis-[calc(50%_-_12px)] " +
            (section === "demos" ? "lg:basis-[calc(33.333%_-_16px)]" : "")
          }
        >
          <MissionVideoCard
            section={section}
            id={entry.id}
            title={entry.title}
            subtitle={entry.description}
            video={entry.video}
            managed
            tag={definition.tag}
            tagColor={definition.tagColor}
          />
        </Item>
      ))}
    </Stagger>
  );
}
