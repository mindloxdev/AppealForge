import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "@/lib/ai/system-prompt";

describe("system prompt", () => {
  it("matches the hash recorded when it was generated", () => {
    const sha = createHash("sha256").update(SYSTEM_PROMPT).digest("hex");
    expect(sha).toBe(SYSTEM_PROMPT_SHA256);
  });

  it("is byte-identical to the spec copy in docs/", () => {
    const spec = readFileSync("docs/system-prompt.txt", "utf8")
      .replace(/\r\n/g, "\n")
      .replace(/\n+$/, "");
    expect(SYSTEM_PROMPT).toBe(spec);
  });

  it("still carries the rules the product depends on", () => {
    expect(SYSTEM_PROMPT).toMatch(/^You write formal appeal letters to US health insurers/);
    expect(SYSTEM_PROMPT).toContain("[DATE OF PRIOR AUTH REQUEST]");
    expect(SYSTEM_PROMPT).toContain("Length 400 to 700 words.");
    expect(SYSTEM_PROMPT).toContain("Request peer-to-peer review");
    expect(SYSTEM_PROMPT).toMatch(/Output only the letter text, nothing before or after it\.$/);
    expect(SYSTEM_PROMPT.split("\n")).toHaveLength(30);
  });
});
