"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callNvidiaChatCompletions = callNvidiaChatCompletions;
async function callNvidiaChatCompletions(args) {
    const { apiKey, baseUrl = "https://integrate.api.nvidia.com/v1", model = "openai/gpt-oss-20b", messages, temperature = 0.7, top_p = 0.9, max_tokens = 700, } = args;
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
    const res = await fetch(url, {
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
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`NVIDIA API error (${res.status}): ${text || res.statusText}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        "";
    return String(content).trim();
}
