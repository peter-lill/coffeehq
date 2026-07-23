import type { BrewContext, TranscriptParticipant, TranscriptTurn } from "../types";

const META_PATTERNS = {
  interactionId: /Interaction ID:\s*([^\r\n]+)/i,
  startTime: /Transcript Start Time:\s*([^\r\n]+)/i,
  endTime: /Transcript End Time:\s*([^\r\n]+)/i,
  duration: /Transcript Duration:\s*([^\r\n]+)/i,
};

const TURN_PATTERN = /^(\d{1,2}:\d{2})\s+(Internal|External)\s+(.+?)\s{2,}(.+)$/i;

function clean(value?: string): string | undefined {
  return value?.replace(/\s+/g, " ").trim() || undefined;
}

function participantId(type: string, name: string): string {
  return `${type.toLowerCase()}:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function isGenesysTranscript(source: string): boolean {
  return /Transcript Start Time:/i.test(source) && /Participant Type/i.test(source);
}

export function parseGenesysTranscript(source: string): BrewContext {
  const participants = new Map<string, TranscriptParticipant>();
  const turns: TranscriptTurn[] = [];

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, "  ").trim();
    const match = line.match(TURN_PATTERN);
    if (!match) continue;

    const [, timestamp, typeRaw, nameRaw, textRaw] = match;
    const displayName = clean(nameRaw) ?? "Unknown participant";
    const text = clean(textRaw) ?? "";
    if (!text) continue;

    const type = typeRaw.toLowerCase() === "internal" ? "internal" : "external";
    const id = participantId(type, displayName);
    const participant = participants.get(id) ?? { id, displayName, type };
    participants.set(id, participant);
    turns.push({ timestamp, participant, text });
  }

  const interactionId = clean(source.match(META_PATTERNS.interactionId)?.[1]);
  const startTime = clean(source.match(META_PATTERNS.startTime)?.[1]);
  const endTime = clean(source.match(META_PATTERNS.endTime)?.[1]);
  const duration = clean(source.match(META_PATTERNS.duration)?.[1]);
  const directionMatch = source.match(/Direction:\s*(Inbound|Outbound)/i)?.[1]?.toLowerCase();

  return {
    rawSource: source,
    metadata: {
      interactionId,
      startTime,
      endTime,
      duration,
      direction: directionMatch === "inbound" || directionMatch === "outbound" ? directionMatch : "unknown",
      source: "genesys",
    },
    participants: [...participants.values()],
    turns,
    draft: "",
    notes: [],
    warnings: [],
  };
}
