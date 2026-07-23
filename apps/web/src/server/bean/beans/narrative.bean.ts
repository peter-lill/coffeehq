import { generateNarrative } from "../narrative/openai-provider";
import { WORKCOVER_QLD_FILE_NOTE_PROFILE } from "../profiles/workcover-qld-file-note";
import type { MagicalBean } from "../types";

function cleanSource(value: string): string {
  return value
    .replace(/[‪‬]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function buildNarrativeInput(context: Parameters<MagicalBean["brew"]>[0]): string {
  const metadata = [
    `Source type: ${context.metadata.source}`,
    `Direction: ${context.metadata.direction ?? "unknown"}`,
    context.metadata.interactionId
      ? `Interaction ID: ${context.metadata.interactionId}`
      : null,
    context.metadata.startTime
      ? `Start time: ${context.metadata.startTime}`
      : null,
    context.metadata.endTime
      ? `End time: ${context.metadata.endTime}`
      : null,
    context.metadata.duration
      ? `Duration: ${context.metadata.duration}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const transcript =
    context.turns.length > 0
      ? context.turns
          .map(
            (turn) =>
              `[${turn.timestamp || "time unknown"}] ` +
              `${turn.participant.type.toUpperCase()} – ` +
              `${turn.participant.displayName}: ${turn.text}`,
          )
          .join("\n")
      : cleanSource(context.rawSource);

  return `
CONTACT METADATA
${metadata}

SOURCE MATERIAL
${transcript}
`.trim();
}

export const narrativeBean: MagicalBean = {
  id: "narrative",
  name: "Narrative Bean",
  description:
    "Generates a Gold Standard WorkCover Queensland file note for human review.",

  async brew(context) {
    if (!context.rawSource.trim()) {
      context.warnings.push({
        code: "EMPTY_SOURCE",
        message: "No source information was provided.",
        severity: "error",
      });

      return context;
    }

    try {
      context.draft = await generateNarrative({
        instructions: WORKCOVER_QLD_FILE_NOTE_PROFILE,
        source: buildNarrativeInput(context),
      });

      context.notes.push(
        "Narrative Bean generated the file-note narrative from the supplied source material.",
      );
    } catch (error) {
      context.draft = "";

      context.warnings.push({
        code: "NARRATIVE_GENERATION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "The Gold Standard file note could not be generated.",
        severity: "error",
      });
    }

    return context;
  },
};
