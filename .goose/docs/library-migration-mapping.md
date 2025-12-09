# Bash Library Migration Mapping

## Overview

This document maps all 55 Claude Code bash libraries to their Goose equivalents, categorizing them into:
- **Category A**: Embed in recipe instructions (simple utilities)
- **Category B**: Convert to MCP server tools (complex state management)
- **Category C**: Use Goose built-ins (native functionality exists)
- **Category D**: Architectural redesign (orchestration patterns)
- **Category E**: Not needed (obsolete or workflow-specific)

## Migration Categories Summary

| Category | Count | Strategy | Examples |
|----------|-------|----------|----------|
| A - Embed | 22 | Inline in recipe instructions | timestamp-utils, detect-project-dir |
| B - MCP | 15 | Convert to MCP server tools | checkbox-utils, state-machine |
| C - Built-ins | 8 | Use Goose native features | error-handling, unified-logger |
| D - Redesign | 7 | Recipe pattern changes | barrier-utils, workflow-init |
| E - Not Needed | 3 | Obsolete or not applicable | library-version-check, tmp scripts |

**Total Libraries**: 55

## Category A: Embed in Recipe Instructions (22 libraries)

These utilities are simple enough to inline as shell commands or template variables in recipe instructions.

### Core Utilities (5 libraries)

1. **timestamp-utils.sh**
   - **Purpose**: Generate ISO timestamps
   - **Migration**: `$(date -u +%Y-%m-%dT%H:%M:%SZ)` in instructions
   - **Usage**: Backup filenames, checkpoint timestamps
   - **Status**: ✓ Already used in revise.yaml

2. **detect-project-dir.sh**
   - **Purpose**: Locate project root directory
   - **Migration**: Template variable `{{ project_dir }}` (Goose auto-detects)
   - **Usage**: All recipe file paths
   - **Status**: ✓ Goose provides PROJECT_DIR automatically

3. **base-utils.sh**
   - **Purpose**: Basic utility functions (path manipulation, string utils)
   - **Migration**: Inline bash utilities (`basename`, `dirname`, etc.)
   - **Usage**: Path extraction, filename parsing
   - **Status**: ✓ Use standard bash commands

4. **unified-location-detection.sh**
   - **Purpose**: Detect .claude/ directory location
   - **Migration**: Not needed (Goose uses .goose/ in project root)
   - **Usage**: Library sourcing (obsolete in Goose)
   - **Status**: ✓ Architectural change (no sourcing needed)

5. **summary-formatting.sh**
   - **Purpose**: Format summary text blocks
   - **Migration**: Inline markdown formatting in instructions
   - **Usage**: Summary file creation
   - **Status**: ✓ Already used in implementer-coordinator.yaml

### Workflow Utilities (7 libraries)

6. **argument-capture.sh**
   - **Purpose**: Parse command arguments
   - **Migration**: Recipe `parameters` section
   - **Usage**: All workflow recipes
   - **Status**: ✓ Already migrated in all recipes (research.yaml, etc.)

7. **metadata-extraction.sh**
   - **Purpose**: Extract metadata from plan files
   - **Migration**: Inline grep/sed commands in instructions
   - **Usage**: Plan validation, metadata display
   - **Status**: Embed as needed

8. **context-pruning.sh**
   - **Purpose**: Reduce context size by pruning verbose output
   - **Migration**: Not needed (Goose handles context automatically)
   - **Usage**: Large plan optimization
   - **Status**: ✓ Goose built-in optimization

9. **workflow-detection.sh**
   - **Purpose**: Detect workflow type from plan metadata
   - **Migration**: Inline regex parsing in instructions
   - **Usage**: Implementer coordinator (workflow type detection)
   - **Status**: Embed in implementer-coordinator.yaml

10. **workflow-scope-detection.sh**
    - **Purpose**: Determine workflow scope (single vs multi-phase)
    - **Migration**: Inline phase counting logic
    - **Usage**: Plan structure detection
    - **Status**: Embed in implementer-coordinator.yaml (STEP 2)

### Plan Utilities (5 libraries)

11. **topic-utils.sh**
    - **Purpose**: Topic directory manipulation
    - **Migration**: Inline path construction (`{{ topic_path }}/subdir`)
    - **Usage**: Artifact path generation
    - **Status**: ✓ Already migrated (all recipes use artifact_paths)

