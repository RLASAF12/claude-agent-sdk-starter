import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

/**
 * Counts words, characters, and sentences in a given text.
 * Use this when you need to analyze the length or structure of any text.
 *
 * The SDK `tool()` signature is: tool(name, description, inputShape, handler).
 * `inputShape` is a raw Zod shape (an object of Zod validators), NOT z.object(...).
 * The handler must resolve to an MCP CallToolResult: { content: [{ type, text }] }.
 */
const getWordCount = tool(
  "get_word_count",
  "Counts the number of words, characters, and sentences in a given text. Use this for text analysis.",
  {
    text: z.string().describe("The text to analyze."),
  },
  async ({ text }) => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const characters = text.length;
    const sentences = text
      .split(/[.!?]+\s*/)
      .filter((s) => s.trim().length > 0).length;

    return {
      content: [
        {
          type: "text",
          text: `${words} words, ${characters} characters, ${sentences} sentences`,
        },
      ],
    };
  },
);

/**
 * Returns the current timestamp in ISO 8601 plus a human-readable form.
 * Accepts an optional IANA timezone name (e.g., "America/New_York", "Asia/Jerusalem").
 */
const getTimestamp = tool(
  "get_timestamp",
  'Returns the current date and time. Accepts an optional IANA timezone name (e.g., "America/New_York", "Asia/Jerusalem"). Defaults to UTC.',
  {
    timezone: z
      .string()
      .optional()
      .describe('IANA timezone name, e.g. "Europe/London". Defaults to UTC.'),
  },
  async ({ timezone }) => {
    const tz = timezone ?? "UTC";
    const now = new Date();
    let human: string;
    let resolvedTz = tz;
    try {
      human = now.toLocaleString("en-US", {
        timeZone: tz,
        dateStyle: "full",
        timeStyle: "long",
      });
    } catch {
      // Fallback if the timezone is invalid
      human = now.toUTCString();
      resolvedTz = "UTC (fallback — invalid timezone provided)";
    }

    return {
      content: [
        {
          type: "text",
          text: `ISO: ${now.toISOString()}\nLocal (${resolvedTz}): ${human}`,
        },
      ],
    };
  },
);

/**
 * In-process MCP server bundling all starter tools. Runs in the same process
 * as the agent — no separate HTTP server to spawn. Add new tools to this array.
 */
export const starterTools = createSdkMcpServer({
  name: "starter-tools",
  version: "0.1.0",
  tools: [getWordCount, getTimestamp],
});

/**
 * Fully-qualified tool names (mcp__<server>__<tool>) used to pre-approve the
 * tools via the `allowedTools` option so the demo runs non-interactively.
 */
export const starterToolNames = [
  "mcp__starter-tools__get_word_count",
  "mcp__starter-tools__get_timestamp",
];
