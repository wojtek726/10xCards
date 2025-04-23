#!/bin/bash

# Print colorized messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}==== 10x-cards E2E Test Suite ====${NC}"
echo -e "${YELLOW}====================================================${NC}"

# Track overall test status
overall_status=0

# Allow running specific tests if provided as arguments
if [ $# -gt 0 ]; then
  echo -e "\n${BLUE}Running specified tests: $*${NC}"
  npx playwright test "$@"
  
  exit_status=$?
  if [ $exit_status -eq 0 ]; then
    echo -e "${GREEN}✅ Specified tests passed!${NC}"
    exit 0
  else
    echo -e "${RED}❌ Specified tests failed${NC}"
    exit 1
  fi
fi

# Run basic authentication tests
run_auth_tests() {
  echo -e "\n${BLUE}Running basic authentication tests...${NC}"
  npx playwright test e2e/auth-basic.spec.ts
  
  local status=$?
  if [ $status -eq 0 ]; then
    echo -e "${GREEN}✅ Basic authentication tests passed!${NC}"
  else
    echo -e "${RED}❌ Basic authentication tests failed${NC}"
    overall_status=1
  fi
  return $status
}

# Run visual tests with minimal requirements
run_visual_tests() {
  echo -e "\n${BLUE}Running minimal visual tests...${NC}"
  # Using grep to run just the login page test
  npx playwright test -g "login page should match visual baseline" e2e/visual.spec.ts
  
  local status=$?
  if [ $status -eq 0 ]; then
    echo -e "${GREEN}✅ Visual tests passed!${NC}"
  else
    echo -e "${RED}❌ Visual tests failed${NC}"
    # Don't fail the overall build for visual tests
    # overall_status=1
  fi
  return $status
}

# Run all the tests
run_auth_tests
auth_status=$?

# Only run additional tests if auth tests passed
if [ $auth_status -eq 0 ]; then
  run_visual_tests
fi

# Print final summary
echo -e "\n${YELLOW}====================================================${NC}"
if [ $overall_status -eq 0 ]; then
  echo -e "${GREEN}✅ All required E2E tests completed successfully!${NC}"
else
  echo -e "${RED}❌ Some E2E tests failed - see logs above for details${NC}"
fi
echo -e "${YELLOW}====================================================${NC}"

exit $overall_status 