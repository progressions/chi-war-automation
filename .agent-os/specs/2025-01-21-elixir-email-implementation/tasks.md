# Tasks: Email Implementation for Phoenix API

**Spec:** [spec.md](./spec.md)
**Created:** 2025-01-21
**Estimated Total Time:** 13-17 hours
**Status:** Not Started

## Task Overview

Implement complete email functionality in shot-elixir Phoenix app to achieve feature parity with Rails shot-server email system.

---

## Phase 1: Infrastructure Setup (2-3 hours)

### Task 1.1: Install Email Dependencies
**Estimated Time:** 30 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Add `{:swoosh, "~> 1.16"}` to mix.exs dependencies
- [ ] Add `{:phoenix_swoosh, "~> 1.2"}` to mix.exs dependencies
- [ ] Add `{:gen_smtp, "~> 1.2"}` to mix.exs dependencies
- [ ] Run `mix deps.get` to install dependencies
- [ ] Verify Oban is properly configured (should already be installed)
- [ ] Run `mix deps.compile` to ensure clean compilation

**Verification:**
- All dependencies install without errors
- `mix deps` shows swoosh, phoenix_swoosh, and gen_smtp

**Files Modified:**
- `mix.exs`
- `mix.lock`

---

### Task 1.2: Configure Base Mailer Module
**Estimated Time:** 45 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Create `lib/shot_elixir/mailer.ex` with Swoosh.Mailer setup
- [ ] Add mailer configuration to `config/config.exs`
- [ ] Configure Swoosh API client with Finch
- [ ] Add Oban email queue configuration to `config/config.exs`
- [ ] Verify base configuration loads correctly

**Verification:**
- `ShotElixir.Mailer` module compiles
- Configuration loads without errors
- Oban shows `emails` queue in configuration

**Files Created:**
- `lib/shot_elixir/mailer.ex`

**Files Modified:**
- `config/config.exs`

**Code Template:**
```elixir
# lib/shot_elixir/mailer.ex
defmodule ShotElixir.Mailer do
  use Swoosh.Mailer, otp_app: :shot_elixir
end
```

---

### Task 1.3: Configure Environment-Specific Settings
**Estimated Time:** 1 hour
**Status:** Not Started

**Subtasks:**
- [ ] Configure development environment in `config/dev.exs`:
  - Set Swoosh.Adapters.Local
  - Configure mailer URL options (localhost:3001)
  - Enable mailbox preview route
- [ ] Configure test environment in `config/test.exs`:
  - Set Swoosh.Adapters.Test
  - Configure test URL options
