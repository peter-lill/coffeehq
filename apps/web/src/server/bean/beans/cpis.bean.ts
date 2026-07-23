import type { MagicalBean } from "../types";

const DEFAULT_LIMIT = 3800;

export function splitForCpis(text: string, limit = DEFAULT_LIMIT): string[] {
  const paragraphs = text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length <= limit && `${current}\n\n${paragraph}`.trim().length <= limit) {
      current = `${current}\n\n${paragraph}`.trim();
      continue;
    }

    flush();
    if (paragraph.length <= limit) {
      current = paragraph;
      continue;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [paragraph];
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (`${current} ${trimmed}`.trim().length > limit) flush();
      current = `${current} ${trimmed}`.trim();
    }
  }

  flush();
  return chunks;
}

export const cpisBean: MagicalBean = {
  id: "cpis",
  name: "CPIS Bean",
  description: "Splits output without breaking sentences where possible.",
  brew(context) {
    context.notes = splitForCpis(context.draft);
    return context;
  },
};
