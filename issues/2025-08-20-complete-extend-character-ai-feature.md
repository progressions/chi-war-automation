# Issue: Complete "Extend Your Character" AI Feature with Enhanced UX and Robust Processing

**Date**: 2025-08-20  
**Priority**: Medium  
**Category**: AI/UX  
**Status**: Open

## Description

The "Extend your character" AI feature exists but needs completion and improvement. Currently, it's a basic dialog that triggers an AI background job to fill in missing character fields, but it lacks proper user interface guidance, robust error handling, timeout management, and progress feedback. Users don't know when to use the feature, can't track progress, and don't get clear feedback about failures or timeouts.

The feature should intelligently suggest itself when characters have incomplete information and provide a professional, guided experience for AI-powered character enhancement.

## Current State Analysis

### Existing Infrastructure ✅

**Backend (Partially Complete):**
- `AiService#extend_character` - Core AI character extension logic using Grok
- `AiCharacterUpdateJob` - Background job for async processing
- `Api::V2::AiController#extend` - API endpoint triggering the job
- `AiService#merge_json_with_existing_character` - Smart field merging (only fills empty fields)
- Retry logic with increasing token limits for robust AI responses

**Frontend (Basic Implementation):**
- `Extend.tsx` - Simple dialog component for triggering extension
- `aiClient#extendCharacter` - API client method
- Integration with character SpeedDial menu
- Basic loading state management

### Current Problems ❌

**User Experience Issues:**
- No guidance on when/why to use the feature
- No suggestion banner for characters with missing fields
- Basic dialog provides minimal explanation
- No progress tracking during background processing
- No real-time feedback on completion/failure
- Users don't know the feature exists unless they explore the SpeedDial

**Backend Processing Issues:**
- Limited timeout handling (relies on job queue timeouts)
- ActionCable broadcast has undefined `campaign` variable (bug in `AiCharacterUpdateJob:11`)
- No user notification system for job completion
- Error handling lacks specificity for different failure types
- No progress indicators for long-running AI requests

**Integration Issues:**
- Feature not discoverable in the UI
- No smart detection of incomplete characters
- No preview of what fields will be updated
- No undo functionality for AI changes

## Proposed Solution

### Phase 1: Smart Discovery and Suggestion System

**Incomplete Character Detection:**
Create intelligent detection for characters that would benefit from AI extension:

```typescript
// characterCompleteness.ts - Utility for detecting incomplete characters
interface CharacterCompleteness {
  missingFields: string[]
  completenessScore: number
  shouldSuggestExtension: boolean
  suggestions: string[]
}

function analyzeCharacterCompleteness(character: Character): CharacterCompleteness {
  const importantFields = [
    'description.Background',
    'description.Appearance', 
    'description.Melodramatic Hook',
    'description.Age',
    'description.Height',
    'description.Weight',
    'description.Hair Color',
    'description.Eye Color',
    'wealth'
  ]
  
  // Analyze missing fields and generate suggestions
  // Return completeness score and recommendations
}
```

**Suggestion Banner Component:**
```typescript
// ExtendCharacterBanner.tsx - Smart suggestion banner
interface BannerProps {
  character: Character
  onExtend: () => void
  onDismiss: () => void
}

// Shows contextual banner suggesting AI extension for incomplete characters
// Dismissible with localStorage persistence
// Clear benefits messaging ("Fill in 5 missing fields with AI")
```

### Phase 2: Enhanced User Interface

**Improved Extension Dialog:**
```typescript
// EnhancedExtendDialog.tsx - Professional extension interface
interface ExtendDialogProps {
  character: Character
  completenessAnalysis: CharacterCompleteness
  open: boolean
  onClose: () => void
}

// Features:
// - Show specific fields that will be updated
// - Preview/explanation of AI enhancement process  
// - Progress tracking with WebSocket integration
// - Clear benefits and expectations
// - Cancel functionality during processing
```

**Field Preview System:**
- Show which specific fields are missing/empty
- Explain what the AI will generate for each field
- Allow users to opt-out of specific field updates
- Preview mode showing before/after states

### Phase 3: Robust Backend Processing

