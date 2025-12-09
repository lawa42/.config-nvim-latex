# Goose Workflow Utilities

This directory contains a port of Claude Code's core workflow utilities to the Goose ecosystem. The implementation transforms bash-orchestrated markdown commands into declarative YAML recipes with MCP server extensions.

## Directory Structure

```
.goose/
├── recipes/              # YAML recipe files for workflows
│   ├── subrecipes/      # Subrecipes for agent delegation
│   └── tests/           # Test recipes for validation
├── mcp-servers/         # Custom MCP servers for complex utilities
│   ├── plan-manager/    # Phase marker management (checkbox-utils.sh equivalent)
│   └── state-machine/   # Workflow state validation and transitions
├── scripts/             # External orchestration scripts
├── tmp/                 # Temporary state files and logs
└── checkpoints/         # Workflow checkpoint files
```

## Core Components

### MCP Servers

#### plan-manager
Manages phase markers in implementation plans (ported from `checkbox-utils.sh`).

**Tools**:
- `mark_phase_complete(plan_path, phase_num)` - Mark phase as [COMPLETE]
- `mark_phase_in_progress(plan_path, phase_num)` - Mark phase as [IN PROGRESS]
- `verify_phase_complete(plan_path, phase_num)` - Check if phase is complete
- `check_all_phases_complete(plan_path)` - Verify all phases complete
- `get_phase_status(plan_path, phase_num)` - Get current phase status

**Usage**:
```bash
# Start server (used by Goose internally)
node .goose/mcp-servers/plan-manager/index.js

# Run tests
cd .goose/mcp-servers/plan-manager && npm test
```

#### state-machine
Validates workflow state transitions (ported from `workflow-state-machine.sh`).

**Valid State Transitions**:
- NOT_STARTED → RESEARCH
- RESEARCH → PLANNING
- PLANNING → IMPLEMENTATION
- IMPLEMENTATION → COMPLETE
- Any state → ERROR

**Tools**:
- `sm_init(workflow_id, workflow_type, description)` - Initialize state machine
- `sm_transition(workflow_id, target_state)` - Transition to new state (validates)
- `sm_current_state(workflow_id)` - Get current state
- `sm_validate_transition(workflow_id, target_state)` - Check if transition is valid

**Usage**:
```bash
# Start server (used by Goose internally)
node .goose/mcp-servers/state-machine/index.js

# Run tests
cd .goose/mcp-servers/state-machine && npm test
```

### Recipes

Recipes are YAML templates that define multi-phase workflows. Each recipe includes:
- **Parameters**: Input configuration
- **Instructions**: Step-by-step behavioral guidelines
- **Subrecipes**: Delegation to specialized agents
- **Retry Checks**: Hard barrier validation for artifacts

**Available Recipes**:
- `research.yaml` - Research workflow (topic naming + research specialist)
- `create-plan.yaml` - Planning workflow (research + plan architect)
- `revise.yaml` - Plan revision workflow (backup + revision)
- `implement.yaml` - Implementation workflow (phase execution + iteration)

### Subrecipes

Subrecipes implement specialized agent behaviors:
- `research-specialist.yaml` - Codebase analysis and report creation
- `topic-naming.yaml` - Semantic directory name generation
- `plan-architect.yaml` - Implementation plan creation
- `implementer-coordinator.yaml` - Phase execution orchestration

### Scripts

External orchestration scripts for workflows that require iteration:
- `goose-implement-orchestrator.sh` - Iteration loop for large plans (handles max_iterations, continuation_context)

## User Guide

This guide explains how to use Goose workflow recipes.

### From Command Line (Recommended)

Run recipes from the command line with `goose run`:

```bash
# Interactive mode - prompts for required parameters
goose run --recipe ~/.config/.goose/recipes/research.yaml

# With parameters
goose run --recipe ~/.config/.goose/recipes/research.yaml --params topic="authentication patterns"
```

### From Neovim

In Neovim with Goose open in a split, you can ask Goose to run recipes:

```
Please run the research recipe for topic "authentication patterns"
```

Or ask it to run a specific recipe file:

```
Run goose recipe at ~/.config/.goose/recipes/research.yaml with topic "API error handling"
```

**Note**: The `/recipe:X` syntax is not a built-in Goose command. Recipes are invoked via `goose run --recipe`.

### Available Recipes

#### Research

Conducts codebase research and generates analysis reports.

```bash
# Interactive - prompts for topic
goose run --recipe ~/.config/.goose/recipes/research.yaml

# With parameters
goose run --recipe ~/.config/.goose/recipes/research.yaml \
  --params topic="authentication patterns"

# With complexity
goose run --recipe ~/.config/.goose/recipes/research.yaml \
  --params topic="database schema design" \
  --params complexity=3
```

