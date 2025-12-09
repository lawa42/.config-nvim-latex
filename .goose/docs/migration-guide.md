# Migration Guide: Claude Code to Goose

## Overview

This guide helps you migrate from Claude Code's bash-orchestrated workflow commands to Goose's YAML recipe system.

## Quick Start

**Before (Claude Code)**:
```bash
/research "user authentication patterns"
/create-plan "implement user authentication"
/implement path/to/plan.md
```

**After (Goose)**:
```bash
goose run --recipe .goose/recipes/research.yaml --params topic="user authentication patterns"
goose run --recipe .goose/recipes/create-plan.yaml --params feature_description="implement user authentication"
goose run --recipe .goose/recipes/implement.yaml --params plan_file="path/to/plan.md"
```

## Core Architectural Differences

| Aspect | Claude Code | Goose |
|--------|-------------|-------|
| **Command Structure** | Markdown files with embedded bash | YAML recipes with instructions |
| **Agent Delegation** | Task tool invocation | Subrecipe calls |
| **State Management** | Bash state files + state machine | Recipe parameters + JSON checkpoints |
| **Hard Barriers** | Bash verification blocks | retry.checks with shell validation |
| **Library Functions** | 55 bash libraries | 2 MCP servers + embedded instructions |
| **Iteration Loops** | Bash loop in command | External orchestrator script |

## Workflow Migration

### Research Workflow

**Claude Code** (`/research`):
```bash
/research "topic description" --complexity 2
```

**Goose** (`research.yaml`):
```bash
goose run --recipe .goose/recipes/research.yaml \
  --params topic="topic description" \
  --params complexity=2
```

**Key Changes**:
- Topic slug generation moved to `topic-naming.yaml` subrecipe
- Research specialist logic in `research-specialist.yaml` subrecipe
- Hard barrier validation uses `retry.checks` with shell commands
- Artifact paths auto-calculated from topic directory

**Verification**:
```bash
# Check report created
test -f .claude/specs/[NNN]_topic_slug/reports/001-analysis.md

# Verify minimum size
test $(stat -f%z .claude/specs/[NNN]_topic_slug/reports/001-analysis.md) -gt 500
```

### Planning Workflow

**Claude Code** (`/create-plan`):
```bash
/create-plan "feature description" --complexity 3 --file path/to/plan.md
```

**Goose** (`create-plan.yaml`):
```bash
goose run --recipe .goose/recipes/create-plan.yaml \
  --params feature_description="feature description" \
  --params complexity=3 \
  --params plan_file="path/to/plan.md"
```

**Key Changes**:
- Two-phase orchestration (research → planning) in single recipe
- Standards auto-loaded from `.goosehints` (no manual injection)
- Plan architect logic in `plan-architect.yaml` subrecipe
- Complexity calculation uses `plan-manager` MCP server
- Phase 0 divergence detection embedded in plan-architect instructions

**New Features**:
- Automatic tier recommendation based on complexity score
- Plan metadata validation via `validate_plan_metadata` MCP tool

### Revision Workflow

**Claude Code** (`/revise`):
```bash
/revise path/to/plan.md "revision details"
```

**Goose** (`revise.yaml`):
```bash
goose run --recipe .goose/recipes/revise.yaml \
  --params existing_plan_path="path/to/plan.md" \
  --params revision_details="revision details"
```

**Key Changes**:
- Backup creation with timestamp inline (no bash utility)
- Diff validation uses shell `cmp` command in `retry.checks`
- Plan architect runs in revision mode (detects via `operation_mode` parameter)
- Edit tool enforcement preserved in plan-architect subrecipe

**Backup Format**:
```
plans/backups/plan_YYYYMMDD_HHMMSS.md
```

### Implementation Workflow

**Claude Code** (`/implement`):
```bash
/implement path/to/plan.md --starting-phase 3 --max-iterations 5
```

**Goose** (external orchestrator):
```bash
bash .goose/scripts/goose-implement-orchestrator.sh path/to/plan.md --max-iterations=5
```

**Key Changes**:
- External bash script handles iteration loop (Goose recipes are single-iteration)
- Implementer coordinator in `implementer-coordinator.yaml` subrecipe
- Simplified dependency analysis (inline, no bash utility)
- Phase markers managed via `plan-manager` MCP server
- Context exhaustion detection triggers checkpoint creation

