# Field Mapping Strategy for Dismissable Onboarding Modules

## Backend Analysis Summary

### OnboardingProgress Model Fields
```ruby
class OnboardingProgress < ApplicationRecord
  # Milestone timestamp fields
  first_campaign_created_at: datetime
  first_campaign_activated_at: datetime
  first_character_created_at: datetime
  first_faction_created_at: datetime
  first_party_created_at: datetime
  first_site_created_at: datetime
  first_fight_created_at: datetime
  congratulations_dismissed_at: datetime
  
  # Computed methods (serialized to frontend)
  all_milestones_complete?: boolean
  onboarding_complete?: boolean
  ready_for_congratulations?: boolean
  next_milestone: object
end
```

## Frontend Onboarding Module Structure

### Three Main Modules
1. **CampaignOnboarding** - Pre-campaign creation CTA
2. **OnboardingCarousel** - Post-campaign milestone carousel (6 milestones)
3. **CongratulationsModule** - Final celebration (already dismissable)

### Onboarding Display Logic (OnboardingModule.tsx)
```typescript
// Module visibility conditions:
if (onboarding_complete) return null
if (ready_for_congratulations) show CongratulationsModule
if (!first_campaign_created_at) show CampaignOnboarding
else show OnboardingCarousel
```

## Dismissal Strategy

### Approach: Use Timestamp Fields as Dismissal Flags

Instead of creating new database fields, we'll use the existing milestone timestamp fields to represent dismissal. Setting a timestamp to the current time indicates the module/milestone is "completed" (dismissed).

### Module-to-Field Mapping

#### 1. CampaignOnboarding Module
- **Field**: `first_campaign_created_at`
- **Dismissal Action**: Set to current timestamp
- **Effect**: Hides pre-campaign module, shows carousel
- **Note**: This is foundational and should remain non-dismissible per spec

#### 2. OnboardingCarousel Module (Complete Carousel)
- **Field**: `congratulations_dismissed_at` 
- **Dismissal Action**: Set to current timestamp
- **Effect**: Sets `onboarding_complete = true`, hides all onboarding
- **Note**: This dismisses the entire carousel as a unit

#### 3. Individual Milestone Dismissal (Within Carousel)
Each milestone can be individually dismissed by setting its timestamp:

- **Activate Campaign**: `first_campaign_activated_at`
- **Character**: `first_character_created_at` 
- **Faction**: `first_faction_created_at`
- **Party**: `first_party_created_at`
- **Site**: `first_site_created_at`
- **Fight**: `first_fight_created_at`

### API Integration Pattern

#### Dismiss Action
```typescript
// Example: Dismiss entire carousel
await client.patch('/api/v2/onboarding', {
  onboarding_progress: {
    congratulations_dismissed_at: new Date().toISOString()
  }
})

// Example: Dismiss individual milestone
await client.patch('/api/v2/onboarding', {
  onboarding_progress: {
    first_character_created_at: new Date().toISOString()
  }
})
```

#### Restore Action
```typescript
// Reset specific milestone
await client.patch('/api/v2/onboarding', {
  onboarding_progress: {
    first_character_created_at: null
  }
})

// Reset entire onboarding
await client.patch('/api/v2/onboarding', {
  onboarding_progress: {
    congratulations_dismissed_at: null,
    first_campaign_activated_at: null,
    first_character_created_at: null,
    first_faction_created_at: null,
    first_party_created_at: null,
    first_site_created_at: null,
    first_fight_created_at: null
  }
})
```

## Implementation Benefits

### ✅ Advantages
1. **No Database Changes**: Uses existing fields and API endpoints
2. **Consistent Logic**: Dismissal = completion in onboarding terms
3. **Granular Control**: Individual milestone dismissal supported
4. **Existing Infrastructure**: Leverages current serialization and API patterns
5. **Backward Compatible**: No breaking changes to existing functionality

### ⚠️ Considerations
1. **Semantic Overlap**: Dismissed timestamps also represent "fake completion"
2. **Progress Tracking**: Need to distinguish between actual completion vs dismissal in UI
3. **Restoration**: Nullifying timestamps resets progress, may confuse users

## UI/UX Strategy

### Visual Differentiation
- **Completed** milestones: Green check with actual completion date
- **Dismissed** milestones: Grey/muted styling with "dismissed" indicator
- **In Progress**: Blue styling with action buttons

### Dismiss Button Placement
- **Carousel Module**: Top-right corner "×" button dismisses entire carousel
- **Individual Milestones**: Small "×" button on each milestone card within carousel
- **Campaign Module**: Keep non-dismissible per requirements

## Testing Strategy

### API Testing
- Verify PATCH requests update correct timestamp fields
- Test individual milestone dismissal behavior
- Test complete carousel dismissal
- Test restoration of dismissed modules

### E2E Testing
- Test dismiss button functionality on each module type
- Verify module visibility after dismissal
- Test settings page restoration functionality
- Test persistence across browser sessions

### Test Implementation
Created comprehensive Playwright test: `test-scripts/test-dismissable-onboarding-modules.js`

**Test Coverage:**
1. ✅ Login and verify onboarding carousel visibility
2. ✅ Individual milestone dismissal functionality
3. ✅ Complete carousel dismissal functionality
4. ✅ Onboarding restoration via settings page
5. ✅ Restoration verification
6. ✅ Persistence testing across page refreshes

**Test Features:**
- Uses existing `login-helper.js` for authentication
- Screenshot capture for each test phase
- Error handling and graceful fallbacks
- Support for headless execution via `HEADLESS=true`
- Proper waiting for API responses and UI updates

## Next Steps for Implementation

1. **Add Dismiss Buttons to Components**
   - OnboardingCarousel.tsx: Add top-right corner dismiss button
   - Individual milestone cards: Add small dismiss buttons
   - Use Material-UI Close icon for consistency

2. **Implement API Integration**
   - Create dismiss handler functions in frontend components
   - Use existing onboarding API client methods
   - Handle success/error states with toast notifications

3. **Add Settings Restoration**
   - Add "Reset Onboarding" section to profile/settings page
   - Implement restore functionality with confirmation dialog
   - Use existing API patterns for consistency

4. **Update Frontend Logic**
   - Modify component visibility logic to check dismissed states
   - Ensure proper state management through AppContext
   - Test integration with existing onboarding progress tracking