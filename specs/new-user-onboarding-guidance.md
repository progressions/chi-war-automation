# New User Onboarding Guidance - Technical Specification

**Feature**: First-time user onboarding dashboard and guidance flow  
**Priority**: High  
**Target**: Frontend (shot-client-next)

## Overview

Replace empty campaigns table with contextual onboarding experience for users with no campaigns. Provide guided actions and explanations to help new users understand the platform and take their first meaningful actions.

## User Story

**As a** new user who just registered  
**I want** clear guidance on what to do next  
**So that** I understand the platform and can get started quickly

## Atomic Implementation Phases

### Phase 1: Onboarding State Detection
**Goal**: Detect when user needs onboarding vs normal dashboard

**Frontend Changes:**
- Update `src/app/(main)/page.tsx` to check user's campaign count
- Modify dashboard routing logic to branch based on onboarding state
- Add `isFirstTimeUser` helper function

**Acceptance Criteria:**
- Users with 0 campaigns see onboarding flow
- Users with ≥1 campaigns see normal dashboard
- State detection happens client-side using campaign data

---

### Phase 2: OnboardingDashboard Component
**Goal**: Create welcoming onboarding interface with guided actions

**Frontend Changes:**
- Create `src/components/dashboard/OnboardingDashboard.tsx`
- Include welcome message, platform explanation, and call-to-action buttons
- Style with Material-UI consistent with existing design system

**Component Structure:**
```typescript
interface OnboardingDashboardProps {
  userName: string;
  onCreateCampaign: () => void;
}
```

**Content Elements:**
- Welcome headline with user's name
- Brief explanation of campaigns, characters, and fights
- Primary CTA: "Create Your First Campaign"
- Secondary actions: "Learn More", "Join Existing Campaign"

**Acceptance Criteria:**
- Component renders with user's name
- Clicking "Create Your First Campaign" opens campaign creation
- Responsive layout works on mobile and desktop
- Matches existing app styling and theme

---

### Phase 3: Enhanced Empty States
**Goal**: Improve campaigns list empty state with better guidance

**Frontend Changes:**
- Update `src/components/campaigns/List.tsx` empty state
- Add helpful messaging when campaigns table is empty
- Include contextual actions and next steps

**Enhanced Empty State:**
- Clear explanation of what campaigns are
- Visual guidance (icon or illustration)
- Prominent "Create Campaign" button
- Optional "Learn More" link

**Acceptance Criteria:**
- Empty campaigns table shows helpful guidance instead of just empty table
- Users understand what campaigns are and why they need one
- Clear path to create first campaign

---

### Phase 4: Onboarding Flow Integration
**Goal**: Seamless transition from onboarding to normal app usage

**Frontend Changes:**
- Update campaign creation success flow to transition out of onboarding
- Ensure first campaign creation shows success message and guidance
- Handle edge cases (user deletes all campaigns, etc.)

**Flow Logic:**
1. User completes onboarding action (creates campaign)
2. App detects user no longer needs onboarding
3. Redirect to normal dashboard with success message
4. Future visits show normal dashboard

**Acceptance Criteria:**
- Creating first campaign exits onboarding mode
- User sees confirmation and next steps after first campaign
- Subsequent visits show normal dashboard
- Deleting all campaigns returns user to onboarding state

---

### Phase 5: Content and Copy Refinement
**Goal**: Polish messaging and user guidance

**Frontend Changes:**
- Refine copy for clarity and friendliness
- Add helpful tooltips or explanatory text where needed
- Ensure messaging aligns with Feng Shui 2 RPG context

**Content Guidelines:**
- Friendly, welcoming tone
- Brief explanations without overwhelming detail
- Context-appropriate for RPG users
- Clear action-oriented language

**Acceptance Criteria:**
- All onboarding text is clear and helpful
- Messaging feels natural and welcoming
- No confusing or overwhelming information
- Copy reviewed for consistency with app voice

## Technical Implementation Notes

### Key Files
- `src/app/(main)/page.tsx` - Main dashboard routing
- `src/components/dashboard/OnboardingDashboard.tsx` - New component
- `src/components/campaigns/List.tsx` - Enhanced empty state
- `src/hooks/useCampaigns.ts` - Campaign data fetching
- `src/contexts/CampaignContext.tsx` - Campaign state management

### State Management
- Use existing campaign context/hooks for data
- No new global state needed
- Onboarding state derived from campaign count

### Design System
- Use existing Material-UI components
- Follow current color scheme and typography
- Maintain responsive design patterns

### Testing Considerations
- Test onboarding flow with new user account
- Verify transition out of onboarding after campaign creation
- Test empty state improvements
- Ensure mobile responsiveness

## Success Metrics

- New users understand what to do next
- Reduced drop-off after registration
- Increased first campaign creation rate
- Improved user feedback on initial experience