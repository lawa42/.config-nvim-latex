# Comparison of NickvanDyke/opencode.nvim and sudo-tee/opencode.nvim

## Summary
This report compares two Neovim plugins, `NickvanDyke/opencode.nvim` and `sudo-tee/opencode.nvim`, both designed to integrate the `opencode` AI assistant. While both provide editor-aware AI capabilities, `sudo-tee/opencode.nvim` offers a more integrated Neovim-native chat interface with robust session, snapshot, and restore point management, whereas `NickvanDyke/opencode.nvim` focuses on direct integration with the `opencode` CLI, leveraging its TUI and offering flexible provider options.

## Findings

### 1. Key Differences in Features, Philosophy, or Implementation

**NickvanDyke/opencode.nvim:**
*   **Philosophy:** Aims to integrate the `opencode` AI assistant directly with Neovim, streamlining research, reviews, and requests. It appears to leverage the `opencode` CLI's TUI for core interaction while providing a Neovim layer for context injection, prompt input, and command execution.
*   **Features:**
    *   **Context Injection:** Supports specific placeholders like `@this`, `@buffer`, `@diagnostics`, `@diff`, etc., for injecting editor context into prompts.
    *   **Prompt Management:** Allows inputting prompts with completions, highlights, and normal-mode support, and selecting from a predefined library or custom prompts.
    *   **`opencode` Instance Management:** Can auto-connect to an existing `opencode` instance or manage one via various providers (e.g., `snacks.terminal`, `kitty`, `wezterm`, `tmux`).
    *   **Real-time Updates:** Reloads buffers edited by `opencode` in real-time and forwards `opencode`'s Server-Sent-Events as autocmds.
    *   **Community:** Has a larger community with 1.1k stars and 35 forks.

**sudo-tee/opencode.nvim:**
*   **Philosophy:** Provides a comprehensive Neovim-native frontend for the `opencode` AI agent, focusing on a chat interface and persistent, workspace-tied sessions. It is a fork of `azorng/goose.nvim`, indicating a focus on a rich, interactive AI assistant experience within Neovim.
*   **Features:**
    *   **Chat Interface:** Offers a dedicated chat interface within Neovim for continuous conversations with the AI.
    *   **Session Management:** Emphasizes persistent sessions tied to the workspace, including child sessions and a timeline picker for navigation, undo, redo, and fork operations.
    *   **Snapshot and Restore Points:** Automatically creates snapshots of the workspace and restore points before revert operations, allowing for review, comparison, and restoration of project state.
    *   **Agent Modes:** Explicitly defines "Build" (full development) and "Plan" (planning/analysis) agents, with support for custom agents and easy switching between them.
    *   **UI Customization:** Extensive options for customizing UI elements, including icons and highlight groups.
    *   **Prompt Guard & Hooks:** Includes a `prompt_guard` for controlling prompt submission and custom user hooks for various events.
    *   **Community:** Has a smaller community with 287 stars and 19 forks, and is explicitly noted as being in "early development."

### 2. Direct Comparisons or Reviews

No direct comparative reviews pitting one against the other were found during the web search. However, `NickvanDyke/opencode.nvim`'s README explicitly mentions `sudo-tee/opencode.nvim` in its acknowledgments: "Uses `opencode`'s TUI for simplicity — see [sudo-tee/opencode.nvim](https://github.com/sudo-tee/opencode.nvim) for a Neovim frontend." This suggests that `sudo-tee/opencode.nvim` is recognized as providing a more integrated Neovim frontend experience, potentially with its own UI implementation rather than relying solely on the `opencode` CLI's TUI.

### 3. Advantages and Disadvantages

**NickvanDyke/opencode.nvim:**
*   **Advantages:**
    *   Larger and more established community, potentially leading to more resources and broader support.
    *   Flexible options for managing the `opencode` CLI instance through various providers.
    *   Direct integration with the `opencode` CLI, which might appeal to users who prefer to interact with the underlying tool's TUI.
*   **Disadvantages:**
    *   May rely more on the external `opencode` TUI for the primary interaction, potentially offering a less "native" Neovim chat experience compared to `sudo-tee/opencode.nvim`.

**sudo-tee/opencode.nvim:**
*   **Advantages:**
    *   Provides a more integrated and feature-rich Neovim-native chat interface.
    *   Robust session management with timeline, snapshots, and restore points for enhanced code safety and history tracking.
    *   Clear distinction and management of "Build" and "Plan" agents, offering more controlled AI interactions.
    *   Extensive UI customization options.
*   **Disadvantages:**
    *   Smaller community and explicitly stated as being in "early development," which could imply more bugs or breaking changes.
    *   May have a steeper learning curve due to its comprehensive feature set.

### 4. Community and Development Activity

*   **NickvanDyke/opencode.nvim:**
    *   **Stars:** 1.1k
    *   **Forks:** 35
    *   **Contributors:** 18
    *   This indicates a more significant user base and a healthy level of community engagement and development.
*   **sudo-tee/opencode.nvim:**
    *   **Stars:** 287
    *   **Forks:** 19
    *   **Contributors:** 14
    *   While smaller than `NickvanDyke/opencode.nvim`, it still shows active development and a growing community, especially given its "early development" status. The comparable number of contributors suggests a dedicated development team.

## Sources
- [https://github.com/NickvanDyke/opencode.nvim](https://github.com/NickvanDyke/opencode.nvim)
- [https://github.com/sudo-tee/opencode.nvim](https://github.com/sudo-tee/opencode.nvim)
