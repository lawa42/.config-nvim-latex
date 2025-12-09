# Plan Manager MCP Server

Model Context Protocol (MCP) server for managing implementation plan phase markers and complexity calculations.

## Overview

The plan-manager MCP server provides tools for:
- Managing phase status markers ([NOT STARTED], [IN PROGRESS], [COMPLETE])
- Validating plan metadata compliance
- Calculating complexity scores for phases and plans
- Recommending plan tiers based on complexity

Ported from Claude Code's `checkbox-utils.sh` and `complexity-utils.sh` libraries.

## Installation

```bash
cd .goose/mcp-servers/plan-manager
npm install
```

## Usage

The server runs via stdio transport and is invoked automatically by Goose recipes that require plan management tools.

### Starting the Server

```bash
node index.js
```

## Tools

### Phase Marker Management

#### `mark_phase_complete`

Mark a phase as [COMPLETE] in the plan file.

**Parameters**:
- `plan_path` (string, required): Absolute path to plan file
- `phase_num` (integer, required): Phase number (1-based)

**Returns**:
```json
{
  "success": true,
  "phase_num": 3,
  "old_status": "IN PROGRESS",
  "new_status": "COMPLETE",
  "phase_title": "Database Setup"
}
```

**Example**:
```javascript
await callTool('mark_phase_complete', {
  plan_path: '/path/to/plan.md',
  phase_num: 3
});
```

#### `mark_phase_in_progress`

Mark a phase as [IN PROGRESS] in the plan file.

**Parameters**:
- `plan_path` (string, required): Absolute path to plan file
- `phase_num` (integer, required): Phase number (1-based)

**Returns**:
```json
{
  "success": true,
  "phase_num": 2,
  "old_status": "NOT STARTED",
  "new_status": "IN PROGRESS",
  "phase_title": "API Setup"
}
```

#### `verify_phase_complete`

Check if a phase is marked as [COMPLETE].

**Parameters**:
- `plan_path` (string, required): Absolute path to plan file
- `phase_num` (integer, required): Phase number (1-based)

**Returns**:
```json
{
  "phase_num": 2,
  "title": "API Setup",
  "is_complete": true,
  "current_status": "COMPLETE"
}
```

#### `get_phase_status`

Get the current status of a phase.

**Parameters**:
- `plan_path` (string, required): Absolute path to plan file
- `phase_num` (integer, required): Phase number (1-based)

**Returns**:
```json
{
  "phase_num": 4,
  "status": "IN PROGRESS",
  "title": "Testing Phase"
}
```

#### `check_all_phases_complete`

Verify all phases in the plan are marked [COMPLETE].

**Parameters**:
- `plan_path` (string, required): Absolute path to plan file

**Returns**:
```json
{
  "total_phases": 5,
  "complete_phases": 3,
  "all_complete": false,
  "incomplete_phases": [
    {
      "num": 4,
      "title": "Testing Phase",
      "status": "IN PROGRESS"
    },
    {
      "num": 5,
      "title": "Documentation",
      "status": "NOT STARTED"
    }
  ]
}
```

### Metadata Validation

#### `validate_plan_metadata`

Validate plan metadata compliance against plan-metadata-standard.md.

**Parameters**:
- `plan_path` (string, required): Absolute path to plan file

**Returns**:
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Feature description too short: 45 chars (recommended 50-100)"
  ],
  "metadata_section_found": true,
  "required_fields_count": 6,
  "found_fields_count": 6
}
```

**Validates**:
- Required fields: Date, Feature, Status, Estimated Hours, Standards File, Research Reports
- Date format (YYYY-MM-DD)
- Feature length (50-100 chars recommended)
- Estimated Hours range (low < high)
- Phase status markers

### Complexity Calculation

#### `calculate_phase_complexity`

Calculate complexity score for a specific phase.

**Parameters**:
- `plan_path` (string, required): Absolute path to plan file
- `phase_num` (integer, required): Phase number (1-based)

**Returns**:
```json
{
  "phase_num": 3,
  "complexity_score": 8.4,
  "factors": {
    "task_count": 12,
    "file_count": 5,
    "code_blocks": 3,
    "has_duration": true
  }
}
```

**Complexity Formula**:
```
score = (tasks * 0.5) + (files * 0.2) + (code_blocks * 0.3) + (has_duration ? 1.0 : 0)
```

**Factors**:
- `task_count`: Number of `- [ ]` checkboxes
- `file_count`: Number of file references (.sh, .md, .lua, .py, .js, .ts)
- `code_blocks`: Number of ``` code blocks
- `has_duration`: Presence of "hour", "minute", or "duration" keywords

