# Add DatabaseCleaner to Rails Test Suite

**Date:** 2025-08-20  
**Priority:** Medium  
**Category:** Testing  

## Description

The Rails test suite is experiencing widespread test failures due to database state pollution between test runs. Multiple specs are failing with `ActiveRecord::RecordInvalid: Validation failed: Email has already been taken` errors, indicating that database records from previous tests are persisting and causing uniqueness constraint violations.

This is a common issue in Rails test suites where tests don't properly clean up the database between runs, leading to:
- Flaky tests that pass/fail depending on run order
- False negatives where tests fail due to leftover data
- Difficulty in debugging actual application logic issues
- Unreliable CI/CD pipeline results

## Steps to Reproduce

1. Run the full V2 API request spec suite: `bundle exec rspec spec/requests/api/v2/`
2. Observe multiple failures with email uniqueness violations
3. Tests fail because users created in one spec persist when the next spec runs
4. Different test files trying to create users with same email addresses (e.g., "player@example.com")

## Expected vs Actual Behavior

**Expected:** Each test should run in isolation with a clean database state  
**Actual:** Tests are polluting the database and causing cascading failures across the test suite

## Root Cause

The test suite lacks proper database cleaning strategy between test runs. Rails' default transactional fixtures may not be sufficient for all test scenarios, especially when dealing with:
- Complex database operations
- Multiple database connections
- Background jobs that commit outside transactions
- Integration tests that require non-transactional behavior

## Proposed Solution

Add the `database_cleaner` gem to provide reliable database cleaning strategies:

1. **Add DatabaseCleaner gem** to Gemfile test group
2. **Configure cleaning strategies** in RSpec setup:
   - Use `:transaction` strategy for most tests (fastest)
   - Use `:truncation` strategy for tests that need it (more thorough)
   - Use `:deletion` strategy for specific edge cases
3. **Set up proper before/after hooks** in RSpec configuration
4. **Handle background jobs** that may persist data outside transactions

## Implementation Plan

### Phase 1: Add DatabaseCleaner
```ruby
# Gemfile
group :test do
  gem 'database_cleaner-active_record'
end
```

### Phase 2: Configure RSpec
```ruby
# spec/rails_helper.rb
RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
  
  # Use truncation for tests that need it
  config.around(:each, :js) do |example|
    DatabaseCleaner.strategy = :truncation
    example.run
    DatabaseCleaner.strategy = :transaction
  end
end
```

### Phase 3: Update Problem Test Files
- Fix hardcoded email addresses in test files
- Use factories with sequences or random data
- Ensure proper test isolation

## Related Files

**Failing specs observed:**
- `spec/requests/api/v2/campaigns/campaigns_autocomplete_spec.rb`
- `spec/requests/api/v2/campaigns/campaigns_spec.rb` 
- `spec/requests/api/v2/characters/characters_spec.rb`
- `spec/requests/api/v2/weapons/weapons_spec.rb`
- Many other V2 specs with email uniqueness violations

**Configuration files to update:**
- `Gemfile` - Add database_cleaner gem
- `spec/rails_helper.rb` - Configure DatabaseCleaner
- Individual spec files - Update to use proper test data

## Benefits

1. **Reliable tests** - Each test runs in clean environment
2. **Easier debugging** - Failures indicate actual logic issues, not data pollution
3. **Consistent CI/CD** - Tests behave same locally and in pipeline
4. **Developer productivity** - No more mysterious test failures
5. **Maintainable test suite** - Clear separation between test cases

## Testing Strategy

1. Add DatabaseCleaner configuration
2. Run full test suite to verify improvements
3. Focus on previously failing V2 API specs
4. Monitor for any performance impact (truncation is slower than transactions)
5. Adjust strategies per test type as needed

## Success Criteria

- [ ] V2 API request specs run without email uniqueness violations
- [ ] Tests can be run in any order with consistent results  
- [ ] No test failures due to database state pollution
- [ ] Minimal performance impact on test suite execution time
- [ ] Clean, maintainable test setup that scales with codebase

## Investigation Notes

The issue was discovered while implementing V2 campaign memberships functionality. Our new spec (19 tests) passes perfectly with proper test isolation using unique timestamps, but the broader test suite suffers from data pollution issues that mask real functionality testing.

Current workaround in our V2 campaign memberships spec:
```ruby
# Uses timestamp to ensure unique emails
timestamp = Time.now.to_i
@admin = User.create!(email: "admin#{timestamp}@example.com", ...)
```

This approach works but isn't scalable across the entire test suite. DatabaseCleaner provides the proper infrastructure solution.