# Report: Workflow & Coordination Patterns

**Goal**: Understand how OpenCode agents collaborate and execute tasks.

## Executive Summary
The primary pattern observed is a **Coordinator-Specialist** hierarchy. The Coordinator manages state, creates a file-based workspace, decomposes the problem, and delegates execution. The Specialist performs the work and reports back via shared files.

## Findings

### 1. Delegation via File Reference
*   **Mechanism**: The Coordinator invokes the Specialist using the `task` tool (or `@agent-name`).
*   **Context Passing**: Instead of passing the full context in the prompt, the Coordinator creates a specific "Report Definition File" and passes its **absolute path** as the sole input to the Specialist.
*   **Benefit**: Keeps the context window clean and provides a clear "contract" for the sub-task.

### 2. Decomposition Strategy
*   **Project Directory**: A dedicated directory (slugified topic) acts as the shared memory.
*   **Sub-task Files**: The problem is broken into numbered files (e.g., `01_subtopic.md`).
*   **Aggregation**: Results are aggregated into a central `OVERVIEW.md`.

### 3. Tool usage & Constraints
*   **Coordinator**:
    *   *High Privilege*: Has `bash` access (scoped) to manage directories.
    *   *Role*: Architect and Manager.
*   **Specialist**:
    *   *Low Privilege*: Denied `bash` and `edit`.
    *   *Role*: Worker.
    *   *Output*: Must use `write` to overwrite the report file, ensuring a clean state update.

## Recommendations
*   Adopt the "Input File" pattern for delegation to maintain state.
*   Use directory isolation for complex multi-agent tasks.
*   Restrict tool access for worker agents to "Read/Write" only, preventing system modification.
