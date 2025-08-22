# End-to-End User Story Test: Complete New User Journey

**Date:** 2025-01-28  
**Priority:** High  
**Category:** Testing  
**Type:** Feature Request  

## Description

Build a comprehensive end-to-end test that validates the complete user journey from a new visitor discovering the site through running their first tabletop RPG session. This test should cover the full "happy path" experience that demonstrates all core functionality working together seamlessly.

## User Story Overview

**Primary Actor:** New Gamemaster + 4 New Players  
**Goal:** Complete setup and run first RPG session  
**Scope:** Full application workflow from registration to active gameplay  

## Detailed User Journey

### Phase 1: Gamemaster Registration & Setup

1. **Homepage Discovery**
   - New visitor lands on homepage (no existing account)
   - Clicks "Get Started" or "Create Account" button
   - Selects "Gamemaster" role during registration

2. **Account Creation & Confirmation**
   - Fills out registration form (email, password, name)
   - Receives confirmation email
   - Clicks confirmation link in email
   - Account is activated and confirmed

3. **Initial Login & Campaign Creation**
   - Signs in to website with new credentials
   - Navigates to campaign creation
   - Creates first campaign with name and description
   - Campaign is automatically seeded with:
     - Default schticks library
     - Weapons collection
     - Template characters (various archetypes)

4. **World Building Setup**
   - Creates 2-3 Factions (e.g., "The Dragons", "The Ascended")
   - Creates 2-3 Sites (e.g., "Ancient Temple", "Modern Warehouse")
   - Creates 2-3 Junctures (e.g., "Ancient China", "Modern Day", "Future")
   - Links factions to sites and junctures appropriately

### Phase 2: Player Invitation & Registration

5. **Player Invitations**
   - GM sends email invitations to 4 different email addresses
   - Each invitation contains unique redemption link
   - Invitation emails are delivered successfully

6. **Player Registration Flow (x4)**
   - Each player receives invitation email
   - Clicks invitation redemption link
   - Creates new user account through invitation flow
   - Confirms email address
   - Logs in to website
   - Automatically joined to GM's campaign

### Phase 3: Character Creation

7. **Player Character Creation (x4)**
   - Each player logs in and navigates to character creation
   - Browses available template characters
   - Selects and customizes a template (e.g., Archer, Sorcerer, Everyday Hero, Spy)
   - Assigns character to appropriate faction and juncture
   - Saves completed character

8. **GM Character Management**
   - GM logs in and reviews all player characters
   - Creates additional NPC characters for the session
   - Creates template enemies (mooks, featured foes, bosses)

### Phase 4: Session Organization

9. **Party Formation**
   - GM creates a new Party
   - Adds all 4 player characters to the party
   - Sets party name and description

10. **Fight Setup**
    - GM creates a new Fight
    - Sets fight name and description
    - Adds the player party to the fight
    - Adds NPC enemies to the fight
    - Configures fight location (site) and time period (juncture)

### Phase 5: Gameplay Validation

11. **Fight Initiation**
    - GM starts the fight
    - Initiative order is calculated and displayed
    - Shot counter system is active
    - All characters appear in proper initiative sequence

12. **Basic Combat Actions**
    - Characters can take actions in initiative order
    - Damage can be applied and tracked
    - Shot counter advances properly
    - Fight state updates in real-time

## Technical Requirements

### Test Framework
- **Primary:** Playwright end-to-end tests
- **Environment:** Test database with clean state
- **Scope:** Full browser automation testing both frontend and backend

### Test Data Requirements
- **Email System:** Mock email delivery for testing invitations
- **Database Seeding:** Proper template data (schticks, weapons, characters)
- **User Accounts:** Temporary test email addresses
- **Campaign Data:** Default world-building content

### Validation Points
- [ ] Homepage loads and navigation works
- [ ] User registration flow completes successfully
- [ ] Email confirmation process works
- [ ] Campaign creation includes proper seeding
- [ ] World-building entities (factions, sites, junctures) can be created
- [ ] Invitation system sends emails and processes redemptions
- [ ] Player registration through invitations works
- [ ] Template character selection and customization works
- [ ] Party creation and character assignment works
- [ ] Fight creation with mixed PC/NPC characters works
- [ ] Initiative system calculates and displays properly
- [ ] Basic combat mechanics function correctly

## Expected Outcomes

### Success Criteria
- [ ] Complete user journey from homepage to active fight
- [ ] All 5 users (1 GM + 4 players) successfully registered and active
- [ ] Campaign fully populated with characters, factions, sites, junctures
- [ ] Fight running with proper initiative order and combat mechanics
- [ ] No broken workflows or error states encountered
- [ ] Real-time updates and state synchronization working

### Performance Requirements
- [ ] Registration and confirmation flows complete within 30 seconds each
- [ ] Campaign and character creation respond within 5 seconds
- [ ] Fight initialization completes within 10 seconds
- [ ] Real-time updates appear within 2 seconds

## Implementation Approach

### Test Structure
```
test-scripts/
├── test-complete-user-journey.js          # Main end-to-end test
├── helpers/
│   ├── user-registration-helper.js        # Registration workflows
│   ├── campaign-setup-helper.js           # Campaign creation
│   ├── character-creation-helper.js       # Character workflows
│   ├── invitation-helper.js               # Invitation system
│   └── fight-setup-helper.js              # Combat setup
└── test-results/
    └── user-journey/                       # Screenshots and artifacts
```

### Test Execution Strategy
1. **Parallel User Simulation** - Run multiple browser contexts for different users
2. **Email Integration** - Mock or use test email service for invitations
3. **Data Cleanup** - Ensure clean state before and after test execution
4. **Comprehensive Screenshots** - Capture key UI states for validation
5. **Error Recovery** - Handle network delays and async operations gracefully

## Related Files

### Frontend Files
- `src/app/page.tsx` - Homepage component
- `src/app/auth/` - Authentication pages
- `src/app/campaigns/` - Campaign management
- `src/app/characters/` - Character creation and management
- `src/app/fights/` - Fight management interface

### Backend Files
- `app/controllers/api/v2/users_controller.rb` - User registration
- `app/controllers/api/v2/campaigns_controller.rb` - Campaign management
- `app/controllers/api/v2/invitations_controller.rb` - Invitation system
- `app/controllers/api/v2/characters_controller.rb` - Character management
- `app/controllers/api/v2/fights_controller.rb` - Fight management

### Test Infrastructure
- `test-scripts/login-helper.js` - Authentication utilities
- `test-scripts/test-results/` - Test artifacts and screenshots
- `playwright.config.js` - Test configuration

## Investigation Notes

This comprehensive test will validate:
- Complete user onboarding experience
- Cross-user collaboration workflows
- Real-time synchronization between users
- Data integrity across complex multi-user scenarios
- Performance under realistic usage patterns

The test serves as both validation and documentation of the complete user experience, ensuring all core workflows integrate properly and provide a smooth experience for new users discovering the platform.

## Definition of Done

- [ ] Test script successfully executes complete user journey
- [ ] All validation points pass consistently
- [ ] Test runs reliably in CI/CD environment
- [ ] Screenshots document each major workflow step
- [ ] Performance benchmarks meet requirements
- [ ] Error handling gracefully manages edge cases
- [ ] Test artifacts provide clear success/failure reporting