**Iteration Flow**:
```
Iteration 1: Execute phases → Context 85% → Create checkpoint → Return CONTINUATION_REQUIRED
Iteration 2: Load checkpoint → Execute phases → Context 90% → Create checkpoint → Return CONTINUATION_REQUIRED
Iteration 3: Load checkpoint → Execute phases → Complete → Return WORKFLOW_COMPLETE
```

**Orchestrator Script**:
The `goose-implement-orchestrator.sh` script:
1. Parses plan file path and max iterations
2. Invokes `implement.yaml` recipe with iteration parameter
3. Parses output for WORKFLOW_COMPLETE or CONTINUATION_REQUIRED
4. Loads continuation context from checkpoint JSON
5. Repeats until complete or max iterations reached

## Pattern Translations

### Hard Barrier Pattern

**Claude Code** (Bash blocks):
```markdown
## STEP 2c: HARD BARRIER - Validate Artifact Creation

```bash
# Verify report created
if [ ! -f "$report_path" ]; then
  echo "ERROR: Report not created at $report_path"
  exit 1
fi

# Verify minimum size
if [ $(stat -f%z "$report_path") -lt 500 ]; then
  echo "ERROR: Report too small (< 500 bytes)"
  exit 1
fi
\```
```

**Goose** (retry.checks):
```yaml
retry:
  checks:
    - type: shell
      command: "test -f {{ report_path }}"
      error_message: "Report not created at {{ report_path }}"
    - type: shell
      command: "test $(stat -f%z {{ report_path }}) -gt 500"
      error_message: "Report too small (< 500 bytes)"
```

### Agent Delegation

**Claude Code** (Task tool):
```markdown
**EXECUTE NOW**: USE the Task tool to invoke the research-specialist.

Task {
  subagent_type: "research"
  description: "Conduct codebase research"
  prompt: |
    Read and follow behavioral guidelines from:
    /path/to/research-specialist.md

    Input:
    - topic: {{ topic }}
    - report_path: {{ report_path }}

    Create research report with codebase analysis.
    Return RESEARCH_COMPLETE signal.
}
```

**Goose** (Subrecipe):
```yaml
sub_recipes:
  - name: research-specialist
    path: ./subrecipes/research-specialist.yaml
    parameters:
      topic: "{{ topic }}"
      report_path: "{{ report_path }}"
```

### State Persistence

**Claude Code** (Bash state files):
```bash
# Save state
cat > "$STATE_FILE" <<EOF
plan_file="$plan_file"
topic_path="$topic_path"
iteration=$iteration
EOF

# Load state
source "$STATE_FILE"
```

**Goose** (JSON checkpoint):
```yaml
# Save checkpoint (automatic with retry.checkpoint_file)
retry:
  checkpoint_file: ".goose/checkpoints/implement_{{ workflow_id }}_iter_{{ iteration }}.json"

# Checkpoint format:
{
  "version": "2.1",
  "timestamp": "2025-12-05T22:00:00Z",
  "plan_path": "/path/to/plan.md",
  "topic_path": "/path/to/topic",
  "iteration": 2,
  "max_iterations": 5,
  "continuation_context": "/path/to/summary_iteration_1.md"
}
```

### Library Sourcing

**Claude Code** (Bash sourcing):
```bash
source "$CLAUDE_LIB/core/error-handling.sh" 2>/dev/null || {
  echo "Error: Cannot load error-handling library"
  exit 1
}

source "$CLAUDE_LIB/plan/checkbox-utils.sh"
mark_phase_complete "$plan_file" 3
```

**Goose** (MCP servers):
```yaml
# No sourcing needed - use MCP server tools directly
instructions: |
  Use the plan-manager MCP server to mark Phase 3 complete.

  Call mark_phase_complete tool:
  - plan_path: {{ plan_file }}
  - phase_num: 3
```

## MCP Server Migration

### Phase Marker Management

**Claude Code** (checkbox-utils.sh):
```bash
source "$CLAUDE_LIB/plan/checkbox-utils.sh"

mark_phase_complete "$plan_file" 3
verify_phase_complete "$plan_file" 3
check_all_phases_complete "$plan_file"
```