**Enhanced Job Processing:**
```ruby
# app/jobs/enhanced_ai_character_update_job.rb
class EnhancedAiCharacterUpdateJob < ApplicationJob
  include JobTimeoutHandler
  queue_as :ai_processing
  
  TIMEOUT_DURATION = 2.minutes
  MAX_RETRIES = 3
  
  around_perform do |job, block|
    with_timeout(TIMEOUT_DURATION) do
      with_progress_tracking do
        block.call
      end
    end
  end
  
  def perform(character_id, user_id, selected_fields = nil)
    @character = Character.find(character_id)
    @user = User.find(user_id) 
    @campaign = @character.campaign
    
    # Progress: Starting AI generation
    broadcast_progress(0, "Starting AI character extension...")
    
    # Enhanced AI service call with field selection
    json = AiService.extend_character(@character, selected_fields)
    broadcast_progress(50, "AI generation complete, updating character...")
    
    # Selective field merging based on user choices
    updated_character = AiService.merge_selected_fields(json, @character, selected_fields)
    updated_character.save!
    
    # Progress: Complete
    broadcast_progress(100, "Character successfully extended!")
    broadcast_completion(updated_character)
    
  rescue AiService::TimeoutError => e
    broadcast_error("AI generation timed out. Please try again.", :timeout)
  rescue AiService::InvalidResponseError => e  
    broadcast_error("AI returned invalid response. Please try again.", :invalid_response)
  rescue StandardError => e
    broadcast_error("Failed to extend character: #{e.message}", :general_error)
  end
  
  private
  
  def broadcast_progress(percentage, message)
    ActionCable.server.broadcast(
      "campaign_#{@campaign.id}", 
      { 
        type: "character_extension_progress",
        character_id: @character.id,
        percentage: percentage,
        message: message,
        user_id: @user.id
      }
    )
  end
  
  def broadcast_completion(character)
    ActionCable.server.broadcast(
      "campaign_#{@campaign.id}",
      {
        type: "character_extension_complete",
        character: CharacterSerializer.new(character).serializable_hash,
        user_id: @user.id
      }
    )
  end
  
  def broadcast_error(message, error_type)
    ActionCable.server.broadcast(
      "campaign_#{@campaign.id}",
      {
        type: "character_extension_error", 
        character_id: @character.id,
        error_message: message,
        error_type: error_type,
        user_id: @user.id
      }
    )
  end
end
```

**Enhanced AI Service:**
```ruby  
# app/services/enhanced_ai_service.rb
class EnhancedAiService < AiService
  class TimeoutError < StandardError; end
  class InvalidResponseError < StandardError; end
  
  def self.extend_character_with_field_selection(character, selected_fields = nil)
    # Enhanced extend_character with field selection
    # Improved prompt engineering for specific fields
    # Better error classification and handling
    # Timeout management with configurable limits
  end
  
  def self.merge_selected_fields(json, character, selected_fields)
    # Only merge fields that user specifically selected
    # Preserve existing data for non-selected fields
    # Validate all changes before applying
  end
end
```

### Phase 4: Real-time Progress and Feedback

**Progress Tracking Component:**
```typescript
// ExtensionProgressTracker.tsx - Real-time progress UI
interface ProgressProps {
  characterId: string
  onComplete: (character: Character) => void
  onError: (error: ExtensionError) => void
}

// Features:
// - Real-time progress bar with WebSocket updates
// - Detailed status messages during processing
// - Cancel functionality (job termination)
// - Retry options for failed attempts
// - Error categorization with specific guidance
```

**WebSocket Integration:**
```typescript
// hooks/useCharacterExtension.ts - WebSocket-based progress tracking
export function useCharacterExtension(characterId: string) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<ExtensionStatus>('idle')
  const [error, setError] = useState<ExtensionError | null>(null)
  
  // WebSocket subscription for real-time updates
  // Progress tracking and error handling
  // Automatic retry logic for recoverable errors
}
```

## Technical Implementation Details

### Backend Enhancements

**Timeout Management:**
```ruby
# config/initializers/ai_timeouts.rb
Rails.application.configure do
  config.ai_service = {
    character_extension_timeout: 2.minutes,
    max_retries: 3,
    retry_backoff: [30.seconds, 1.minute, 2.minutes]
  }
end
```

**Job Queue Configuration:**
```ruby
# config/application.rb
# Separate queue for AI processing with higher timeout limits
# Dead job handling for failed AI requests
# Job progress tracking with Redis
```

**Error Classification:**
```ruby
module AiService
  class TimeoutError < StandardError; end
  class InvalidResponseError < StandardError; end  
  class ServiceUnavailableError < StandardError; end
  class RateLimitError < StandardError; end
  class InvalidCharacterError < StandardError; end
end
```

### Frontend Enhancements