12. **parse-template.sh**
    - **Purpose**: Parse plan templates
    - **Migration**: Not needed (plan-architect creates plans directly)
    - **Usage**: Plan creation from templates
    - **Status**: ✓ Architectural change (no templates in Goose)

13. **topic-decomposition.sh**
    - **Purpose**: Decompose feature description into topic slug
    - **Migration**: Inline in topic-naming.yaml instructions
    - **Usage**: Topic slug generation
    - **Status**: ✓ Already migrated (topic-naming.yaml)

14. **plan-core-bundle.sh**
    - **Purpose**: Bundle multiple plan utilities together
    - **Migration**: Not needed (no sourcing in Goose)
    - **Usage**: Library sourcing optimization
    - **Status**: ✓ Obsolete (no sourcing needed)

15. **auto-analysis-utils.sh**
    - **Purpose**: Automatic complexity analysis
    - **Migration**: Inline in plan-architect.yaml instructions
    - **Usage**: Complexity calculation
    - **Status**: ✓ Already migrated (plan-architect.yaml complexity logic)

### Utility Scripts (5 libraries)

16. **backup-command-file.sh**
    - **Purpose**: Backup command files before modification
    - **Migration**: Inline `cp` command with timestamp
    - **Usage**: Revision workflow (backup creation)
    - **Status**: ✓ Already migrated (revise.yaml backup logic)

17. **rollback-command-file.sh**
    - **Purpose**: Rollback command files from backup
    - **Migration**: Inline `cp` command
    - **Usage**: Error recovery (manual rollback)
    - **Status**: Not needed (Goose handles errors differently)

18. **detect-testing.sh**
    - **Purpose**: Detect test framework in project
    - **Migration**: Inline test discovery logic
    - **Usage**: Testing workflows
    - **Status**: Defer to Phase 7 (testing workflows not yet ported)

19. **generate-testing-protocols.sh**
    - **Purpose**: Generate testing protocol documentation
    - **Migration**: Not needed (manual documentation)
    - **Usage**: Testing documentation
    - **Status**: Not applicable to Goose port

20. **git-commit-utils.sh**
    - **Purpose**: Git commit message formatting
    - **Migration**: Inline git commit commands
    - **Usage**: Implementation phase commits
    - **Status**: Embed in implementer-coordinator.yaml (Phase 7)

21. **optimize-claude-md.sh**
    - **Purpose**: Optimize CLAUDE.md file structure
    - **Migration**: Not applicable (.goosehints is static)
    - **Usage**: Standards file optimization
    - **Status**: Not needed

22. **validate-agent-invocation-pattern.sh**
    - **Purpose**: Validate Task tool invocation syntax
    - **Migration**: Not applicable (no Task tool in Goose)
    - **Usage**: Command linting
    - **Status**: Not needed

## Category B: Convert to MCP Server Tools (15 libraries)

These libraries contain complex logic requiring stateful operations, best implemented as MCP server tools.

### Completed MCP Servers (2 libraries)

1. **checkbox-utils.sh** → **plan-manager MCP** ✓
   - **Purpose**: Manage plan phase checkboxes ([NOT STARTED], [IN PROGRESS], [COMPLETE])
   - **MCP Tools**:
     - `mark_phase_complete(plan_path, phase_num)`
     - `verify_phase_complete(plan_path, phase_num)`
     - `check_all_phases_complete(plan_path)`
   - **Status**: ✓ Completed in Phase 1
   - **File**: `.goose/mcp-servers/plan-manager/index.js`

2. **workflow-state-machine.sh** → **state-machine MCP** ✓
   - **Purpose**: Workflow state validation and transitions
   - **MCP Tools**:
     - `sm_init(description, workflow_type)`
     - `sm_transition(target_state)`
     - `sm_current_state()`
   - **Status**: ✓ Completed in Phase 1
   - **File**: `.goose/mcp-servers/state-machine/index.js`

### Additional MCP Conversions Needed (13 libraries)

3. **complexity-utils.sh** → **plan-manager MCP** (extend existing)
   - **Purpose**: Complexity score calculation
   - **New MCP Tools**:
     - `calculate_complexity(plan_path)` - Parse plan and calculate complexity score
     - `tier_recommendation(complexity_score)` - Recommend tier (1/2/3)
   - **Status**: Add to plan-manager MCP server
   - **Integration**: plan-architect.yaml uses for tier selection

4. **standards-extraction.sh** → **Not needed**
   - **Purpose**: Extract standards sections from CLAUDE.md
   - **Migration**: Goose auto-loads .goosehints (no extraction needed)
   - **Status**: ✓ Obsolete (Goose built-in)

