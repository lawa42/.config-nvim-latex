# Report: Core Agent Configuration Structure

**Goal**: Analyze the structure of OpenCode agent definition files.

## Executive Summary
OpenCode agents are defined using Markdown files with a YAML frontmatter block. This block configures the agent's identity, operational mode, underlying model, and security permissions. The body of the markdown defines the agent's role, process, and constraints.

## Findings

### 1. YAML Frontmatter Standards
The frontmatter typically includes:
*   `description`: A concise summary of the agent's purpose.
*   `mode`: Operational mode (e.g., `subagent`).
*   `model`: The specific LLM to use (e.g., `google/gemini-2.5-flash-lite`, `google/gemini-3-deep-think`).
*   `maxSteps`: (Optional) Limits the number of interaction steps.
*   `permissions`: Critical security configuration.

### 2. Permissions System
Permissions are granularly defined per tool:
*   **Allow/Deny**: Tools can be globally allowed or denied (e.g., `websearch: allow`, `edit: deny`).
*   **Granular Bash Control**: The `bash` tool supports pattern matching for specific commands.
    *   *Example*: `"mkdir -p .opencode/specs/*": allow`
    *   *Example*: `"*": deny` (Default deny all others)

### 3. Mode and Model
*   `mode: subagent`: Indicates the agent is designed to be called by other agents or systems, rather than a primary user interface agent.
*   `model`: Allows selecting different models optimized for the task (e.g., "Flash" for coordination/speed, "Deep Think" for reasoning/research).

## Recommendations
*   Always define strict `bash` permissions for safety.
*   Use `maxSteps` for potentially open-ended tasks to prevent loops.
*   Clearly document the Role and Process in the markdown body.
