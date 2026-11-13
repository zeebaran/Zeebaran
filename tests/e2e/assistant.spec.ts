import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const entry = (id: string, name: string, system: string) => ({
  id,
  slug: id,
  name,
  kind: "rootstock",
  code: id.toUpperCase(),
  localName: "",
  intro: "Published rootstock information from the nursery catalog.",
  origin: "",
  season: "",
  seasonMonths: "",
  colour: "",
  flavour: "",
  brix: "",
  firmness: "",
  shelfLife: "",
  storageLife: "",
  marketClass: "",
  system,
  spacing: "3 × 2 m",
  yield: "",
  bestFor: "High-density systems",
  note: "",
  highlights: [],
  agronomyNotes: "",
  rootstockIds: [],
  images: [],
  specifications: [],
  badge: "",
  sortOrder: 0,
  publishedAt: "2026-11-11T00:00:00Z",
});
const data = {
  items: [
    entry("m9", "M9", "Dwarfing"),
    entry("m26", "M26", "Semi-dwarfing"),
    entry("m7", "M7", "Semi-dwarfing"),
  ],
  pages: [],
  retrievedAt: "2026-11-11T00:00:00Z",
  partial: false,
};
async function open(page: Page, input: "pointer" | "keyboard" = "pointer") {
  const launcher = page.getByRole("button", { name: "Open Zeebaran assistant" });
  // With motion enabled the launcher floats, so WebKit may never see a stable click target.
  if (input === "keyboard") await launcher.press("Enter");
  else await launcher.click();
  await expect(page.locator("#orchard-assistant")).toBeVisible();
  await expect(page.locator("#orchard-assistant")).toHaveAttribute("aria-busy", "false");
}
async function ask(page: import("@playwright/test").Page, q: string) {
  await page.getByLabel("Message", { exact: true }).fill(q);
  await page.getByRole("button", { name: "Send question", exact: true }).click();
  await expect(page.locator(".orchard-question").last()).toHaveText(q);
}
test("loads on demand, compares, switches and retains its conversation without per-message requests", async ({
  page,
}) => {
  let reads = 0;
  const writes: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET" && r.url().includes("/api/")) writes.push(r.url());
  });
  await page.route("**/api/assistant", (r) => {
    reads++;
    return r.fulfill({ json: data });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open Zeebaran assistant" }).waitFor();
  expect(reads).toBe(0);
  await open(page);
  expect(reads).toBe(1);
  await ask(page, "M9 vs M26");
  await expect(page.locator(".orchard-answer").last()).toContainText("M9 vs M26");
  await page.getByLabel("Second comparison selection").selectOption("m7");
  await expect(page.locator(".orchard-answer").last()).toContainText("M9 vs M7");
  await ask(page, "M9 altitude");
  await expect(page.locator(".orchard-answer").last()).toContainText("Altitude is not recorded");
  await ask(page, "recommend a high density rootstock");
  await expect(page.locator(".orchard-answer").last()).toContainText(
    "not a confirmed planting recommendation",
  );
  expect(reads).toBe(1);
  expect(writes).toEqual([]);
  await page.getByRole("button", { name: "Close Zeebaran assistant" }).click();
  await expect(page.locator("#orchard-assistant")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Open Zeebaran assistant" })).toBeFocused();
  await open(page);
  await expect(page.locator(".orchard-question")).toHaveCount(4);
  expect(reads).toBe(1);
  await page.getByRole("button", { name: "Start a new conversation" }).click();
  await expect(page.locator(".orchard-question")).toHaveCount(0);
});
test("fits small, tablet and desktop screens, supports keyboard and has no automated dialog violations", async ({
  page,
}) => {
  await page.route("**/api/assistant", (r) => r.fulfill({ json: data }));
  await page.goto("/contact");
  await open(page);
  for (const width of [320, 390, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 844 });
    const r = await page.locator("#orchard-assistant").boundingBox();
    expect(r!.x).toBeGreaterThanOrEqual(0);
    expect(r!.x + r!.width).toBeLessThanOrEqual(width + 1);
    expect(r!.y).toBeGreaterThanOrEqual(0);
    expect(r!.y + r!.height).toBeLessThanOrEqual(845);
    expect(
      await page.locator("#orchard-assistant").evaluate((e) => e.scrollWidth <= e.clientWidth),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await ask(page, "M9 vs M26");
  const axe = await new AxeBuilder({ page })
    .include("#orchard-assistant")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#orchard-assistant")).not.toBeVisible();
});
test("recovers from a failed snapshot, escapes stored markup and hides in administration", async ({
  page,
}) => {
  let count = 0;
  await page.route("**/api/assistant", (r) => {
    count++;
    return count === 1
      ? r.fulfill({ status: 503, json: { error: "Temporarily unavailable" } })
      : r.fulfill({
          json: { ...data, items: [{ ...data.items[0], intro: "<img src=x onerror=alert(1)>" }] },
        });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open Zeebaran assistant" }).click();
  await expect(page.locator("#orchard-assistant").getByRole("alert")).toContainText(
    "Temporarily unavailable",
  );
  await page.getByRole("button", { name: "Retry collection" }).click();
  await expect(page.locator("#orchard-assistant")).toHaveAttribute("aria-busy", "false");
  await ask(page, "M9");
  await expect(page.locator(".orchard-product")).toContainText("<img src=x onerror=alert(1)>");
  expect(await page.locator(".orchard-product img").count()).toBe(0);
  await page.goto("/admin/login");
  await expect(page.getByRole("button", { name: "Open Zeebaran assistant" })).toHaveCount(0);
});
test("floats above the existing comparison dock", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("zeebaran.compare.v1", JSON.stringify(["m9"])),
  );
  await page.route("**/api/catalog/resolve?ids=m9", (r) =>
    r.fulfill({ json: { items: [data.items[0]] } }),
  );
  await page.goto("/");
  await expect(page.getByRole("complementary", { name: "Your comparison" })).toBeVisible();
  await expect
    .poll(async () => {
      const a = await page.locator(".orchard-launcher").boundingBox(),
        d = await page.locator(".compare-dock").boundingBox();
      return a!.y + a!.height <= d!.y - 5;
    })
    .toBe(true);
});

test("makes additional dynamically loaded entries discoverable without another request", async ({
  page,
}) => {
  let reads = 0;
  await page.route("**/api/assistant", (r) => {
    reads++;
    return r.fulfill({
      json: {
        ...data,
        items: Array.from({ length: 9 }, (_, i) => entry("root-" + i, "New Root " + i, "Dwarfing")),
      },
    });
  });
  await page.goto("/");
  await open(page);
  await ask(page, "Explore rootstocks");
  await expect(page.locator(".orchard-product")).toHaveCount(6);
  await page.getByRole("button", { name: "Show next 3 entries" }).click();
  await expect(page.locator(".orchard-product")).toHaveCount(9);
  expect(reads).toBe(1);
});

test("opens compact, grows on the first question and keeps a shaped toggle beneath the panel", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route("**/api/assistant", (r) => r.fulfill({ json: data }));
  await page.goto("/");
  await open(page, "keyboard");
  const dialog = page.locator("#orchard-assistant");
  await expect(dialog).toHaveAttribute("data-expanded", "false");
  await expect
    .poll(() =>
      dialog.evaluate((element) =>
        element.getAnimations().some((animation) => animation.playState === "running"),
      ),
    )
    .toBe(false);
  const compact = await page.locator(".orchard-window").boundingBox();
  const toggle = page.getByRole("button", { name: "Minimize Zeebaran assistant" });
  await expect(toggle).toBeVisible();
  const t = await toggle.boundingBox();
  expect(t!.y).toBeGreaterThan(compact!.y + compact!.height);
  expect(await toggle.evaluate((e) => parseFloat(getComputedStyle(e).borderRadius))).toBeLessThan(
    t!.width / 2,
  );
  await ask(page, "M9 vs M26");
  await expect(page.locator("#orchard-assistant")).toHaveAttribute("data-expanded", "true");
  await expect
    .poll(async () => (await page.locator(".orchard-window").boundingBox())!.height)
    .toBeGreaterThan(compact!.height + 100);
  await toggle.click();
  await expect(page.locator("#orchard-assistant")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Open Zeebaran assistant" })).toBeFocused();
  await open(page, "keyboard");
  await expect(page.locator("#orchard-assistant")).toHaveAttribute("data-expanded", "true");
  await page.getByRole("button", { name: "Start a new conversation" }).click();
  await expect(page.locator("#orchard-assistant")).toHaveAttribute("data-expanded", "false");
  await expect
    .poll(async () => (await page.locator(".orchard-window").boundingBox())!.height)
    .toBeLessThan(compact!.height + 2);
});

test("custom line drawing and welcome choreography respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/api/assistant", (r) => r.fulfill({ json: data }));
  await page.goto("/");
  await expect(page.locator(".orchard-mark-leaf")).toHaveCSS("animation-name", "orchard-mark-draw");
  const ring = await page.locator(".orchard-launcher").evaluate((e) => ({
    name: getComputedStyle(e, "::before").animationName,
    iterations: getComputedStyle(e, "::before").animationIterationCount,
  }));
  expect(ring).toEqual({ name: "orchard-ring-breathe", iterations: "2" });
  await open(page, "keyboard");
  await expect(page.locator(".orchard-welcome h3")).toHaveCSS(
    "animation-name",
    "orchard-heading-reveal",
  );
  await expect(page.locator(".orchard-starters button").first()).toHaveCSS(
    "animation-name",
    "orchard-suggestion-arrive",
  );
  await page.getByLabel("Message", { exact: true }).focus();
  await expect(page.getByLabel("Message", { exact: true })).toHaveCSS("outline-style", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".orchard-welcome h3")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".orchard-starters button").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.getByRole("button", { name: "Minimize Zeebaran assistant" }).click();
  await expect(page.locator(".orchard-mark-leaf")).toHaveCSS("animation-name", "none");
});