| Parameter | Prompted | Description |
|-----------|----------|-------------|
| `topic` | Yes | Research topic or question |
| `complexity` | No | 1 (quick) to 4 (comprehensive). Default: 2 |

**Output**: `.claude/specs/{NNN_topic}/reports/001-{topic}-analysis.md`

#### Create Plan

Generates implementation plans for features or changes.

```bash
# Interactive - prompts for feature description
goose run --recipe ~/.config/.goose/recipes/create-plan.yaml

# With parameters
goose run --recipe ~/.config/.goose/recipes/create-plan.yaml \
  --params feature_description="add user settings page"

# With complexity
goose run --recipe ~/.config/.goose/recipes/create-plan.yaml \
  --params feature_description="fix login timeout" \
  --params complexity=1
```

| Parameter | Prompted | Description |
|-----------|----------|-------------|
| `feature_description` | Yes | What to implement |
| `complexity` | No | 1-4. Default: 2 |
| `file` | No | Specific file to focus on |

**Output**: `.claude/specs/{NNN_topic}/plans/001-{topic}-plan.md`

#### Revise Plan

Updates an existing plan with new requirements.

```bash
# Interactive - prompts for plan path and revision details
goose run --recipe ~/.config/.goose/recipes/revise.yaml

# With parameters
goose run --recipe ~/.config/.goose/recipes/revise.yaml \
  --params existing_plan_path=".claude/specs/867_auth/plans/001-plan.md" \
  --params revision_details="add OAuth2 support"
```

| Parameter | Prompted | Description |
|-----------|----------|-------------|
| `existing_plan_path` | Yes | Path to existing plan |
| `revision_details` | Yes | Changes to make |
| `complexity` | No | 1-4. Default: 2 |

**Output**: Updated plan (original backed up with timestamp)

#### Implement

Executes a plan phase by phase.

```bash
# Interactive - prompts for plan file
goose run --recipe ~/.config/.goose/recipes/implement.yaml

# With parameters
goose run --recipe ~/.config/.goose/recipes/implement.yaml \
  --params plan_file=".claude/specs/867_auth/plans/001-plan.md"

# Resume from specific phase
goose run --recipe ~/.config/.goose/recipes/implement.yaml \
  --params plan_file=".claude/specs/867_auth/plans/001-plan.md" \
  --params starting_phase=3
```

| Parameter | Prompted | Description |
|-----------|----------|-------------|
| `plan_file` | Yes | Path to implementation plan |
| `starting_phase` | No | Phase to start from. Default: 1 |
| `max_iterations` | No | Max loops. Default: 10 |

### Common Workflows

#### Full Development Cycle

```bash
# 1. Research the topic
goose run --recipe ~/.config/.goose/recipes/research.yaml \
  --params topic="notification system architecture"

# 2. Create implementation plan
goose run --recipe ~/.config/.goose/recipes/create-plan.yaml \
  --params feature_description="add push notifications" \
  --params complexity=3

# 3. Revise plan if needed
goose run --recipe ~/.config/.goose/recipes/revise.yaml \
  --params existing_plan_path=".claude/specs/NNN_topic/plans/001-plan.md" \
  --params revision_details="add fallback for older devices"

# 4. Implement the plan
goose run --recipe ~/.config/.goose/recipes/implement.yaml \
  --params plan_file=".claude/specs/NNN_topic/plans/001-plan.md"
```

#### Quick Bug Fix

```bash
# Create a simple plan
goose run --recipe ~/.config/.goose/recipes/create-plan.yaml \
  --params feature_description="fix memory leak in event handler" \
  --params complexity=1

# Implement it
goose run --recipe ~/.config/.goose/recipes/implement.yaml \
  --params plan_file=".claude/specs/NNN_topic/plans/001-plan.md"
```

#### Interactive Mode

Run any recipe without `--params` to get interactive prompts:

```bash
goose run --recipe ~/.config/.goose/recipes/research.yaml
# Goose will prompt: "Natural language description of research topic: "
```

### Complexity Levels

| Level | Use Case | Plan Detail |
|-------|----------|-------------|
| 1 | Bug fixes, small changes | 1-2 phases |
| 2 | Standard features | 3-4 phases |
| 3 | Complex features | 5-7 phases |
| 4 | Architectural changes | 7+ phases |

### Tips

