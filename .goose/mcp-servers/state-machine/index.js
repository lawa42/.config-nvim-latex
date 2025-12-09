#!/usr/bin/env node

/**
 * State Machine MCP Server
 *
 * Provides tools for workflow state management and validation.
 * Ported from Claude Code's workflow-state-machine.sh library.
 *
 * Valid states and transitions:
 * - NOT_STARTED → RESEARCH
 * - RESEARCH → PLANNING
 * - PLANNING → IMPLEMENTATION
 * - IMPLEMENTATION → COMPLETE
 * - Any state → ERROR
 *
 * Tools:
 * - sm_init: Initialize state machine for a workflow
 * - sm_transition: Transition to a new state (validates transition)
 * - sm_current_state: Get current state
 * - sm_validate_transition: Check if transition is valid without executing
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

// Valid state transitions
const TRANSITIONS = {
  NOT_STARTED: ['RESEARCH'],
  RESEARCH: ['PLANNING'],
  PLANNING: ['IMPLEMENTATION'],
  IMPLEMENTATION: ['COMPLETE'],
  ERROR: [], // Terminal state
};

// All states can transition to ERROR
const ALL_STATES = ['NOT_STARTED', 'RESEARCH', 'PLANNING', 'IMPLEMENTATION', 'COMPLETE', 'ERROR'];

// State file directory (use .goose/tmp for state persistence)
const STATE_DIR = path.join(process.env.HOME || os.homedir(), '.config', '.goose', 'tmp');

// Tool definitions
const TOOLS = [
  {
    name: 'sm_init',
    description: 'Initialize state machine for a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: {
          type: 'string',
          description: 'Unique workflow identifier',
        },
        workflow_type: {
          type: 'string',
          description: 'Type of workflow (research, plan, implement, etc.)',
        },
        description: {
          type: 'string',
          description: 'Human-readable workflow description',
        },
      },
      required: ['workflow_id', 'workflow_type'],
    },
  },
  {
    name: 'sm_transition',
    description: 'Transition to a new state (validates transition)',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: {
          type: 'string',
          description: 'Workflow identifier',
        },
        target_state: {
          type: 'string',
          description: 'Target state to transition to',
          enum: ALL_STATES,
        },
      },
      required: ['workflow_id', 'target_state'],
    },
  },
  {
    name: 'sm_current_state',
    description: 'Get current state of a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: {
          type: 'string',
          description: 'Workflow identifier',
        },
      },
      required: ['workflow_id'],
    },
  },
  {
    name: 'sm_validate_transition',
    description: 'Check if a state transition is valid without executing it',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: {
          type: 'string',
          description: 'Workflow identifier',
        },
        target_state: {
          type: 'string',
          description: 'Target state to validate',
          enum: ALL_STATES,
        },
      },
      required: ['workflow_id', 'target_state'],
    },
  },
];

/**
 * Get state file path for a workflow
 */
function getStateFilePath(workflowId) {
  return path.join(STATE_DIR, `state_${workflowId}.json`);
}

/**
 * Ensure state directory exists
 */
async function ensureStateDir() {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore
  }
}

/**
 * Load state for a workflow
 */
async function loadState(workflowId) {
  const statePath = getStateFilePath(workflowId);

  if (!existsSync(statePath)) {
    throw new Error(`Workflow state not found: ${workflowId}`);
  }

  const content = await fs.readFile(statePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save state for a workflow
 */
async function saveState(workflowId, state) {
  await ensureStateDir();
  const statePath = getStateFilePath(workflowId);
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Initialize state machine
 */
async function initStateMachine(workflowId, workflowType, description) {
  const state = {
    workflow_id: workflowId,
    workflow_type: workflowType,
    description: description || '',
    current_state: 'NOT_STARTED',
    history: [
      {
        state: 'NOT_STARTED',
        timestamp: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveState(workflowId, state);

  return {
    success: true,
    workflow_id: workflowId,
    initial_state: 'NOT_STARTED',
    state_file: getStateFilePath(workflowId),
  };
}

/**
 * Validate state transition
 */
function validateTransition(currentState, targetState) {
  // Allow transition to ERROR from any state
  if (targetState === 'ERROR') {
    return { valid: true, reason: 'ERROR is always allowed' };
  }

  // Check if transition is defined
  const allowedTransitions = TRANSITIONS[currentState];
  if (!allowedTransitions) {
    return {
      valid: false,
      reason: `Unknown current state: ${currentState}`,
    };
  }

  // Check if target state is allowed
  if (allowedTransitions.includes(targetState)) {
    return { valid: true, reason: 'Valid transition' };
  }

  return {
    valid: false,
    reason: `Invalid transition from ${currentState} to ${targetState}. Allowed: ${allowedTransitions.join(', ')}`,
  };
}

/**
 * Transition to a new state
 */
async function transitionState(workflowId, targetState) {
  const state = await loadState(workflowId);

  // Validate transition
  const validation = validateTransition(state.current_state, targetState);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  // Update state
  const oldState = state.current_state;
  state.current_state = targetState;
  state.updated_at = new Date().toISOString();
  state.history.push({
    state: targetState,
    timestamp: new Date().toISOString(),
    previous_state: oldState,
  });

  await saveState(workflowId, state);

  return {
    success: true,
    workflow_id: workflowId,
    previous_state: oldState,
    current_state: targetState,
    timestamp: state.updated_at,
  };
}

/**
 * Get current state
 */
async function getCurrentState(workflowId) {
  const state = await loadState(workflowId);

  return {
    workflow_id: workflowId,
    workflow_type: state.workflow_type,
    description: state.description,
    current_state: state.current_state,
    created_at: state.created_at,
    updated_at: state.updated_at,
    history_count: state.history.length,
  };
}

/**
 * Validate transition without executing
 */
async function checkTransition(workflowId, targetState) {
  const state = await loadState(workflowId);
  const validation = validateTransition(state.current_state, targetState);

  return {
    workflow_id: workflowId,
    current_state: state.current_state,
    target_state: targetState,
    valid: validation.valid,
    reason: validation.reason,
  };
}

// Create server instance
const server = new Server(
  {
    name: 'state-machine',
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
      case 'sm_init':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await initStateMachine(args.workflow_id, args.workflow_type, args.description),
                null,
                2
              ),
            },
          ],
        };

      case 'sm_transition':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await transitionState(args.workflow_id, args.target_state),
                null,
                2
              ),
            },
          ],
        };

      case 'sm_current_state':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await getCurrentState(args.workflow_id),
                null,
                2
              ),
            },
          ],
        };

      case 'sm_validate_transition':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await checkTransition(args.workflow_id, args.target_state),
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
  console.error('State Machine MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
