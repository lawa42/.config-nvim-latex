#!/usr/bin/env node

/**
 * Plan Manager MCP Server
 *
 * Provides tools for managing phase markers in implementation plans.
 * Ported from Claude Code's checkbox-utils.sh library.
 *
 * Tools:
 * - mark_phase_complete: Update phase status to [COMPLETE]
 * - mark_phase_in_progress: Update phase status to [IN PROGRESS]
 * - verify_phase_complete: Check if phase is marked complete
 * - check_all_phases_complete: Verify all phases in plan are complete
 * - get_phase_status: Get current status of a phase
 * - calculate_phase_complexity: Calculate complexity score for a phase
 * - calculate_plan_complexity: Calculate complexity score for entire plan
 * - tier_recommendation: Get tier recommendation based on complexity score
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// Tool definitions
const TOOLS = [
  {
    name: 'mark_phase_complete',
    description: 'Mark a phase as [COMPLETE] in the plan file',
    inputSchema: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Absolute path to the plan file',
        },
        phase_num: {
          type: 'integer',
          description: 'Phase number (1-based index)',
        },
      },
      required: ['plan_path', 'phase_num'],
    },
  },
  {
    name: 'mark_phase_in_progress',
    description: 'Mark a phase as [IN PROGRESS] in the plan file',
    inputSchema: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Absolute path to the plan file',
        },
        phase_num: {
          type: 'integer',
          description: 'Phase number (1-based index)',
        },
      },
      required: ['plan_path', 'phase_num'],
    },
  },
  {
    name: 'verify_phase_complete',
    description: 'Check if a phase is marked as [COMPLETE]',
    inputSchema: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Absolute path to the plan file',
        },
        phase_num: {
          type: 'integer',
          description: 'Phase number (1-based index)',
        },
      },
      required: ['plan_path', 'phase_num'],
    },
  },
  {
    name: 'check_all_phases_complete',
    description: 'Verify all phases in the plan are marked [COMPLETE]',
    inputSchema: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Absolute path to the plan file',
        },
      },
      required: ['plan_path'],
    },
  },
  {
    name: 'get_phase_status',
    description: 'Get the current status of a phase',
    inputSchema: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Absolute path to the plan file',
        },
        phase_num: {
          type: 'integer',
          description: 'Phase number (1-based index)',
        },
      },
      required: ['plan_path', 'phase_num'],
    },
  },
  {
    name: 'validate_plan_metadata',
    description: 'Validate plan metadata compliance (required fields, format)',
    inputSchema: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Absolute path to the plan file',
        },
      },
      required: ['plan_path'],
    },
  },
  {
    name: 'calculate_phase_complexity',
    description: 'Calculate complexity score for a specific phase',
    inputSchema: {
      type: 'object',
      properties: {
        plan_path: {
          type: 'string',
          description: 'Absolute path to the plan file',
        },
        phase_num: {
          type: 'integer',
          description: 'Phase number (1-based index)',
        },
      },
      required: ['plan_path', 'phase_num'],
    },
  },
  {
    name: 'calculate_plan_complexity',
    description: 'Calculate complexity score for entire plan based on tasks, phases, hours, dependencies',
    inputSchema: {
      type: 'object',
      properties: {
        task_count: {
          type: 'integer',
          description: 'Total number of tasks in plan',
          default: 0,
        },
        phase_count: {
          type: 'integer',
          description: 'Total number of phases in plan',
          default: 0,
        },
        estimated_hours: {
          type: 'number',
          description: 'Estimated hours for plan (mid-range)',
          default: 0,
        },
        dependency_complexity: {
          type: 'number',
          description: 'Dependency complexity score (0-10)',
          default: 0,
        },
      },
    },
  },
  {
    name: 'tier_recommendation',
    description: 'Get tier recommendation based on complexity score',
    inputSchema: {
      type: 'object',
      properties: {
        complexity_score: {
          type: 'number',
          description: 'Complexity score from calculate_plan_complexity',
        },
      },
      required: ['complexity_score'],
    },
  },
];

/**
 * Find the phase header line in the plan content
 */
function findPhaseHeader(content, phaseNum) {
  const lines = content.split('\n');
  const phasePattern = new RegExp(`^###\\s+Phase\\s+${phaseNum}:\\s+(.+?)\\s+\\[([A-Z\\s]+)\\]`);

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(phasePattern);
    if (match) {
      return { lineIndex: i, line: lines[i], title: match[1], status: match[2] };
    }
  }

  return null;
}

