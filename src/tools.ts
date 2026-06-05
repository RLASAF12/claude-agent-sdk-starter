import { tool } from "@anthropic-ai/claude-code";
import { z } from "zod";

/**
 * Counts words, characters, and sentences in a given text.
 * Use this when you need to analyze the length or structure of any text.
 */
const get_word_count = tool({
  name: "get_word_count",
  description:
    "Counts the number of words, characters, and sentences in a given text. Use this for text analysis.",
  input: z.object({
    text: z.string().describe("The text to analyze."),
  }),
  async execute({ text }) {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const characters = text.length;
    const sentences = text
      .split(/[.!?]+\s*/)
      .filter((s) => s.trim().length > 0).length;

    return {
      words,
      characters,
      sentences,
      summary: `${words} words, ${characters} characters, ${sentences} sentences`,
    };
  },
});

/**
 * Returns the current timestamp in ISO 8601 and human-readable format.
 * Accepts an optional IANA timezone name (e.g., "America/New_York", "Asia/Jerusalem").
 */
const get_timestamp = tool({
  name: "get_timestamp",
  description:
    'Returns the current date and time. Accepts an optional IANA timezone name (e.g., "America/New_York", "Asia/Jerusalem"). Defaults to UTC.',
  input: z.object({
    timezone: z
      .string()
      .optional()
      .default("UTC")
      .describe('IANA timezone name, e.g. "Europe/London". Defaults to UTC.'),
  }),
  async execute({ timezone = "UTC" }) {
    const now = new Date();
    const iso = now.toISOString();

    let human: string;
    let resolvedTz = timezone;
    try {
      human = now.toLocaleString("en-US", {
        timeZone: timezone,
        dateStyle: "full",
        timeStyle: "long",
      });
    } catch {
      // Fallback if timezone is invalid
      human = now.toUTCString();
      resolvedTz = "UTC (fallback — invalid timezone provided)";
    }

    return { iso, human, timezone: resolvedTz };
  },
});

/** All tools exported for the agent loop. Add new tools here. */
export const tools = [get_word_count, get_timestamp];
