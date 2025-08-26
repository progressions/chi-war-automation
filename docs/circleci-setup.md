# CircleCI Setup Guide

## Overview
This guide walks you through setting up CircleCI to automatically run tests on your pull requests for both the frontend (shot-client-next) and backend (shot-server) repositories.

## Prerequisites
- CircleCI account (which you already have)
- GitHub repositories for your projects
- `.circleci/config.yml` files in each repository (already created)

## Step 1: Connect CircleCI to GitHub

1. **Log in to CircleCI** at https://app.circleci.com/
2. Click on **"Projects"** in the left sidebar
3. You should see your GitHub organizations/repositories listed

## Step 2: Set Up shot-client-next (Frontend)

### Add the Project to CircleCI:
1. Find `progressions/shot-client-next` in your projects list
2. Click **"Set Up Project"**
3. CircleCI will detect the `.circleci/config.yml` file
4. Click **"Use Existing Config"**
5. Click **"Start Building"**

### Configure Environment Variables (if needed):
1. Go to **Project Settings** → **Environment Variables**
2. Add any necessary environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_WS_URL=ws://localhost:3000/cable
   ```

## Step 3: Set Up shot-server (Backend)

### Add the Project to CircleCI:
1. Find `progressions/shot-server` in your projects list
2. Click **"Set Up Project"**
3. Click **"Use Existing Config"**
4. Click **"Start Building"**

### Configure Environment Variables:
1. Go to **Project Settings** → **Environment Variables**
2. Add the following required environment variables:
   ```
   DATABASE_URL=postgresql://circleci@localhost/shot_server_test
   RAILS_MASTER_KEY=(your Rails master key from config/master.key)
   SECRET_KEY_BASE=(generate with: rails secret)
   JWT_SECRET_KEY=(generate a secure random string)
   REDIS_URL=redis://localhost:6379
   ```

### Important: Before First Run
You need to install the RSpec JUnit formatter gem:
```bash
cd shot-server
bundle add rspec_junit_formatter --group test
bundle install
git add Gemfile Gemfile.lock
git commit -m "Add rspec_junit_formatter for CircleCI"
git push
```

## Step 4: Enable GitHub Status Checks

### For Each Repository:
1. In CircleCI, go to **Project Settings** → **Advanced**
2. Enable **"GitHub Status Updates"**
3. Enable **"Build forked pull requests"** (if you want to test external PRs)

### In GitHub (for protected branches):
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Add a branch protection rule for `main` (or your default branch)
4. Check **"Require status checks to pass before merging"**
5. Search for and select the CircleCI checks:
   - `ci/circleci: test`
   - `ci/circleci: build` (for frontend)
   - `ci/circleci: lint` (for backend)

## Step 5: Test the Setup

### Create a Test Pull Request:
1. Create a new branch:
   ```bash
   git checkout -b test/circleci-setup
   ```

2. Make a small change (e.g., update README)

3. Push and create a PR:
   ```bash
   git push origin test/circleci-setup
   ```

4. Open the PR on GitHub - you should see CircleCI checks running

## Troubleshooting

### Common Issues:

**1. Tests not running on PRs:**
- Ensure the repository is properly connected in CircleCI
- Check that GitHub webhooks are configured (Settings → Webhooks in GitHub)

**2. Database connection errors (Rails):**
- Verify PostgreSQL service is running in the CircleCI config
- Check DATABASE_URL environment variable

**3. Missing dependencies:**
- For Rails: Run `bundle install` locally and commit `Gemfile.lock`
- For Next.js: Run `npm install` locally and commit `package-lock.json`

**4. Permission errors:**
- Ensure CircleCI has proper permissions to your GitHub repositories
- Re-authenticate if necessary in CircleCI account settings

## CircleCI Configuration Files

### Frontend (.circleci/config.yml)
- Runs TypeScript type checking
- Runs ESLint for code quality
- Runs Jest tests with coverage
- Builds the Next.js application

### Backend (.circleci/config.yml)
- Sets up PostgreSQL and Redis services
- Runs RSpec test suite
- Runs RuboCop for code style (if configured)
- Outputs test results in JUnit format for CircleCI

## Monitoring Builds

### CircleCI Dashboard:
- View all builds at https://app.circleci.com/pipelines/github/progressions
- Click on any build to see detailed logs
- Set up email/Slack notifications in Project Settings → Notifications

### GitHub Integration:
- Check status directly on pull requests
- Click "Details" next to any check to see CircleCI logs
- All checks must pass before merging (if branch protection is enabled)

## Next Steps

1. **Add Code Coverage Reporting:**
   - Consider integrating with Codecov or Coveralls
   - Add coverage badges to your README

2. **Optimize Build Times:**
   - Use CircleCI's parallelism features for large test suites
   - Implement better caching strategies

3. **Add Additional Checks:**
   - Security scanning with `bundle audit` or `npm audit`
   - License checking
   - Performance benchmarks

## Resources

- [CircleCI Documentation](https://circleci.com/docs/)
- [CircleCI Ruby/Rails Guide](https://circleci.com/docs/language-ruby/)
- [CircleCI Node.js Guide](https://circleci.com/docs/language-javascript/)
- [GitHub Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)