# Comparison of NickvanDyke and sudo-tee OpenCode Neovim Plugins

## Summary
This report compares two Neovim plugins for integrating the OpenCode AI assistant: NickvanDyke/opencode.nvim and sudo-tee/opencode.nvim. NickvanDyke's plugin offers a more mature and community-supported integration, focusing on robust interaction with the OpenCode CLI and extensive context injection. In contrast, sudo-tee's plugin provides a more native Neovim chat interface with advanced features like workspace snapshots and persistent sessions, though it is still in early development.

## Findings

### Key Feature Differences
*   **Integration Approach:** NickvanDyke/opencode.nvim acts as a comprehensive wrapper for the OpenCode CLI, leveraging its TUI and command structure. It focuses on providing a wide array of commands and contexts to interact with the AI assistant. Sudo-tee/opencode.nvim, on the other hand, aims to be a more native Neovim frontend, offering a chat-like interface directly within Neovim and managing persistent sessions.
*   **Context Injection:** Both plugins offer rich context injection. NickvanDyke's plugin explicitly lists contexts like `@this`, `@buffer`, `@buffers`, `@visible`, `@diagnostics`, `@quickfix`, `@diff`, and `@grapple`. Sudo-tee's plugin automatically captures current file, selected text, mentioned files, diagnostics, and cursor position.
*   **Terminal Providers:** NickvanDyke's plugin explicitly supports various terminal providers like `snacks.terminal`, `kitty`, `wezterm`, and `tmux` for managing the OpenCode instance. Sudo-tee's plugin focuses more on its internal UI rendering.
*   **Workspace Management:** A significant differentiator is sudo-tee's implementation of workspace snapshots and restore points, allowing users to review, compare, and revert code changes made by the AI. This feature is explicitly marked as experimental. NickvanDyke's plugin does not explicitly mention similar workspace snapshot capabilities.
*   **UI/Keymaps:** Sudo-tee's plugin has a recently restructured and detailed UI and keymap configuration, suggesting a more refined in-editor user experience.

### Performance and Stability
*   **NickvanDyke/opencode.nvim:** With 1.1k stars and 35 forks, this plugin appears to be more mature and widely adopted. It has a low number of open issues (1) and pull requests (1), indicating a relatively stable codebase and active maintenance.
*   **sudo-tee/opencode.nvim:** This plugin is explicitly stated to be in "early development" and may contain "bugs and breaking changes." It has 287 stars, 19 forks, and 5 open issues with 0 open pull requests, suggesting a less stable state and ongoing development.

### Main Advantages and Disadvantages

**NickvanDyke/opencode.nvim:**
*   **Advantages:**
    *   More mature and stable with a larger user base and community support.
    *   Comprehensive integration with the OpenCode CLI, offering extensive commands and context options.
    *   Flexible configuration and API.
*   **Disadvantages:**
    *   Relies on the OpenCode TUI for some interactions, which might feel less "native" to some Neovim users compared to a fully integrated frontend.

**sudo-tee/opencode.nvim:**
*   **Advantages:**
    *   Provides a more native Neovim chat interface.
    *   Features persistent sessions for continuous AI conversations.
    *   Unique and powerful workspace snapshot and restore point capabilities for managing AI-driven code changes.
    *   Detailed UI customization options.
*   **Disadvantages:**
    *   Still in early development, leading to potential bugs and breaking changes.
    *   Smaller community and less overall adoption compared to NickvanDyke's plugin.

### Active Development and Community Support
*   **NickvanDyke/opencode.nvim:** Shows strong active development with 593 commits and a significant number of contributors (18). The high star and fork count further indicate a vibrant community.
*   **sudo-tee/opencode.nvim:** Also actively developed with 344 commits and 14 contributors. However, its community engagement metrics (stars, forks) are lower than NickvanDyke's, consistent with its earlier development stage.

### Preferred Use Cases
*   **NickvanDyke/opencode.nvim:** Best suited for users who prioritize a stable, well-supported, and feature-rich integration with the OpenCode CLI, and are comfortable with its TUI-based interaction model. It's a solid choice for general AI assistance, code reviews, and research within Neovim.
*   **sudo-tee/opencode.nvim:** Ideal for users who desire a more deeply integrated Neovim-native chat experience with OpenCode. Its unique workspace snapshot and restore features make it particularly appealing for those who frequently experiment with AI-driven code modifications and require robust version control for those changes, even if it means dealing with an earlier-stage project.

## Sources
- https://github.com/NickvanDyke/opencode.nvim
- https://github.com/sudo-tee/opencode.nvim