**Smart Banner Integration:**
- Character show page automatically analyzes completeness
- Banner appears for characters with < 70% completeness score
- Dismissible with 7-day localStorage persistence
- Clear, actionable messaging about benefits

**Progress UI Components:**
- Step-by-step progress indicator
- Estimated time remaining based on historical data
- Cancel button with confirmation dialog
- Error recovery guidance with retry options

**Field Selection Interface:**
- Checkbox interface for field selection
- Preview of current vs AI-generated content
- Undo functionality for individual field changes
- Batch update confirmation with diff view

## User Stories

### Discovery and Onboarding
- **As a user**, I want to be prompted to extend incomplete characters so I know the feature exists and when it's useful
- **As a user**, I want to see which fields are missing so I understand what the AI will help me fill in
- **As a user**, I want to dismiss suggestions so I'm not repeatedly prompted for characters I want to keep minimal

### Extension Process  
- **As a user**, I want to see progress during AI generation so I know the system is working and how long it might take
- **As a user**, I want to cancel long-running requests so I'm not stuck waiting indefinitely
- **As a user**, I want clear error messages so I understand what went wrong and how to fix it

### Results and Control
- **As a user**, I want to preview AI changes before applying them so I can maintain control over my character
- **As a user**, I want to selectively apply AI suggestions so I can keep some fields unchanged
- **As a user**, I want to undo AI changes so I can revert unwanted modifications

### Error Recovery
- **As a user**, I want automatic retry for transient failures so temporary issues don't block me
- **As a user**, I want specific guidance for different error types so I know how to resolve issues
- **As a user**, I want to retry failed requests so I don't lose progress from partial completions

## Acceptance Criteria

### Smart Discovery System
- [ ] Characters with < 70% field completeness show suggestion banner
- [ ] Banner lists specific missing fields and benefits of AI extension
- [ ] Banner is dismissible with 7-day persistence per character
- [ ] Suggestion logic accounts for character type (PC vs NPC differences)

### Enhanced User Interface
- [ ] Extension dialog shows field-by-field preview of what will be generated
- [ ] Users can opt-out of specific field updates before processing
- [ ] Progress bar with real-time status updates during AI generation
- [ ] Cancel functionality works during all processing phases

### Robust Processing
- [ ] 2-minute timeout with automatic retry for transient failures
- [ ] Specific error messages for different failure types (timeout, invalid response, service unavailable)
- [ ] Job processing handles concurrent extension requests properly
- [ ] WebSocket broadcasting includes proper campaign and user context

### Progress and Feedback
- [ ] Real-time progress tracking from job start to completion
- [ ] Clear status messages at each processing phase
- [ ] Error recovery guidance with retry options
- [ ] Success notification with option to undo changes

### Field Management
- [ ] Selective field merging (only updates chosen empty fields)
- [ ] Preview mode showing current vs proposed changes
- [ ] Undo functionality for individual field changes
- [ ] Validation that AI changes maintain character consistency

## Testing Strategy

### Unit Tests
- Character completeness analysis logic
- AI service error handling and retry mechanisms
- Field merging with selective updates
- WebSocket broadcasting with proper context

### Integration Tests  
- End-to-end extension workflow from UI to job completion
- Timeout handling and recovery scenarios
- Concurrent extension request handling
- WebSocket message delivery and client updates

### User Interface Tests
- Banner display logic for different character completeness levels
- Progress tracking UI with simulated WebSocket events
- Error state handling with different error types
- Field selection and preview functionality

### Load Tests
- AI service under concurrent extension requests
- Job queue performance with multiple background extensions
- WebSocket broadcasting performance with many concurrent users

## Success Criteria

**Discoverability:**
- 80%+ of users with incomplete characters engage with suggestion banner
- 50%+ reduction in support questions about "how to fill character details"
- Feature usage increase of 300%+ from current baseline

**User Experience:**
- < 5% of extension requests result in user-reported timeouts
- 90%+ user satisfaction with progress feedback clarity
- < 10% of users report confusion about what the feature does

**Technical Reliability:**
- 95%+ successful completion rate for extension requests
- < 30 second average processing time for character extensions
- Zero critical errors related to WebSocket broadcasting

**Content Quality:**
- 85%+ user satisfaction with AI-generated character content
- < 15% of extensions require significant manual corrections
- AI-generated content maintains consistency with existing character data

This comprehensive enhancement will transform the "Extend your character" feature from a hidden, basic tool into a discoverable, professional AI assistant that intelligently helps users create richer, more complete characters with confidence and control.