**Goose** (plan-manager MCP):
```yaml
# Mark phase complete
mark_phase_complete:
  plan_path: {{ plan_file }}
  phase_num: 3

# Verify complete
verify_phase_complete:
  plan_path: {{ plan_file }}
  phase_num: 3

# Check all phases
check_all_phases_complete:
  plan_path: {{ plan_file }}
```

### Complexity Calculation

**Claude Code** (complexity-utils.sh):
```bash
source "$CLAUDE_LIB/plan/complexity-utils.sh"

score=$(calculate_plan_complexity 45 7 106 5)
echo "Complexity: $score"
```

**Goose** (plan-manager MCP):
```yaml
# Calculate complexity
calculate_plan_complexity:
  task_count: 45
  phase_count: 7
  estimated_hours: 106
  dependency_complexity: 5

# Get tier recommendation
tier_recommendation:
  complexity_score: 215.0
```

### State Machine

**Claude Code** (workflow-state-machine.sh):
```bash
source "$CLAUDE_LIB/core/workflow-state-machine.sh"

sm_init "research" "research-only"
sm_transition "RESEARCH"
current=$(sm_current_state)
```

**Goose** (state-machine MCP):
```yaml
# Initialize state
sm_init:
  description: "research"
  workflow_type: "research-only"

# Transition state
sm_transition:
  target_state: "RESEARCH"

# Get current state
sm_current_state: {}
```

## Recipe Authoring

### Basic Recipe Structure

```yaml
# Recipe metadata
name: my-workflow
description: "Description of workflow"
version: 1.0.0

# Parameters (inputs from user or parent recipe)
parameters:
  - key: input_param
    input_type: string
    requirement: required
    description: "Description of parameter"

  - key: optional_param
    input_type: integer
    requirement: optional
    default: 5

# Instructions (what the agent should do)
instructions: |
  STEP 1: Describe first step

  Execute task A, B, C.

  STEP 2: Describe second step

  Use tool X to accomplish Y.

  Return WORKFLOW_COMPLETE signal.

# Subrecipes (delegate to other agents)
sub_recipes:
  - name: subagent
    path: ./subrecipes/subagent.yaml
    parameters:
      sub_param: "{{ input_param }}"

# Retry configuration (hard barriers)
retry:
  max_attempts: 3
  checks:
    - type: shell
      command: "test -f {{ artifact_path }}"
      error_message: "Artifact not created"

  checkpoint_file: ".goose/checkpoints/{{ workflow_id }}.json"
```

### Parameter Passing

**Parent Recipe**:
```yaml
parameters:
  - key: topic
    input_type: string
    requirement: required

sub_recipes:
  - name: research-specialist
    path: ./subrecipes/research-specialist.yaml
    parameters:
      topic: "{{ topic }}"  # Pass parameter to subrecipe
      report_path: "{{ artifact_paths.reports }}/001-analysis.md"
```

**Subrecipe**:
```yaml
parameters:
  - key: topic
    input_type: string
    requirement: required

  - key: report_path
    input_type: string
    requirement: required

instructions: |
  Conduct research on topic: {{ topic }}
  Save report to: {{ report_path }}
```

### Template Variables

Goose supports template variables using `{{ variable }}` syntax:

```yaml
instructions: |
  Create report at path: {{ report_path }}

  Current timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)

  Topic directory: {{ topic_path }}/reports/

  Project root: {{ project_dir }}
```

**Common Variables**:
- `{{ parameter_name }}` - Recipe parameters
- `{{ project_dir }}` - Project root directory (auto-detected)
- `{{ workflow_id }}` - Unique workflow identifier
- `$(command)` - Shell command substitution

## Troubleshooting

### Issue: Recipe Not Found

**Error**:
```
Error: Recipe not found: .goose/recipes/research.yaml
```

**Solution**:
Verify recipe file exists and path is correct:
```bash
ls -la .goose/recipes/research.yaml
```

### Issue: Parameter Missing

**Error**:
```
Error: Required parameter 'topic' not provided
```

**Solution**:
Provide all required parameters:
```bash
goose run --recipe .goose/recipes/research.yaml --params topic="value"
```

### Issue: MCP Server Not Running

**Error**:
```
Error: MCP server 'plan-manager' not available
```

**Solution**:
Start MCP server:
```bash
cd .goose/mcp-servers/plan-manager
node index.js
```

