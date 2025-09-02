# Character Effects Implementation Tasks

## Phase 1: Backend V2 API Development

### Task 1.1: Create V2 CharacterEffects Controller
**Priority:** High  
**Estimated Time:** 2-3 hours

- [ ] Create `app/controllers/api/v2/character_effects_controller.rb`
- [ ] Implement RESTful actions: `create`, `update`, `destroy`
- [ ] Follow V2 API patterns with proper error handling
- [ ] Add nested route under fights: `/api/v2/fights/:fight_id/character_effects`
- [ ] Test with existing CharacterEffect model validations

**Acceptance Criteria:**
- All V2 endpoints return consistent JSON structure
- Validation errors properly formatted
- Authentication and campaign authorization enforced

### Task 1.2: Create V2 CharacterEffect Serializer  
**Priority:** High  
**Estimated Time:** 1-2 hours

- [ ] Create `app/serializers/character_effect_serializer.rb`
- [ ] Include all necessary attributes: id, name, description, severity, action_value, change
- [ ] Add entity_class for frontend consistency
- [ ] Include timestamps for created_at, updated_at

**Acceptance Criteria:**
- Serializer outputs consistent with frontend type definitions
- All required fields included
- Optional fields handled gracefully

### Task 1.3: Update Encounter Serializer
**Priority:** Medium  
**Estimated Time:** 2-3 hours

- [ ] Modify `encounter_serializer.rb` to include character effects
- [ ] Add character effects to shot data structure
- [ ] Ensure efficient loading with includes/joins
- [ ] Group effects by shot_id for frontend consumption

**Acceptance Criteria:**
- Character effects included in encounter API response
- No N+1 query issues
- Effects properly associated with characters/vehicles

### Task 1.4: Add Routes and Documentation
**Priority:** Low  
**Estimated Time:** 1 hour

- [ ] Update `config/routes.rb` with V2 character effects routes
- [ ] Add API documentation for new endpoints
- [ ] Update any relevant API pattern documentation

**Acceptance Criteria:**
- Routes follow V2 RESTful patterns
- Documentation accurate and complete

## Phase 2: Frontend Type Definitions & API Client

### Task 2.1: TypeScript Type Definitions
**Priority:** High  
**Estimated Time:** 1-2 hours

- [ ] Add `CharacterEffect` interface to `src/types/encounters.ts`
- [ ] Define severity type union: `error | warning | info | success`
- [ ] Add character effect arrays to encounter/fight types
- [ ] Update existing types to include character effects

**Acceptance Criteria:**
- All character effect properties typed correctly
- Severity levels match backend enum
- Integration with existing type system

### Task 2.2: V2 API Client Methods
**Priority:** High  
**Estimated Time:** 2-3 hours

- [ ] Add character effect methods to `src/lib/ApiV2.ts`
- [ ] Implement `createCharacterEffect`, `updateCharacterEffect`, `deleteCharacterEffect`
- [ ] Follow existing V2 API patterns for error handling
- [ ] Add proper TypeScript typing for all methods

**Acceptance Criteria:**
- Methods consistent with other V2 API endpoints
- Proper error handling and type safety
- Integration with existing API client patterns

### Task 2.3: Update Encounter Context
**Priority:** High  
**Estimated Time:** 2-3 hours

- [ ] Modify `src/contexts/EncounterContext.tsx` to include character effects
- [ ] Add character effects to encounter state
- [ ] Create helper methods for grouping effects by shot_id
- [ ] Handle character effect updates in context actions

**Acceptance Criteria:**
- Character effects available throughout encounter components
- Efficient data structure for UI consumption
- Real-time updates handled properly

## Phase 3: Core UI Components

### Task 3.1: Character Effects Display Component
**Priority:** High  
**Estimated Time:** 3-4 hours

- [ ] Create `src/components/character-effects/CharacterEffectsDisplay.tsx`
- [ ] Implement horizontal icon layout with severity colors
- [ ] Add Material-UI severity color mapping
- [ ] Include tooltips showing effect count
- [ ] Integrate with existing character card layout

**Acceptance Criteria:**
- Icons display in correct severity colors
- Responsive layout works on mobile devices
- Integrates seamlessly with character cards

### Task 3.2: Individual Effect Icon Component
**Priority:** Medium  
**Estimated Time:** 2-3 hours

- [ ] Create `src/components/character-effects/CharacterEffectIcon.tsx`
- [ ] Use Material-UI `InfoOutlinedIcon` with severity colors
- [ ] Implement hover states and click handlers
- [ ] Add accessibility attributes (aria-label, role, etc.)

**Acceptance Criteria:**
- Icons properly colored by severity
- Hover and click interactions work
- Accessible to screen readers

### Task 3.3: Effect Creation Modal
**Priority:** High  
**Estimated Time:** 4-5 hours

- [ ] Create `src/components/character-effects/CharacterEffectModal.tsx`
- [ ] Implement form with all required fields
- [ ] Add severity dropdown with proper options
- [ ] Create action value dropdown (context-sensitive for character/vehicle)
- [ ] Implement form validation and submission
- [ ] Add loading states during API calls