/**
 * Update phase status in plan file
 */
async function updatePhaseStatus(planPath, phaseNum, newStatus) {
  if (!existsSync(planPath)) {
    throw new Error(`Plan file not found: ${planPath}`);
  }

  const content = await fs.readFile(planPath, 'utf-8');
  const phaseInfo = findPhaseHeader(content, phaseNum);

  if (!phaseInfo) {
    throw new Error(`Phase ${phaseNum} not found in plan file`);
  }

  const lines = content.split('\n');
  const oldLine = lines[phaseInfo.lineIndex];
  const newLine = oldLine.replace(/\[([A-Z\s]+)\]$/, `[${newStatus}]`);

  lines[phaseInfo.lineIndex] = newLine;
  await fs.writeFile(planPath, lines.join('\n'), 'utf-8');

  return {
    success: true,
    phase_num: phaseNum,
    old_status: phaseInfo.status,
    new_status: newStatus,
    phase_title: phaseInfo.title,
  };
}

/**
 * Get phase status
 */
async function getPhaseStatus(planPath, phaseNum) {
  if (!existsSync(planPath)) {
    throw new Error(`Plan file not found: ${planPath}`);
  }

  const content = await fs.readFile(planPath, 'utf-8');
  const phaseInfo = findPhaseHeader(content, phaseNum);

  if (!phaseInfo) {
    throw new Error(`Phase ${phaseNum} not found in plan file`);
  }

  return {
    phase_num: phaseNum,
    status: phaseInfo.status,
    title: phaseInfo.title,
  };
}

/**
 * Check if all phases are complete
 */
async function checkAllPhasesComplete(planPath) {
  if (!existsSync(planPath)) {
    throw new Error(`Plan file not found: ${planPath}`);
  }

  const content = await fs.readFile(planPath, 'utf-8');
  const lines = content.split('\n');
  const phasePattern = /^###\s+Phase\s+(\d+):\s+(.+?)\s+\[([A-Z\s]+)\]/;

  const phases = [];
  for (const line of lines) {
    const match = line.match(phasePattern);
    if (match) {
      phases.push({
        num: parseInt(match[1]),
        title: match[2],
        status: match[3],
      });
    }
  }

  if (phases.length === 0) {
    throw new Error('No phases found in plan file');
  }

  const incomplete = phases.filter(p => p.status !== 'COMPLETE');

  return {
    total_phases: phases.length,
    complete_phases: phases.length - incomplete.length,
    all_complete: incomplete.length === 0,
    incomplete_phases: incomplete.map(p => ({ num: p.num, title: p.title, status: p.status })),
  };
}

/**
 * Calculate phase complexity score
 * Ported from complexity-utils.sh calculate_phase_complexity()
 */
