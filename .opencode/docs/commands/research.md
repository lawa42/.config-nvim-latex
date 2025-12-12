# /research Command

## Usage
```bash
/research "Topic or Question"
```

## Description
Initiates a research workflow using a coordinator-specialist pattern. The coordinator decomposes the topic into sub-questions, delegates each to a research specialist, and synthesizes an executive summary.

## Output Structure
```
.opencode/specs/
├── .counter                 # Project ID counter
└── NNN_topic_slug/          # Project directory (e.g., 012_api_comparison)
    ├── OVERVIEW.md          # Executive summary + links to sub-reports
    ├── 01_subtopic.md       # Research report with findings
    ├── 02_subtopic.md
    └── ...
```

## Workflow

### 1. Initialize
- Coordinator reads `.opencode/specs/.counter`, increments, writes new value
- Creates project directory: `.opencode/specs/NNN_slug/`

### 2. Setup Overview
- Creates `OVERVIEW.md` with research topic heading and original request

### 3. Decompose
- Breaks topic into 1-5 sub-topics
- Creates report definition files (`01_subtopic.md`, etc.) with questions to investigate

### 4. Delegate
- Invokes `research-specialist` for each sub-topic via `task` tool
- Passes explicit prompt with file paths and write requirements
- Waits for each task to complete sequentially

### 5. Research (per specialist)
- Reads report definition file
- Fetches web pages via `webfetch` (GitHub, Reddit, docs)
- **MUST write report file** with `## Summary`, `## Findings`, `## Sources`
- **MUST append to OVERVIEW.md** with markdown link `[filename.md](filename.md)`

### 6. Finalize
- Coordinator reads completed OVERVIEW.md
- Inserts `## Executive Summary` after title heading, before `## Original Request:`

## Agents

| Agent | Mode | Model | Purpose |
|-------|------|-------|---------|
| research-coordinator | primary | google/gemini-2.5-flash | Manages workflow, delegates tasks |
| research-specialist | subagent | (inherited) | Fetches URLs, writes reports |

## Critical Implementation Details

### Specialist Write Contract
Each specialist **MUST call `write` exactly twice**:
1. Write the report file with findings
2. Write OVERVIEW.md with appended summary

If a specialist finishes without both writes, the task has failed.

### Link Format in OVERVIEW.md
Summaries appended to OVERVIEW.md must use markdown link syntax:
```markdown
See: [filename.md](filename.md)
```
Not plain text like `See: filename.md`.

### Executive Summary Placement
The executive summary goes **after** the title heading but **before** the Original Request:
```markdown
# Research Topic: [Topic]

## Executive Summary
[3-5 sentence synthesis]

## Original Request:
[Original request text]

### [Sub-topic sections...]
```

### Error Handling
- Specialists continue even if some `webfetch` calls fail
- Write whatever findings were gathered, even if limited
- Never skip the write step due to incomplete research

## Configuration
Requires `webfetch: allow` in `opencode.json` for specialists to fetch URLs without prompts:
```json
{
  "permission": {
    "webfetch": "allow"
  }
}
```
