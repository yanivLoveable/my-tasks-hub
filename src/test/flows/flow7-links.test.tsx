import { describe, it, expect } from "vitest";
import { rewriteTaskUrl } from "@/config/links";

describe("Flow 7 — Link behavior + env rewrite", () => {
  it("rewrites ERP URL for dev env", () => {
    const result = rewriteTaskUrl("https://erp.example.com/task/123", "ERP", "dev");
    expect(result).toBe("https://erp-dev.example.com/task/123");
  });

  it("rewrites ERP URL for test env", () => {
    const result = rewriteTaskUrl("https://erp.example.com/task/123", "ERP", "test");
    expect(result).toBe("https://erp-test.example.com/task/123");
  });

  it("rewrites ERP URL for prod env", () => {
    const result = rewriteTaskUrl("https://erp.example.com/task/123", "ERP", "prod");
    expect(result).toBe("https://erp.example.com/task/123");
  });

  it("rewrites SNOW URL for dev env", () => {
    const result = rewriteTaskUrl("https://snow.example.com/incident/456", "SNOW", "dev");
    expect(result).toBe("https://snow-dev.example.com/incident/456");
  });

  it("rewrites SNOW URL for test env", () => {
    const result = rewriteTaskUrl("https://snow.example.com/incident/456", "SNOW", "test");
    expect(result).toBe("https://snow-test.example.com/incident/456");
  });

  it("rewrites DOCS URL for dev env", () => {
    const result = rewriteTaskUrl("https://docs.example.com/doc/789", "DOCS", "dev");
    expect(result).toBe("https://docs-dev.example.com/doc/789");
  });

  it("preserves path and query params", () => {
    const result = rewriteTaskUrl("https://erp.example.com/task/123?tab=details&view=full", "ERP", "dev");
    expect(result).toContain("/task/123?tab=details&view=full");
    expect(result).toContain("erp-dev.example.com");
  });

  it("returns original URL for unknown system", () => {
    const original = "https://unknown.example.com/foo";
    const result = rewriteTaskUrl(original, "UNKNOWN", "dev");
    expect(result).toBe(original);
  });

  it("returns original URL for invalid URL string", () => {
    const result = rewriteTaskUrl("not-a-url", "ERP", "dev");
    expect(result).toBe("not-a-url");
  });
});
