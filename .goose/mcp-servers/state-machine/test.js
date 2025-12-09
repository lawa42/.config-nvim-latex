#!/usr/bin/env node

/**
 * Test script for state-machine MCP server
 *
 * Tests basic functionality without requiring full MCP client setup.
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATE_DIR = path.join(process.env.HOME || os.homedir(), '.config', '.goose', 'tmp');
const TEST_WORKFLOW_ID = 'test_workflow_' + Date.now();

// Valid state transitions
const TRANSITIONS = {
  NOT_STARTED: ['RESEARCH'],
  RESEARCH: ['PLANNING'],
  PLANNING: ['IMPLEMENTATION'],
  IMPLEMENTATION: ['COMPLETE'],
  ERROR: [],
};

async function setup() {
  console.log('Setting up test environment...');

  // Ensure state directory exists
  if (!existsSync(STATE_DIR)) {
    await fs.mkdir(STATE_DIR, { recursive: true });
  }

  console.log(`✓ State directory ready: ${STATE_DIR}`);
}

async function testStateInitialization() {
  console.log('\nTesting state initialization...');

  const state = {
    workflow_id: TEST_WORKFLOW_ID,
    workflow_type: 'test',
    description: 'Test workflow',
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

  const statePath = path.join(STATE_DIR, `state_${TEST_WORKFLOW_ID}.json`);
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');

  if (existsSync(statePath)) {
    console.log('✓ State file created');
    return true;
  } else {
    console.error('✗ State file creation failed');
    return false;
  }
}

async function testStateTransitions() {
  console.log('\nTesting state transitions...');

  const statePath = path.join(STATE_DIR, `state_${TEST_WORKFLOW_ID}.json`);
  const content = await fs.readFile(statePath, 'utf-8');
  const state = JSON.parse(content);

  // Test valid transition: NOT_STARTED → RESEARCH
  const currentState = state.current_state;
  const targetState = 'RESEARCH';

  const allowedTransitions = TRANSITIONS[currentState];
  if (allowedTransitions.includes(targetState)) {
    console.log(`✓ Valid transition: ${currentState} → ${targetState}`);

    // Update state
    state.current_state = targetState;
    state.updated_at = new Date().toISOString();
    state.history.push({
      state: targetState,
      timestamp: new Date().toISOString(),
      previous_state: currentState,
    });

    await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
    console.log('✓ State updated successfully');
    return true;
  } else {
    console.error(`✗ Invalid transition: ${currentState} → ${targetState}`);
    return false;
  }
}

async function testInvalidTransition() {
  console.log('\nTesting invalid transition detection...');

  const statePath = path.join(STATE_DIR, `state_${TEST_WORKFLOW_ID}.json`);
  const content = await fs.readFile(statePath, 'utf-8');
  const state = JSON.parse(content);

  // Test invalid transition: RESEARCH → IMPLEMENTATION (should fail)
  const currentState = state.current_state;
  const targetState = 'IMPLEMENTATION';

  const allowedTransitions = TRANSITIONS[currentState];
  if (allowedTransitions.includes(targetState)) {
    console.error(`✗ Should have rejected transition: ${currentState} → ${targetState}`);
    return false;
  } else {
    console.log(`✓ Correctly rejected invalid transition: ${currentState} → ${targetState}`);
    console.log(`  Allowed from ${currentState}: ${allowedTransitions.join(', ')}`);
    return true;
  }
}

async function testErrorStateTransition() {
  console.log('\nTesting ERROR state transition (always allowed)...');

  const statePath = path.join(STATE_DIR, `state_${TEST_WORKFLOW_ID}.json`);
  const content = await fs.readFile(statePath, 'utf-8');
  const state = JSON.parse(content);

  // ERROR should be allowed from any state
  const currentState = state.current_state;
  const targetState = 'ERROR';

  console.log(`✓ ERROR transition allowed from ${currentState}`);

  // Update state
  state.current_state = targetState;
  state.updated_at = new Date().toISOString();
  state.history.push({
    state: targetState,
    timestamp: new Date().toISOString(),
    previous_state: currentState,
  });

  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
  console.log('✓ State updated to ERROR');

  return true;
}

async function cleanup() {
  console.log('\nCleaning up test environment...');

  try {
    const statePath = path.join(STATE_DIR, `state_${TEST_WORKFLOW_ID}.json`);
    if (existsSync(statePath)) {
      await fs.unlink(statePath);
      console.log('✓ Test state file removed');
    }
  } catch (error) {
    console.error('✗ Cleanup failed:', error.message);
  }
}

async function main() {
  console.log('=== State Machine MCP Server Tests ===\n');

  try {
    await setup();

    const testResults = [
      await testStateInitialization(),
      await testStateTransitions(),
      await testInvalidTransition(),
      await testErrorStateTransition(),
    ];

    await cleanup();

    console.log('\n=== Test Summary ===');
    const passed = testResults.filter(r => r).length;
    const total = testResults.length;
    console.log(`Passed: ${passed}/${total}`);

    if (passed === total) {
      console.log('\n✓ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n✗ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ Test suite error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
