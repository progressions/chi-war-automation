# CircleCI Setup for Chi War

## Overview
Both shot-server (Rails backend) and shot-client-next (Next.js frontend) have CircleCI configurations for continuous integration.

## Projects in CircleCI
- **Chi War Frontend**: `circleci/UfnwQBL6SKkhCaAww3iFTJ/WYudLSzmxxDfvqCNX6vTkK`
- **Chi War Backend**: `circleci/UfnwQBL6SKkhCaAww3iFTJ/JR4wdy7ntPzKsU7CH9Pqh`

## Frontend CI Pipeline (shot-client-next)
Located in `shot-client-next/.circleci/config.yml`

### Jobs
1. **Test Job**
   - Node version: 20.11.0
   - TypeScript type checking
   - ESLint linting
   - Test suite execution
   - Coverage reporting

2. **Build Job**
   - Production build verification
   - Build artifact storage

### Workflow
- Tests run first
- Build only runs after tests pass

## Backend CI Pipeline (shot-server)
Located in `shot-server/.circleci/config.yml`

### Jobs
1. **Test Job**
   - Ruby version: 3.2.2
   - PostgreSQL 15 database
   - Redis 7.0 cache
   - RSpec test suite
   - Test credentials setup

### Required Environment Variables
For the backend to run tests properly in CircleCI:
- `RAILS_TEST_KEY` - 32-character key for test credentials

## CircleCI MCP Integration
The CircleCI MCP server provides programmatic access to:
- Monitor pipeline status
- Analyze test results and failures
- Find flaky tests
- Trigger pipeline runs
- Validate configuration files
- Download usage metrics

### Common Commands
```bash
# List followed projects
mcp circleci list-projects

# Check latest pipeline status
mcp circleci status --project <projectSlug> --branch <branch>

# Get test results
mcp circleci test-results --project <projectSlug>

# Find flaky tests
mcp circleci flaky-tests --project <projectSlug>

# Run a pipeline
mcp circleci run-pipeline --project <projectSlug> --branch <branch>
```

## Setup Instructions

### For New Pipelines
1. Ensure `.circleci/config.yml` exists in each repository
2. Connect repositories to CircleCI via GitHub integration
3. Set required environment variables in CircleCI project settings
4. Test pipeline execution

### For Rails Backend
1. Add `RAILS_TEST_KEY` to CircleCI environment variables
2. Ensure test database credentials are properly configured
3. Verify PostgreSQL and Redis services start correctly

### For Next.js Frontend  
1. Ensure `npm run test:ci` script exists in package.json
2. Configure test coverage reporting
3. Verify TypeScript and linting checks pass

## Troubleshooting

### No Pipelines Found
- Check that repositories are connected to CircleCI
- Verify branch names match (main vs master)
- Ensure initial commits have been pushed to trigger pipelines

### Test Failures
- Review test logs in CircleCI dashboard
- Check environment variable configuration
- Verify service dependencies are running

### Build Issues
- Check Node/Ruby version compatibility
- Review dependency installation logs
- Ensure build scripts are properly configured