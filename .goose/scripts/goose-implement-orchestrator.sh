#!/usr/bin/env bash
#
# Goose Implementation Orchestrator
# External iteration loop for large plan implementation
#
# Usage: bash goose-implement-orchestrator.sh <plan_file> [--max-iterations=N]

set -e  # Fail-fast
set -u  # Undefined variable error
set -o pipefail  # Pipeline error propagation

# === ARGUMENT PARSING ===
PLAN_FILE="${1:-}"
MAX_ITERATIONS=5  # Default
CURRENT_ITERATION=1
CONTINUATION_CONTEXT=""

# Parse optional flags
shift || true
while [ $# -gt 0 ]; do
  case "$1" in
    --max-iterations=*)
      MAX_ITERATIONS="${1#*=}"
      ;;
    --max-iterations)
      MAX_ITERATIONS="$2"
      shift
      ;;
    *)
      echo "WARNING: Unknown argument: $1" >&2
      ;;
  esac
  shift || break
done

# Validate plan file
if [ -z "$PLAN_FILE" ]; then
  echo "ERROR: No plan file specified" >&2
  echo "Usage: bash goose-implement-orchestrator.sh <plan_file> [--max-iterations=N]" >&2
  exit 1
fi

if [ ! -f "$PLAN_FILE" ]; then
  echo "ERROR: Plan file not found: $PLAN_FILE" >&2
  exit 1
fi

# Extract topic path
TOPIC_PATH=$(dirname $(dirname "$PLAN_FILE"))

echo "═══════════════════════════════════════════════════════════════════"
echo "🚀 GOOSE IMPLEMENTATION ORCHESTRATOR"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Plan File: $PLAN_FILE"
echo "Topic Path: $TOPIC_PATH"
echo "Max Iterations: $MAX_ITERATIONS"
echo ""

# === ITERATION LOOP ===
while [ $CURRENT_ITERATION -le $MAX_ITERATIONS ]; do
  echo "───────────────────────────────────────────────────────────────────"
  echo "📋 Iteration $CURRENT_ITERATION / $MAX_ITERATIONS"
  echo "───────────────────────────────────────────────────────────────────"
  echo ""

  # Build goose command
  GOOSE_CMD="goose run --recipe .goose/recipes/implement.yaml"
  GOOSE_CMD="$GOOSE_CMD --params plan_file=\"$PLAN_FILE\""
  GOOSE_CMD="$GOOSE_CMD --params iteration=$CURRENT_ITERATION"
  GOOSE_CMD="$GOOSE_CMD --params max_iterations=$MAX_ITERATIONS"

  if [ -n "$CONTINUATION_CONTEXT" ]; then
    GOOSE_CMD="$GOOSE_CMD --params continuation_context=\"$CONTINUATION_CONTEXT\""
  fi

  # Execute goose recipe
  echo "Executing: $GOOSE_CMD"
  echo ""

  # Capture output
  OUTPUT_FILE="/tmp/goose_implement_iter_${CURRENT_ITERATION}_$$.txt"
  if eval "$GOOSE_CMD" > "$OUTPUT_FILE" 2>&1; then
    cat "$OUTPUT_FILE"
    GOOSE_EXIT=0
  else
    cat "$OUTPUT_FILE"
    GOOSE_EXIT=$?
    echo ""
    echo "ERROR: Goose recipe failed with exit code $GOOSE_EXIT" >&2
    rm -f "$OUTPUT_FILE"
    exit $GOOSE_EXIT
  fi

  # Parse output for continuation signal
  REQUIRES_CONTINUATION=$(grep "^CONTINUATION_REQUIRED:" "$OUTPUT_FILE" | head -1 || echo "")
  WORKFLOW_COMPLETE=$(grep "^WORKFLOW_COMPLETE:" "$OUTPUT_FILE" | head -1 || echo "")

  # Clean up output file
  rm -f "$OUTPUT_FILE"

  # Check for completion
  if [ -n "$WORKFLOW_COMPLETE" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "✅ IMPLEMENTATION COMPLETE"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "$WORKFLOW_COMPLETE"
    echo ""
    echo "Total iterations used: $CURRENT_ITERATION / $MAX_ITERATIONS"
    echo ""
    exit 0
  fi

  # Check for continuation requirement
  if [ -n "$REQUIRES_CONTINUATION" ]; then
    echo ""
    echo "⏸️  Context exhaustion detected - continuation required"
    echo ""

    # Extract continuation context from checkpoint
    CHECKPOINT_FILE="$TOPIC_PATH/.goose/checkpoints/implement_iter_$((CURRENT_ITERATION + 1)).json"
    if [ -f "$CHECKPOINT_FILE" ]; then
      CONTINUATION_CONTEXT=$(jq -r '.continuation_context // ""' "$CHECKPOINT_FILE")
      echo "Continuation context: $CONTINUATION_CONTEXT"
    else
      echo "WARNING: Checkpoint file not found: $CHECKPOINT_FILE" >&2
      echo "Attempting to continue without continuation context" >&2
      CONTINUATION_CONTEXT=""
    fi

    # Increment iteration
    CURRENT_ITERATION=$((CURRENT_ITERATION + 1))

    # Check if max iterations reached
    if [ $CURRENT_ITERATION -gt $MAX_ITERATIONS ]; then
      echo ""
      echo "═══════════════════════════════════════════════════════════════════"
      echo "⚠️  MAX ITERATIONS REACHED"
      echo "═══════════════════════════════════════════════════════════════════"
      echo ""
      echo "Implementation halted after $MAX_ITERATIONS iterations"
      echo "Work may still be incomplete"
      echo ""
      echo "To continue, increase --max-iterations or run:"
      echo "  bash $0 \"$PLAN_FILE\" --max-iterations=$((MAX_ITERATIONS + 5))"
      echo ""
      exit 1
    fi

    # Continue to next iteration
    echo ""
    echo "Continuing to iteration $CURRENT_ITERATION..."
    echo ""
    sleep 2  # Brief pause before next iteration
    continue
  else
    # No continuation signal, but also no completion signal
    # This is unexpected - treat as error
    echo ""
    echo "ERROR: Unexpected orchestrator state" >&2
    echo "  No WORKFLOW_COMPLETE or CONTINUATION_REQUIRED signal found" >&2
    echo "  This indicates a recipe implementation issue" >&2
    echo ""
    exit 1
  fi
done

# Should never reach here due to loop exit conditions above
echo "ERROR: Orchestrator loop exited unexpectedly" >&2
exit 1