#### `calculate_plan_complexity`

Calculate complexity score for entire plan based on tasks, phases, hours, dependencies.

**Parameters**:
- `task_count` (integer, default: 0): Total number of tasks
- `phase_count` (integer, default: 0): Total number of phases
- `estimated_hours` (number, default: 0): Estimated hours (mid-range)
- `dependency_complexity` (number, default: 0): Dependency complexity score (0-10)

**Returns**:
```json
{
  "complexity_score": 215.0,
  "factors": {
    "task_count": 45,
    "phase_count": 7,
    "estimated_hours": 106,
    "dependency_complexity": 5
  }
}
```

**Complexity Formula**:
```
score = (tasks * 0.3) + (phases * 1.0) + (hours * 0.1) + dependency_complexity
```

**Example**:
```javascript
await callTool('calculate_plan_complexity', {
  task_count: 45,
  phase_count: 7,
  estimated_hours: 106,
  dependency_complexity: 5
});
```

#### `tier_recommendation`

Get tier recommendation based on complexity score.

**Parameters**:
- `complexity_score` (number, required): Complexity score from calculate_plan_complexity

**Returns**:
```json
{
  "tier": 3,
  "description": "Complex (may expand to Level 1 or Level 2)",
  "structure_level": 0,
  "complexity_score": 215.0,
  "thresholds": {
    "tier_1_max": 49.9,
    "tier_2_min": 50.0,
    "tier_2_max": 199.9,
    "tier_3_min": 200.0
  }
}
```

**Tier Definitions**:
- **Tier 1** (score < 50): Simple (inline phases, no expansion)
- **Tier 2** (50 ≤ score < 200): Moderate (may expand to Level 1 if needed)
- **Tier 3** (score ≥ 200): Complex (may expand to Level 1 or Level 2)

**Example**:
```javascript
await callTool('tier_recommendation', {
  complexity_score: 215.0
});
```

## Recipe Integration

### Example: Mark Phase Complete

```yaml
instructions: |
  After completing Phase 3, mark it as complete using the plan-manager MCP server.

  Use the mark_phase_complete tool:
  - plan_path: {{ plan_file }}
  - phase_num: 3

  Verify the phase was marked complete using verify_phase_complete.
```

### Example: Calculate Complexity

```yaml
instructions: |
  Calculate the plan complexity score to determine tier recommendation.

  1. Use calculate_plan_complexity tool:
     - task_count: {{ total_tasks }}
     - phase_count: {{ total_phases }}
     - estimated_hours: {{ mid_range_hours }}
     - dependency_complexity: {{ dep_score }}

  2. Use tier_recommendation tool with the returned complexity_score.

  3. Based on tier, decide plan structure level:
     - Tier 1: Keep inline (Level 0)
     - Tier 2: May expand to Level 1
     - Tier 3: May expand to Level 1 or Level 2
```

## Testing

Run the test suite:

```bash
npm test
```

Tests include:
- Phase marker updates (NOT STARTED → IN PROGRESS → COMPLETE)
- Phase status verification
- All phases complete check
- Metadata validation
- Complexity calculation (phase and plan)
- Tier recommendation

## Error Handling

All tools return structured errors:

```json
{
  "error": "Plan file not found: /invalid/path.md",
  "tool": "mark_phase_complete",
  "arguments": {
    "plan_path": "/invalid/path.md",
    "phase_num": 3
  }
}
```

Common errors:
- Plan file not found
- Phase not found in plan
- Invalid phase number
- Missing metadata section
- Invalid metadata format

## Migration from Claude Code

### Phase Marker Management

**Claude Code** (bash):
```bash
source "$CLAUDE_LIB/plan/checkbox-utils.sh"
mark_phase_complete "$plan_file" 3
verify_phase_complete "$plan_file" 3
```

**Goose** (MCP):
```javascript
await callTool('mark_phase_complete', { plan_path: plan_file, phase_num: 3 });
await callTool('verify_phase_complete', { plan_path: plan_file, phase_num: 3 });
```

### Complexity Calculation

**Claude Code** (bash):
```bash
source "$CLAUDE_LIB/plan/complexity-utils.sh"
score=$(calculate_plan_complexity 45 7 106 5)
```

**Goose** (MCP):
```javascript
const result = await callTool('calculate_plan_complexity', {
  task_count: 45,
  phase_count: 7,
  estimated_hours: 106,
  dependency_complexity: 5
});
```

## Version

- **Version**: 1.0.0
- **MCP SDK**: @modelcontextprotocol/sdk
- **Node.js**: 18+

## License

Part of the Goose workflow utilities port from Claude Code.
