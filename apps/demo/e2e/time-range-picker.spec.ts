import { expect, Page, test } from "@playwright/test";

function playgroundCard(page: Page) {
  return page.locator('[data-slot="card"]').filter({
    has: page.locator('[data-slot="card-title"]').filter({ hasText: /^Playground$/ }),
  });
}

function docsInput(page: Page) {
  return page.getByRole("textbox").first();
}

function playgroundInput(page: Page) {
  return playgroundCard(page).getByRole("textbox").first();
}

function generatedSnippetCard(page: Page) {
  return page.locator('[data-slot="card"]').filter({
    has: page
      .locator('[data-slot="card-title"]')
      .filter({ hasText: /^Generated snippet from the playground$/ }),
  });
}

function docsResultHeading(page: Page) {
  return page.getByText("Selected Range", { exact: true });
}

function themeButton(page: Page, label?: "System" | "Dark" | "Light") {
  return page.getByRole("button", {
    name: label ? `Theme: ${label}` : /theme:/i,
  });
}

function selectedRangeDetails(page: Page) {
  return page.getByText("Start ISO", { exact: true });
}

function selectedRangeSummary(page: Page) {
  return playgroundCard(page)
    .getByText("Selected Range", { exact: true })
    .locator("..")
    .locator("..");
}

function pickerList(page: Page) {
  return page.locator("[cmdk-list]").first();
}

async function openConfiguration(page: Page) {
  const details = page.locator("details").filter({ hasText: "Configuration" }).first();
  const summary = details.locator("summary");
  if (!(await details.evaluate((element) => element.hasAttribute("open")))) {
    await summary.click();
  }
}

async function unixRange(page: Page) {
  const start = Date.parse(
    (await page
      .locator('xpath=(//div[normalize-space()="Start ISO"]/following-sibling::div[1])[1]')
      .textContent()) ?? "",
  );

  const endLabel = page
    .locator('xpath=//div[normalize-space()="End ISO (now)" or normalize-space()="End ISO"]')
    .first();
  const end = Date.parse(
    (await endLabel.locator("xpath=following-sibling::div[1]").textContent()) ?? "",
  );

  return { start, end };
}

async function tabToDocsInput(page: Page) {
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press("Tab");

    const isFocused = await docsInput(page).evaluate(
      (element) => document.activeElement === element,
    );

    if (isFocused) {
      return;
    }
  }

  throw new Error("Could not focus the picker input via Tab.");
}

