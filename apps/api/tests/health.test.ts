import request from "supertest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/parish_platform?schema=public";
process.env.JWT_ACCESS_SECRET = "test-access-secret-change-me-32-chars";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-change-me-32-chars";
process.env.CORS_ORIGINS = "http://localhost:3000";

describe("health", () => {
  it("returns an operational status", async () => {
    const { createApp } = await import("../src/app.js");
    const app = createApp();

    const response = await request(app).get("/health").expect(200);
    expect(response.body.status).toBe("ok");
  });
});
