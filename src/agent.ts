import { query } from "@anthropic-ai/claude-code";
import { tools } from "./tools";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const DEMO_PROMPT = `
Count the words in this sentence: "The quick brown fox jumps over the lazy dog."
Then tell me the current UTC time.
Use both tools and report the results clearly.
`.trim();

async function main(): Promise<void> {
  if (!API_KEY) {
    console.error("❌  ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.");
    process.exit(1);
  }

  console.log("🤖  Claude Agent SDK Starter — running demo task\n");
  console.log(`📋  Model   : ${MODEL}`);
  console.log(`🔧  Tools   : ${tools.map((t) => t.name).join(", ")}\n`);
  console.log("─".repeat(60));
  console.log(`💬  Prompt  : ${DEMO_PROMPT}\n`);
  console.log("─".repeat(60) + "\n");

  try {
    for await (const message of query({
      prompt: DEMO_PROMPT,
      options: { model: MODEL },
      tools,
    })) {
      switch (message.type) {
        case "assistant":
          if (message.message?.content) {
            for (const block of message.message.content) {
              if (block.type === "text" && block.text) {
                console.log(`🧠  Claude  : ${block.text}`);
              } else if (block.type === "tool_use") {
                console.log(`⚙️   Tool call: ${block.name}(${JSON.stringify(block.input)})`);
              }
            }
          }
          break;

        case "tool":
          console.log(`✅  Result  : ${JSON.stringify(message.toolUseResult?.content ?? message)}`);
          break;

        case "result":
          console.log("\n" + "─".repeat(60));
          console.log("🏁  Final result:");
          console.log(message.result ?? "(no result text)");
          console.log("─".repeat(60));
          break;

        default:
          break;
      }
    }
  } catch (error) {
    console.error("❌  Agent error:", (error as Error).message);
    process.exit(1);
  }
}

main();
