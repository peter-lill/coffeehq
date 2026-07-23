import type { BrewContext } from "../types";

export function parsePlainText(source: string): BrewContext {
  return {
    rawSource: source,
    metadata: { source: "plain-text", direction: "unknown" },
    participants: [],
    turns: [],
    draft: source.trim(),
    notes: [],
    warnings: [],
  };
}
