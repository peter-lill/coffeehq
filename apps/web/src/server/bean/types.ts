export type ParticipantType = "internal" | "external" | "unknown";

export interface TranscriptParticipant {
  id: string;
  displayName: string;
  type: ParticipantType;
}

export interface TranscriptTurn {
  timestamp: string;
  participant: TranscriptParticipant;
  text: string;
}

export interface TranscriptMetadata {
  interactionId?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  direction?: "inbound" | "outbound" | "unknown";
  source: "genesys" | "plain-text";
}

export interface BrewWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface BrewContext {
  rawSource: string;
  metadata: TranscriptMetadata;
  participants: TranscriptParticipant[];
  turns: TranscriptTurn[];
  draft: string;
  notes: string[];
  warnings: BrewWarning[];
}

export interface MagicalBean {
  id: string;
  name: string;
  description: string;
  brew(context: BrewContext): Promise<BrewContext> | BrewContext;
}
