# Direct Comparison of opencode.nvim Implementations

## Summary
This report compares two Neovim plugins for the `opencode` AI assistant: `NickvanDyke/opencode.nvim` and `sudo-tee/opencode.nvim`. The primary distinction lies in their approach: NickvanDyke's plugin integrates with the external `opencode` TUI, providing context and commands, while sudo-tee's offers a native Neovim chat interface with advanced features like robust session and snapshot management.

## Findings

### NickvanDyke/opencode.nvim
*   **Purpose:** Integrates the `opencode` AI assistant with Neovim to streamline editor-aware research, reviews, and requests. It acts as a bridge to the `opencode` TUI.
*   **Key Features:**
    *   Auto-connects to any `opencode` instance running in Neovim's CWD or provides an integrated instance via various terminal providers (e.g., `snacks.terminal`, `kitty`, `wezterm`, `tmux`).
    *   Offers input prompts with completions, highlights, and normal-mode support.
    *   Allows selection and definition of custom prompts.
    *   Injects relevant editor context such as buffer content, cursor position, visual selections, diagnostics, quickfix lists, Git diffs, and `grapple.nvim` tags.
    *   Provides commands to control `opencode` and respond to permission requests.
    *   Real-time buffer reloading for files edited by `opencode`.
    *   Statusline component for monitoring `opencode`'s state.
    *   Forwards `opencode`'s Server-Sent-Events as autocmds for automation.
*   **Philosophy:** Focuses on integrating with the existing `opencode` TUI for simplicity, as explicitly stated in its acknowledgments: "Uses `opencode`'s TUI for simplicity — see `sudo-tee/opencode.nvim` for a Neovim frontend."
*   **GitHub Stars:** 1.1k stars (as of research date).

### sudo-tee/opencode.nvim
*   **Purpose:** A dedicated Neovim frontend for `opencode` - a terminal-based AI coding agent. It provides a native chat interface within Neovim, capturing editor context and maintaining persistent sessions.
*   **Key Features:**
    *   Provides a direct chat interface within Neovim for interaction with the `opencode` AI agent.
    *   Captures comprehensive editor context including current file, selected text, mentioned files, diagnostics (info, warn, error), and cursor position.
    *   Maintains persistent sessions tied to the workspace, allowing for continuous conversations.
    *   Supports built-in agents ("Build" for full development, "Plan" for planning/analysis without file changes) and allows for custom agent creation.
    *   Extensive and recently restructured keymap configuration for editor, input, output, and permission windows.
    *   Includes contextual actions for snapshots (diff, revert files) and automatic restore points before revert operations.
    *   Offers custom user hooks for events like file edits, session loads, and permission requests.
    *   Implements a `prompt_guard` for controlling when prompts can be sent.
    *   Provides built-in slash commands and supports custom user commands.
*   **Philosophy:** Aims to provide a native Neovim experience for `opencode`, building the frontend directly within Neovim. It is a fork of `goose.nvim`.
*   **Caution:** Noted as being in early development with potential for bugs and breaking changes; requires `opencode` CLI v0.6.3+.
*   **GitHub Stars:** 287 stars (as of research date).

### Main Differences and Similarities

**Differences:**
*   **UI/UX Approach:** `NickvanDyke/opencode.nvim` integrates with the external `opencode` TUI, acting as a control layer. `sudo-tee/opencode.nvim` provides a native Neovim-based chat interface, making it a full frontend within the editor.
*   **Snapshot/Restore Features:** `sudo-tee/opencode.nvim` has a more developed system for contextual snapshots, diffing changes, and restoring files to previous states or restore points. `NickvanDyke/opencode.nvim`'s README does not detail similar native snapshot management.
*   **Origin/Maturity:** `NickvanDyke/opencode.nvim` has significantly more stars and appears to be a more established integration. `sudo-tee/opencode.nvim` is a fork of `goose.nvim` and is explicitly stated to be in "early development."
*   **Provider Management:** `NickvanDyke/opencode.nvim` focuses on managing the *terminal provider* for the `opencode` TUI. `sudo-tee/opencode.nvim`'s "provider" configuration relates more to internal Neovim pickers and completion engines.

**Similarities:**
*   Both plugins aim to integrate the `opencode` AI assistant with Neovim.
*   Both provide rich context injection from the Neovim editor (current file, selection, diagnostics) to enhance AI prompts.
*   Both offer extensive configuration options and API for customization.
*   Both support various commands for interacting with the `opencode` AI.
*   Both are written primarily in Lua.

### Performance, Configurability, and Extensibility

*   **Performance:** Direct performance comparison is difficult without benchmarks. `NickvanDyke/opencode.nvim`'s reliance on an external TUI might introduce different overheads compared to `sudo-tee/opencode.nvim`'s native Neovim implementation. `NickvanDyke`'s README mentions that `mcp-neovim-server` had slow and unreliable tool calls, suggesting an effort to optimize its own integration.
*   **Configurability:** Both are highly configurable. `sudo-tee/opencode.nvim` appears to have a more recently updated and structured keymap configuration, along with detailed UI customization options.
*   **Extensibility:** Both are extensible. `NickvanDyke/opencode.nvim` allows for custom terminal providers. `sudo-tee/opencode.nvim` supports custom agents and user-defined hooks for various events, offering deep integration points.

### Advantages and Disadvantages of Switching

*   **Switching from NickvanDyke/opencode.nvim to sudo-tee/opencode.nvim:**
    *   **Advantages:** Gain a more native Neovim chat interface, potentially more seamless UI/UX, robust snapshot and restore capabilities, and a more structured keymap configuration.
    *   **Disadvantages:** May encounter more bugs or breaking changes due to its "early development" status. Requires adapting to a different interaction model if accustomed to the `opencode` TUI.
*   **Switching from sudo-tee/opencode.nvim to NickvanDyke/opencode.nvim:**
    *   **Advantages:** Potentially more stability and a larger community given its higher star count. If the user prefers the `opencode` TUI, this plugin offers a streamlined integration.
    *   **Disadvantages:** Less native Neovim UI, potentially fewer advanced features like integrated snapshot management within Neovim.

## Sources
- https://github.com/NickvanDyke/opencode.nvim
- https://github.com/sudo-tee/opencode.nvim
