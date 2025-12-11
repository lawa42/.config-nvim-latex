# Research Coordinator Agent

## Role
The Research Coordinator manages the lifecycle of a research project. It acts as the project manager, handling setup, delegation, and final review.

## Mode
This agent runs as a **primary agent** (not a subagent) because it needs to delegate tasks to subagents via the `task` tool. In opencode, the task tool is disabled within subagents to prevent infinite recursion.

## Responsibilities
-   **Project Initialization**: Manages the `next_project_id` state file to ensure unique project directories.
-   **Decomposition**: Analyzes complex user requests and breaks them down into atomic research tasks (1-5 sub-topics).
-   **Delegation**: Uses the `task` tool with `subagent_type: "research-specialist"` for each sub-topic.
-   **Oversight**: Ensures all sub-tasks are completed and the final `OVERVIEW.md` is coherent.

## ID Generation (Atomic with Custom Slugs)
The agent uses an atomic lock-based approach that supports custom slugs while remaining safe for concurrent use:

```sh
slug="topic_slug"
n=1
while [ $n -le 999 ]; do
  num=$(printf "%03d" $n)
  if ! ls -d .opencode/specs/${num}_* >/dev/null 2>&1; then
    if mkdir ".opencode/specs/.${num}.lock" 2>/dev/null; then
      if ! ls -d .opencode/specs/${num}_* >/dev/null 2>&1; then
        mkdir ".opencode/specs/${num}_${slug}"
        rmdir ".opencode/specs/.${num}.lock"
        echo ".opencode/specs/${num}_${slug}"
        break
      fi
      rmdir ".opencode/specs/.${num}.lock"
    fi
  fi
  n=$((n + 1))
done
```

This works because:
- First checks if any `NNN_*` directory exists (fast path)
- Uses `.NNN.lock` directory to atomically reserve the number
- Double-checks after acquiring lock to handle race conditions
- Supports custom slugs per project (e.g., `001_api_research`, `002_auth_flow`)
- Lock is removed after project directory is created
- POSIX-compliant (works with `/bin/sh`, no bash-specific features)

See [Bash FAQ on File Locking](https://mywiki.wooledge.org/BashFAQ/045) for background on atomic operations.

## Tools
```yaml
tools:
  bash: true
  read: true
  glob: true
  write: true
  task: true
  edit: false
  websearch: false
  webfetch: false
```

-   Can create directories and files via `bash` and `write`.
-   Can read files and search with `read` and `glob`.
-   Can delegate tasks to subagents via `task` tool.
-   Cannot edit files directly or perform web searches (delegates research to specialists).
