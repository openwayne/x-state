import { vi } from "vitest";

vi.test("example", ({ test }) => {
  test("should pass", () => {
    expect(1 + 1).toBe(2);
  });
});