5. **dependency-analyzer.sh** → **plan-manager MCP** (extend existing)
   - **Purpose**: Analyze phase dependencies for wave-based execution
   - **New MCP Tools**:
     - `analyze_dependencies(plan_path)` - Parse dependencies and generate waves
     - `generate_wave_structure(plan_path)` - Return wave-based execution order
   - **Status**: Add to plan-manager MCP server
   - **Integration**: implementer-coordinator.yaml uses for wave orchestration
   - **Note**: Simplified inline version already in implementer-coordinator.yaml

6. **state-persistence.sh** → **checkpoint-manager MCP** (new server)
   - **Purpose**: Persist workflow state across invocations
   - **MCP Tools**:
     - `save_state(workflow_id, state_data)` - Save workflow state to JSON
     - `load_state(workflow_id)` - Load workflow state from JSON
     - `delete_state(workflow_id)` - Cleanup workflow state
   - **Status**: Create new MCP server
   - **Integration**: All workflows use for state persistence
   - **Alternative**: Use Goose retry.checkpoint_file (simpler)

7. **checkpoint-utils.sh** → **Use Goose retry.checkpoint_file**
   - **Purpose**: Create and manage workflow checkpoints
   - **Migration**: Goose `retry.checkpoint_file` configuration
   - **Status**: ✓ Goose built-in feature
   - **Integration**: Already used in implement.yaml

8. **barrier-utils.sh** → **Use Goose retry.checks**
   - **Purpose**: Hard barrier validation (artifact creation enforcement)
   - **Migration**: Goose `retry.checks` with shell commands
   - **Status**: ✓ Goose built-in pattern
   - **Integration**: Already used in all recipes

9. **validation-utils.sh** → **validator MCP** (new server)
   - **Purpose**: Reusable validation functions (path validation, file checks)
   - **MCP Tools**:
     - `validate_path(path, type)` - Validate path exists and is correct type
     - `validate_file_size(path, min_bytes)` - Check file meets size requirement
     - `validate_file_content(path, pattern)` - Check file contains pattern
   - **Status**: Create new MCP server OR use inline shell validation
   - **Integration**: All recipes use for validation
   - **Recommendation**: Inline shell validation simpler (no MCP needed)

10. **workflow-initialization.sh** → **Embed in recipes**
    - **Purpose**: Initialize workflow state and directories
    - **Migration**: Recipe parameter initialization + directory creation
    - **Status**: ✓ Already migrated (all recipes handle initialization)

11. **workflow-init.sh** → **Embed in recipes**
    - **Purpose**: Initialize workflow (duplicate of workflow-initialization.sh)
    - **Migration**: Recipe parameter initialization
    - **Status**: ✓ Already migrated

12. **workflow-bootstrap.sh** → **Embed in recipes**
    - **Purpose**: Bootstrap workflow environment
    - **Migration**: Recipe instructions (directory creation, validation)
    - **Status**: ✓ Already migrated (all recipes create directories)

13. **workflow-llm-classifier.sh** → **topic-naming.yaml** (subrecipe)
    - **Purpose**: LLM-based workflow classification
    - **Migration**: Already ported to topic-naming.yaml subrecipe
    - **Status**: ✓ Completed in Phase 2

14. **artifact-creation.sh** → **artifact-manager MCP** (new server)
    - **Purpose**: Create and register workflow artifacts
    - **MCP Tools**:
     - `create_artifact(artifact_type, path, metadata)` - Create artifact file
     - `register_artifact(artifact_path, artifact_type)` - Register in artifact registry
     - `list_artifacts(topic_path)` - List all artifacts for topic
   - **Status**: Create new MCP server OR use inline file creation
   - **Recommendation**: Inline file creation simpler (no MCP needed)

15. **artifact-registry.sh** → **artifact-manager MCP** (consolidate with artifact-creation)
    - **Purpose**: Track created artifacts
    - **Migration**: Consolidate into artifact-manager MCP
    - **Status**: Create artifact-manager MCP OR use file-based registry
    - **Recommendation**: Simple JSON file registry (no MCP needed)

## Category C: Use Goose Built-ins (8 libraries)

These libraries provide functionality that Goose already has natively.

1. **error-handling.sh** → **Goose native error handling**
   - **Purpose**: Error logging and handling
   - **Migration**: Goose native error reporting
   - **Status**: ✓ Use Goose error system
   - **Note**: Goose captures errors automatically

