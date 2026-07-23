type OpenAIContentPart = {
  type?: string;
  text?: string;
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAIContentPart[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
  };
};

function extractOutputText(response: OpenAIResponse): string {
  if (
    typeof response.output_text === "string" &&
    response.output_text.trim()
  ) {
    return response.output_text.trim();
  }

  const text = response.output
    ?.flatMap((item) => item.content ?? [])
    .filter(
      (part) =>
        part.type === "output_text" &&
        typeof part.text === "string",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error(
      "The narrative provider returned no file-note text.",
    );
  }

  return text;
}

export async function generateNarrative(options: {
  instructions: string;
  source: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY has not been configured. BEAN cannot generate a Gold Standard file note.",
    );
  }

  const model =
    process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";

  const baseUrl =
    process.env.OPENAI_BASE_URL?.trim() ||
    "https://api.openai.com/v1";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions: options.instructions,
        input: options.source,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json()) as OpenAIResponse;

    if (!response.ok) {
      throw new Error(
        payload.error?.message ||
          `Narrative provider request failed with HTTP ${response.status}.`,
      );
    }

    return extractOutputText(payload);
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "The narrative request timed out after 120 seconds.",
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
