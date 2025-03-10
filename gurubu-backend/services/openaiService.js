const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }


  async askAssistant(assistantId, message, threadId = null) {
    try {
      
      let thread;
      if (!threadId) {
        thread = await this.openai.beta.threads.create();
        threadId = thread.id;
      } else {
        threadId = threadId;
      }

      await this.openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      let runStatus = await this.openai.beta.threads.runs.retrieve(
        threadId,
        run.id
      );

      while (runStatus.status !== "completed") {
        if (runStatus.status === "failed") {
          throw new Error(`Run failed with error: ${runStatus.last_error}`);
        }

        if (["expired", "cancelled"].includes(runStatus.status)) {
          throw new Error(`Run ${runStatus.status}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        );
      }

      const messages = await this.openai.beta.threads.messages.list(threadId);

      const assistantMessages = messages.data.filter(
        (msg) => msg.role === "assistant"
      );

      if (assistantMessages.length === 0) {
        return { response: "No response from assistant" };
      }

      const latestMessage = assistantMessages[0];
      
      const textContent = latestMessage.content
        .filter((content) => content.type === "text")
        .map((content) => content.text.value)
        .join("\n");

      return { response: textContent, threadId: threadId };
    } catch (error) {
      console.error("Error in askAssistant:", error);
      throw new Error(`Failed to get response from assistant: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService();
