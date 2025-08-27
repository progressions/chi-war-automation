# PositionableImage Upload Positioning Bug Fix

**Date**: 2025-01-27  
**Priority**: Medium  
**Category**: Frontend/UI  
**Estimated Effort**: 2-4 hours  
**Component**: `PositionableImage.tsx`

## Problem Statement

When users upload a new image via the `PositionableImage` component, they cannot reposition the image correctly until the page is refreshed. The drag-to-reposition functionality appears to use incorrect position calculations, making the image jump to unexpected positions during dragging.

## Root Cause Analysis

### Technical Root Cause

The issue lies in the state initialization pattern in `PositionableImage.tsx` (lines 42-46):

```typescript
const position = entity.image_positions?.find(
  pos => pos.context === context
) || { x_position: 0, y_position: 0 }
const [currentX, setCurrentX] = useState(position.x_position)
const [currentY, setCurrentY] = useState(position.y_position)
```

**The Problem**: 
- `currentX` and `currentY` state variables are initialized **only once** when the component mounts using `useState`
- When a new image is uploaded, `entity.image_url` changes but the position state is **not updated** to reflect the new image
- The drag calculations continue using position coordinates from the previous image, which have different dimensions

### Workflow Breakdown

1. **Initial State**: User has an existing image with position records
2. **Upload New Image**: 
   - New `image_url` is set on entity
   - Component re-renders with new image
   - `currentX` and `currentY` state retain old position values
3. **Attempt Repositioning**:
   - Drag calculations use old coordinates with new image dimensions
   - Results in incorrect positioning behavior
4. **Page Refresh**:
   - Component re-mounts, state re-initializes with current position records
   - Positioning works correctly

### Impact

- **Severity**: Medium - Feature works after refresh but breaks user workflow
- **User Experience**: Frustrating for users who expect immediate repositioning after upload
- **Workaround**: Manual page refresh required
- **Frequency**: Every image upload that requires repositioning

## Technical Specification

### Solution Approach

Clear all existing `image_position` records when a new image is uploaded to an entity. This approach eliminates the state synchronization issue entirely by ensuring users always start with a fresh, centered position for new images.

### Implementation Options

#### Option 1: Model Callback Approach (Recommended)
Add a callback to the `WithImagekit` concern to automatically clear position records when image changes:

```ruby
# In app/models/concerns/with_imagekit.rb
after_save :clear_image_positions_on_image_change

private

def clear_image_positions_on_image_change
  if saved_changes.key?("image_attachment_id") && image.attached?
    image_positions.destroy_all
  end
end
```

**Pros**: 
- Systematic approach - applies to all entities consistently
- Handled at data layer for guaranteed consistency
- Follows Rails conventions for related data cleanup
- No frontend changes needed
- Clean slate for each new image

**Cons**: 
- Users lose existing position customizations
- Requires backend changes

#### Option 2: Controller-Based Clearing (Alternative)
Add position clearing directly in each controller's update method:

```ruby
# In characters_controller.rb, vehicles_controller.rb, etc.
if params[:image].present?
  begin
    @character.image.purge if @character.image.attached?
    @character.image_positions.destroy_all  # Clear positioning data
    @character.image.attach(params[:image])
  rescue StandardError => e
    Rails.logger.error("Error uploading to ImageKit: #{e.message}")
  end
end
```

**Pros**: 
- Explicit control per controller
- Clear intent in upload logic

**Cons**: 
- Requires updates to multiple controllers
- More maintenance overhead

#### Option 3: Service Layer Approach (Alternative)
Create dedicated service for image uploads with position clearing:

```ruby
# app/services/image_upload_service.rb
class ImageUploadService
  def self.replace_image(entity, new_image)
    entity.image.purge if entity.image.attached?
    entity.image_positions.destroy_all
    entity.image.attach(new_image)
    entity
  end
end
```

**Pros**: 
- Encapsulates upload logic
- Reusable across controllers
- Testable in isolation

**Cons**: 
- Requires refactoring existing upload code
- Additional service layer complexity

### Recommended Solution

**Option 1 (Model Callback)** is recommended as it provides the most systematic and maintainable solution with automatic cleanup.

## Implementation Plan

### Phase 1: Backend Fix (Required)
1. **Add callback to WithImagekit concern** in `app/models/concerns/with_imagekit.rb`
   - Location: After existing methods
   - Callback: `after_save :clear_image_positions_on_image_change`
   - Logic: Clear all image_positions when image attachment changes

### Phase 2: Enhanced User Experience (Optional)
2. **Add user notification** for position reset
   - Update upload success toast to mention position reset
   - Consider adding option to preserve positions in future

3. **Improve visual feedback** during upload
   - Show loading state in `PositionableImage` during upload
   - Reset position state to (0,0) after successful upload
   - Add success feedback when upload completes

