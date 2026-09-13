import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPERATING_MODE,
  isOperatingMode,
} from "../src/mode.js";

describe("operating mode", () => {
  it("defaults to research", () => {
    expect(DEFAULT_OPERATING_MODE).toBe("research");
  });

  it("accepts only the three approved modes", () => {
    expect(isOperatingMode("research")).toBe(true);
    expect(isOperatingMode("paper")).toBe(true);
    expect(isOperatingMode("live")).toBe(true);
    expect(isOperatingMode("prod")).toBe(false);
    expect(isOperatingMode("")).toBe(false);
  });
});
