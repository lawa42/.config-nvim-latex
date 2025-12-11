# /research Command

## Usage
```bash
/research "Topic or Question"
```

## Description
The `/research` command initiates a deep research workflow on a specified topic. It uses a coordinator-worker agent pattern to decompose the topic into sub-questions and execute them sequentially.

## Folder Structure
The command creates a structured output directory for each research session:

```
.opencode/specs/
├── NNN_topic_slug/          # Project directory (e.g., 001_agent_patterns)
│   ├── OVERVIEW.md          # Main summary and entry point
│   ├── 01_subtopic.md       # Sub-report (researched)
│   ├── 02_subtopic.md       # Sub-report (researched)
│   └── ...
```

Project IDs are assigned atomically using `mkdir` - safe for concurrent use across multiple opencode instances.

## Workflow
1.  **Coordinator**: The `research-coordinator` agent receives the request via the `agent:` frontmatter field.
2.  **Initialization**: It atomically claims the next project number using `mkdir` (safe for concurrent instances).
3.  **Decomposition**: The coordinator breaks the main topic into smaller, manageable sub-topics (1-5).
4.  **Delegation**: For each sub-topic, the coordinator uses the `task` tool with `subagent_type: "research-specialist"`.
5.  **Execution**: Specialists conduct research using websearch, webfetch (external) and read, glob, grep (codebase) and write findings to their report files.
6.  **Aggregation**: Specialists append summaries to `OVERVIEW.md`.
7.  **Completion**: The coordinator reviews the final result and reports back to the user.

## Command Structure
The command uses opencode's native agent delegation via frontmatter:

```markdown
---
description: Research a topic and generate a structured report.
agent: research-coordinator
---

[Prompt content with $ARGUMENTS placeholder]
```

Key points:
- `agent: research-coordinator` - Specifies which agent handles the command
- `$ARGUMENTS` - Placeholder replaced with user-provided arguments

Note: The coordinator runs as a primary agent (not subagent) because it needs to use the `task` tool to delegate to research-specialist. In opencode, the task tool is disabled within subagents to prevent infinite recursion.
