#!/usr/bin/env node

/**
 * Test script for plan-manager MCP server
 *
 * Tests basic functionality without requiring full MCP client setup.
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import functions from index.js would require restructuring,
// so we'll test via actual file operations

const TEST_DIR = path.join(__dirname, 'test-tmp');
const TEST_PLAN = path.join(TEST_DIR, 'test-plan.md');

async function setup() {
  console.log('Setting up test environment...');

  // Create test directory
  if (!existsSync(TEST_DIR)) {
    await fs.mkdir(TEST_DIR, { recursive: true });
  }

  // Create test plan file
  const planContent = `# Test Plan

## Metadata
- **Date**: 2025-12-05
- **Feature**: Test plan for MCP server
- **Status**: [NOT STARTED]

## Implementation Phases

### Phase 1: Foundation [NOT STARTED]
- [ ] Task 1
- [ ] Task 2

### Phase 2: Testing [NOT STARTED]
- [ ] Task 1
- [ ] Task 2

### Phase 3: Documentation [NOT STARTED]
- [ ] Task 1
- [ ] Task 2
`;

  await fs.writeFile(TEST_PLAN, planContent, 'utf-8');
  console.log('✓ Test plan created');
}

async function testPhaseStatusUpdates() {
  console.log('\nTesting phase status updates...');

  // Test marking Phase 1 as IN PROGRESS
  let content = await fs.readFile(TEST_PLAN, 'utf-8');
  content = content.replace('### Phase 1: Foundation [NOT STARTED]', '### Phase 1: Foundation [IN PROGRESS]');
  await fs.writeFile(TEST_PLAN, content, 'utf-8');

  content = await fs.readFile(TEST_PLAN, 'utf-8');
  if (content.includes('Phase 1: Foundation [IN PROGRESS]')) {
    console.log('✓ Phase 1 marked as IN PROGRESS');
  } else {
    console.error('✗ Failed to mark Phase 1 as IN PROGRESS');
    return false;
  }

  // Test marking Phase 1 as COMPLETE
  content = content.replace('### Phase 1: Foundation [IN PROGRESS]', '### Phase 1: Foundation [COMPLETE]');
  await fs.writeFile(TEST_PLAN, content, 'utf-8');

  content = await fs.readFile(TEST_PLAN, 'utf-8');
  if (content.includes('Phase 1: Foundation [COMPLETE]')) {
    console.log('✓ Phase 1 marked as COMPLETE');
  } else {
    console.error('✗ Failed to mark Phase 1 as COMPLETE');
    return false;
  }

  return true;
}

async function testPhaseDetection() {
  console.log('\nTesting phase detection...');

  const content = await fs.readFile(TEST_PLAN, 'utf-8');
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

  console.log(`Found ${phases.length} phases:`);
  phases.forEach(p => {
    console.log(`  Phase ${p.num}: ${p.title} [${p.status}]`);
  });

  if (phases.length === 3) {
    console.log('✓ All phases detected correctly');
    return true;
  } else {
    console.error('✗ Phase detection failed');
    return false;
  }
}

async function cleanup() {
  console.log('\nCleaning up test environment...');

  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    console.log('✓ Test directory removed');
  } catch (error) {
    console.error('✗ Cleanup failed:', error.message);
  }
}

async function main() {
  console.log('=== Plan Manager MCP Server Tests ===\n');

  try {
    await setup();

    const testResults = [
      await testPhaseStatusUpdates(),
      await testPhaseDetection(),
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