2. **checkpoint-utils.sh** → **retry.checkpoint_file**
   - **Purpose**: Checkpoint creation and management
   - **Migration**: Goose `retry.checkpoint_file` configuration
   - **Status**: ✓ Already used in implement.yaml

3. **unified-logger.sh** → **Goose logs**
   - **Purpose**: Centralized logging
   - **Migration**: Goose `goose logs` command
   - **Status**: ✓ Use Goose native logging

4. **barrier-utils.sh** → **retry.checks**
   - **Purpose**: Hard barrier pattern enforcement
   - **Migration**: Goose `retry.checks` with shell validation
   - **Status**: ✓ Already used in all recipes

5. **library-sourcing.sh** → **Not needed**
   - **Purpose**: Source bash libraries
   - **Migration**: Goose doesn't use bash sourcing
   - **Status**: ✓ Architectural change

6. **source-libraries.sh** → **Not needed**
   - **Purpose**: Source bash libraries
   - **Migration**: Goose doesn't use bash sourcing
   - **Status**: ✓ Architectural change

7. **source-libraries-inline.sh** → **Not needed**
   - **Purpose**: Inline library sourcing
   - **Migration**: Goose doesn't use bash sourcing
   - **Status**: ✓ Architectural change

8. **library-version-check.sh** → **Not needed**
   - **Purpose**: Check library version compatibility
   - **Migration**: Not applicable (no bash libraries)
   - **Status**: ✓ Obsolete

## Category D: Architectural Redesign (7 libraries)

These libraries implement orchestration patterns that map to recipe structures, not direct code.

1. **workflow-initialization.sh** → **Recipe parameter initialization**
   - **Purpose**: Initialize workflow state and directories
   - **Migration**: Recipe `parameters` section + directory creation in instructions
   - **Status**: ✓ Already migrated (all recipes)

2. **barrier-utils.sh** → **retry.checks pattern**
   - **Purpose**: Hard barrier enforcement
   - **Migration**: `retry.checks` with shell validation commands
   - **Status**: ✓ Already migrated (all recipes)

3. **validation-utils.sh** → **Inline shell validation**
   - **Purpose**: Reusable validation functions
   - **Migration**: Shell commands in `retry.checks`
   - **Status**: ✓ Use inline validation (simpler than MCP)

4. **checkpoint-utils.sh** → **retry.checkpoint_file**
   - **Purpose**: Checkpoint creation
   - **Migration**: Goose checkpoint configuration
   - **Status**: ✓ Already migrated (implement.yaml)

5. **workflow-bootstrap.sh** → **Recipe initialization logic**
   - **Purpose**: Bootstrap workflow environment
   - **Migration**: Recipe instructions (STEP 1: Validate and initialize)
   - **Status**: ✓ Already migrated (all recipes)

6. **workflow-init.sh** → **Recipe parameter defaults**
   - **Purpose**: Initialize workflow with defaults
   - **Migration**: Recipe `parameters` with `default` values
   - **Status**: ✓ Already migrated (all recipes)

7. **dependency-analyzer.sh** → **Inline wave generation**
   - **Purpose**: Analyze phase dependencies
   - **Migration**: Inline parsing logic in implementer-coordinator.yaml
   - **Status**: ✓ Simplified implementation already in Phase 5

## Category E: Not Needed (3 libraries)

These libraries are obsolete or not applicable to Goose.

1. **library-version-check.sh**
   - **Purpose**: Check bash library version compatibility
   - **Reason**: No bash libraries in Goose
   - **Status**: ✓ Obsolete

2. **tmp/update_paths.sh**
   - **Purpose**: Temporary migration script
   - **Reason**: Project-specific, not workflow-related
   - **Status**: ✓ Not applicable

3. **optimize-claude-md.sh**
   - **Purpose**: Optimize CLAUDE.md structure
   - **Reason**: .goosehints is static, no optimization needed
   - **Status**: ✓ Not applicable

## Convert-Specific Libraries (5 libraries)

These libraries are part of the document-converter skill, not core workflow utilities.

1. **convert-core.sh** → **document-converter skill**
   - **Purpose**: Core document conversion logic
   - **Status**: Part of skill, not ported (outside scope)

2. **convert-docx.sh** → **document-converter skill**
   - **Purpose**: DOCX conversion
   - **Status**: Part of skill, not ported

3. **convert-markdown.sh** → **document-converter skill**
   - **Purpose**: Markdown conversion
   - **Status**: Part of skill, not ported

