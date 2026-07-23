import type { MagicalBean } from "../types";

export const validationBean: MagicalBean = {
  id: "validation",
  name: "Validation Bean",
  description: "Flags incomplete or unsafe output rather than inventing facts.",
  brew(context) {
    if (!context.rawSource.trim()) {
      context.warnings.push({ code: "source.empty", severity: "error", message: "No source text was supplied." });
    }
    if (!context.draft.trim()) {
      context.warnings.push({ code: "draft.empty", severity: "error", message: "No reviewable text could be produced." });
    }
    if (context.metadata.source === "genesys" && context.turns.length < 2) {
      context.warnings.push({ code: "turns.low", severity: "warning", message: "Very few transcript turns were detected. Check the source formatting." });
    }
    return context;
  },
};