test.describe("Time Range Picker Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with picker visible and no console errors", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Natural language time range picker/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Search time range...")).toBeVisible();
    expect(errors).toHaveLength(0);
    await context.close();
  });

  test("preset selection shows result card", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("past 1 h");

    const presetButton = page.getByRole("button", { name: /Past 1 hour/ }).first();
    await expect(presetButton).toBeVisible();
    await presetButton.dispatchEvent("click");

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(page.getByText("Start ISO", { exact: true })).toBeVisible();
  });

  test("focusing the picker reveals presets and examples", async ({ page }) => {
    await docsInput(page).click();

    await expect(pickerList(page).getByText("Presets", { exact: true })).toBeVisible();
    await expect(pickerList(page).getByText("Examples", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Past 1 hour/ }).first()).toBeVisible();
    await expect(pickerList(page).getByText("Try typing:")).toBeVisible();
  });

  test("tab focus opens presets on the picker input", async ({ page }) => {
    await tabToDocsInput(page);
    await expect(docsInput(page)).toBeFocused();
    await expect(pickerList(page).getByText("Presets", { exact: true })).toBeVisible();
    await expect(pickerList(page).getByText("Examples", { exact: true })).toBeVisible();
  });

  test("shortcut input parses correctly", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("3h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(page.locator("[data-slot=badge]").filter({ hasText: "3h" }).first()).toBeVisible();
  });

  test("natural language input", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("last friday");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();
  });

  test("date range input", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("Mar 3 - Mar 13");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(page.getByText("Start ISO", { exact: true })).toBeVisible();
    const year = new Date().getFullYear();
    await expect(page.getByText(new RegExp(`${year}-03`)).first()).toBeVisible();
  });

  test("time range input", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("9am - 5pm");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();
  });

  test("clear selection", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("1h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(docsResultHeading(page)).toBeVisible();

    await page.getByRole("button", { name: /clear selection/i }).click();
    await expect(selectedRangeDetails(page)).toHaveCount(0);
  });

  test("refocusing a selected value reopens the presets", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("1h");
    await page.keyboard.press("Enter");
    await expect(docsResultHeading(page)).toBeVisible();

    await input.click();

    await expect(input).toBeFocused();
    await expect(pickerList(page).getByText("Presets", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Past 1 hour/ }).first()).toBeVisible();
  });

  test("selecting a different preset after reopening replaces the previous preset", async ({
    page,
  }) => {
    const input = docsInput(page);

    await input.click();
    await page
      .getByRole("button", { name: /Past 1 hour/ })
      .first()
      .click();

    await expect(page.locator("[data-slot=badge]").filter({ hasText: "1h" }).first()).toBeVisible();
    const firstRange = await unixRange(page);

    await input.click();
    await expect(pickerList(page).getByText("Presets", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: /Past 3 hours/ })
      .first()
      .click();

    await expect(page.locator("[data-slot=badge]").filter({ hasText: "3h" }).first()).toBeVisible();
    await expect(page.locator("[data-slot=badge]").filter({ hasText: "1h" })).toHaveCount(0);

    const secondRange = await unixRange(page);
    expect(secondRange.start).toBeLessThan(firstRange.start);
    expect(secondRange.end).toBeGreaterThanOrEqual(firstRange.end - 1000);
  });

  test("blur commits a parsed value without pressing Enter", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("3h");
    await expect(page.getByText("Parsed Result")).toBeVisible();

    await input.evaluate((element) => {
      element.blur();
    });

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(docsInput(page)).toHaveValue("");
    await expect(page.locator("[data-slot=badge]").filter({ hasText: "3h" }).first()).toBeVisible();
  });

  test("blur clears invalid input without selecting a range", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("definitely not a range");
    await expect(page.getByText(/could not parse/i)).toBeVisible();

    await page.keyboard.press("Tab");

    await expect(page.getByText(/could not parse/i)).not.toBeVisible();
    await expect(selectedRangeDetails(page)).toHaveCount(0);
    await expect(docsInput(page)).toHaveValue("");
  });

  test("keyboard flow: type, enter, escape", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("1h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(docsResultHeading(page)).toBeVisible();

    await docsInput(page).click({ position: { x: 5, y: 5 } });
    await docsInput(page).fill("test");
    await expect(page.getByText(/could not parse/i)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText(/could not parse/i)).not.toBeVisible();
  });

  test("theme control cycles through system, dark, and light", async ({ page }) => {
    const html = page.locator("html");
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(html).not.toHaveClass(/dark/);
    await expect(themeButton(page, "System")).toBeVisible();

    await themeButton(page, "System").click();
    await expect(html).toHaveClass(/dark/);
    await expect(themeButton(page, "Dark")).toBeVisible();

    await themeButton(page, "Dark").click();
    await expect(html).not.toHaveClass(/dark/);
    await expect(themeButton(page, "Light")).toBeVisible();

    await themeButton(page, "Light").click();
    await expect(html).not.toHaveClass(/dark/);
    await expect(themeButton(page, "System")).toBeVisible();
  });

  test("system theme is used by default", async ({ page }) => {
    const html = page.locator("html");

    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(html).toHaveClass(/dark/);

    await page.emulateMedia({ colorScheme: "light" });
    await expect(html).not.toHaveClass(/dark/);
  });

  test("12h/24h format toggle", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("14:00 - 16:00");
    await page.keyboard.press("Enter");
    await expect(docsResultHeading(page)).toBeVisible();

    await openConfiguration(page);
    const format24h = page.getByRole("radio", { name: "24h" });
    const format12h = page.getByRole("radio", { name: "12h" });
    await expect(format24h).toBeChecked();
    await expect(
      playgroundCard(page)
        .getByText(/14:00 - 16:00/)
        .first(),
    ).toBeVisible();

    await format12h.click();
    await expect(format12h).toBeChecked();
    await expect(
      playgroundCard(page)
        .getByText(/2:00 PM - 4:00 PM/)
        .first(),
    ).toBeVisible();
  });

  test("pausing a live range freezes the selection", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("1h");
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(
      selectedRangeSummary(page)
        .locator("[data-slot=badge]")
        .filter({ hasText: /^Live$/ }),
    ).toHaveCount(1);

    await page.getByRole("button", { name: /pause live range/i }).click();

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(
      selectedRangeSummary(page)
        .locator("[data-slot=badge]")
        .filter({ hasText: /^Live$/ }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: /pause live range/i })).toHaveCount(0);
  });

  test("shift controls move a live range backward and forward by its duration", async ({
    page,
  }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("1h");
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();

    const initial = await unixRange(page);
    const duration = initial.end - initial.start;
    const backwardButton = page.getByRole("button", { name: /shift range backward/i });
    const forwardButton = page.getByRole("button", { name: /shift range forward/i });

    await expect(forwardButton).toBeDisabled();

    await backwardButton.click();

    await expect(
      selectedRangeSummary(page)
        .locator("[data-slot=badge]")
        .filter({ hasText: /^Live$/ }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: /pause live range/i })).toHaveCount(0);

    const shiftedBack = await unixRange(page);
    expect(shiftedBack.end - shiftedBack.start).toBe(duration);
    expect(Math.abs(shiftedBack.start - (initial.start - duration))).toBeLessThanOrEqual(5_000);
    expect(Math.abs(shiftedBack.end - (initial.end - duration))).toBeLessThanOrEqual(5_000);

    await expect(forwardButton).toBeEnabled();
    await forwardButton.click();

    const shiftedForward = await unixRange(page);
    expect(shiftedForward.end - shiftedForward.start).toBe(duration);
    expect(shiftedForward.end).toBeGreaterThanOrEqual(initial.end);
    expect(shiftedForward.end - initial.end).toBeLessThanOrEqual(5_000);
    await expect(forwardButton).toBeDisabled();
  });

  test("paused live ranges can still be shifted backward and forward", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("1h");
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();

    await page.getByRole("button", { name: /pause live range/i }).click();
    const paused = await unixRange(page);
    const duration = paused.end - paused.start;
    const backwardButton = page.getByRole("button", { name: /shift range backward/i });
    const forwardButton = page.getByRole("button", { name: /shift range forward/i });

    await backwardButton.click();
    const shiftedBack = await unixRange(page);
    expect(shiftedBack.start).toBe(paused.start - duration);
    expect(shiftedBack.end).toBe(paused.end - duration);

    await forwardButton.click();
    const shiftedForward = await unixRange(page);
    expect(shiftedForward).toEqual(paused);
  });

  test("playground supports custom presets and generated snippets", async ({ page }) => {
    const input = playgroundInput(page);
    await input.click();
    await input.fill("biz");

    const businessHoursPreset = pickerList(page).getByRole("button", { name: /Business hours/ });
    await expect(businessHoursPreset).toBeVisible();
    await businessHoursPreset.dispatchEvent("click");

    await expect(page.getByText("Start ISO", { exact: true })).toBeVisible();
    await expect(page.getByText(/09:00 - 17:00|9:00 AM - 5:00 PM/).first()).toBeVisible();
    await expect(
      page
        .locator('[data-slot="card-title"]')
        .filter({ hasText: /^Generated snippet from the playground$/ }),
    ).toBeVisible();

    await openConfiguration(page);
    await page.getByLabel("Live label").fill("live");
    await expect(generatedSnippetCard(page).getByText('labels={{ now: "live" }}')).toBeVisible();
  });

  test("responsive layout at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByPlaceholder("Search time range...")).toBeVisible();
    await expect(page.getByText("Supported Input Formats")).toBeVisible();
  });

  test("responsive layout at desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByPlaceholder("Search time range...")).toBeVisible();
    await expect(page.getByText("Supported Input Formats")).toBeVisible();
  });

  test("invalid input shows error message", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("asdfgh");
    await expect(page.getByText(/could not parse/i)).toBeVisible();
  });

  test("long range: past 90 days", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("90d");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(docsResultHeading(page)).toBeVisible();
  });
});
