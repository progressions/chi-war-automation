# Character Advancements Manager

**Date:** 2025-11-20
**Status:** Planned
**Author:** Isaac Priestley

## Overview

This specification describes the implementation of an Advancements Manager component for Player Characters (PCs) that tracks character progression through experience points, levels, or other advancement milestones. The feature will provide a UI similar to the existing Skills Manager on the character Show page.

## Problem Statement

The Chi War application tracks character advancements in the backend database but lacks a frontend interface for managing them. Players and gamemasters need an intuitive way to:

1. View a character's advancement history
2. Add new advancements as characters gain experience
3. See the total count of advancements at a glance
4. Remove advancements if needed (e.g., corrections)

## Current Data Model

### Backend Support Status

| Feature | shot-server (Rails) | shot-elixir (Phoenix) |
|---------|--------------------|-----------------------|
| Advancement Schema/Model | ✅ Complete | ✅ Complete |
| Character Association | ✅ has_many | ✅ has_many |
| API V1 Endpoints | ✅ Complete (Legacy) | ❌ Missing |
| **API V2 Endpoints** | ❌ Missing | ❌ Missing |
| Model Tests | ✅ Complete | ❌ Missing |
| Controller Tests (V1) | ✅ Complete | ❌ Missing |
| **Controller Tests (V2)** | ❌ Missing | ❌ Missing |
| JSON Serialization | ✅ AdvancementSerializer | ⚠️ Partial (IDs only) |

**Implementation Strategy**: Create V2 endpoints for both backends. V1 endpoints will remain for backward compatibility.

### Backend (Rails - shot-server)

**Database Table** (`advancements`):
```ruby
create_table :advancements, id: :uuid do |t|
  t.references :character, null: false, type: :uuid, foreign_key: true
  t.string :description
  t.timestamps
end
```

**Model** (`app/models/advancement.rb`):
```ruby
class Advancement < ApplicationRecord
  belongs_to :character
  validates :character, presence: true
end
```

**API Endpoints** (V1 - Legacy, V2 - To Be Created):
- `GET /api/v1/characters/:character_id/advancements` - List all advancements (Legacy)
- `POST /api/v1/characters/:character_id/advancements` - Create advancement (Legacy)
- `GET /api/v1/characters/:character_id/advancements/:id` - Show single advancement (Legacy)
- `PATCH /api/v1/characters/:character_id/advancements/:id` - Update advancement (Legacy)
- `DELETE /api/v1/characters/:character_id/advancements/:id` - Delete advancement (Legacy)

**Note**: V1 endpoints exist but new implementation should use V2 for consistency

**Serializer** (`app/serializers/advancement_serializer.rb`):
```ruby
class AdvancementSerializer < ActiveModel::Serializer
  attributes :id, :description, :created_at, :updated_at, :character_id
end
```

### Frontend (Next.js)

**Type Definition** (MISSING - needs to be added):
```typescript
export interface Advancement extends BaseEntity {
  id: string
  character_id: string
  description: string
  created_at: string
  updated_at: string
}
```

**API Client Methods** (partially implemented in `characterClient.ts:249-260`):
```typescript
async function createAdvancement(
  character: Character,
  advancement: Advancement
): Promise<AxiosResponse<Advancement>>

async function deleteAdvancement(
  character: Character,
  advancement: Advancement
): Promise<AxiosResponse<void>>
```

**Missing**: Update method, list method

### Backend (Elixir - shot-elixir)

**Schema** (`lib/shot_elixir/characters/advancement.ex`):
```elixir
defmodule ShotElixir.Characters.Advancement do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "advancements" do
    field :description, :string
    belongs_to :character, ShotElixir.Characters.Character

    timestamps(inserted_at: :created_at, updated_at: :updated_at, type: :utc_datetime)
  end

  def changeset(advancement, attrs) do
    advancement
    |> cast(attrs, [:description, :character_id])
    |> validate_required([:description, :character_id])
  end
end
```

**Character Association** (`lib/shot_elixir/characters/character.ex:80`):
```elixir
has_many :advancements, ShotElixir.Characters.Advancement
```

