# 🤖 claude-agent-sdk-starter

> The minimal TypeScript starter kit for Anthropic's Claude Agent SDK — the one the docs forgot to include.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Agent SDK](https://img.shields.io/badge/Claude%20Agent%20SDK-latest-orange)](https://platform.claude.com/docs/en/agent-sdk/overview)

## 🎯 What this is

A copy-paste starting point for building agents with the [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) — the same SDK that powers Claude Code. Includes two working tools built with Zod, the async-iterator agent loop, typed outputs, and a clean project structure.

**Gap it fills:** Anthropic shipped the Agent SDK in 2026 with great docs but no working TypeScript example repo you can clone and run in 60 seconds. This is that repo.

## ⚡ Quickstart

```bash
git clone https://github.com/RLASAF12/claude-agent-sdk-starter
cd claude-agent-sdk-starter
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm install
npm run dev                  # watch Claude use both tools live
```

## 🔧 How it works

The Claude Agent SDK exposes a `query()` function that returns an `AsyncIterable<Message>`. Claude reads your prompt, decides which tools to call, executes them in-process, and streams every step back to you:

```typescript
for await (const message of query({
  prompt,
  options: { mcpServers: { "starter-tools": starterTools }, allowedTools },
})) {
  // message.type: "assistant" | "result" | ...
  // handle each step as it arrives
}
```

**Key insight:** Custom tools are registered as **in-process MCP servers**. You bundle your tools with `createSdkMcpServer()` and pass it via `options.mcpServers` — no HTTP server, no separate process. The SDK hosts the MCP server inside your Node.js process using Zod schemas for type-safe inputs. Tool names are namespaced `mcp__<server>__<tool>`; list them in `allowedTools` to pre-approve them.

## 🛠️ Included Tools

| Tool | Input | Output | Use case |
|------|-------|--------|----------|
| `get_word_count` | `text: string` | words / characters / sentences | Text analysis |
| `get_timestamp` | `timezone?: string` | ISO 8601 + human-readable local time | Time-aware agents |

## ➕ Add Your Own Tool

Three steps to add a tool:

1. Define it in `src/tools.ts` with the `tool(name, description, inputShape, handler)` helper
2. Add it to the `tools` array passed to `createSdkMcpServer()` (and its name to `starterToolNames`)
3. Done — Claude will discover and use it

```typescript
// src/tools.ts
// Signature: tool(name, description, inputShape, handler)
// inputShape is a raw Zod shape — NOT z.object(...).
// The handler returns an MCP CallToolResult: { content: [{ type, text }] }.
const myTool = tool(
  "my_tool",
  "What this tool does — be specific, Claude reads this",
  { value: z.string().describe("Input description") },
  async ({ value }) => ({
    content: [{ type: "text", text: value.toUpperCase() }],
  }),
);
```

## 🏗️ Architecture

```
  You
   │
   ▼
agent.ts
   │  query({ prompt, options: { mcpServers } })
   ▼
Claude API (claude-sonnet-4-6)
   │
   ├──► tool_call: get_word_count ──► in-process MCP handler ──► result
   │
   └──► tool_call: get_timestamp  ──► in-process MCP handler ──► result
   │
   ▼
 AsyncIterable<Message>
   │  for await (const msg of ...)
   ▼
 Your handler (print / store / act)
```

## 📚 Links

- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [MCP in the SDK](https://platform.claude.com/docs/en/agent-sdk/mcp)
- [Quickstart Docs](https://platform.claude.com/docs/en/agent-sdk/quickstart)

## 📄 License

MIT — copy it, fork it, build on it.
