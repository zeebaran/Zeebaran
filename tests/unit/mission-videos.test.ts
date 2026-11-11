import { describe, expect, it } from "vitest";
import { placedContent, textKey, type ContentValue } from "../../features/cms/model";
import { missionVideoCards } from "../../features/cms/mission-videos";
import { videoPoster, youtubeUrl } from "../../features/cms/video";
import catalog from "../../features/cms/catalog.generated.json";
import { missionSections } from "../../features/cms/mission-content";

describe("Mission's existing video placements", () => {
  it("shows exactly two defaults in each section when nothing has been configured", () => {
    const sections = missionSections({ text: {}, images: {} });
    expect(Object.values(sections).map((cards) => cards.length)).toEqual([2, 2, 2]);
  });
  it("preserves edited extra legacy cards but removes untouched surplus placeholders", () => {
    const extra = missionVideoCards.find((card) => card.id === "ZB-OI-03")!;
    const sections = missionSections({
      text: { [textKey(extra.title)]: "A manually edited field story" },
      images: {},
      videos: { "ZB-DM-05": { kind: "youtube", src: "https://youtu.be/abcdefghijk" } },
    });
    expect(sections.orchard).toHaveLength(3);
    expect(sections.orchard[2].title).toBe("A manually edited field story");
    expect(sections.demos.map((card) => card.id)).toEqual(["ZB-DM-01", "ZB-DM-02", "ZB-DM-05"]);
  });
  it("uses saved section entries as authoritative, so removed cards cannot reappear", () => {
    const sections = missionSections({ text: {}, images: {} });
    sections.orchard.push({
      id: "MV-authored",
      title: "New field film",
      description: "A new video description",
    });
    const content = {
      text: {},
      images: {},
      missionSections: sections,
      videos: { "ZB-OI-04": { kind: "youtube" as const, src: "https://youtu.be/abcdefghijk" } },
    };
    expect(missionSections(content).orchard.map((card) => card.id)).toEqual([
      "ZB-OI-01",
      "ZB-OI-02",
      "MV-authored",
    ]);
  });
  it("gets a CDN preview from the configured video without another database record", () => {
    expect(videoPoster({ kind: "youtube", src: "https://youtu.be/abcdefghijk" })).toBe(
      "https://res.cloudinary.com/jfiuaflr/image/upload/f_auto,q_auto,c_limit,w_960/zeebaran/videos/posters/youtube-abcdefghijk.jpg",
    );
    expect(
      videoPoster({
        kind: "cloudinary",
        src: "https://res.cloudinary.com/orchard/video/upload/v123/field/planting.mp4",
      }),
    ).toBe("https://res.cloudinary.com/orchard/video/upload/v123/field/planting.jpg");
    expect(videoPoster(undefined)).toBeNull();
    expect(
      videoPoster({ kind: "youtube", src: "https://evil.test/watch?v=abcdefghijk" }),
    ).toBeNull();
    expect(
      videoPoster({ kind: "cloudinary", src: "https://evil.test/video/upload/planting.mp4" }),
    ).toBeNull();
  });
  it("retains saved title and description keys from the existing editing catalog", () => {
    const fields = new Map(catalog.mission.fields.map((f) => [f.key, f.value]));
    expect(new Set(missionVideoCards.map((c) => c.id)).size).toBe(11);
    for (const card of missionVideoCards) {
      expect(fields.get(textKey(card.title))).toBe(card.title);
      expect(fields.get(textKey(card.subtitle))).toBe(card.subtitle);
    }
  });
  it("never exposes a legacy page-bottom video, even when already published", () => {
    const content: ContentValue = {
      text: { existing: "A manual edit" },
      images: {},
      video: {
        kind: "youtube",
        src: "https://www.youtube-nocookie.com/embed/abcdefghijk",
        title: "Old film",
      },
      videos: {
        "ZB-OI-01": { kind: "youtube", src: "https://www.youtube-nocookie.com/embed/abcdefghijk" },
      },
    };
    for (const page of ["home", "about", "platform", "mission"]) {
      expect(placedContent(page, content).video).toBeUndefined();
      expect(placedContent(page, content).text.existing).toBe("A manual edit");
    }
    expect(placedContent("home", content).videos).toBeUndefined();
    expect(placedContent("mission", content).videos).toEqual(content.videos);
    expect(content.video?.title).toBe("Old film"); // Reading does not mutate saved data.
  });
  it("accepts supported links but rejects deceptive schemes, hosts, credentials and ports", () => {
    for (const url of [
      "https://youtu.be/abcdefghijk",
      "https://www.youtube.com/watch?v=abcdefghijk&t=12",
      "https://www.youtube-nocookie.com/embed/abcdefghijk",
      "https://youtube.com/shorts/abcdefghijk",
    ])
      expect(youtubeUrl(url)).toBe("https://www.youtube-nocookie.com/embed/abcdefghijk");
    for (const url of [
      "javascript://youtube.com/watch?v=abcdefghijk",
      "http://youtube.com/watch?v=abcdefghijk",
      "https://youtube.com.evil.test/watch?v=abcdefghijk",
      "https://user:pass@youtube.com/watch?v=abcdefghijk",
      "https://youtube.com:8443/watch?v=abcdefghijk",
      "https://youtu.be/short",
      "https://youtube.com/embed/abcdefghijk/unexpected",
    ])
      expect(youtubeUrl(url)).toBeNull();
  });
});
