import { z } from "zod";

export const generatePlanRequestSchema = z.object({
  promptPackage: z
    .string()
    .trim()
    .min(20, "promptPackage must contain the LLM-ready prompt text"),
  projectName: z.string().trim().max(200).optional(),
  model: z.string().trim().min(1).max(120).optional(),
});

export type GeneratePlanRequest = z.infer<typeof generatePlanRequestSchema>;

export interface OllamaConfig {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

export function readOllamaConfig(env: NodeJS.ProcessEnv = process.env): OllamaConfig {
  return {
    baseUrl: env.OLLAMA_BASE_URL?.trim() || undefined,
    apiKey: env.OLLAMA_API_KEY?.trim() || undefined,
    model: env.OLLAMA_MODEL?.trim() || undefined,
  };
}

export interface GeneratePlanSuccess {
  plan: string;
  model: string;
}

export interface GeneratePlanUpstreamError {
  status: number;
  message: string;
  detail?: unknown;
}

export class OllamaError extends Error {
  status: number;
  detail?: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

function extractPlanFromChat(payload: any): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  // Ollama /api/chat: { message: { role, content }, ... }
  if (payload.message && typeof payload.message.content === "string") {
    return payload.message.content;
  }
  // OpenAI-compatible: { choices: [{ message: { content } }] }
  if (Array.isArray(payload.choices) && payload.choices.length > 0) {
    const first = payload.choices[0];
    if (first?.message?.content && typeof first.message.content === "string") {
      return first.message.content;
    }
    if (typeof first?.text === "string") return first.text;
  }
  return undefined;
}

function extractPlanFromGenerate(payload: any): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  if (typeof payload.response === "string") return payload.response;
  return undefined;
}

export async function callOllamaGeneratePlan(
  config: Required<Pick<OllamaConfig, "baseUrl">> & OllamaConfig,
  request: GeneratePlanRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<GeneratePlanSuccess> {
  const effectiveModel = (request.model || config.model || "llama3").trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const systemMsg =
    "You are a senior product architect and implementation planner. Produce the requested finished implementation plan in Markdown using the project markdown the user provides as the source of truth. Do not invent credentials or vendor lock-in.";

  const chatBody = {
    model: effectiveModel,
    stream: false,
    messages: [
      { role: "system", content: systemMsg },
      { role: "user", content: request.promptPackage },
    ],
  };

  const chatUrl = joinUrl(config.baseUrl, "/api/chat");
  let chatRes: Response;
  try {
    chatRes = await fetchImpl(chatUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(chatBody),
    });
  } catch (err) {
    throw new OllamaError(
      502,
      `Could not reach Ollama at ${config.baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (chatRes.ok) {
    const payload = await chatRes.json().catch(() => undefined);
    const plan = extractPlanFromChat(payload);
    if (plan && plan.trim().length > 0) {
      return { plan: plan.trim(), model: payload?.model || effectiveModel };
    }
    // fall through to /api/generate fallback if response shape unrecognized
  }

  // If chat failed with 404 or returned an unrecognized payload, try /api/generate
  if (chatRes.status === 404 || chatRes.status === 405 || chatRes.ok) {
    const generateBody = {
      model: effectiveModel,
      stream: false,
      system: systemMsg,
      prompt: request.promptPackage,
    };
    const genUrl = joinUrl(config.baseUrl, "/api/generate");
    let genRes: Response;
    try {
      genRes = await fetchImpl(genUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(generateBody),
      });
    } catch (err) {
      throw new OllamaError(
        502,
        `Could not reach Ollama at ${config.baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (!genRes.ok) {
      const detail = await safeReadBody(genRes);
      throw new OllamaError(
        genRes.status === 401 || genRes.status === 403 ? genRes.status : 502,
        `Ollama upstream error (${genRes.status} ${genRes.statusText || ""}).`.trim(),
        detail,
      );
    }

    const payload = await genRes.json().catch(() => undefined);
    const plan = extractPlanFromGenerate(payload) ?? extractPlanFromChat(payload);
    if (!plan || plan.trim().length === 0) {
      throw new OllamaError(502, "Ollama returned an empty plan response.", payload);
    }
    return { plan: plan.trim(), model: payload?.model || effectiveModel };
  }

  // Non-OK chat response that we didn't already fall through.
  const detail = await safeReadBody(chatRes);
  throw new OllamaError(
    chatRes.status === 401 || chatRes.status === 403 ? chatRes.status : 502,
    `Ollama upstream error (${chatRes.status} ${chatRes.statusText || ""}).`.trim(),
    detail,
  );
}

async function safeReadBody(res: Response): Promise<unknown> {
  try {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return undefined;
  }
}