**Acceptance Criteria:**
- Form validates required fields
- Action value options appropriate for character vs vehicle
- Change field validation works correctly
- Success/error handling with toast notifications

### Task 3.4: Effect Details Popover
**Priority:** Medium  
**Estimated Time:** 2-3 hours

- [ ] Create `src/components/character-effects/CharacterEffectPopover.tsx`  
- [ ] Show effect details on icon hover/click
- [ ] Display name, description, action value, change
- [ ] Add gamemaster-only delete button
- [ ] Implement delete confirmation dialog

**Acceptance Criteria:**
- Popover positions correctly relative to icon
- All effect information displayed clearly
- Delete functionality works with confirmation

## Phase 4: Integration & Permissions

### Task 4.1: GamemasterOnly Integration
**Priority:** Medium  
**Estimated Time:** 1-2 hours

- [ ] Wrap add effect button with `GamemasterOnly` component
- [ ] Restrict delete functionality to gamemasters
- [ ] Ensure proper permission checks throughout

**Acceptance Criteria:**
- Only gamemasters can add/delete effects
- All users can view effects
- Permission checks work correctly

### Task 4.2: Toast Notification Integration
**Priority:** Low  
**Estimated Time:** 1 hour

- [ ] Add success notifications for effect creation/deletion
- [ ] Include effect name in success messages
- [ ] Use existing `ToastContext` patterns

**Acceptance Criteria:**
- Clear success messages shown
- Error messages handled gracefully
- Consistent with existing toast patterns

### Task 4.3: Character Card Integration
**Priority:** High  
**Estimated Time:** 2-3 hours

- [ ] Integrate character effects display into character cards
- [ ] Position effects appropriately in card layout
- [ ] Ensure consistent spacing and alignment
- [ ] Test with various numbers of effects

**Acceptance Criteria:**
- Effects display seamlessly in character cards
- Layout remains clean with many effects
- Mobile responsive design maintained

## Phase 5: Real-time Updates & Testing

### Task 5.1: WebSocket Integration
**Priority:** Medium  
**Estimated Time:** 2-3 hours

- [ ] Ensure character effect changes trigger encounter broadcasts
- [ ] Handle real-time updates in EncounterContext
- [ ] Test multi-user effect synchronization
- [ ] Verify WebSocket message handling

**Acceptance Criteria:**
- Effects appear immediately for all connected users
- No duplicate or missing effects
- WebSocket errors handled gracefully

### Task 5.2: Component Unit Tests
**Priority:** Medium  
**Estimated Time:** 3-4 hours

- [ ] Write tests for CharacterEffectsDisplay component
- [ ] Test CharacterEffectModal form validation
- [ ] Test CharacterEffectIcon interactions
- [ ] Add tests for permission-based rendering

**Acceptance Criteria:**
- All components have unit tests
- Edge cases covered (empty effects, validation errors)
- Permission logic tested

### Task 5.3: Integration Testing
**Priority:** Medium  
**Estimated Time:** 2-3 hours

- [ ] Test complete effect creation workflow
- [ ] Test effect deletion with confirmation
- [ ] Test real-time updates across multiple browser windows
- [ ] Test mobile responsiveness

**Acceptance Criteria:**
- End-to-end workflows function correctly
- Mobile UI works properly
- Multi-user scenarios tested

### Task 5.4: E2E Testing with Playwright
**Priority:** Low  
**Estimated Time:** 2-3 hours

- [ ] Create Playwright test for character effects workflow
- [ ] Test gamemaster adding effects during encounter
- [ ] Test player viewing effects
- [ ] Test real-time synchronization

**Acceptance Criteria:**
- E2E test covers complete user journey
- Both gamemaster and player perspectives tested
- Test runs reliably in CI environment

## Phase 6: Polish & Documentation

### Task 6.1: Visual Polish
**Priority:** Low  
**Estimated Time:** 2-3 hours

- [ ] Refine spacing and alignment in all components
- [ ] Ensure consistent color usage across themes
- [ ] Add smooth animations for effect creation/deletion
- [ ] Optimize for mobile layout

**Acceptance Criteria:**
- Professional visual appearance
- Smooth user interactions
- Consistent with overall app design

### Task 6.2: Accessibility Improvements
**Priority:** Medium  
**Estimated Time:** 1-2 hours

- [ ] Add proper ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Verify color contrast meets standards

**Acceptance Criteria:**
- Components accessible to screen readers
- Keyboard navigation functional
- WCAG color contrast compliance

### Task 6.3: Component Documentation
**Priority:** Low  
**Estimated Time:** 1-2 hours

- [ ] Document component props and interfaces
- [ ] Add usage examples for each component
- [ ] Update README with character effects feature info
- [ ] Document any new patterns or conventions

**Acceptance Criteria:**
- Clear component documentation
- Usage examples provided
- Integration patterns documented

## Estimated Total Time: 35-50 hours

**Critical Path:** Backend API → Type Definitions → Core UI Components → Integration
**Dependencies:** Phase 1 must complete before Phase 2, Phase 2 before Phase 3
**Risk Areas:** WebSocket integration, Mobile responsive design, Action value validation logic