# Fight Lifecycle Management Feature Specification

**Date**: January 4, 2025  
**Author**: Development Team  
**Status**: In Development  
**Feature Branch**: `fight-lifecycle-management`

## Executive Summary

Implement a comprehensive fight lifecycle management system that provides clear visibility of active fights and allows GMs to properly end fights. This includes an active fight banner on the homepage for quick access and an explicit "End Fight" mechanism to close out combat encounters.

## Problem Statement

Currently, the application lacks:
1. Clear visibility of ongoing fights from the homepage
2. An explicit mechanism for GMs to end fights and prevent further updates
3. A cohesive fight lifecycle that distinguishes between unstarted, active, and ended fights

## Solution Overview

### 1. Active Fight Banner
A prominent banner on the dashboard that displays when a fight is currently active, allowing quick access for all campaign members.

### 2. Fight Ending Mechanism
An explicit "End Fight" button in the encounter admin panel that properly closes a fight and prevents further modifications.

### 3. Fight Lifecycle States
Clear definition and enforcement of fight states: Unstarted, Active, and Ended.

## Technical Architecture

### Backend Components

#### API Endpoints

**1. Get Current Fight**
```
GET /api/v2/campaigns/:id/current_fight
```
- Returns the currently active fight for a campaign
- Response includes fight details and participant count
- Returns null if no active fight

**2. End Fight**
```
PATCH /api/v2/fights/:id/end
```
- Sets the `ended_at` timestamp
- Prevents further modifications
- Broadcasts fight ended event via WebSocket

#### Database Schema
Existing fields utilized:
- `fights.started_at` - timestamp when fight begins
- `fights.ended_at` - timestamp when fight ends
- `fights.sequence` - current sequence number

#### Model Updates

**Fight Model**
```ruby
class Fight < ApplicationRecord
  scope :active, -> { where.not(started_at: nil).where(ended_at: nil) }
  scope :current, -> { active.order(started_at: :desc).first }
  
  def active?
    started_at.present? && ended_at.nil?
  end
  
  def ended?
    ended_at.present?
  end
  
  def can_modify?
    !ended?
  end
end
```

### Frontend Components

#### ActiveFightBanner Component
Location: `src/components/dashboard/ActiveFightBanner.tsx`

**Props:**
- `campaignId: string`
- `userId: string`
- `isGamemaster: boolean`

**Features:**
- Displays fight name and current sequence
- Shows participant count
- "Join Fight" button for players
- "Resume Fight" button for GM
- Auto-dismiss when fight ends
- Real-time updates via WebSocket

