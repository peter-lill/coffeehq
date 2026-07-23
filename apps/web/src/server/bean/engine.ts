import { cpisBean } from "./beans/cpis.bean";
import { narrativeBean } from "./beans/narrative.bean";
import { participantBean } from "./beans/participant.bean";
import { validationBean } from "./beans/validation.bean";
import { isGenesysTranscript, parseGenesysTranscript } from "./parsers/genesys";
import { parsePlainText } from "./parsers/plain-text";
import type { BrewContext, MagicalBean } from "./types";

const FILE_NOTE_BLEND: MagicalBean[] = [participantBean, narrativeBean, validationBean, cpisBean];

export async function brewFileNote(source: string): Promise<BrewContext> {
  let context = isGenesysTranscript(source) ? parseGenesysTranscript(source) : parsePlainText(source);
  for (const bean of FILE_NOTE_BLEND) context = await bean.brew(context);
  return context;
}
