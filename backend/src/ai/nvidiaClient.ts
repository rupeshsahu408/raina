export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string | Array<Record<string, unknown>>;
};

export async function callNvidiaChatCompletions(args: {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}) {
  const {
    apiKey,
    baseUrl = "https://integrate.api.nvidia.com/v1",
    model = "openai/gpt-oss-20b",
    messages,
    temperature = 0.7,
    top_p = 0.9,
    max_tokens = 1200,
  } = args;

  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        top_p,
        max_tokens,
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      throw new Error("NVIDIA API timeout: request exceeded 45 seconds.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `NVIDIA API error (${res.status}): ${text || res.statusText}`
    );
  }

  const data: any = await res.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    "";

  return String(content).trim();
}

