import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

export type AiProviderId = "gemini" | "groq";

export function getAiProviderConfig(): {
  provider: AiProviderId;
  model: string;
} {
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();
  const model =
    process.env.AI_MODEL ??
    (provider === "groq" ? "llama-3.3-70b-versatile" : "gemini-2.0-flash");

  if (provider !== "gemini" && provider !== "groq") {
    throw new Error(
      `Invalid AI_PROVIDER "${provider}". Expected "gemini" or "groq".`,
    );
  }

  return { provider, model };
}

function createGeminiModel(model: string): LanguageModel {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  const google = createGoogleGenerativeAI({ apiKey });
  return google(model);
}

function createGroqModel(model?: string): LanguageModel {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set.");
  }
  const groq = createGroq({ apiKey });
  return groq(model ?? "llama-3.3-70b-versatile");
}

/** Primary model from env. */
export function getLanguageModel(): LanguageModel {
  const { provider, model } = getAiProviderConfig();
  return provider === "groq" ? createGroqModel(model) : createGeminiModel(model);
}

/**
 * Prefer configured provider; if Gemini is selected but unavailable, fall back to Groq.
 * Call sites that need resilience (chat / bootstrap) should use this.
 */
export function getLanguageModelResilient(): {
  model: LanguageModel;
  provider: AiProviderId;
  modelId: string;
} {
  const { provider, model } = getAiProviderConfig();

  if (provider === "groq") {
    return {
      model: createGroqModel(model),
      provider: "groq",
      modelId: model,
    };
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("missing gemini key");
    }
    return {
      model: createGeminiModel(model),
      provider: "gemini",
      modelId: model,
    };
  } catch {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "Gemini unavailable and GROQ_API_KEY is not set. Add a valid GEMINI_API_KEY or GROQ_API_KEY.",
      );
    }
    const fallbackModel = "llama-3.3-70b-versatile";
    return {
      model: createGroqModel(fallbackModel),
      provider: "groq",
      modelId: fallbackModel,
    };
  }
}