async function calculatePhaseComplexity(planPath, phaseNum) {
  if (!existsSync(planPath)) {
    throw new Error(`Plan file not found: ${planPath}`);
  }

  const content = await fs.readFile(planPath, 'utf-8');
  const lines = content.split('\n');

  // Find phase boundaries
  const phaseStart = lines.findIndex(line =>
    line.match(new RegExp(`^###\\s+Phase\\s+${phaseNum}:`))
  );

  if (phaseStart === -1) {
    throw new Error(`Phase ${phaseNum} not found in plan file`);
  }

  // Find next phase or end of file
  let phaseEnd = lines.length;
  for (let i = phaseStart + 1; i < lines.length; i++) {
    if (lines[i].match(/^###\s+Phase\s+\d+:/)) {
      phaseEnd = i;
      break;
    }
  }

  const phaseContent = lines.slice(phaseStart, phaseEnd).join('\n');

  // Count tasks (- [ ] checkboxes)
  const taskCount = (phaseContent.match(/^- \[ \]/gm) || []).length;

  // Count file references (.sh, .md, .lua, .py, .js, .ts files)
  const fileCount = (phaseContent.match(/\.\/(.*\.(sh|md|lua|py|js|ts))/g) || []).length;

  // Count code blocks (```)
  const codeBlockMarkers = (phaseContent.match(/^```/gm) || []).length;
  const codeBlocks = Math.floor(codeBlockMarkers / 2); // Each block has opening and closing

  // Check for duration indicators
  const hasDuration = /hour|minute|duration/i.test(phaseContent) ? 1 : 0;

  // Calculate weighted score
  // Base: task_count * 0.5
  // Files: file_count * 0.2
  // Code blocks: code_blocks * 0.3
  // Duration mentioned: +1.0
  const score = (taskCount * 0.5) + (fileCount * 0.2) + (codeBlocks * 0.3) + hasDuration;

  return {
    phase_num: phaseNum,
    complexity_score: parseFloat(score.toFixed(1)),
    factors: {
      task_count: taskCount,
      file_count: fileCount,
      code_blocks: codeBlocks,
      has_duration: hasDuration === 1,
    },
  };
}

/**
 * Calculate plan complexity score
 * Ported from complexity-utils.sh calculate_plan_complexity()
 */
function calculatePlanComplexity(taskCount, phaseCount, estimatedHours, dependencyComplexity) {
  // Default values
  taskCount = taskCount || 0;
  phaseCount = phaseCount || 0;
  estimatedHours = estimatedHours || 0;
  dependencyComplexity = dependencyComplexity || 0;

  // Weighted formula:
  // - Tasks: 0.3 per task
  // - Phases: 1.0 per phase
  // - Hours: 0.1 per hour
  // - Dependencies: raw score (0-10)
  const score = (taskCount * 0.3) + (phaseCount * 1.0) + (estimatedHours * 0.1) + dependencyComplexity;

  return {
    complexity_score: parseFloat(score.toFixed(1)),
    factors: {
      task_count: taskCount,
      phase_count: phaseCount,
      estimated_hours: estimatedHours,
      dependency_complexity: dependencyComplexity,
    },
  };
}

/**
 * Get tier recommendation based on complexity score
 */
function getTierRecommendation(complexityScore) {
  let tier, description, structure_level;

  if (complexityScore < 50) {
    tier = 1;
    description = 'Simple (inline phases, no expansion)';
    structure_level = 0;
  } else if (complexityScore < 200) {
    tier = 2;
    description = 'Moderate (may expand to Level 1 if needed)';
    structure_level = 0; // Start at 0, expand if warranted
  } else {
    tier = 3;
    description = 'Complex (may expand to Level 1 or Level 2)';
    structure_level = 0; // Start at 0, expand progressively
  }

  return {
    tier,
    description,
    structure_level,
    complexity_score: complexityScore,
    thresholds: {
      tier_1_max: 49.9,
      tier_2_min: 50.0,
      tier_2_max: 199.9,
      tier_3_min: 200.0,
    },
  };
}

/**
 * Validate plan metadata compliance
 * Based on .claude/docs/reference/standards/plan-metadata-standard.md
 */
async function validatePlanMetadata(planPath) {
  if (!existsSync(planPath)) {
    throw new Error(`Plan file not found: ${planPath}`);
  }

  const content = await fs.readFile(planPath, 'utf-8');
  const lines = content.split('\n');

  const errors = [];
  const warnings = [];

  // Extract metadata section (between ## Metadata and next ##)
  let metadataStart = -1;
  let metadataEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^##\s+Metadata/i)) {
      metadataStart = i;
    } else if (metadataStart !== -1 && lines[i].match(/^##\s+/)) {
      metadataEnd = i;
      break;
    }
  }

  if (metadataStart === -1) {
    errors.push('Missing ## Metadata section');
    return { valid: false, errors, warnings };
  }

  const metadataSection = lines.slice(metadataStart, metadataEnd !== -1 ? metadataEnd : lines.length);

  // Required fields validation
  const requiredFields = {
    Date: /^-\s+\*\*Date\*\*:\s+(\d{4}-\d{2}-\d{2})/,
    Feature: /^-\s+\*\*Feature\*\*:\s+(.{10,})/,
    Status: /^-\s+\*\*Status\*\*:\s+\[(NOT STARTED|IN PROGRESS|COMPLETE|BLOCKED)\]/,
    'Estimated Hours': /^-\s+\*\*Estimated Hours\*\*:\s+(\d+)-(\d+)\s+hours/,
    'Standards File': /^-\s+\*\*Standards File\*\*:\s+(\/.*)/,
    'Research Reports': /^-\s+\*\*Research Reports\*\*:/,
  };

  for (const [field, pattern] of Object.entries(requiredFields)) {
    const found = metadataSection.some(line => pattern.test(line));
    if (!found) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate Date format
  const dateLine = metadataSection.find(line => line.match(requiredFields.Date));
  if (dateLine) {
    const match = dateLine.match(requiredFields.Date);
    const dateStr = match[1];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format: ${dateStr} (expected YYYY-MM-DD)`);
    }
  }

  // Validate Feature length (50-100 chars recommended)
  const featureLine = metadataSection.find(line => line.match(requiredFields.Feature));
  if (featureLine) {
    const match = featureLine.match(/^-\s+\*\*Feature\*\*:\s+(.+)/);
    const feature = match[1];
    if (feature.length < 10) {
      warnings.push(`Feature description too short: ${feature.length} chars (recommended 50-100)`);
    } else if (feature.length > 150) {
      warnings.push(`Feature description too long: ${feature.length} chars (recommended 50-100)`);
    }
  }

  // Validate Estimated Hours format
  const hoursLine = metadataSection.find(line => line.match(requiredFields['Estimated Hours']));
  if (hoursLine) {
    const match = hoursLine.match(/^-\s+\*\*Estimated Hours\*\*:\s+(\d+)-(\d+)\s+hours/);
    if (match) {
      const low = parseInt(match[1]);
      const high = parseInt(match[2]);
      if (low >= high) {
        errors.push(`Invalid hour range: ${low}-${high} (low must be < high)`);
      }
    }
  }

  // Validate Research Reports (if not "none", must have list items)
  const reportsLine = metadataSection.find(line => line.match(requiredFields['Research Reports']));
  if (reportsLine) {
    const reportLineIndex = metadataSection.indexOf(reportsLine);
    const nextLine = metadataSection[reportLineIndex + 1];
    if (nextLine && !nextLine.includes('none') && !nextLine.match(/^\s+-\s+\[/)) {
      warnings.push('Research Reports should list reports as markdown links or "none"');
    }
  }

  // Check for phase status markers
  const phasePattern = /^###\s+Phase\s+\d+:\s+.+?\s+\[(NOT STARTED|IN PROGRESS|COMPLETE|BLOCKED)\]/;
  const phasesWithMarkers = lines.filter(line => phasePattern.test(line));
  const allPhases = lines.filter(line => /^###\s+Phase\s+\d+:/.test(line));

  if (phasesWithMarkers.length < allPhases.length) {
    errors.push(`${allPhases.length - phasesWithMarkers.length} phase(s) missing status markers`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata_section_found: true,
    required_fields_count: Object.keys(requiredFields).length,
    found_fields_count: Object.keys(requiredFields).filter(field =>
      metadataSection.some(line => requiredFields[field].test(line))
    ).length,
  };
}

// Create server instance
const server = new Server(
  {
    name: 'plan-manager',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'mark_phase_complete':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await updatePhaseStatus(args.plan_path, args.phase_num, 'COMPLETE'),
                null,
                2
              ),
            },
          ],
        };

      case 'mark_phase_in_progress':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await updatePhaseStatus(args.plan_path, args.phase_num, 'IN PROGRESS'),
                null,
                2
              ),
            },
          ],
        };

      case 'verify_phase_complete':
        const status = await getPhaseStatus(args.plan_path, args.phase_num);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  phase_num: status.phase_num,
                  title: status.title,
                  is_complete: status.status === 'COMPLETE',
                  current_status: status.status,
                },
                null,
                2
              ),
            },
          ],
        };

      case 'check_all_phases_complete':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await checkAllPhasesComplete(args.plan_path),
                null,
                2
              ),
            },
          ],
        };

      case 'get_phase_status':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await getPhaseStatus(args.plan_path, args.phase_num),
                null,
                2
              ),
            },
          ],
        };

      case 'validate_plan_metadata':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await validatePlanMetadata(args.plan_path),
                null,
                2
              ),
            },
          ],
        };

      case 'calculate_phase_complexity':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await calculatePhaseComplexity(args.plan_path, args.phase_num),
                null,
                2
              ),
            },
          ],
        };

      case 'calculate_plan_complexity':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                calculatePlanComplexity(
                  args.task_count,
                  args.phase_count,
                  args.estimated_hours,
                  args.dependency_complexity
                ),
                null,
                2
              ),
            },
          ],
        };

      case 'tier_recommendation':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                getTierRecommendation(args.complexity_score),
                null,
                2
              ),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error.message,
              tool: name,
              arguments: args,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Plan Manager MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
