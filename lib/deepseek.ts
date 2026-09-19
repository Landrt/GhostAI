/**
 * Client d'intégration officiel pour l'API DeepSeek (OpenAI-compatible)
 * Modèle par défaut : deepseek-chat (DeepSeek-V3)
 * Documentation : https://api.deepseek.com
 */

import dns from "dns";

if (typeof dns !== "undefined" && typeof dns.setDefaultResultOrder === "function") {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch {}
}

const apiKey = process.env.DEEPSEEK_API_KEY || "";

export const isDeepSeekConfigured = Boolean(
  (process.env.DEEPSEEK_API_KEY || apiKey) &&
    !(process.env.DEEPSEEK_API_KEY || apiKey).startsWith("dev_") &&
    (process.env.DEEPSEEK_API_KEY || apiKey).length > 10
);

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekCompletionOptions {
  model?: string;
  messages: DeepSeekMessage[];
  system?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
}

export interface DeepSeekCompletionResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
}

export async function createDeepSeekChatCompletion(
  options: DeepSeekCompletionOptions
): Promise<DeepSeekCompletionResult> {
  const effectiveKey = process.env.DEEPSEEK_API_KEY || apiKey;
  if (!effectiveKey) {
    throw new Error("Clé DEEPSEEK_API_KEY manquante.");
  }

  const model = options.model || "deepseek-chat";
  const messages: DeepSeekMessage[] = [];

  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }

  messages.push(...options.messages);

  const payload: any = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
    stream: false,
  };

  if (options.response_format) {
    payload.response_format = options.response_format;
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${effectiveKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Erreur API DeepSeek (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const text = choice?.message?.content || "";

  let usageResult: DeepSeekCompletionResult["usage"] = undefined;
  if (data.usage) {
    const promptTokens = data.usage.prompt_tokens || 0;
    const completionTokens = data.usage.completion_tokens || 0;
    const totalTokens = data.usage.total_tokens || promptTokens + completionTokens;

    // Tarification DeepSeek V3 :
    // Prompt : 0,27 $ / 1M tokens ($0.00000027)
    // Completion : 1,10 $ / 1M tokens ($0.0000011)
    const estimatedCostUsd =
      promptTokens * 0.00000027 + completionTokens * 0.0000011;

    usageResult = {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd,
    };
  }

  return {
    text: text.trim(),
    usage: usageResult,
  };
}

/**
 * Adaptateur de compatibilité d'appel style messages.create
 */
export const deepseek = {
  messages: {
    create: async (params: {
      model?: string;
      system?: string;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: "json_object" | "text" };
    }) => {
      const res = await createDeepSeekChatCompletion({
        model: params.model === "claude-3-5-sonnet-latest" ? "deepseek-chat" : params.model || "deepseek-chat",
        system: params.system,
        messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        response_format: params.response_format,
      });

      return {
        content: [{ type: "text" as const, text: res.text }],
        usage: res.usage
          ? {
              input_tokens: res.usage.promptTokens,
              output_tokens: res.usage.completionTokens,
            }
          : undefined,
        rawUsage: res.usage,
      };
    },
  },
};
