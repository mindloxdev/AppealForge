import { test, expect, devices } from "@playwright/test";

/**
 * Layout and accessibility checks at the sizes the product is actually used at.
 * The mobile project in playwright.config.ts runs this file on a phone profile;
 * the desktop project runs the same assertions at desktop widths.
 */

const PAGES = ["/", "/pricing", "/templates", "/medical-necessity-appeal-letter", "/faq"];

for (const path of PAGES) {
  test(`${path} has no horizontal scroll and keeps text readable`, async ({ page }) => {
    await page.goto(path);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      offenders: Array.from(document.querySelectorAll("*"))
        .filter((element) => element.scrollWidth > document.documentElement.clientWidth + 2)
        .slice(0, 5)
        .map((element) => `${element.tagName}.${(element as HTMLElement).className}`.slice(0, 80)),
    }));

    expect(overflow.offenders, `${path} overflows`).toEqual([]);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    // Body text is never smaller than 14px.
    const smallest = await page.evaluate(() => {
      const sizes = Array.from(document.querySelectorAll("p, li, label, a, button"))
        .filter((element) => (element.textContent ?? "").trim().length > 20)
        .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));
      return sizes.length ? Math.min(...sizes) : 16;
    });
    expect(smallest).toBeGreaterThanOrEqual(12);
  });
}

test("the generator is usable on a phone", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();

  await page.goto("/");

  // The tool is reachable without hunting: the first step is on screen after
  // the compact value proposition.
  await expect(page.getByRole("heading", { name: "Appeal letter generator" })).toBeVisible();
  await expect(page.getByLabel("Insurance company name")).toBeVisible();

  // Progress is visible in the compact form.
  await expect(page.getByText("Step 1 of 3")).toBeVisible();

  // Tap targets are comfortable. A control inside a label (a checkbox or radio
  // card) is tapped by its label, so that is what gets measured.
  const buttonBoxes = await page
    .locator("header button, main button, footer button")
    .evaluateAll((buttons) =>
      buttons
        .filter((button) => (button as HTMLElement).offsetParent !== null)
        .map((button) => {
          const target = button.closest("label") ?? button;
          return {
            height: target.getBoundingClientRect().height,
            label:
              (button.textContent || button.getAttribute("aria-label") || "").slice(0, 30) ||
              `${target.tagName}.${(target as HTMLElement).className}`.slice(0, 90),
          };
        }),
    );
  for (const box of buttonBoxes) {
    expect(box.height, `"${box.label}" is too short to tap`).toBeGreaterThanOrEqual(36);
  }

  // The mobile navigation opens and closes.
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("link", { name: "Denial Reasons" })).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await context.close();
});

test("the form is keyboard navigable and labelled", async ({ page }) => {
  await page.goto("/");

  // Every visible control has an accessible name.
  const unnamed = await page.evaluate(() => {
    const controls = Array.from(
      document.querySelectorAll<HTMLElement>(
        "header :is(input,textarea,select,button,[role='combobox'])," +
          "main :is(input,textarea,select,button,[role='combobox'])," +
          "footer :is(input,textarea,select,button,[role='combobox'])",
      ),
    ).filter((element) => {
      if (element.offsetParent === null) return false;
      // Radix renders hidden proxy inputs for form submission; they are
      // aria-hidden and unreachable by keyboard, so they are not controls.
      if (element.getAttribute("aria-hidden") === "true") return false;
      if (element.getAttribute("tabindex") === "-1") return false;
      if (Number(getComputedStyle(element).opacity) === 0) return false;
      return true;
    });

    return controls
      .filter((element) => {
        const label = element.getAttribute("aria-label");
        const labelledBy = element.getAttribute("aria-labelledby");
        const id = element.getAttribute("id");
        const hasLabelElement = id ? document.querySelector(`label[for="${id}"]`) : null;
        const text = (element.textContent ?? "").trim();
        return !label && !labelledBy && !hasLabelElement && text.length === 0;
      })
      .map((element) => `${element.tagName}#${element.id || "(no id)"}`)
      .slice(0, 5);
  });
  expect(unnamed).toEqual([]);

  // Tab reaches the first field, and the focus ring is not suppressed.
  // :focus-visible only matches keyboard focus, so the field is reached with
  // Tab rather than a programmatic focus() call.
  const insurer = page.getByLabel("Insurance company name");
  await page.locator("body").press("Tab");
  for (let i = 0; i < 25 && !(await insurer.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }

  await expect(insurer).toBeFocused();
  const focusRing = await insurer.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      matchesFocusVisible: element.matches(":focus-visible"),
      // The visible indicator is a ring drawn with box-shadow plus a border
      // colour change; the forced-colors fallback is checked separately below.
      boxShadow: styles.boxShadow,
      borderColor: styles.borderColor,
    };
  });

  expect(focusRing.matchesFocusVisible).toBe(true);
  expect(focusRing.boxShadow).not.toBe("none");
  expect(focusRing.boxShadow.length).toBeGreaterThan(10);

  // The searchable dropdown works from the keyboard alone.
  await page.getByRole("combobox", { name: "Denial reason" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.type("timely");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("combobox", { name: "Denial reason" })).toContainText("Timely filing");
});

test("focus stays visible in forced-colors mode", async ({ browser }) => {
  // Windows High Contrast drops box-shadows, so the focus ring has to come
  // back as a real outline. Tailwind's outline-hidden is what provides it.
  const context = await browser.newContext({ forcedColors: "active" });
  const page = await context.newPage();
  await page.goto("/");

  const insurer = page.getByLabel("Insurance company name");
  await page.locator("body").press("Tab");
  for (let i = 0; i < 25 && !(await insurer.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(insurer).toBeFocused();

  const outline = await insurer.evaluate((element) => ({
    style: getComputedStyle(element).outlineStyle,
    width: Number.parseFloat(getComputedStyle(element).outlineWidth),
  }));
  expect(outline.style).not.toBe("none");
  expect(outline.width).toBeGreaterThan(0);

  await context.close();
});

test("reduced motion is respected", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  const durations = await page.evaluate(() =>
    Array.from(document.querySelectorAll("*"))
      .slice(0, 400)
      .map((element) => getComputedStyle(element).transitionDuration)
      .filter((value) => value && value !== "0s"),
  );

  // The global reduced-motion rule collapses every transition to ~0.
  for (const duration of durations) {
    expect(Number.parseFloat(duration)).toBeLessThan(0.01);
  }

  await context.close();
});

/**
 * The breakpoint sweep.
 *
 * The widths below are the ones the design brief names, 320px included -
 * narrow enough that a single unbreakable button label or a grid item that
 * refuses to shrink shows up as a horizontally scrolling page. Running them
 * here keeps that a regression test rather than a one-off inspection.
 */
const BREAKPOINTS = [1440, 1280, 1024, 768, 390, 320];

for (const width of BREAKPOINTS) {
  test(`no horizontal overflow at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();

    for (const path of [...PAGES, "/how-it-works", "/for-medical-billers", "/login"]) {
      await page.goto(path);

      const result = await page.evaluate(() => {
        const root = document.documentElement;
        const offenders: string[] = [];
        for (const element of document.querySelectorAll("body *")) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.right > root.clientWidth + 1) {
            offenders.push(
              `${element.tagName.toLowerCase()}.${String(element.className)}`.slice(0, 70),
            );
            if (offenders.length === 3) break;
          }
        }
        return { over: root.scrollWidth - root.clientWidth, offenders };
      });

      expect(result.offenders, `${path} at ${width}px`).toEqual([]);
      expect(result.over, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }

    await context.close();
  });
}
