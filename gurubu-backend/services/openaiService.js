const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }


  async askAssistant(assistantId, message) {
    try {
      const thread = await this.openai.beta.threads.create();

      await this.openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: message,
      });

      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
      });

      let runStatus = await this.openai.beta.threads.runs.retrieve(
        thread.id,
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
          thread.id,
          run.id
        );
      }

      const messages = await this.openai.beta.threads.messages.list(thread.id);

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

      return { response: textContent, threadId: thread.id };
    } catch (error) {
      console.error("Error in askAssistant:", error);
      throw new Error(`Failed to get response from assistant: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService();
