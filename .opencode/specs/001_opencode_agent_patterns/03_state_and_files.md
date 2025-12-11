# Report: File System & State Management

**Goal**: Investigate how agents manage state and projects.

## Executive Summary
State management relies on the file system. Simple text files are used for counters (`next_project_id`) and directories for task isolation. Naming conventions ensure sortability and uniqueness.

## Findings

### 1. Persistent State (Counters)
*   **Method**: A single file (`next_project_id`) holds the current integer state.
*   **Operation**: The agent reads the file, increments the value, and writes it back immediately before creating the project.
*   **Simplicity**: Avoids complex databases; relies on the file system's atomicity for single-user environments.

### 2. Directory Structure & Naming
*   **Root**: `.opencode/specs/` is the designated workspace.
*   **Format**: `NNN_topic_slug` (e.g., `001_agent_patterns`).
    *   `NNN`: Ensures chronological ordering.
    *   `topic_slug`: Human-readable identifier.
*   **Files**: Inside the directory, sub-tasks are also numbered (`01_config.md`) to imply execution order.

### 3. Result Aggregation
*   **Master File**: `OVERVIEW.md` tracks the overall progress.
*   **Pattern**:
    1.  Initialize `OVERVIEW.md` with request details.
    2.  As sub-tasks finish, append a summary section to `OVERVIEW.md`.
    3.  Detailed data remains in the sub-task files.

## Recommendations
*   Use `NNN_name` convention for all generated artifacts.
*   Maintain a "Master" file for every complex task to track status and high-level results.
*   Keep `next_project_id` or similar counters in a known location (e.g., `.opencode/specs/`).
