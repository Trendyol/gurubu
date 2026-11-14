const axios = require("axios");

const DEFAULT_BASE_URL = "https://aigateway.trendyol.com";
const DEFAULT_MODEL = "deepseek-v4-flash-0731";
const DEFAULT_TIMEOUT_MS = 120000;

class LlmEstimationClient {
  baseUrl() {
    return String(
      process.env.AI_GATEWAY_BASE_URL || DEFAULT_BASE_URL
    ).replace(/\/+$/, "");
  }

  model() {
    return process.env.AI_GATEWAY_MODEL || DEFAULT_MODEL;
  }

  apiKey() {
    return process.env.OPENAI_API_KEY || "";
  }

  timeoutMs() {
    const parsed = Number(process.env.AI_GATEWAY_TIMEOUT_MS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
  }

  isConfigured() {
    return Boolean(this.apiKey());
  }

  buildSystemPrompt(guide) {
    return [
      "You are an agile story point estimation assistant for Planning Poker.",
      "Use the project estimation guide below as your primary ruleset (system rules).",
      "Return ONLY valid JSON with this exact shape:",
      '{"estimation": <number>, "reasoning": ["short sentence 1", "short sentence 2", "short sentence 3"]}',
      "Rules:",
      "- estimation must be a numeric story point value consistent with the guide",
      "- reasoning must contain 2 or 3 short sentences",
      "- do not wrap the JSON in markdown fences",
      "- do not add any keys other than estimation and reasoning",
      "",
      "=== PROJECT ESTIMATION GUIDE ===",
      String(guide || "").trim(),
      "=== END GUIDE ===",
    ].join("\n");
  }

  buildUserPrompt({ projectKey, issueKey, summary, description }) {
    return [
      `Project: ${projectKey}`,
      `Issue: ${issueKey}`,
      `Summary: ${summary || ""}`,
      "",
      "Description:",
      description || "(empty)",
      "",
      "Estimate this issue using the guide.",
    ].join("\n");
  }

  parseContent(content) {
    if (!content || typeof content !== "string") {
      throw new Error("Empty LLM content");
    }

    let raw = content.trim();
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      raw = fenced[1].trim();
    }

    const parsed = JSON.parse(raw);
    const estimation = Number(parsed.estimation);
    if (!Number.isFinite(estimation)) {
      throw new Error("LLM estimation is not a number");
    }

    const reasoning = Array.isArray(parsed.reasoning)
      ? parsed.reasoning
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];

    if (reasoning.length === 0) {
      throw new Error("LLM reasoning is empty");
    }

    return { estimation, reasoning };
  }

  async estimate({ projectKey, issueKey, summary, description, guide }) {
    if (!this.isConfigured()) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await axios.post(
      `${this.baseUrl()}/chat/completions`,
      {
        model: this.model(),
        messages: [
          {
            role: "system",
            content: this.buildSystemPrompt(guide),
          },
          {
            role: "user",
            content: this.buildUserPrompt({
              projectKey,
              issueKey,
              summary,
              description,
            }),
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey()}`,
          "Content-Type": "application/json",
        },
        timeout: this.timeoutMs(),
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    return this.parseContent(content);
  }
}

module.exports = new LlmEstimationClient();
