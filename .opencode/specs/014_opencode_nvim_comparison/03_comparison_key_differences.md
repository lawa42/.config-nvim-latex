# Comparison and Key Differences

## Summary
This report compares two Neovim plugins for integrating the `opencode` AI assistant: `NickvanDyke/opencode.nvim` and `sudo-tee/opencode.nvim`. The primary distinction lies in their approach: NickvanDyke's version acts more as a wrapper around the `opencode` CLI's TUI, while sudo-tee's offers a more native and feature-rich Neovim frontend with an integrated chat interface, advanced session management, and workspace snapshots. While NickvanDyke's plugin has a larger community and appears more stable, sudo-tee's is under active development with a focus on deeper Neovim integration, albeit with acknowledged early-stage stability concerns.

## Findings

### Key Features

**NickvanDyke/opencode.nvim**
*   **Core Functionality**: Integrates the `opencode` AI assistant with Neovim for editor-aware research, reviews, and requests.
*   **Interaction Model**: Auto-connects to an `opencode` instance (or provides one) and leverages `opencode`'s Terminal User Interface (TUI) for interaction.
*   **Context Injection**: Injects relevant editor context such as buffer content, cursor position, visual selections, and diagnostics into prompts.
*   **Prompt Management**: Supports input prompts with completions, highlights, and the ability to select from a library of predefined prompts or define custom ones.
*   **Control & Feedback**: Allows control of `opencode` via commands, responds to permission requests, reloads edited buffers in real-time, and provides statusline integration.
*   **Extensibility**: Forwards `opencode`'s Server-Sent-Events as autocmds for automation and supports various terminal providers (e.g., `snacks.terminal`, `kitty`, `wezterm`, `tmux`).

**sudo-tee/opencode.nvim**
*   **Core Functionality**: A dedicated Neovim frontend for the `opencode` AI agent, providing a chat interface directly within Neovim. It is a fork of `goose.nvim`.
*   **Interaction Model**: Creates a native Neovim chat interface, capturing editor context (current file, selections) to enhance prompts.
*   **Session Management**: Offers persistent sessions tied to the workspace, allowing for continuous conversations. Includes features for selecting, renaming, sharing, unsharing, and compacting sessions, as well as navigating message history.
*   **Advanced Workspace Integration**:
    *   **Snapshots**: Automatically creates snapshots of the workspace after prompts or changes, enabling review, comparison, and restoration of project states.
    *   **Restore Points**: Generates contextual restore points before revert operations, allowing for undoing reverts.
    *   **Diff View**: Provides commands to open diffs of modified files, navigate between diffs, and revert changes at various granularities (last prompt, last session, specific snapshot).
*   **Agent Support**: Includes built-in "Build" (full development) and "Plan" (restricted for planning/analysis) agents, with support for custom agents and switching between them.
*   **User & Slash Commands**: Extensive set of keymaps and slash commands for various actions, including file mentions and context item management.
*   **Customization**: Rich configuration options for UI, context capturing, and user-defined hooks for events like file edits or session loading.

### Performance and Stability

**NickvanDyke/opencode.nvim**
*   The README does not explicitly mention performance or stability issues.
*   The project has one open issue, suggesting a relatively stable state or less active issue reporting.

**sudo-tee/opencode.nvim**
*   The README explicitly states: "This plugin is in early development and may have bugs and breaking changes. It is not recommended for production use yet."
*   One open issue (`#133`) reports "UI is slow to open with opencode v1+", indicating potential performance concerns, especially with newer versions of the `opencode` CLI.

### Main Differences in Approach or Philosophy

*   **TUI Wrapper vs. Native Frontend**:
    *   **NickvanDyke/opencode.nvim**: Appears to function more as a wrapper that integrates the `opencode` CLI's existing TUI into Neovim. Its "Acknowledgments" section explicitly states, "Uses `opencode`'s TUI for simplicity — see `sudo-tee/opencode.nvim` for a Neovim frontend." This suggests a philosophy of minimal intervention, letting the `opencode` CLI handle the core UI.
    *   **sudo-tee/opencode.nvim**: Aims to be a more comprehensive and native Neovim frontend. It builds a chat interface directly within Neovim, providing a deeper integration with Neovim's buffer management, keymaps, and UI elements. Its origin as a fork of `goose.nvim` further supports a focus on a Neovim-centric experience.

*   **Feature Set & Complexity**:
    *   **NickvanDyke/opencode.nvim**: Offers a solid set of features for interacting with `opencode`, focusing on prompt injection and basic control.
    *   **sudo-tee/opencode.nvim**: Provides a significantly richer feature set, including advanced session management, workspace snapshots, detailed diffing and reverting capabilities, and a more granular control over agents and context. This comes with increased complexity in configuration and usage.

### Community Activity and Recent Development

**NickvanDyke/opencode.nvim**
*   **Stars**: 1.1k stars (as of Dec 2025).
*   **Forks**: 35 forks.
*   **Issues**: 1 open issue.
*   **Discussions**: Several discussions with recent activity (Dec 2025, Nov 2025), indicating an engaged user base.
*   **Overall**: Appears to have a larger and more established community.

**sudo-tee/opencode.nvim**
*   **Stars**: 287 stars (as of Dec 2025).
*   **Forks**: 19 forks.
*   **Issues**: 5 open issues, with very recent activity (Dec 2025), suggesting active development.
*   **Releases**: No releases published, which aligns with its "early development" status.
*   **Overall**: While smaller in community size, it shows strong recent development activity, but is less mature.

### Pros and Cons of Switching from NickvanDyke/opencode.nvim to sudo-tee/opencode.nvim

**Pros:**
*   **Deeper Neovim Integration**: `sudo-tee/opencode.nvim` offers a more native Neovim experience with an integrated chat interface, potentially leading to a more seamless workflow.
*   **Advanced Features**: Access to powerful features like automatic workspace snapshots, contextual restore points, and comprehensive diffing/reverting capabilities.
*   **Granular Control**: More extensive keymaps and commands for fine-grained control over `opencode` sessions, agents, and context.
*   **Active Development**: The project shows active development, suggesting new features and improvements are regularly being worked on.

**Cons:**
*   **Early Development & Potential Instability**: The plugin is explicitly in early development, meaning users might encounter bugs, breaking changes, and performance issues (e.g., slow UI opening).
*   **Steeper Learning Curve**: The extensive feature set and configuration options may require more time and effort to learn and set up effectively.
*   **Smaller Community**: A smaller user base might translate to fewer resources for troubleshooting and less community-driven development compared to the more established NickvanDyke version.
*   **License Change**: Switching from MIT to Apache-2.0 might have implications depending on project requirements.

## Sources
*   https://github.com/NickvanDyke/opencode.nvim
*   https://github.com/NickvanDyke/opencode.nvim/issues
*   https://github.com/NickvanDyke/opencode.nvim/discussions
*   https://github.com/sudo-tee/opencode.nvim
*   https://github.com/sudo-tee/opencode.nvim/issues
*   https://www.reddit.com/r/neovim/search?q=opencode.nvim