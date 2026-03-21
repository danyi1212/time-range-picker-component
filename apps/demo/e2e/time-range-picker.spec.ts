import { expect, Page, test } from "@playwright/test";

function docsInput(page: Page) {
  return page.getByRole("textbox").first();
}

function playgroundInput(page: Page) {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("Playground", { exact: true }) })
    .getByRole("textbox")
    .first();
}

function docsResultHeading(page: Page) {
  return page.locator('[data-slot="card-title"]').filter({ hasText: /^Selected Range/ });
}

function pickerList(page: Page) {
  return page.locator("[cmdk-list]").first();
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
    await expect(page.getByText("Natural Language Time Range Picker")).toBeVisible();
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
    await expect(page.getByText("Start ISO")).toBeVisible();
  });

  test("focusing the picker reveals presets and examples", async ({ page }) => {
    await docsInput(page).click();

    await expect(pickerList(page).getByText("Presets", { exact: true })).toBeVisible();
    await expect(pickerList(page).getByText("Examples", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Past 1 hour/ }).first()).toBeVisible();
    await expect(pickerList(page).getByText("Try typing:")).toBeVisible();
  });

  test("tab focus opens presets on the picker input", async ({ page }) => {
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
    }

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
    await expect(page.getByText("Start ISO")).toBeVisible();
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
    await expect(docsResultHeading(page)).toHaveCount(0);
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

  test("blur commits a parsed value without pressing Enter", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("3h");
    await expect(page.getByText("Parsed Result")).toBeVisible();

    await page.keyboard.press("Tab");

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
    await expect(docsResultHeading(page)).toHaveCount(0);
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
    const themeButton = page.getByRole("button", { name: /theme:/i });

    await expect(html).not.toHaveClass(/dark/);
    await expect(themeButton).toContainText("System");

    await themeButton.click();
    await expect(html).toHaveClass(/dark/);
    await expect(themeButton).toContainText("Dark");

    await themeButton.click();
    await expect(html).not.toHaveClass(/dark/);
    await expect(themeButton).toContainText("Light");

    await themeButton.click();
    await expect(html).not.toHaveClass(/dark/);
    await expect(themeButton).toContainText("System");
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

    const formatToggle = page.getByRole("button", { name: /24h|12h/ });
    await expect(formatToggle).toContainText("24h");
    await expect(docsInput(page)).toHaveAttribute("placeholder", /14:00/);

    await formatToggle.click();
    await expect(formatToggle).toContainText("12h");
    await expect(docsInput(page)).toHaveAttribute("placeholder", /2:00 PM/);
  });

  test("pausing a live range freezes the selection", async ({ page }) => {
    const input = docsInput(page);
    await input.click();
    await input.fill("1h");
    await page.keyboard.press("Enter");

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(page.locator("[data-slot=badge]").filter({ hasText: "Live" })).toHaveCount(1);

    await page.getByRole("button", { name: /pause live range/i }).click();

    await expect(docsResultHeading(page)).toBeVisible();
    await expect(page.locator("[data-slot=badge]").filter({ hasText: "Live" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /pause live range/i })).toHaveCount(0);
  });

  test("playground supports custom presets and generated snippets", async ({ page }) => {
    await page.getByRole("button", { name: "Playground" }).click();

    const input = playgroundInput(page);
    await input.click();
    await input.fill("biz");

    const businessHoursPreset = pickerList(page).getByRole("button", { name: /Business hours/ });
    await expect(businessHoursPreset).toBeVisible();
    await businessHoursPreset.dispatchEvent("click");

    await expect(page.getByText("Start ISO")).toBeVisible();
    await expect(playgroundInput(page)).toHaveAttribute("placeholder", /09:00|9:00 AM/);
    await expect(
      page.locator('[data-slot="card-title"]').filter({ hasText: /^Generated snippet$/ }),
    ).toBeVisible();

    await page.getByLabel("Live label").fill("live");
    await expect(page.getByText('labels={{ now: "live" }}')).toBeVisible();
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