test("voice transcribes then sends once, with separate circular composer controls", async ({
  page,
}) => {
  await page.addInitScript(() => {
    class SpeechMock {
      onresult: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      start() {
        Object.assign(window, { speechMock: this });
      }
      stop() {
        this.onend?.();
      }
      abort() {
        Object.assign(window, { speechAborted: true });
      }
    }
    Object.assign(window, { SpeechRecognition: SpeechMock });
  });
  let reads = 0;
  await page.route("**/api/assistant", (r) => {
    reads++;
    return r.fulfill({ json: data });
  });
  const response = await page.goto("/");
  expect(response?.headers()["permissions-policy"]).toContain("microphone=(self)");
  await open(page);
  await page.getByLabel("Message", { exact: true }).fill("Compare");
  await page.getByRole("button", { name: "Start voice input", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop voice input and send" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByLabel("Message", { exact: true })).toHaveAttribute("readonly", "");
  const result = async (text: string, final: boolean) =>
    page.evaluate(
      ({ text, final }) => {
        const w = window as unknown as { speechMock: { onresult: (event: unknown) => void } };
        w.speechMock.onresult({ results: [{ isFinal: final, 0: { transcript: text } }] });
      },
      { text, final },
    );
  await result("M9", false);
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("Compare M9");
  await expect(page.locator(".orchard-question")).toHaveCount(0);
  await result("M9 vs M26", true);
  await page.getByRole("button", { name: "Stop voice input and send" }).click();
  await expect(page.locator(".orchard-question")).toHaveText("Compare M9 vs M26");
  await expect(page.getByRole("button", { name: "Start voice input", exact: true })).toBeEnabled();
  expect(reads).toBe(1);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const bounds = await page.locator(".orchard-compose").evaluate((form) => {
      const field = form.querySelector(".orchard-input-wrap")!.getBoundingClientRect();
      return [...form.querySelectorAll("button")].map((button) => {
        const r = button.getBoundingClientRect();
        return {
          outside: r.left >= field.right,
          circular: parseFloat(getComputedStyle(button).borderRadius) >= r.width / 2,
        };
      });
    });
    expect(bounds.every((b) => b.outside && b.circular)).toBe(true);
    await expect(page.locator(".orchard-compose-area")).toHaveCSS("border-top-width", "0px");
  }
  // Closing cancels recording; even a queued final result must not submit.
  await page.getByRole("button", { name: "Start voice input", exact: true }).click();
  await result("M7", true);
  await page.evaluate(() => {
    const w = window as unknown as { speechMock: { onend: () => void }; lateSpeechEnd: () => void };
    w.lateSpeechEnd = w.speechMock.onend;
  });
  await page.getByRole("button", { name: "Close Zeebaran assistant" }).click();
  await expect(page.locator("#orchard-assistant")).not.toBeVisible();
  await page.evaluate(() => (window as unknown as { lateSpeechEnd: () => void }).lateSpeechEnd());
  await open(page);
  await expect(page.locator(".orchard-question")).toHaveCount(1);
  expect(
    await page.evaluate(() => (window as unknown as { speechAborted: boolean }).speechAborted),
  ).toBe(true);
});

test("voice permission errors and unsupported browsers preserve typing", async ({ page }) => {
  await page.addInitScript(() => {
    class SpeechMock {
      onerror: ((event: unknown) => void) | null = null;
      start() {
        setTimeout(() => this.onerror?.({ error: "not-allowed" }), 0);
      }
      abort() {}
    }
    Object.assign(window, { SpeechRecognition: SpeechMock });
  });
  await page.route("**/api/assistant", (r) => r.fulfill({ json: data }));
  await page.goto("/");
  await open(page);
  await page.getByLabel("Message", { exact: true }).fill("M9");
  await page.getByRole("button", { name: "Start voice input", exact: true }).click();
  await expect(page.locator(".orchard-error")).toContainText("Microphone access was denied");
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("M9");
  await page.evaluate(() =>
    Object.assign(window, { SpeechRecognition: undefined, webkitSpeechRecognition: undefined }),
  );
  await page.getByRole("button", { name: "Start voice input", exact: true }).click();
  await expect(page.locator(".orchard-error")).toContainText("unavailable in this browser");
  await page.getByRole("button", { name: "Send question", exact: true }).click();
  await expect(page.locator(".orchard-question")).toHaveText("M9");
});

test("rootstock browse opens the products page and handles catalog availability", async ({
  page,
}) => {
  await page.route("**/api/assistant", (route) => route.fulfill({ json: data }));
  await page.goto("/");
  await open(page);
  await ask(page, "show all rootstocks");
  const browse = page.getByRole("link", { name: "Browse the collection", exact: true });
  await expect(browse).toHaveAttribute("href", "/products#rootstock-selection");
  await browse.click();
  await expect(page).toHaveURL(/\/products#rootstock-selection$/);
  if (process.env.E2E_HARVEST_CATALOG === "1") {
    const rootstocks = page.locator("#rootstock-selection");
    await expect(rootstocks).toBeInViewport();
    await expect(rootstocks.getByRole("combobox", { name: "Search rootstocks" })).toBeVisible();
  } else {
    await expect(page.getByText(/The planting catalog could not be loaded/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Try again", exact: true })).toHaveAttribute(
      "href",
      "/products",
    );
  }
});

test("a slow refresh does not erase the next question being typed", async ({ page }) => {
  let reads = 0;
  let release = () => {};
  let started = () => {};
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route("**/api/assistant", async (route) => {
    reads++;
    if (reads === 2) {
      started();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    }
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await open(page);
  await page.evaluate(() => {
    const now = Date.now();
    Date.now = () => now + 61000;
  });
  const input = page.getByLabel("Message", { exact: true });
  await input.fill("Show rootstocks");
  await page.getByRole("button", { name: "Send question", exact: true }).click();
  await began;
  await input.fill("My next question about storage");
  release();
  await expect(page.locator(".orchard-question")).toHaveText("Show rootstocks");
  await expect(input).toHaveValue("My next question about storage");
  expect(reads).toBe(2);
});

test("keeps keyboard focus inside the assistant in both directions", async ({ page }) => {
  await page.route("**/api/assistant", (r) => r.fulfill({ json: data }));
  await page.goto("/");
  await open(page);
  const close = page.getByRole("button", { name: "Close Zeebaran assistant" });
  const minimize = page.getByRole("button", { name: "Minimize Zeebaran assistant" });
  await minimize.focus();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(minimize).toBeFocused();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("#orchard-assistant"))).toBe(
      true,
    );
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open Zeebaran assistant" })).toBeFocused();
});

test("launcher floats gently, turns periodically and on hover, and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let reads = 0;
  await page.route("**/api/assistant", (r) => {
    reads++;
    return r.fulfill({ json: data });
  });
  await page.goto("/");
  const launcher = page.getByRole("button", { name: "Open Zeebaran assistant" });
  const symbol = page.locator(".orchard-launcher-symbol");
  const svg = symbol.locator(":scope > svg");
  await expect(svg).toHaveCSS("animation-name", "orchard-mark-orbit");
  const phases = await launcher.evaluate((e) => {
    const animation = e
      .getAnimations()
      .find((a) => (a as CSSAnimation).animationName === "orchard-launcher-float")!;
    animation.pause();
    animation.currentTime = 1000;
    const rest = getComputedStyle(e).translate;
    animation.currentTime = 4000;
    const raised = getComputedStyle(e).translate;
    animation.play();
    return { rest, raised };
  });
  expect(phases).toEqual({ rest: "0px", raised: "0px -3px" });
  const orbit = await svg.evaluate((e) => {
    const a = e
      .getAnimations()
      .find((a) => (a as CSSAnimation).animationName === "orchard-mark-orbit")!;
    a.pause();
    a.currentTime = 10000;
    const idle = getComputedStyle(e).rotate;
    a.currentTime = 17700;
    const turning = parseFloat(getComputedStyle(e).rotate);
    a.currentTime = 18000;
    const fullTurn = parseFloat(getComputedStyle(e).rotate);
    a.play();
    return { idle, turning, fullTurn };
  });
  expect(parseFloat(orbit.idle)).toBe(0);
  expect(orbit.turning).toBeGreaterThan(300);
  expect(orbit.fullTurn).toBe(0);
  const target = await launcher.boundingBox();
  await page.mouse.move(target!.x + target!.width / 2, target!.y + target!.height / 2);
  await expect(symbol).toHaveAttribute("data-spinning", "true");
  await expect(svg).toHaveCSS("animation-play-state", "paused");
  const active = await symbol.evaluate((e) => e.getAnimations().length);
  expect(active).toBe(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(symbol).not.toHaveAttribute("data-spinning", "true");
  await expect(svg).toHaveCSS("animation-name", "none");
  await expect(launcher).toHaveCSS("animation-name", "none");
  expect(reads).toBe(0);
  await open(page);
  expect(reads).toBe(1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(
    await page
      .locator(".orchard-launcher")
      .evaluate((e) => e.getAnimations().every((a) => a.playState === "paused")),
  ).toBe(true);
});
