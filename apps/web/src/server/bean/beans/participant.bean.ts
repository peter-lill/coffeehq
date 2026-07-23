import type { MagicalBean } from "../types";

export const participantBean: MagicalBean = {
  id: "participant",
  name: "Participant Bean",
  description: "Checks that transcript participants were identified.",
  brew(context) {
    if (context.metadata.source === "genesys" && context.participants.length === 0) {
      context.warnings.push({
        code: "participants.missing",
        severity: "error",
        message: "No participants could be identified in the Genesys transcript.",
      });
    }
    return context;
  },
};