- **Use interactive mode**: Run recipes without `--params` to get prompted for inputs
- **Start simple**: Use `complexity=1` for quick tasks, increase if needed
- **Check outputs**: Plans and reports go to `.claude/specs/{NNN_topic}/`
- **Resume work**: Use `starting_phase` to continue interrupted implementations
- **Review first**: Look at generated plans before running implement
- **Shell aliases**: Create aliases for frequently used recipes (see Quick Start)

## Quick Start

```bash
# Run a research workflow (interactive - prompts for topic)
goose run --recipe ~/.config/.goose/recipes/research.yaml

# Run a research workflow (with parameters)
goose run --recipe ~/.config/.goose/recipes/research.yaml \
  --params topic="authentication patterns" \
  --params complexity=2

# Run a planning workflow
goose run --recipe ~/.config/.goose/recipes/create-plan.yaml \
  --params feature_description="user authentication system" \
  --params complexity=3

# Run an implementation workflow
goose run --recipe ~/.config/.goose/recipes/implement.yaml \
  --params plan_file=".claude/specs/NNN_topic/plans/001-plan.md"
```

### Shell Aliases (Optional)

Add these to your `~/.bashrc` or `~/.zshrc` for convenience:

```bash
alias goose-research='goose run --recipe ~/.config/.goose/recipes/research.yaml'
alias goose-plan='goose run --recipe ~/.config/.goose/recipes/create-plan.yaml'
alias goose-revise='goose run --recipe ~/.config/.goose/recipes/revise.yaml'
alias goose-implement='goose run --recipe ~/.config/.goose/recipes/implement.yaml'

# Usage:
# goose-research --params topic="my topic"
# goose-plan --params feature_description="my feature"
```

## Testing

### MCP Server Tests
```bash
# Test plan-manager (2 tests)
cd ~/.config/.goose/mcp-servers/plan-manager && node test.js

# Test state-machine (4 tests)
cd ~/.config/.goose/mcp-servers/state-machine && node test.js
```

**Test Results**: 6/6 tests passing (100%)

### Recipe Tests
```bash
# Test parameter passing
goose run --recipe ~/.config/.goose/recipes/tests/test-params.yaml \
  --params test_input="test value"
```

## Configuration

Project standards are defined in `.goosehints` (converted from Claude Code's `CLAUDE.md`).

Key standards:
- Topic-based directory structure (`specs/{NNN_topic}/`)
- Plan metadata requirements
- Hard barrier pattern enforcement
- Phase dependency syntax
- State management patterns

## Documentation

- [Migration Guide](docs/migration-guide.md) - Detailed patterns for porting Claude Code to Goose
- [Library Migration Mapping](docs/library-migration-mapping.md) - 55 bash libraries categorization
- [plan-manager API](mcp-servers/plan-manager/README.md) - MCP server tool documentation
- [Plan Implementation](../.claude/specs/998_goose_workflow_utilities_port/plans/001-goose-workflow-utilities-port-plan.md) - Complete implementation plan
- [Research Report](../.claude/specs/998_goose_workflow_utilities_port/reports/001-goose-workflow-utilities-port-analysis.md) - Architectural analysis and approach
- [.goosehints](../.goosehints) - Project standards for Goose recipes

## Known Limitations

### Goose vs Claude Code Differences
1. **Iteration Loops**: Goose lacks built-in iteration; requires external orchestrator script
2. **State Persistence**: Must use JSON files or parameter passing (no bash state files)
3. **Hard Barriers**: Implemented via `retry.checks` (not bash verification blocks)
4. **Agent Delegation**: Uses subrecipe calls (not Task tool invocation)
5. **Library Functions**: Must be embedded in instructions or converted to MCP servers

### Workarounds
- **External iteration**: Use `goose-implement-orchestrator.sh` script
- **Complex state**: Use `plan-manager` and `state-machine` MCP servers
- **Bash utilities**: Embed simple logic in instructions, convert complex utilities to MCP servers

## Migration from Claude Code

To migrate a Claude Code workflow to Goose:

1. **Command Structure**: Convert markdown command to YAML recipe
2. **Agent Delegation**: Replace Task tool invocations with subrecipe calls
3. **State Management**: Replace bash state files with JSON state or parameters
4. **Hard Barriers**: Replace bash verification blocks with `retry.checks`
5. **Libraries**: Embed simple functions or convert to MCP servers

See [Migration Guide](docs/migration-guide.md) for detailed translation patterns.

## Contributing

This port is complete. All 7 phases have been implemented and tested. Contributions welcome for:
- Additional recipe workflows
- Performance optimizations
- Integration test coverage
- Documentation improvements

## License

MIT License - See Claude Code project for full license details.