4. **convert-pdf.sh** → **document-converter skill**
   - **Purpose**: PDF conversion
   - **Status**: Part of skill, not ported

5. **convert-gemini.sh** → **document-converter skill**
   - **Purpose**: Gemini AI conversion
   - **Status**: Part of skill, not ported

**Note**: Document converter libraries are excluded from this migration (separate skill, not workflow utilities).

## Lean-Specific Libraries (1 library)

1. **lean/phase-classifier.sh** → **Not applicable**
   - **Purpose**: Classify Lean proof phases
   - **Reason**: Lean workflow not in scope for this port
   - **Status**: Not included (Lean workflows separate)

## TODO-Specific Libraries (1 library)

1. **todo/todo-functions.sh** → **Not applicable**
   - **Purpose**: TODO.md management functions
   - **Reason**: TODO management not in scope for this port
   - **Status**: Not included (separate workflow)

## Artifact-Specific Libraries (4 remaining)

2. **artifact/template-integration.sh** → **Embed in plan-architect.yaml**
   - **Purpose**: Integrate templates into plans
   - **Migration**: Inline template rendering in plan-architect instructions
   - **Status**: Not needed (plan-architect creates plans directly)

3. **artifact/overview-synthesis.sh** → **Embed in research-specialist.yaml**
   - **Purpose**: Synthesize overview sections in reports
   - **Migration**: Inline in research-specialist instructions
   - **Status**: Not needed (research-specialist writes reports directly)

4. **artifact/substitute-variables.sh** → **Use Goose template variables**
   - **Purpose**: Variable substitution in templates
   - **Migration**: Goose `{{ variable }}` syntax
   - **Status**: ✓ Already migrated (all recipes use template syntax)

## MCP Server Consolidation Plan

### Current MCP Servers (2)
1. **plan-manager** (Phase 1) ✓
2. **state-machine** (Phase 1) ✓

### Proposed MCP Servers (4 additional)

3. **plan-manager** (extend existing)
   - Add complexity-utils.sh tools:
     - `calculate_complexity(plan_path)`
     - `tier_recommendation(complexity_score)`
   - Add dependency-analyzer.sh tools (optional):
     - `analyze_dependencies(plan_path)`
     - `generate_wave_structure(plan_path)`
   - **Status**: Extend in Phase 6

4. **checkpoint-manager** (optional, may not be needed)
   - Consolidate state-persistence.sh functionality
   - Tools:
     - `save_state(workflow_id, state_data)`
     - `load_state(workflow_id)`
     - `delete_state(workflow_id)`
   - **Alternative**: Use Goose retry.checkpoint_file (simpler)
   - **Recommendation**: Skip MCP, use Goose built-in

5. **artifact-manager** (optional, may not be needed)
   - Consolidate artifact-creation.sh and artifact-registry.sh
   - Tools:
     - `create_artifact(type, path, metadata)`
     - `register_artifact(path, type)`
     - `list_artifacts(topic_path)`
   - **Alternative**: Simple JSON file registry
   - **Recommendation**: Skip MCP, use file-based registry

6. **validator** (optional, may not be needed)
   - Consolidate validation-utils.sh
   - Tools:
     - `validate_path(path, type)`
     - `validate_file_size(path, min_bytes)`
     - `validate_file_content(path, pattern)`
   - **Alternative**: Inline shell validation in retry.checks
   - **Recommendation**: Skip MCP, use inline validation

### Final MCP Server Suite (2-3 servers)

**Minimum** (2 servers):
1. **plan-manager** - Phase marker management + complexity calculation
2. **state-machine** - Workflow state transitions

**Optional** (1 server):
3. **plan-manager** (extended) - Add dependency analysis tools if inline implementation proves insufficient

**Total**: 2-3 MCP servers (down from 15 proposed)

## Migration Status Summary

