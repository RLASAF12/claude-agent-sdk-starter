import { query } from "@anthropic-ai/claude-agent-sdk";
import { starterTools, starterToolNames } from "./tools";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const DEMO_PROMPT = `
Count the words in this sentence: "The quick brown fox jumps over the lazy dog."
Then tell me the current time in Asia/Jerusalem.
Use both tools and report the results clearly.
`.trim();

async function main(): Promise<void> {
  if (!API_KEY) {
    console.warn(
      "ℹ️  ANTHROPIC_API_KEY not set — falling back to your logged-in Claude Code session.\n" +
        "    Set it in .env (see .env.example) to authenticate with an API key instead.\n",
    );
  }

  console.log("🤖  Claude Agent SDK Starter — running demo task\n");
  console.log(`📋  Model   : ${MODEL}`);
  console.log(`🔧  Tools   : ${starterToolNames.join(", ")}\n`);
  console.log("─".repeat(60));
  console.log(`💬  Prompt  : ${DEMO_PROMPT}\n`);
  console.log("─".repeat(60) + "\n");

  try {
    // query() returns an AsyncIterable<SDKMessage>. Every assistant turn,
    // tool call, and the final result streams back through this loop.
    for await (const message of query({
      prompt: DEMO_PROMPT,
      options: {
        model: MODEL,
        // Register the in-process MCP server that exposes our custom tools.
        mcpServers: { "starter-tools": starterTools },
        // Pre-approve the two tools so the demo runs without permission prompts.
        allowedTools: starterToolNames,
      },
    })) {
      switch (message.type) {
        case "assistant":
          for (const block of message.message.content) {
            if (block.type === "text") {
              console.log(`🧠  Claude  : ${block.text}`);
            } else if (block.type === "tool_use") {
              console.log(
                `⚙️   Tool call: ${block.name}(${JSON.stringify(block.input)})`,
              );
            }
          }
          break;

        case "result":
          console.log("\n" + "─".repeat(60));
          console.log("🏁  Final result:");
          console.log(
            message.subtype === "success"
              ? message.result
              : `(no result text — ended with: ${message.subtype})`,
          );
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