**Visual Design:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔥 Active Fight: "Warehouse Showdown" - Sequence 3      │
│ 12 participants in combat                               │
│                                    [Join Fight] →       │
└─────────────────────────────────────────────────────────┘
```

#### EndFightDialog Component
Location: `src/components/encounters/EndFightDialog.tsx`

**Props:**
- `open: boolean`
- `onClose: () => void`
- `onConfirm: () => void`
- `fightName: string`

**Features:**
- Confirmation dialog to prevent accidental ending
- Warning about irreversibility
- Option to add closing notes

#### MenuBar Updates
Location: `src/components/encounters/MenuBar.tsx`

**Changes:**
- Add "End Fight" button to admin panel
- Only visible to GM
- Disabled if fight already ended
- Red color scheme to indicate finality

### WebSocket Events

**New Events:**
- `fight_started` - Broadcast when fight begins
- `fight_ended` - Broadcast when fight ends
- `fight_updated` - Existing event for fight changes

## User Experience Flow

### For Players

1. **Homepage Visit**
   - See active fight banner if fight is ongoing
   - Click "Join Fight" to navigate to encounter

2. **During Fight**
   - Normal fight participation
   - Receive notification when fight ends

3. **After Fight Ends**
   - Banner disappears
   - Fight becomes read-only

### For Gamemaster

1. **Starting a Fight**
   - Navigate to fight/encounter
   - Click "Roll Initiative" to mark as started
   - Banner appears on homepage for all users

2. **During Fight**
   - Full fight management capabilities
   - "End Fight" button visible in admin panel

3. **Ending a Fight**
   - Click "End Fight" button
   - Confirm in dialog
   - Fight marked as ended
   - No further modifications allowed

## Implementation Tasks

### Phase 1: Backend Infrastructure (4 hours)
- [ ] Add `current` action to fights controller
- [ ] Add `end_fight` action to fights controller
- [ ] Add Fight model scopes and methods
- [ ] Update fight serializers with status info
- [ ] Add WebSocket broadcast events
- [ ] Add validation to prevent modifying ended fights

### Phase 2: Active Fight Banner (3 hours)
- [ ] Create ActiveFightBanner component
- [ ] Integrate with Dashboard
- [ ] Add API client methods for current fight
- [ ] Implement WebSocket subscription
- [ ] Add loading and error states

### Phase 3: End Fight Mechanism (3 hours)
- [ ] Add End Fight button to MenuBar
- [ ] Create EndFightDialog component
- [ ] Implement end fight API call
- [ ] Add confirmation flow
- [ ] Update UI to show ended state

### Phase 4: Testing & Polish (2 hours)
- [ ] Write unit tests for new endpoints
- [ ] Write component tests
- [ ] Test WebSocket events
- [ ] Test fight lifecycle transitions
- [ ] Handle edge cases

## API Contract

### GET /api/v2/campaigns/:id/current_fight

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Warehouse Showdown",
  "sequence": 3,
  "started_at": "2025-01-04T10:00:00Z",
  "participant_count": 12,
  "shots": [...],
  "gamemaster": {
    "id": "uuid",
    "name": "GM Name"
  }
}
```

**Response (204 No Content):**
When no active fight exists

### PATCH /api/v2/fights/:id/end

**Request Body:**
```json
{
  "notes": "Optional closing notes"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Warehouse Showdown",
  "ended_at": "2025-01-04T11:30:00Z",
  "status": "ended"
}
```

**Error Response (422):**
```json
{
  "error": "Fight has already ended"
}
```

## Security Considerations

- Only GMs can end fights
- Validate campaign membership for fight access
- Prevent replay attacks on end fight endpoint
- Audit log for fight lifecycle changes

## Performance Considerations

- Cache current fight status in Redis
- Debounce WebSocket updates
- Lazy load fight details in banner
- Use optimistic UI updates

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements for fight status changes
- High contrast mode support

## Testing Strategy

### Unit Tests
- Fight model lifecycle methods
- Controller actions and authorization
- Serializer output format

### Integration Tests
- Full fight lifecycle flow
- WebSocket event broadcasting
- API endpoint responses

### E2E Tests
- Player joining active fight
- GM ending fight flow
- Banner visibility and updates

## Success Metrics

- Reduction in user confusion about fight status
- Decrease in support tickets about "stuck" fights
- Improved session flow tracking
- Positive user feedback on fight visibility

## Future Enhancements

1. **Fight History**
   - Archive of ended fights
   - Statistics and analytics

2. **Pause/Resume**
   - Ability to pause fights
   - Save and restore fight state

3. **Multiple Active Fights**
   - Support concurrent fights
   - Fight switching UI

4. **Fight Templates**
   - Save fight setups
   - Quick fight initialization

## Dependencies

- Existing fight/encounter system
- WebSocket infrastructure
- Authentication and authorization
- Campaign context system

## Rollback Plan

Feature is additive and can be disabled via feature flag if issues arise:
- `FIGHT_LIFECYCLE_ENABLED` environment variable
- Gradual rollout by campaign ID
- Fallback to existing fight behavior

## Documentation Updates Required

- User guide: Fight lifecycle section
- GM guide: Ending fights
- API documentation: New endpoints
- WebSocket events documentation