**Character View** (`lib/shot_elixir_web/views/api/v2/character_view.ex:106`):
```elixir
advancement_ids: get_association_ids(character, :advancements)
```

**Missing Components**:
- ❌ No `/api/v2/characters/:character_id/advancements` controller
- ❌ No routes for advancement CRUD in V2
- ❌ No advancement controller tests
- ❌ No advancement model/schema tests
- ⚠️ Character view only includes `advancement_ids`, not full advancement objects

**Required Implementation**: Create V2 API endpoints (V1 exists in Rails for legacy support)

## Proposed Solution

Create an `AdvancementsManager` component that mirrors the existing `SkillsManager` component pattern, allowing users to:
1. View all advancements in a single-column list (not split like skills)
2. Add new advancements with a description
3. See total advancement count in the section header
4. Delete advancements when needed
5. Toggle visibility of the management interface

## Implementation Details

### 1. Type Definition Updates

**File**: `src/types/resources.ts`

Add the Advancement interface:
```typescript
export interface Advancement extends BaseEntity {
  id: string
  character_id: string
  description: string
  created_at: string
  updated_at: string
}
```

Export it from the barrel file:
```typescript
// In src/types/types.ts
export type { Advancement } from "./resources"
```

### 2. API Client Enhancement

**File**: `src/lib/client/characterClient.ts`

Add missing client methods:
```typescript
async function getAdvancements(
  character: Character
): Promise<AxiosResponse<Advancement[]>> {
  return get(api.advancements(character))
}

async function updateAdvancement(
  character: Character,
  advancement: Advancement
): Promise<AxiosResponse<Advancement>> {
  return patch(
    api.advancements(character, advancement),
    { advancement: advancement }
  )
}
```

### 3. AdvancementsManager Component

**File**: `src/components/characters/edit/AdvancementsManager.tsx`

**Component Structure**:
```typescript
type FormStateData = {
  characterAdvancements: Advancement[]
  advancementDescription: string
  editingAdvancement: Advancement | null
  showAll: boolean
  open: boolean
}

type AdvancementsManagerProps = {
  character: Character
  updateCharacter?: (character: Character) => void
}
```

**Key Features**:
- Collapsible section with ManageButton toggle
- Section header shows "Advancements (X)" where X is the count (visible even when closed)
- PC-only feature (hidden for NPCs)
- When open, displays:
  - Text input for new/editing advancement description
  - Save button (disabled when description is empty)
  - List of existing advancements with edit and delete buttons
  - Timestamps displayed for each advancement
