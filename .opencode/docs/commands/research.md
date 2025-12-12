# /research Command

## Usage
```bash
/research "Topic or Question"
```

## Description
Initiates a research workflow using a coordinator-worker pattern. The coordinator decomposes the topic into sub-questions, delegates each to a research specialist, and synthesizes an executive summary.

## Output Structure
```
.opencode/specs/
├── .counter                 # Project ID counter
└── NNN_topic_slug/          # Project directory (e.g., 012_api_comparison)
    ├── OVERVIEW.md          # Executive summary + links to sub-reports
    ├── 01_subtopic.md       # Sub-report with ## Summary section
    ├── 02_subtopic.md
    └── ...
```

## Workflow
1. **Initialize**: Read `.counter`, increment, create project directory
2. **Decompose**: Break topic into 1-5 sub-topics, create report definition files
3. **Delegate**: Invoke `research-specialist` for each sub-topic via `task` tool
4. **Research**: Specialists fetch web pages, write findings with `## Summary`, append to OVERVIEW.md
5. **Finalize**: Coordinator writes `## Executive Summary` at top of OVERVIEW.md

## Agents

| Agent | Mode | Purpose |
|-------|------|---------|
| research-coordinator | primary | Manages workflow, delegates tasks |
| research-specialist | subagent | Fetches URLs, writes reports |

## Configuration
Requires `webfetch: allow` in `opencode.json` for specialists to fetch URLs without prompts:
```json
{
  "permission": {
    "webfetch": "allow"
  }
}
```