### Phase 3: Testing and Validation (Required)
4. **Manual testing workflow**:
   - Upload new image to entity with existing position
   - Verify old positions are cleared from database
   - Verify repositioning works immediately after upload
   - Test across different contexts (desktop_entity, mobile_index, etc.)
   - Validate on different entity types (Character, Vehicle, Campaign, etc.)

5. **Automated test coverage**:
   - Add RSpec test for image_position clearing callback
   - Add Playwright test for upload → reposition workflow
   - Test position clearing across entity types

## Files Requiring Changes

### Primary Changes
- **`/shot-server/app/models/concerns/with_imagekit.rb`**
  - Add `after_save :clear_image_positions_on_image_change` callback
  - Implement private method to clear positions on image change

### Secondary Changes (Optional)
- **`/shot-client-next/src/components/ui/PositionableImage.tsx`**
  - Reset currentX/currentY to (0,0) after upload success
  - Update success toast messaging

### Test Files
- **`/shot-server/spec/models/concerns/with_imagekit_spec.rb`** (new/updated)
  - Test image_position clearing on image upload
- **`/test-scripts/test-image-positioning.js`** (new)
  - Automated test for upload → reposition workflow
  - Cross-context positioning validation

## Testing Strategy

### Manual Testing Checklist
- [ ] Upload image to Character with existing position records
- [ ] Verify all old position records are deleted from database
- [ ] Verify drag repositioning works immediately after upload
- [ ] Test image starts at center position (0,0) after upload
- [ ] Test across contexts: desktop_entity, mobile_entity, desktop_index
- [ ] Test with different entity types: Character, Vehicle, Campaign, Site
- [ ] Verify new position saves correctly after repositioning
- [ ] Confirm behavior is consistent across all entity types

### Automated Testing
- [ ] RSpec test: Image position clearing callback
- [ ] Playwright test: Upload → Reposition workflow
- [ ] Database verification: Position records are deleted
- [ ] Cross-entity-type testing: All models with images
- [ ] Mobile touch event testing

## Risk Assessment

### Low Risk
- **Model callback approach**: Well-established Rails pattern
- **Database operation**: Simple destroy_all call, low complexity
- **Backwards compatibility**: No breaking changes to API or frontend

### Medium Risk  
- **Data loss**: Users lose existing position customizations
- **Callback timing**: Ensure callback fires after successful image attachment
- **Performance impact**: destroy_all on related records (minimal for typical usage)

### Mitigation Strategies
- **Thorough testing**: Test all entity types and image upload scenarios
- **Database transaction safety**: Ensure callback runs within save transaction
- **User notification**: Inform users that positions will be reset
- **Monitoring**: Watch for any callback-related errors in logs

## Success Criteria

### Primary Success Metrics
1. **Upload → Reposition workflow** works without page refresh
2. **Position records cleared** automatically on image upload
3. **Zero regression** in existing positioning functionality
4. **Cross-entity consistency** - all entity types behave identically

### Secondary Success Metrics
1. **User workflow improvement** - reduced friction in image management
2. **Clean data state** - no orphaned position records for replaced images  
3. **Bug report reduction** - fewer positioning-related issues
4. **Test coverage increase** - automated coverage for position clearing

## Implementation Notes

### Development Environment
- **Frontend**: Next.js 15.4 with TypeScript
- **Backend**: Rails 8.0 API (image_positions controller)
- **Database**: PostgreSQL with UUID primary keys
- **Testing**: Playwright for E2E, manual testing for UI workflows

### Dependencies
- **No new dependencies** required
- **Existing patterns**: Follows established Rails callback patterns
- **API compatibility**: Uses existing image_position associations and methods

### Deployment Considerations
- **Backend-only change** for core fix
- **No database migrations** required (using existing associations)
- **No API changes** needed (uses existing destroy_all method)
- **Cache considerations**: ImageKit caching unaffected, position cache cleared automatically

## Related Documentation

- **Component Architecture**: `/shot-client-next/CLAUDE.md`
- **API Documentation**: Image Positions endpoints in `/shot-server/app/controllers/api/v2/image_positions_controller.rb`
- **Database Schema**: Image positions table in `/shot-server/db/schema.rb`
- **Testing Guide**: End-to-end testing patterns in `/chi-war/CLAUDE.md`

## Future Enhancements

### Phase 4: Advanced Features (Future Consideration)
- **Position presets**: Save/load common positioning configurations
- **Batch position updates**: Apply positioning to multiple entities
- **Advanced positioning controls**: Fine-grained coordinate inputs
- **Position history**: Undo/redo positioning changes
- **AI-suggested positioning**: Auto-optimize image positioning based on content