- Single-column layout (unlike skills' two-column layout)
- Advancements sorted by creation date (newest first)
- Shows recent 10 advancements with "Show All" option if more than 10
- Edit mode preserves original created_at timestamp
- WebSocket updates for real-time synchronization

**UI Components Used**:
- `SectionHeader` - with title, icon, and action button
- `TextField` - for advancement description input
- `SaveButton` - to add new advancement
- `ManageButton` - to toggle edit mode
- `IconButton` with `DeleteIcon` - to remove advancements
- `Icon` component with keyword "Advancements"
- `Typography` - to display advancement descriptions
- `Box`, `Stack` - for layout

**State Management**:
- Uses `useForm` hook from `@/reducers`
- Local state tracks: advancements array, description input, open/closed state
- useEffect syncs with character prop changes
- Optimistic UI updates followed by API calls

### 4. Integration with Character Show Page

**File**: `src/components/characters/Show.tsx`

Add import:
```typescript
import { AdvancementsManager } from "@/components/characters"
```

Add component after Description section:
```typescript
<Description
  character={memoizedCharacter}
  updateCharacter={updateCharacter}
/>

{memoizedCharacter.action_values?.Type === "PC" && (
  <AdvancementsManager
    character={memoizedCharacter}
    updateCharacter={updateCharacter}
  />
)}

<Weapons
  character={memoizedCharacter}
  setCharacter={setCharacter}
/>
```

Note: Conditional rendering ensures only PC characters see the Advancements section.

### 5. Component Export

**File**: `src/components/characters/edit/index.ts`

Add export:
```typescript
export { default as AdvancementsManager } from "./AdvancementsManager"
```

Or update main barrel file:
**File**: `src/components/characters/index.ts`
```typescript
export { default as AdvancementsManager } from "./edit/AdvancementsManager"
```

## User Interface Details

### Section Header
- **Title**: "Advancements (X)" where X is the total count
- **Icon**: Use `<Icon keyword="Advancements" size="24" />`
- **Description**: "Track your character's experience and progression milestones."
- **Action Button**: ManageButton toggle

### Add Advancement Form (When Open)
```
┌────────────────────────────────────────────────────────┐
│ [Text Field: "Add Advancement"]           [Save]       │
└────────────────────────────────────────────────────────┘
```

### Advancement List
```
┌──────────────────────────────────────────────────────────────┐
│ Reached 5th Level                    Nov 20    [Edit] [Delete]│
│ Learned new Schtick: Lightning Reload Nov 15   [Edit] [Delete]│
│ Increased Defense from 13 to 14      Nov 10    [Edit] [Delete]│
│                                                   [Show All...] │
└──────────────────────────────────────────────────────────────┘
```

When NOT in edit mode (open=false), hide edit/delete buttons but show timestamps.

### Example States

**Empty State (No Advancements)**:
```
Advancements (0)
─────────────────────────────────────────────
Track your character's experience and progression milestones.
[Manage ▼]

No advancements yet.
```

**With Advancements (Closed)**:
```
Advancements (3)
─────────────────────────────────────────────
Track your character's experience and progression milestones.
[Manage ▼]

Reached 5th Level                              Nov 20, 2025
Learned new Schtick: Lightning Reload          Nov 15, 2025
Increased Defense from 13 to 14                Nov 10, 2025
```

**With Advancements (Open)**:
```
Advancements (3)
─────────────────────────────────────────────
Track your character's experience and progression milestones.
[Manage ▲]

[Add Advancement                           ] [Save]

Reached 5th Level                Nov 20    [✏️] [🗑️]
Learned new Schtick: Lightning   Nov 15    [✏️] [🗑️]
Increased Defense from 13 to 14  Nov 10    [✏️] [🗑️]
```

**With 10+ Advancements (Showing Recent 10)**:
```
Advancements (12)
─────────────────────────────────────────────
[Manage ▼]

Advanced to Level 6              Dec 5      [✏️] [🗑️]
Learned Dragon Fire Schtick      Dec 1      [✏️] [🗑️]
... (8 more recent advancements)
                                          [Show All (12)]
```

## Business Logic

### Adding an Advancement
1. User enters description in text field
2. User clicks Save button
3. Create new advancement via API: `POST /api/v2/characters/:id/advancements`
4. WebSocket broadcasts update to all connected clients
5. Character updates via WebSocket subscription (no manual refresh needed)
6. Clear input field but keep form open
7. Show success toast: "Advancement added successfully"

### Editing an Advancement
1. User clicks edit button on specific advancement
2. Description loads into text field (edit mode)
3. User modifies description
4. User clicks Save button
5. Update via API: `PATCH /api/v2/characters/:id/advancements/:advancement_id`
6. WebSocket broadcasts update to all connected clients
7. `created_at` timestamp remains unchanged
8. Clear form and exit edit mode
9. Show success toast: "Advancement updated successfully"

### Deleting an Advancement
1. User clicks delete button on specific advancement
2. Delete via API: `DELETE /api/v2/characters/:id/advancements/:advancement_id`
3. WebSocket broadcasts update to all connected clients
4. Character updates via WebSocket subscription
5. Show success toast: "Advancement removed successfully"

### Show All Functionality
1. If character has more than 10 advancements, display only 10 most recent
2. Show "Show All (X)" button at bottom of list
3. When clicked, toggle `showAll` state to display full list
4. Button text changes to "Show Recent (10)" when expanded

### Character Updates via WebSocket
- Unlike Skills (which update the character's skills object), Advancements are separate records
- Character Show page already subscribes to WebSocket updates via `subscribeToEntity("character", ...)`
- When advancements change, backend broadcasts character update via ActionCable
- Frontend receives update and automatically re-renders with new advancements array
- No manual refresh or re-fetch needed after create/update/delete operations

## Technical Implementation Notes

### API Interactions

**Create Advancement** (V2 API):
```typescript
await client.createAdvancement(character, {
  description: advancementDescription,
  character_id: character.id,
})
// Uses: POST /api/v2/characters/:character_id/advancements
// No manual update needed - WebSocket handles it
```

**Update Advancement** (V2 API):
```typescript
await client.updateAdvancement(character, {
  ...advancement,
  description: editedDescription,
})
// Uses: PATCH /api/v2/characters/:character_id/advancements/:id
// No manual update needed - WebSocket handles it
```

**Delete Advancement** (V2 API):
```typescript
await client.deleteAdvancement(character, advancement)
// Uses: DELETE /api/v2/characters/:character_id/advancements/:id
// No manual update needed - WebSocket handles it
```

**WebSocket Integration**:
The Character Show page already subscribes to entity updates:
```typescript
useEffect(() => {
  const unsubscribe = subscribeToEntity("character", data => {
    if (data && data.id === initialCharacter.id) {
      setCharacter(data) // Automatically updates with new advancements
    }
  })
  return unsubscribe
}, [subscribeToEntity, initialCharacter.id])
```

### Error Handling
- Wrap API calls in try/catch blocks
- On error, revert optimistic updates
- Show error toast with descriptive message
- Log errors to console for debugging

### Validation
- Description field is required (cannot be empty or whitespace-only)
- Trim whitespace from description before saving
- Maximum length: 255 characters
- Save button disabled when description is invalid
- No duplicate checking (allowed by design)

## Testing Strategy

### Backend Tests (REQUIRED)

**Rails (shot-server)**:
```bash
# Run all advancement tests
cd shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
bundle exec rspec spec/models/advancement_spec.rb
bundle exec rspec spec/requests/api/v1/advancements_spec.rb  # Legacy V1 tests
bundle exec rspec spec/requests/api/v2/advancements_spec.rb  # New V2 tests
```

Expected test coverage:
- Model validations (requires character, description optional)
- V1 controller actions (legacy, for backward compatibility)
- V2 controller actions (index, create, show, update, delete)
- Authentication and authorization
- JSON serialization

**Elixir (shot-elixir)**:
```bash
# Run advancement tests (once implemented)
cd shot-elixir
mix test test/shot_elixir/characters/advancement_test.exs
mix test test/shot_elixir_web/controllers/api/v2/advancement_controller_test.exs
```

Expected test coverage (mirror Rails V2 tests):
- Schema validations and changesets
- Character association
- V2 controller actions (index, create, show, update, delete)
- Guardian JWT authentication
- Campaign context validation
- JSON view rendering

### Frontend Unit Tests (Future)
- Component renders correctly with empty advancements
- Component renders correctly with existing advancements
- Add advancement form validation
- Edit advancement preserves timestamp
- Show All toggle functionality

### Manual Testing Checklist
1. ✅ Navigate to PC character Show page
2. ✅ Verify "Advancements (0)" section appears after Description
3. ✅ Verify NPC character does NOT show Advancements section
4. ✅ Click Manage button to open form
5. ✅ Add advancement with valid description
6. ✅ Verify advancement appears in list with timestamp
7. ✅ Verify count updates in header
8. ✅ Add multiple advancements
9. ✅ Edit an advancement description
10. ✅ Verify edited advancement keeps original timestamp
11. ✅ Delete an advancement
12. ✅ Verify count decrements
13. ✅ Close manager (verify edit/delete buttons disappear, timestamps remain)
14. ✅ Add 11+ advancements, verify "Show All" button appears
15. ✅ Test "Show All" toggle functionality
16. ✅ Test WebSocket sync (open character in two browser tabs)
17. ✅ Test permissions (gamemaster vs. player ownership)
18. ✅ Refresh page (verify advancements persist)

### Edge Cases
- Empty description (should disable Save button)
- Whitespace-only description (should trim and validate)
- 255+ character descriptions (should truncate or show error)
- Exactly 10 advancements (Show All button should not appear)
- Exactly 11 advancements (Show All button appears)
- Very long descriptions (test text overflow/wrapping)
- Rapid add/delete operations (test WebSocket updates)
- Network errors (test error handling and user feedback)
- Edit mode cancellation (ensure form clears properly)
- Switching between characters (ensure form resets)

## Migration Considerations

### Database
- No migrations needed (table already exists)
- Existing advancement data will work with new UI

### API
- No API changes needed (endpoints already exist)
- **Future Enhancement**: Add API v2 endpoints for consistency

### Frontend
- Add missing TypeScript type definition
- Implement missing API client methods
- Create new component following existing patterns

## Future Enhancements

1. **Advancement Categories**: Group advancements by type (level up, schtick, stat increase)
3. **Timestamps**: Display when each advancement was created
4. **API V2 Endpoints**: Migrate from V1 to V2 API for consistency
5. **Advancement Templates**: Pre-defined advancement types for quick selection
6. **Bulk Import**: Import multiple advancements from character sheet
7. **Export**: Export advancement history as text/PDF
8. **Undo/Redo**: Allow undo of recent advancement operations
9. **Search/Filter**: Search advancements by description keyword

## Implementation Tasks

### Phase 0: Backend Implementation (Both Rails and Elixir)

**MUST COMPLETE BEFORE FRONTEND WORK**

#### Rails V2 Controller Implementation
- [ ] Create `app/controllers/api/v2/advancements_controller.rb`
- [ ] Implement `index` action - list all advancements for a character
- [ ] Implement `create` action - create new advancement
- [ ] Implement `show` action - get single advancement
- [ ] Implement `update` action - update advancement description
- [ ] Implement `delete` action - remove advancement
- [ ] Add advancement routes to `routes.rb` under `/api/v2/characters/:character_id/advancements`
- [ ] Update or create V2 advancement serializer

#### Rails V2 Controller Tests
- [ ] Create `spec/requests/api/v2/advancements_spec.rb`
- [ ] Test GET `/api/v2/characters/:character_id/advancements` - list all
- [ ] Test POST `/api/v2/characters/:character_id/advancements` - create
- [ ] Test GET `/api/v2/characters/:character_id/advancements/:id` - show
- [ ] Test PATCH `/api/v2/characters/:character_id/advancements/:id` - update
- [ ] Test DELETE `/api/v2/characters/:character_id/advancements/:id` - delete
- [ ] Test authentication requirements
- [ ] Test campaign context validation

#### Elixir V2 Controller Implementation
- [ ] Create `lib/shot_elixir_web/controllers/api/v2/advancement_controller.ex`
- [ ] Implement `index` action - list all advancements for a character
- [ ] Implement `create` action - create new advancement
- [ ] Implement `show` action - get single advancement
- [ ] Implement `update` action - update advancement description
- [ ] Implement `delete` action - remove advancement
- [ ] Add advancement routes to `router.ex` under `/api/v2/characters/:character_id/advancements`
- [ ] Create/update advancement view for JSON serialization

#### Elixir Model Tests
- [ ] Create `test/shot_elixir/characters/advancement_test.exs`
- [ ] Test advancement requires character_id
- [ ] Test advancement allows nil description
- [ ] Test advancement changeset validation
- [ ] Test character association

#### Elixir V2 Controller Tests
- [ ] Create `test/shot_elixir_web/controllers/api/v2/advancement_controller_test.exs`
- [ ] Test GET `/api/v2/characters/:character_id/advancements` - list all
- [ ] Test POST `/api/v2/characters/:character_id/advancements` - create
- [ ] Test GET `/api/v2/characters/:character_id/advancements/:id` - show
- [ ] Test PATCH `/api/v2/characters/:character_id/advancements/:id` - update
- [ ] Test DELETE `/api/v2/characters/:character_id/advancements/:id` - delete
- [ ] Test authentication requirements
- [ ] Test campaign context validation

#### Backend Test Verification
- [ ] Run Rails V1 tests (verify legacy still works): `bundle exec rspec spec/requests/api/v1/advancements_spec.rb`
- [ ] Run Rails V2 tests (new): `bundle exec rspec spec/requests/api/v2/advancements_spec.rb`
- [ ] Run Elixir V2 tests: `mix test test/shot_elixir_web/controllers/api/v2/advancement_controller_test.exs`
- [ ] Verify all backend tests pass before frontend implementation

### Phase 1: Type Definitions and API Client
- [ ] Add `Advancement` interface to `src/types/resources.ts`
- [ ] Export `Advancement` from `src/types/types.ts`
- [ ] Update `Api.ts` to add V1 advancement URL helpers (if needed for backward compatibility)
- [ ] Update `ApiV2.ts` to add V2 advancement URL helpers
- [ ] Add `getAdvancements()` method to `characterClient.ts` (using V2)
- [ ] Update `createAdvancement()` method to use V2 endpoint
- [ ] Update `deleteAdvancement()` method to use V2 endpoint
- [ ] Add `updateAdvancement()` method to `characterClient.ts` (using V2)
- [ ] Update client exports to include new methods

### Phase 2: Component Development
- [ ] Create `src/components/characters/edit/AdvancementsManager.tsx`
- [ ] Implement form state management with useForm hook
- [ ] Implement add advancement functionality
- [ ] Implement edit advancement functionality (preserve created_at)
- [ ] Implement delete advancement functionality
- [ ] Add "Show All" toggle for 10+ advancements
- [ ] Display timestamps for each advancement (formatted date)
- [ ] Add loading/error states
- [ ] Style component to match SkillsManager pattern
- [ ] Add advancement count to section header
- [ ] Add PC-only conditional rendering

### Phase 3: Integration
- [ ] Export component from `src/components/characters/edit/index.ts`
- [ ] Import and add component to `Show.tsx`
- [ ] Position after Description, before Weapons
- [ ] Add PC-only conditional wrapper
- [ ] Verify WebSocket subscription updates work correctly
- [ ] Test integration with character update flow

### Phase 4: Polish and Testing
- [ ] Add toast notifications for success/error
- [ ] Verify WebSocket updates (no optimistic updates needed)
- [ ] Add error handling with user feedback
- [ ] Test with empty advancements
- [ ] Test with 10+ advancements (Show All feature)
- [ ] Test edit mode (preserve timestamp)
- [ ] Test PC vs NPC visibility
- [ ] Test gamemaster/admin permissions
- [ ] Test edge cases and error scenarios
- [ ] Test multi-tab WebSocket synchronization
- [ ] Update character type to include advancements array (if not already present)

### Phase 5: Documentation
- [ ] Add JSDoc comments to component
- [ ] Document API client methods
- [ ] Update character component documentation
- [ ] Add user-facing help text if needed

## Success Criteria

### Backend
1. ✅ Rails backend has V1 (legacy) and V2 advancement CRUD with passing tests
2. ✅ Elixir backend has V2 advancement CRUD with passing tests
3. ✅ Both backends support identical V2 API endpoints
4. ✅ Rails V1 endpoints remain for backward compatibility
5. ✅ Both backends broadcast WebSocket updates on advancement changes
6. ✅ All backend tests pass (Rails RSpec V1 + V2, Elixir ExUnit V2)

### Frontend
6. ✅ PC characters (only) can view their advancement history
7. ✅ Users can add new advancements with descriptions
8. ✅ Users can edit existing advancements (timestamp preserved)
9. ✅ Users can delete advancements
10. ✅ Total advancement count displays in section header (even when closed)
11. ✅ Timestamps display for each advancement
12. ✅ "Show All" functionality works for 10+ advancements
13. ✅ UI matches existing component patterns
14. ✅ All CRUD operations persist to backend (both Rails and Elixir)
15. ✅ WebSocket updates sync across browser tabs
16. ✅ Permissions enforce gamemaster/owner access
17. ✅ Error handling provides clear feedback
18. ✅ Component integrates seamlessly after Description section
19. ✅ Works with both NEXT_PUBLIC_BACKEND_TYPE=rails and phoenix

## Design Decisions

1. **Sort Order**: ✅ Newest-first - shows recent progression prominently
2. **Timestamps**: ✅ Display creation date next to each advancement
3. **Large Lists**: ✅ Show recent 10 with "Show All" option (max expected: 12-15)
4. **Character Types**: ✅ PC-only feature (NPCs don't advance)
5. **Permissions**: ✅ Gamemaster/Admin can manage any character; users can manage characters they own
6. **Default State**: ✅ Closed by default, displays count when closed
7. **Empty State**: ✅ Show section with "No advancements yet" message
8. **Description Length**: ✅ 255 character maximum (same as Skills)
9. **Icon**: ✅ TBD during development
10. **Placement**: ✅ After Description section on Character Show page
11. **Mobile**: ✅ Same layout as desktop (single column)
12. **Edit Capability**: ✅ Allow editing descriptions (preserves created_at timestamp)
13. **Duplicates**: ✅ No validation or prevention
14. **Deletion**: ✅ Immediate delete, no confirmation
15. **Updates**: ✅ Use WebSocket updates for real-time sync

## Dependencies

### Backend
- Rails V1 advancement endpoints (✅ already implemented and tested - legacy)
- Rails V2 advancement endpoints (❌ must implement before frontend work)
- Elixir V2 advancement endpoints (❌ must implement before frontend work)
- Both backends must support identical V2 API format
- WebSocket broadcasting for character updates

### Frontend
- Existing `SkillsManager` component as reference implementation
- Character Show page structure
- useForm reducer hook
- UI components (SectionHeader, TextField, SaveButton, etc.)
- API V2 client methods (to be created/updated)

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Need to create V2 for both backends | Medium | Phase 0 handles both Rails and Elixir V2 implementation |
| V1 legacy endpoints remain | Low | Keep for backward compatibility, document V2 as primary |
| Missing type definition | Medium | Add as first task in Phase 1 |
| WebSocket sync across backends | Low | Both use same ActionCable/Channels pattern |
| User confusion about purpose | Low | Clear help text in section header |

## Timeline Estimate

- **Phase 0**: 6-9 hours (Backend implementation with tests for both Rails V2 and Elixir V2)
  - Rails V2 Controller: 1.5-2 hours
  - Rails V2 Tests: 1-1.5 hours
  - Elixir V2 Controller: 2-3 hours
  - Elixir V2 Tests: 1.5-2.5 hours
- **Phase 1**: 1-2 hours (types and API client)
- **Phase 2**: 3-4 hours (component development)
- **Phase 3**: 1 hour (integration)
- **Phase 4**: 2-3 hours (testing and polish)
- **Phase 5**: 1 hour (documentation)

**Total**: 16-22 hours (includes Rails V2, Elixir V2, edit functionality, and Show All feature)

## References

### Frontend
- Skills Manager: `shot-client-next/src/components/characters/edit/SkillsManager.tsx`
- Character Show: `shot-client-next/src/components/characters/Show.tsx`
- API Client: `shot-client-next/src/lib/client/characterClient.ts`

### Backend - Rails
- Model: `shot-server/app/models/advancement.rb`
- V1 Controller (Legacy): `shot-server/app/controllers/api/v1/advancements_controller.rb`
- V2 Controller: `shot-server/app/controllers/api/v2/advancements_controller.rb` (TO BE CREATED)
- Serializer: `shot-server/app/serializers/advancement_serializer.rb`
- Routes: `rails routes | grep advancement`
- Model Tests: `shot-server/spec/models/advancement_spec.rb`
- V1 Controller Tests (Legacy): `shot-server/spec/requests/api/v1/advancements_spec.rb`
- V2 Controller Tests: `shot-server/spec/requests/api/v2/advancements_spec.rb` (TO BE CREATED)

### Backend - Elixir
- Schema: `shot-elixir/lib/shot_elixir/characters/advancement.ex`
- Character Association: `shot-elixir/lib/shot_elixir/characters/character.ex:80`
- Character View: `shot-elixir/lib/shot_elixir_web/views/api/v2/character_view.ex:106`
- V2 Controller: `shot-elixir/lib/shot_elixir_web/controllers/api/v2/advancement_controller.ex` (TO BE CREATED)
- Routes: `shot-elixir/lib/shot_elixir_web/router.ex` (TO BE UPDATED)
- Schema Tests: `shot-elixir/test/shot_elixir/characters/advancement_test.exs` (TO BE CREATED)
- V2 Controller Tests: `shot-elixir/test/shot_elixir_web/controllers/api/v2/advancement_controller_test.exs` (TO BE CREATED)
