## Executive Summary
This research compared two Neovim frontends for the `opencode` AI assistant: `NickvanDyke/opencode.nvim` and `sudo-tee/opencode.nvim`. `NickvanDyke/opencode.nvim` acts as an integration layer with the external `opencode` TUI, providing context and commands. In contrast, `sudo-tee/opencode.nvim` offers a native Neovim chat interface with advanced features such as persistent sessions and code snapshots, receiving positive feedback for its seamless AI integration despite being in early development. The choice between the two largely depends on the user's preference for a native Neovim experience with enhanced session management versus integration with the standalone `opencode` TUI.

# Research Topic: Comparison of opencode.nvim Implementations

## Original Request:
I am currently using https://github.com/NickvanDyke/opencode.nvim but I'm considering switching to https://github.com/sudo-tee/opencode.nvim and want to know what people are saying about the two and how they compare. Privilege recent information and discussion (closer to Dec 2025 the better).

### sudo-tee/opencode.nvim Analysis
sudo-tee/opencode.nvim is a Neovim frontend for the terminal-based AI coding agent `opencode`. It provides an integrated chat interface that leverages editor context for enhanced AI interactions, persistent sessions, and features like code snapshots and restore points. While in early development, it has received positive user feedback for its seamless AI integration, though some performance and minor UI bugs have been reported.

See: [02_sudotee_opencode_nvim_analysis.md](02_sudotee_opencode_nvim_analysis.md)

### Direct Comparison of opencode.nvim Implementations
This report compares two Neovim plugins for the `opencode` AI assistant: `NickvanDyke/opencode.nvim` and `sudo-tee/opencode.nvim`. The primary distinction lies in their approach: NickvanDyke's plugin integrates with the external `opencode` TUI, providing context and commands, while sudo-tee's offers a native Neovim chat interface with advanced features like robust session and snapshot management.

See: [03_direct_comparison.md](03_direct_comparison.md)

### NickvanDyke/opencode.nvim Analysis
NickvanDyke/opencode.nvim serves as a Neovim frontend for the `opencode` terminal-based AI coding agent. It focuses on integrating the `opencode` TUI experience directly within Neovim, allowing users to leverage AI assistance with editor context. Key features include context passing, command execution, and a streamlined workflow for interacting with the `opencode` agent. User sentiment generally highlights its utility for those already invested in the `opencode` ecosystem, appreciating the contextual integration, though some discussions point to the overhead of managing an external TUI.

See: [01_nickvandyke_opencode_nvim_analysis.md](01_nickvandyke_opencode_nvim_analysis.md)

### Community Discussion and Recent Trends
Recent community discussions (closer to December 2025) indicate a growing interest in native Neovim AI integrations, with `sudo-tee/opencode.nvim` gaining traction for its integrated chat and session management. Users appreciate the seamless experience and advanced features, while `NickvanDyke/opencode.nvim` is valued for its direct integration with the existing `opencode` TUI. The choice often comes down to preference for a fully native Neovim AI experience versus a more direct, command-line-centric integration. Migration discussions suggest that users are weighing the benefits of `sudo-tee`'s native features against the established workflow of `NickvanDyke`'s plugin.

See: [04_community_discussion_and_trends.md](04_community_discussion_and_trends.md)