| Library | Category | Migration Strategy | Status |
|---------|----------|-------------------|--------|
| **Core Utilities** | | | |
| timestamp-utils.sh | A | Inline date commands | ✓ Migrated |
| detect-project-dir.sh | A | Template variable | ✓ Migrated |
| base-utils.sh | A | Inline bash utilities | ✓ Migrated |
| unified-location-detection.sh | E | Not needed | ✓ Obsolete |
| summary-formatting.sh | A | Inline markdown | ✓ Migrated |
| error-handling.sh | C | Goose native | ✓ Migrated |
| unified-logger.sh | C | Goose logs | ✓ Migrated |
| state-persistence.sh | C | Goose checkpoints | ✓ Migrated |
| **Workflow Utilities** | | | |
| argument-capture.sh | A | Recipe parameters | ✓ Migrated |
| metadata-extraction.sh | A | Inline grep/sed | To embed |
| context-pruning.sh | E | Not needed | ✓ Obsolete |
| workflow-detection.sh | A | Inline regex | To embed |
| workflow-scope-detection.sh | A | Inline logic | To embed |
| workflow-initialization.sh | D | Recipe params | ✓ Migrated |
| workflow-init.sh | D | Recipe params | ✓ Migrated |
| workflow-bootstrap.sh | D | Recipe instructions | ✓ Migrated |
| workflow-llm-classifier.sh | B | topic-naming.yaml | ✓ Migrated |
| workflow-state-machine.sh | B | state-machine MCP | ✓ Migrated |
| barrier-utils.sh | C/D | retry.checks | ✓ Migrated |
| checkpoint-utils.sh | C | retry.checkpoint_file | ✓ Migrated |
| validation-utils.sh | D | Inline validation | ✓ Migrated |
| **Plan Utilities** | | | |
| checkbox-utils.sh | B | plan-manager MCP | ✓ Migrated |
| complexity-utils.sh | B | Extend plan-manager MCP | Phase 6 |
| standards-extraction.sh | E | Not needed | ✓ Obsolete |
| topic-utils.sh | A | Inline paths | ✓ Migrated |
| parse-template.sh | E | Not needed | ✓ Obsolete |
| topic-decomposition.sh | A | topic-naming.yaml | ✓ Migrated |
| plan-core-bundle.sh | E | Not needed | ✓ Obsolete |
| auto-analysis-utils.sh | A | plan-architect.yaml | ✓ Migrated |
| dependency-analyzer.sh | B | Inline (or extend plan-manager) | ✓ Simplified |
| **Utility Scripts** | | | |
| backup-command-file.sh | A | Inline cp | ✓ Migrated |
| rollback-command-file.sh | E | Not needed | ✓ Obsolete |
| detect-testing.sh | A | Inline logic | Phase 7 |
| generate-testing-protocols.sh | E | Not needed | ✓ Obsolete |
| git-commit-utils.sh | A | Inline git | Phase 7 |
| optimize-claude-md.sh | E | Not needed | ✓ Obsolete |
| validate-agent-invocation-pattern.sh | E | Not needed | ✓ Obsolete |
| **Artifact Utilities** | | | |
| artifact-creation.sh | A | Inline file creation | ✓ Migrated |
| artifact-registry.sh | A | JSON file registry | Not needed |
| template-integration.sh | E | Not needed | ✓ Obsolete |
| overview-synthesis.sh | E | Not needed | ✓ Obsolete |
| substitute-variables.sh | A | Goose templates | ✓ Migrated |
| **Library Management** | | | |
| library-sourcing.sh | E | Not needed | ✓ Obsolete |
| source-libraries.sh | E | Not needed | ✓ Obsolete |
| source-libraries-inline.sh | E | Not needed | ✓ Obsolete |
| library-version-check.sh | E | Not needed | ✓ Obsolete |

**Excluded from Count** (not workflow utilities):
- 5 convert-* libraries (document-converter skill)
- 1 lean library (Lean workflows)
- 1 todo library (TODO management)
- 1 tmp script (temporary migration)

**Total Workflow Libraries**: 47 (55 total - 8 excluded)

## Phase 6 Implementation Tasks

### Task 1: Extend plan-manager MCP Server ✓
- Add complexity calculation tools
- (Optional) Add dependency analysis tools

### Task 2: Document Inline Migrations
- Create examples for common inline patterns
- Document template variable usage
- Document shell validation patterns

### Task 3: Create Migration Examples
- Example: Inline timestamp generation
- Example: Inline validation
- Example: Template variable substitution

### Task 4: Update Documentation
- Document MCP server consolidation rationale
- Document inline migration patterns
- Document architectural redesign decisions

## Completion Criteria

- [x] All 47 workflow libraries categorized
- [x] Migration strategy defined for each library
- [ ] plan-manager MCP extended with complexity tools
- [ ] Migration examples documented
- [ ] Library migration mapping complete

## Next Steps (Phase 7)

1. Create integration tests for all workflows
2. Performance benchmarking vs Claude Code
3. Complete documentation (recipe guides, MCP API docs)
4. Migration guide for users