Or configure Goose to auto-start MCP servers in `.goose/config.yaml`.

### Issue: Hard Barrier Failed

**Error**:
```
Retry check failed: Report not created at /path/to/report.md
```

**Solution**:
1. Check recipe instructions created artifact correctly
2. Verify path is correct in `retry.checks`
3. Review agent output for errors
4. Check file permissions

### Issue: Iteration Loop Not Halting

**Error**:
```
Max iterations (5) reached, but work remaining
```

**Solution**:
1. Increase `--max-iterations` parameter
2. Review context exhaustion detection logic
3. Check `work_remaining` signal is set correctly
4. Verify `requires_continuation` flag

## Performance Considerations

### Goose vs Claude Code Performance

Expected performance characteristics:

| Metric | Claude Code (Bash) | Goose (YAML + MCP) | Delta |
|--------|-------------------|-------------------|-------|
| Recipe startup | ~50ms | ~200ms | +150ms |
| MCP server latency | N/A | ~50ms per call | +50ms |
| Hard barrier validation | ~10ms | ~30ms (shell check) | +20ms |
| Overall workflow | Baseline | +5-10% | Acceptable |

**Target**: < 10% performance penalty vs Claude Code baseline

**Optimization Tips**:
1. Minimize MCP server calls (batch operations if possible)
2. Use shell validation instead of MCP for simple checks
3. Reduce subrecipe nesting depth (max 2-3 levels)
4. Cache complexity calculations when possible

## Testing

### Recipe Testing

Test recipes independently:
```bash
# Test research workflow
goose run --recipe .goose/recipes/research.yaml \
  --params topic="test topic" \
  --params complexity=2

# Verify artifacts created
test -f .claude/specs/[NNN]_test_topic/reports/001-analysis.md
```

### MCP Server Testing

Test MCP servers with Node.js test suite:
```bash
cd .goose/mcp-servers/plan-manager
npm test

cd .goose/mcp-servers/state-machine
npm test
```

### Integration Testing

Test full workflow chains:
```bash
# Research → Plan → Implement
bash .goose/tests/integration/test-full-workflow.sh
```

## Migration Checklist

- [ ] Install Goose CLI 2.1+
- [ ] Create `.goose/` directory structure
- [ ] Convert CLAUDE.md to `.goosehints`
- [ ] Install MCP servers (plan-manager, state-machine)
- [ ] Port workflow recipes (research, create-plan, revise, implement)
- [ ] Test each workflow independently
- [ ] Test full workflow chain
- [ ] Performance benchmarking
- [ ] Update user documentation
- [ ] Train users on new workflow

## Known Limitations

### Goose Limitations

1. **No Built-in Iteration Loops**: External orchestrator script required for large plans
2. **Single-Pass Execution**: Recipes execute once, no built-in retry loops
3. **Limited Context Passing**: JSON checkpoints required for multi-iteration workflows
4. **MCP Server Overhead**: ~50ms latency per MCP call vs inline bash functions

### Workarounds

**Iteration Loops**:
```bash
# Use external orchestrator script
bash .goose/scripts/goose-implement-orchestrator.sh plan.md
```

**Multi-Iteration Context**:
```yaml
# Pass continuation context via checkpoint JSON
parameters:
  - key: continuation_context
    input_type: string
    requirement: optional

instructions: |
  If continuation_context provided, load previous summary:
  Read file: {{ continuation_context }}
```

## Next Steps

1. **Install Goose**: [Installation Guide](https://goose-cli.dev/install)
2. **Explore Examples**: Review `.goose/recipes/` for working examples
3. **Test Workflows**: Run each workflow with sample inputs
4. **Performance Benchmark**: Compare against Claude Code baseline
5. **Report Issues**: File issues in Goose repository

## Resources

- [Goose CLI Documentation](https://goose-cli.dev/docs)
- [MCP Server Specification](https://github.com/anthropics/mcp)
- [Recipe Authoring Guide](.goose/docs/recipe-authoring-guide.md)
- [MCP Server API Reference](.goose/docs/mcp-api-reference.md)
- [Troubleshooting Guide](.goose/docs/troubleshooting.md)

## Support

For questions or issues:
- Goose CLI: https://github.com/block/goose/issues
- MCP Servers: File issue in this repository
- Migration Help: Consult this guide or contact maintainers