- [ ] Configure production in `config/runtime.exs`:
  - Set Swoosh.Adapters.SMTP with Office 365 settings
  - Configure production URL options (https://chiwar.net)
  - Read SMTP credentials from environment variables
- [ ] Add Fly.io secrets for SMTP credentials
- [ ] Test configuration in development mode

**Verification:**
- Development uses Local adapter
- Test uses Test adapter
- Production configuration references correct env vars
- Fly.io secrets are set

**Commands:**
```bash
fly secrets set SMTP_USERNAME=admin@chiwar.net -a shot-elixir
fly secrets set SMTP_PASSWORD=<password> -a shot-elixir
```

**Files Modified:**
- `config/dev.exs`
- `config/test.exs`
- `config/runtime.exs`

---

### Task 1.4: Create Email Worker with Oban
**Estimated Time:** 45 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Create `lib/shot_elixir/workers/email_worker.ex`
- [ ] Implement Oban.Worker with `:emails` queue
- [ ] Set max_attempts to 3 with exponential backoff
- [ ] Implement `perform/1` function with email dispatch logic
- [ ] Add error handling and logging
- [ ] Write unit test for email worker
- [ ] Verify worker can be enqueued

**Verification:**
- Worker module compiles
- Test shows worker can be enqueued
- Worker handles errors gracefully

**Files Created:**
- `lib/shot_elixir/workers/email_worker.ex`
- `test/shot_elixir/workers/email_worker_test.exs`

**Code Template:**
```elixir
defmodule ShotElixir.Workers.EmailWorker do
  use Oban.Worker, queue: :emails, max_attempts: 3

  alias ShotElixir.Mailer
  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"type" => type} = args}) do
    Logger.info("Sending #{type} email")

    args
    |> build_email()
    |> Mailer.deliver()
    |> case do
      {:ok, _metadata} ->
        Logger.info("Email sent successfully: #{type}")
        :ok

      {:error, reason} ->
        Logger.error("Email delivery failed: #{inspect(reason)}")
        {:error, reason}
    end
  end

  defp build_email(%{"type" => "invitation", "invitation_id" => id}) do
    # Dispatch to appropriate email builder
  end
end
```

---

### Task 1.5: Create Email Layout and View Infrastructure
**Estimated Time:** 45 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Create directory structure: `lib/shot_elixir_web/templates/email/`
- [ ] Create `lib/shot_elixir_web/views/email_view.ex`
- [ ] Create base email layout `lib/shot_elixir_web/templates/email/layout/email.html.heex`
- [ ] Add CSS styles matching Rails email design (inline styles)
- [ ] Create helper functions for URL building
- [ ] Test template rendering with sample data

**Verification:**
- Directory structure created
- EmailView compiles
- Layout template renders correctly
- Helper functions work

**Files Created:**
- `lib/shot_elixir_web/views/email_view.ex`
- `lib/shot_elixir_web/templates/email/layout/email.html.heex`

**Code Template:**
```elixir
# lib/shot_elixir_web/views/email_view.ex
defmodule ShotElixirWeb.EmailView do
  use ShotElixirWeb, :view

  def root_url do
    opts = Application.get_env(:shot_elixir, :mailer_url_options, [])
    scheme = opts[:scheme] || "https"
    host = opts[:host] || "chiwar.net"
    port = opts[:port]

    port_string = if port, do: ":#{port}", else: ""
    "#{scheme}://#{host}#{port_string}"
  end

  def format_timestamp(datetime) do
    Calendar.strftime(datetime, "%B %d, %Y at %I:%M %p UTC")
  end
end
```

---

## Phase 2: User Emails (4-5 hours)

### Task 2.1: Implement Welcome Email
**Estimated Time:** 45 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Create `lib/shot_elixir/emails/user_email.ex` module
- [ ] Implement `welcome/1` function
- [ ] Create template directory `lib/shot_elixir_web/templates/email/user_email/`
- [ ] Create `welcome.html.heex` template matching Rails design
- [ ] Write unit tests for welcome email
- [ ] Write integration test with Swoosh.TestAssertions
- [ ] Test email rendering manually in development

**Verification:**
- welcome/1 generates correct email struct
- Template renders with user data
- Tests pass
- Email preview works in development

**Files Created:**
- `lib/shot_elixir/emails/user_email.ex`
- `lib/shot_elixir_web/templates/email/user_email/welcome.html.heex`
- `test/shot_elixir/emails/user_email_test.exs`

**Reference:**
- Rails: `app/mailers/user_mailer.rb` (welcome method)
- Rails: `app/views/user_mailer/welcome.html.erb`

---

### Task 2.2: Implement Invitation Email
**Estimated Time:** 1 hour
**Status:** Not Started

**Subtasks:**
- [ ] Implement `invitation/1` function in UserEmail module
- [ ] Create `invitation.html.heex` template
- [ ] Match Rails design exactly (green theme, campaign info box)
- [ ] Build invitation redemption URL
- [ ] Handle campaign description conditional display
- [ ] Write unit tests for invitation email
- [ ] Test with real invitation data
- [ ] Verify links work correctly

**Verification:**
- invitation/1 generates email with campaign context
- Template matches Rails styling
- Redemption URL is correct
- Tests pass
- Links are clickable and work

**Files Created:**
- `lib/shot_elixir_web/templates/email/user_email/invitation.html.heex`

**Files Modified:**
- `lib/shot_elixir/emails/user_email.ex`
- `test/shot_elixir/emails/user_email_test.exs`

**Reference:**
- Rails: `app/mailers/user_mailer.rb` (invitation method)
- Rails: `app/views/user_mailer/invitation.html.erb`

---

### Task 2.3: Implement Joined Campaign Email
**Estimated Time:** 30 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Implement `joined_campaign/2` function (user, campaign)
- [ ] Create `joined_campaign.html.heex` template
- [ ] Match Rails content and styling
- [ ] Write unit tests
- [ ] Test with real data

**Verification:**
- Email has correct subject with campaign name
- Template renders correctly
- Tests pass

**Files Created:**
- `lib/shot_elixir_web/templates/email/user_email/joined_campaign.html.heex`

**Files Modified:**
- `lib/shot_elixir/emails/user_email.ex`
- `test/shot_elixir/emails/user_email_test.exs`

**Reference:**
- Rails: `app/views/user_mailer/joined_campaign.html.erb`

---

### Task 2.4: Implement Removed from Campaign Email
**Estimated Time:** 30 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Implement `removed_from_campaign/2` function (user, campaign)
- [ ] Create `removed_from_campaign.html.heex` template
- [ ] Match Rails content and styling
- [ ] Write unit tests
- [ ] Test with real data

**Verification:**
- Email has correct subject with campaign name
- Template renders correctly
- Tests pass

**Files Created:**
- `lib/shot_elixir_web/templates/email/user_email/removed_from_campaign.html.heex`

**Files Modified:**
- `lib/shot_elixir/emails/user_email.ex`
- `test/shot_elixir/emails/user_email_test.exs`

**Reference:**
- Rails: `app/views/user_mailer/removed_from_campaign.html.erb`

---

### Task 2.5: Implement Confirmation Instructions Email
**Estimated Time:** 1.5 hours
**Status:** Not Started

**Subtasks:**
- [ ] Implement `confirmation_instructions/2` function (user, token)
- [ ] Create `confirmation_instructions.html.heex` template
- [ ] Implement pending_invitation_id logic for custom subjects
- [ ] Build confirmation URL with token parameter
- [ ] Match Rails conditional campaign context display
- [ ] Add 24-hour expiry notice
- [ ] Write unit tests covering both invitation and non-invitation cases
- [ ] Test URL generation
- [ ] Verify template conditional logic

**Verification:**
- Correct subject based on pending_invitation presence
- Confirmation URL is properly formatted
- Campaign context displays when appropriate
- Tests cover both scenarios
- Template matches Rails design

**Files Created:**
- `lib/shot_elixir_web/templates/email/user_email/confirmation_instructions.html.heex`

**Files Modified:**
- `lib/shot_elixir/emails/user_email.ex`
- `test/shot_elixir/emails/user_email_test.exs`

**Reference:**
- Rails: `app/mailers/user_mailer.rb` (confirmation_instructions method)
- Rails: `app/views/user_mailer/confirmation_instructions.html.erb`

---

### Task 2.6: Implement Password Reset Email
**Estimated Time:** 1 hour
**Status:** Not Started

**Subtasks:**
- [ ] Implement `reset_password_instructions/2` function (user, token)
- [ ] Create `reset_password_instructions.html.heex` template
- [ ] Create `reset_password_instructions.text.eex` text version
- [ ] Build password reset URL with token
- [ ] Add security headers (X-Auto-Response-Suppress, X-Mailer)
- [ ] Match Rails security notices and warnings
- [ ] Add 2-hour expiry notice
- [ ] Write unit tests for both HTML and text versions
- [ ] Test URL generation
- [ ] Verify security styling matches Rails

**Verification:**
- Both HTML and text versions render
- Reset URL is properly formatted
- Security headers are set
- 2-hour expiry mentioned
- Tests pass for both formats
- Styling matches Rails (red theme for security)

**Files Created:**
- `lib/shot_elixir_web/templates/email/user_email/reset_password_instructions.html.heex`
- `lib/shot_elixir_web/templates/email/user_email/reset_password_instructions.text.eex`

**Files Modified:**
- `lib/shot_elixir/emails/user_email.ex`
- `test/shot_elixir/emails/user_email_test.exs`

**Reference:**
- Rails: `app/mailers/user_mailer.rb` (reset_password_instructions method)
- Rails: `app/views/user_mailer/reset_password_instructions.html.erb`
- Rails: `app/views/user_mailer/reset_password_instructions.text.erb`

---

## Phase 3: Admin Emails (2 hours)

### Task 3.1: Implement Blob Sequence Error Email
**Estimated Time:** 1.5 hours
**Status:** Not Started

**Subtasks:**
- [ ] Create `lib/shot_elixir/emails/admin_email.ex` module
- [ ] Implement `blob_sequence_error/2` function (campaign, error_message)
- [ ] Create template directory `lib/shot_elixir_web/templates/email/admin_email/`
- [ ] Create `blob_sequence_error.html.heex` template
- [ ] Create `blob_sequence_error.text.eex` text version
- [ ] Match Rails error formatting and detail level
- [ ] Set priority header to "high"
- [ ] Include timestamp, campaign info, error details
- [ ] Add remediation steps
- [ ] Write unit tests
- [ ] Test with sample error data

**Verification:**
- Email sent to hardcoded admin address
- Priority header set correctly
- Both HTML and text versions render
- Error details properly displayed
- Remediation steps clear
- Tests pass

**Files Created:**
- `lib/shot_elixir/emails/admin_email.ex`
- `lib/shot_elixir_web/templates/email/admin_email/blob_sequence_error.html.heex`
- `lib/shot_elixir_web/templates/email/admin_email/blob_sequence_error.text.eex`
- `test/shot_elixir/emails/admin_email_test.exs`

**Reference:**
- Rails: `app/mailers/admin_mailer.rb`

**Code Template:**
```elixir
defmodule ShotElixir.Emails.AdminEmail do
  import Swoosh.Email

  @from_email "system@chiwar.net"
  @admin_email "progressions@gmail.com"

  def blob_sequence_error(campaign, error_message) do
    timestamp = DateTime.utc_now()

    new()
    |> to(@admin_email)
    |> from({"Chi War System", @from_email})
    |> subject("[CRITICAL] Campaign Seeding Failed - Blob Sequence Error")
    |> header("Priority", "high")
    |> html_body(blob_error_html(campaign, error_message, timestamp))
    |> text_body(blob_error_text(campaign, error_message, timestamp))
  end

  # Helper functions for HTML and text bodies
end
```

---

### Task 3.2: Add Admin Email Testing
**Estimated Time:** 30 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Write comprehensive unit tests for admin email
- [ ] Test priority header setting
- [ ] Test recipient address
- [ ] Test both HTML and text body rendering
- [ ] Test with nil campaign (error handling)
- [ ] Verify all required information present in email

**Verification:**
- All admin email tests pass
- Edge cases handled
- Email content complete

**Files Modified:**
- `test/shot_elixir/emails/admin_email_test.exs`

---

## Phase 4: Controller Integration (3-4 hours)

### Task 4.1: Integrate Invitation Emails
**Estimated Time:** 1 hour
**Status:** Not Started

**Subtasks:**
- [ ] Update `create` action in InvitationsController to queue email
- [ ] Update `resend` action to queue email
- [ ] Update EmailWorker to handle "invitation" email type
- [ ] Load invitation with associations for email
- [ ] Handle email delivery errors gracefully
- [ ] Add logging for email queuing
- [ ] Write integration tests for both actions
- [ ] Test error scenarios (invalid email, failed delivery)

**Verification:**
- Email queued on invitation creation
- Email queued on invitation resend
- Worker can deliver invitation emails
- Tests pass
- Emails deliver in development

**Files Modified:**
- `lib/shot_elixir_web/controllers/api/v2/invitations_controller.ex`
- `lib/shot_elixir/workers/email_worker.ex`
- `test/shot_elixir_web/controllers/api/v2/invitations_controller_test.exs`

**Code Example:**
```elixir
# In InvitationsController
def create(conn, %{"invitation" => params}) do
  case Invitations.create_invitation(params) do
    {:ok, invitation} ->
      # Queue invitation email
      %{"type" => "invitation", "invitation_id" => invitation.id}
      |> EmailWorker.new()
      |> Oban.insert()

      render(conn, "show.json", invitation: invitation)

    {:error, changeset} ->
      # handle error
  end
end
```

---

### Task 4.2: Integrate User Registration Emails
**Estimated Time:** 1.5 hours
**Status:** Not Started

**Subtasks:**
- [ ] Find or create user registration endpoint
- [ ] Queue confirmation email after user creation
- [ ] Implement token generation for confirmation
- [ ] Queue welcome email after confirmation
- [ ] Update EmailWorker to handle "confirmation" and "welcome" types
- [ ] Handle pending_invitation_id context
- [ ] Write integration tests for registration flow
- [ ] Test full registration -> confirmation -> welcome flow

**Verification:**
- Confirmation email sent on registration
- Welcome email sent after confirmation
- Token generation works
- pending_invitation_id handled correctly
- Tests cover full flow
- Emails deliver correctly

**Files Modified:**
- User registration controller (location TBD)
- `lib/shot_elixir/workers/email_worker.ex`
- `test/shot_elixir_web/controllers/*/user_registration_test.exs`

---

### Task 4.3: Integrate Campaign Membership Emails
**Estimated Time:** 1 hour
**Status:** Not Started

**Subtasks:**
- [ ] Find campaign membership create endpoint
- [ ] Queue `joined_campaign` email on membership creation
- [ ] Find campaign membership delete endpoint
- [ ] Queue `removed_from_campaign` email on deletion
- [ ] Update EmailWorker to handle both email types
- [ ] Write integration tests for both actions
- [ ] Test email delivery for both scenarios

**Verification:**
- joined_campaign email queued on membership create
- removed_from_campaign email queued on delete
- Worker handles both email types
- Tests pass
- Emails deliver correctly

**Files Modified:**
- Campaign membership controller (location TBD)
- `lib/shot_elixir/workers/email_worker.ex`
- Campaign membership controller tests

---

### Task 4.4: Integrate Password Reset Emails
**Estimated Time:** 45 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Find or create password reset request endpoint
- [ ] Generate reset token
- [ ] Queue password reset email
- [ ] Update EmailWorker to handle "password_reset" type
- [ ] Write integration tests
- [ ] Test token expiry (2 hours)
- [ ] Test full password reset flow

**Verification:**
- Reset email sent on password reset request
- Token generated correctly
- Email includes reset link
- Tests pass
- Full flow works end-to-end

**Files Modified:**
- Password reset controller (location TBD)
- `lib/shot_elixir/workers/email_worker.ex`
- Password reset controller tests

---

### Task 4.5: Integrate Admin Error Notifications
**Estimated Time:** 30 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Find critical error handlers in codebase
- [ ] Queue admin email on blob sequence errors
- [ ] Add admin email to other critical error scenarios
- [ ] Update EmailWorker to handle "admin_error" type
- [ ] Test error notification delivery
- [ ] Verify admin receives emails

**Verification:**
- Admin email queued on critical errors
- Worker handles admin email type
- Error details properly passed
- Admin receives notifications

**Files Modified:**
- Error handler locations (campaign seeding, etc.)
- `lib/shot_elixir/workers/email_worker.ex`

---

## Phase 5: Testing & Documentation (2-3 hours)

### Task 5.1: Comprehensive Email Testing
**Estimated Time:** 1 hour
**Status:** Not Started

**Subtasks:**
- [ ] Review all email unit tests for completeness
- [ ] Add missing test cases
- [ ] Test URL generation in all environments
- [ ] Test email rendering with edge cases (long names, special chars)
- [ ] Test Oban worker retry logic
- [ ] Test email delivery failures
- [ ] Ensure test coverage >90% for email code
- [ ] Run full test suite and fix any failures

**Verification:**
- All email tests pass
- Coverage meets threshold
- Edge cases handled
- Worker retry logic tested

---

### Task 5.2: Set Up Email Preview in Development
**Estimated Time:** 45 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Configure Swoosh mailbox preview routes
- [ ] Add mailbox route to router
- [ ] Test email preview in browser
- [ ] Document how to access preview
- [ ] Create sample emails for each type
- [ ] Verify preview displays correctly

**Verification:**
- Email preview accessible at `/dev/mailbox`
- All email types can be previewed
- Styling displays correctly
- Links work in preview

**Files Modified:**
- `lib/shot_elixir_web/router.ex`

**Code Example:**
```elixir
# In router.ex (development only)
if Mix.env() == :dev do
  scope "/dev" do
    pipe_through :browser
    forward "/mailbox", Plug.Swoosh.MailboxPreview
  end
end
```

---

### Task 5.3: Production Email Testing
**Estimated Time:** 1 hour
**Status:** Not Started

**Subtasks:**
- [ ] Deploy email implementation to Fly.io
- [ ] Verify SMTP secrets are set correctly
- [ ] Send test invitation email in production
- [ ] Verify email delivery to inbox
- [ ] Check email formatting in Gmail, Outlook, Apple Mail
- [ ] Verify no spam folder placement
- [ ] Test all email types in production
- [ ] Monitor Oban dashboard for email jobs
- [ ] Test email delivery speed (<30 seconds)

**Verification:**
- SMTP connection works
- Emails deliver successfully
- Formatting correct in major clients
- No spam issues
- Delivery speed acceptable
- Oban jobs process correctly

**Commands:**
```bash
# Deploy to production
cd /path/to/shot-elixir
fly deploy

# Check email logs
fly logs -a shot-elixir | grep -i email

# Monitor Oban
# Access Oban web dashboard if configured
```

---

### Task 5.4: Update Documentation
**Estimated Time:** 45 minutes
**Status:** Not Started

**Subtasks:**
- [ ] Update `shot-elixir/CLAUDE.md` with email information
- [ ] Document email configuration
- [ ] Document development email preview
- [ ] Document production SMTP setup
- [ ] Add troubleshooting guide
- [ ] Document email templates location
- [ ] Add examples of queuing emails
- [ ] Document testing approach

**Verification:**
- Documentation complete and accurate
- Examples work correctly
- Troubleshooting guide helpful

**Files Modified:**
- `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-elixir/CLAUDE.md`

**Documentation Sections to Add:**
```markdown
## Email System

### Overview
Shot Elixir uses Swoosh for email delivery via Office 365 SMTP.

### Configuration
- Development: Local adapter with preview
- Test: Test adapter
- Production: SMTP via Office 365

### Email Types
- User emails: invitations, confirmations, password resets
- Admin emails: critical error notifications

### Development
Access email preview: http://localhost:4002/dev/mailbox

### Queuing Emails
[Code examples...]

### Troubleshooting
[Common issues and solutions...]
```

---

## Progress Tracking

### Phase Completion Status
- [ ] Phase 1: Infrastructure Setup (0/5 tasks)
- [ ] Phase 2: User Emails (0/6 tasks)
- [ ] Phase 3: Admin Emails (0/2 tasks)
- [ ] Phase 4: Controller Integration (0/5 tasks)
- [ ] Phase 5: Testing & Documentation (0/4 tasks)

### Overall Completion: 0/22 tasks (0%)

---

## Dependencies Between Tasks

**Critical Path:**
1. Task 1.1 → Task 1.2 → Task 1.3 → Task 1.4 → Task 1.5
2. Task 1.5 → Task 2.1 → Task 2.2 → ... → Task 2.6
3. Task 2.* → Task 4.*
4. Task 4.* → Task 5.3

**Parallel Work Opportunities:**
- Task 3.1 and 3.2 can be done in parallel with Phase 2
- Task 5.1 and 5.2 can be done in parallel
- Individual email implementations in Phase 2 are mostly independent

---

## Risk Mitigation

**High Priority Items:**
1. Test SMTP connection early (Task 1.3)
2. Verify email template rendering (Task 1.5)
3. Test production delivery early (Task 5.3)

**Common Blockers:**
- SMTP authentication issues → Test in Task 1.3
- Template rendering differences → Reference Rails templates exactly
- Email client compatibility → Test in multiple clients in Task 5.3

---

## Success Criteria

**Functional:**
- [ ] All 6 user email types working
- [ ] Admin error email working
- [ ] All emails match Rails design
- [ ] Background delivery via Oban
- [ ] Development preview working
- [ ] Production SMTP working

**Technical:**
- [ ] All tests passing
- [ ] >90% code coverage
- [ ] Documentation complete
- [ ] No email delivery failures

**User Experience:**
- [ ] Emails deliver <30 seconds
- [ ] No spam folder placement
- [ ] Links work correctly
- [ ] Display correctly in major clients

---

## Notes

**Start Here:**
Begin with Task 1.1 and work sequentially through Phase 1. Don't skip infrastructure setup - it's critical for all subsequent work.

**Testing Strategy:**
Write tests alongside implementation, not after. Each email implementation task includes testing subtasks.

**Reference Materials:**
Keep Rails implementation open for reference:
- `app/mailers/user_mailer.rb`
- `app/views/user_mailer/*.erb`
- Email styling and copy should match exactly

**Time Management:**
If running over estimate, prioritize:
1. Invitation email (most critical)
2. Confirmation email
3. Password reset email
4. Other emails can be added incrementally
