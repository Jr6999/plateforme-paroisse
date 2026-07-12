import { expect, test } from "@playwright/test";

test("home page renders pastoral platform content", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Paroisse Cathedrale" })).toBeVisible();
  await expect(page.getByText("Annonces recentes")).toBeVisible();

  const eventsHeading = page.getByRole("heading", { level: 2, name: "Evenements a venir" });
  await eventsHeading.scrollIntoViewIfNeeded();
  await expect(eventsHeading).toBeVisible();
});
