import { test, expect } from "@playwright/test";

test.describe("Time Range Picker Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with picker visible and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByText("Natural Language Time Range Picker")).toBeVisible();
    await expect(page.getByPlaceholder("Search time range...")).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test("preset selection shows result card", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    // Type a filter to open the popover and narrow presets
    await input.click();
    await input.fill("past 1 h");
    // The preset "Past 1 hour" should appear in the filtered list
    await expect(page.getByText("Past 1 hour")).toBeVisible();
    await page.getByText("Past 1 hour").click();

    await expect(page.getByText("Selected Range")).toBeVisible();
    await expect(page.getByText("ISO Timestamps")).toBeVisible();
  });

  test("shortcut input parses correctly", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    await input.click();
    await input.fill("3h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
    // Check duration badge specifically in the result card
    await expect(page.locator("[data-slot=badge]").filter({ hasText: "3h" }).first()).toBeVisible();
  });

  test("natural language input", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    await input.click();
    await input.fill("last friday");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
  });

  test("date range input", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    await input.click();
    await input.fill("Mar 3 - Mar 13");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
    // Verify the ISO timestamp section shows a March date
    await expect(page.getByText("ISO Timestamps")).toBeVisible();
    await expect(page.getByText(/2026-03/).first()).toBeVisible();
  });

  test("time range input", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    await input.click();
    await input.fill("9am - 5pm");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Selected Range")).toBeVisible();
  });

  test("clear selection", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    // Select a range by typing a shortcut
    await input.click();
    await input.fill("1h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Selected Range")).toBeVisible();

    // Click clear button
    await page.getByRole("button", { name: /clear selection/i }).click();
    await expect(page.getByText("Selected Range")).not.toBeVisible();
  });

  test("keyboard flow: type, enter, escape", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    await input.click();
    await input.fill("1h");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Selected Range")).toBeVisible();

    // After selecting, the placeholder changes to the range display
    // Use getByRole to find the textbox regardless of placeholder
    const textbox = page.getByRole("textbox");
    await textbox.click({ position: { x: 5, y: 5 } });
    await textbox.fill("test");
    await expect(page.getByText(/could not parse/i)).toBeVisible();
    await page.keyboard.press("Escape");
    // After escape, the popover should close
    await expect(page.getByText(/could not parse/i)).not.toBeVisible();
  });

  test("dark mode toggle", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: /toggle theme/i }).click();
    await expect(html).toHaveClass(/dark/);

    await page.getByRole("button", { name: /toggle theme/i }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("12h/24h format toggle", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    // Select a range via shortcut input
    await input.click();
    await input.fill("1h");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Selected Range")).toBeVisible();

    const formatToggle = page.getByRole("button", { name: /24h|12h/ });
    await expect(formatToggle).toContainText("24h");

    await formatToggle.click();
    await expect(formatToggle).toContainText("12h");
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
    const input = page.getByPlaceholder("Search time range...");
    await input.click();
    await input.fill("asdfgh");
    await expect(page.getByText(/could not parse/i)).toBeVisible();
  });

  test("long range: past 90 days", async ({ page }) => {
    const input = page.getByPlaceholder("Search time range...");
    await input.click();
    await input.fill("90d");
    await expect(page.getByText("Parsed Result")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Selected Range")).toBeVisible();
  });
});
