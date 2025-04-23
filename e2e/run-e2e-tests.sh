#!/bin/bash

# Script to run Playwright E2E tests with various options

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================="
echo -e "🎭 Running Playwright E2E Tests"
echo -e "===========================================${NC}"

# Parse arguments
SHOW_UI=false
DEBUG=false
ONLY_FILE=""
ONLY_TEST=""
UPDATE_SNAPSHOTS=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --ui) SHOW_UI=true ;;
        --debug) DEBUG=true ;;
        --file) ONLY_FILE="$2"; shift ;;
        --test) ONLY_TEST="$2"; shift ;;
        --update-snapshots) UPDATE_SNAPSHOTS=true ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
    shift
done

# Construct Playwright command
COMMAND="npx playwright test"

if [ "$SHOW_UI" = true ]; then
    COMMAND="$COMMAND --ui"
fi

if [ "$DEBUG" = true ]; then
    COMMAND="$COMMAND --debug"
fi

if [ ! -z "$ONLY_FILE" ]; then
    COMMAND="$COMMAND $ONLY_FILE"
fi

if [ ! -z "$ONLY_TEST" ]; then
    COMMAND="$COMMAND -g \"$ONLY_TEST\""
fi

if [ "$UPDATE_SNAPSHOTS" = true ]; then
    COMMAND="$COMMAND --update-snapshots"
fi

# Run the command
echo -e "${YELLOW}Running command: ${COMMAND}${NC}"
eval $COMMAND

# Check exit status
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ E2E tests completed successfully!${NC}"
else
    echo -e "${RED}❌ E2E tests failed with exit code $EXIT_CODE${NC}"
    echo -e "${YELLOW}Run with --ui flag to debug test failures${NC}"
fi

exit $EXIT_CODE 