# Research Project: OpenCode Agent Patterns

**Original Request**: OpenCode Agent Patterns
**Status**: Complete

## Summary
### Core Agent Configuration
Agents are defined via Markdown with YAML frontmatter. Key components include `mode` (e.g., subagent), `model` selection, and granular `permissions` (especially for `bash`). The body defines the prompt/system instructions.

### Workflow & Coordination
Follows a Coordinator-Specialist model using file-based delegation. The Coordinator creates a workspace and sub-task files, passing file paths to Specialists. Specialists report back by updating these files and the central Overview.

### File System & State
Uses file-based persistence (e.g., `next_project_id`) and structured directories (`NNN_slug`) to organize work. `OVERVIEW.md` acts as the central aggregate report, while detailed data lives in numbered sub-files.
