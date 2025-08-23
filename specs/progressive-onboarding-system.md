# Progressive Onboarding System - Technical Specification

**Feature**: Milestone-based progressive onboarding with contextual guidance  
**Priority**: High  
**Scope**: Full-stack (Backend + Frontend)  
**Replaces**: Simple "no campaigns" onboarding detection

## Overview

Transform the basic onboarding experience into a sophisticated, milestone-driven system that tracks user progress through key platform actions and provides contextual guidance via an adaptive carousel interface.

## User Experience Flow

### Stage 1: Pre-Campaign (New User)
```
┌─────────────────────────────────────────────────┐
│ 🎯 Ready to start your first campaign?          │
│ Campaigns organize your RPG sessions and        │
│ characters. Click here to get started! →        │
└─────────────────────────────────────────────────┘
```

### Stage 2: Post-Campaign (Carousel Interface)
```
┌─────────────────────────────────────────────────┐
│ 🎉 Great! Now build your world:                 │
│ ◀ [👤 Character] [⚔️ Fight] [🏴 Faction] [👥 Party] [🏛️ Site] ▶ │
│   Create heroes and villains for your story     │
└─────────────────────────────────────────────────┘
```

### Stage 3: Graduation
```
┌─────────────────────────────────────────────────┐
│ 🎉 Congratulations! You've set up your world!   │
│ You've created your campaign, characters,        │
│ factions, and more. Ready to play!        [OK]   │
└─────────────────────────────────────────────────┘
```

## Core Features

### 1. Milestone-Based Progress Tracking
- **Timestamp-based completion** tracking (not boolean flags)
- **Automatic detection** of milestone completion regardless of user path
- **Six core milestones**: Campaign, Character, Fight, Faction, Party, Site
- **Graduation milestone**: Congratulations dismissal

### 2. Contextual Guidance Module
- **Layout-level component** appearing at top of relevant pages
- **Context-aware messaging** that adapts to current page and user progress
- **Visual pointers** directing attention to SpeedDial and other UI elements
- **Progressive disclosure** showing appropriate next steps

### 3. Adaptive Carousel Interface
- **Single CTA mode** for pre-campaign users (must create campaign first)
- **Carousel mode** for post-campaign users with multiple available actions
- **Visual completion indicators** (checkmarks for completed milestones)
- **Smart ordering** with contextual descriptions

### 4. Automatic Milestone Detection
- **Model-level tracking** via reusable `OnboardingTrackable` concern
- **Idempotent updates** - timestamps only set on first occurrence
- **Natural progression** - works regardless of how user completes actions
- **Real-time updates** to frontend via serialized user data

## Technical Implementation

### Backend Architecture

#### Database Schema
```sql
CREATE TABLE onboarding_progresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  first_campaign_created_at TIMESTAMP,
  first_character_created_at TIMESTAMP,
  first_fight_created_at TIMESTAMP,
  first_faction_created_at TIMESTAMP,
  first_party_created_at TIMESTAMP,
  first_site_created_at TIMESTAMP,
  congratulations_dismissed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### Model Architecture
```ruby
# app/models/onboarding_progress.rb
class OnboardingProgress < ApplicationRecord
  belongs_to :user

  def all_milestones_complete?
    milestone_timestamps.all?(&:present?)
  end

  def onboarding_complete?
    all_milestones_complete? && congratulations_dismissed_at.present?
  end

  def ready_for_congratulations?
    all_milestones_complete? && congratulations_dismissed_at.nil?
  end

  def next_milestone
    MILESTONE_SEQUENCE.find { |m| send(m[:timestamp_field]).nil? }
  end

  private

  def milestone_timestamps
    [
      first_campaign_created_at,
      first_character_created_at,
      first_fight_created_at,
      first_faction_created_at,
      first_party_created_at,
      first_site_created_at
    ]
  end
end
```

#### OnboardingTrackable Concern
```ruby
# app/models/concerns/onboarding_trackable.rb
module OnboardingTrackable
  extend ActiveSupport::Concern

  included do
    after_create :track_onboarding_milestone
  end

  private

  def track_onboarding_milestone
    return unless user.present?
    
    milestone_type = self.class.name.downcase
    timestamp_field = "first_#{milestone_type}_created_at"
    
    # Only set if not already set (idempotent)
    if user.onboarding_progress.send(timestamp_field).nil?
      user.onboarding_progress.update!(timestamp_field => Time.current)
    end
  rescue => e
    Rails.logger.warn "Failed to track onboarding milestone: #{e.message}"
  end
end
```

#### User Association & Serialization
```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_one :onboarding_progress, dependent: :destroy
  
  def ensure_onboarding_progress!
    self.onboarding_progress ||= create_onboarding_progress!
  end
end

# app/serializers/user_serializer.rb
class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :first_name, :last_name, :onboarding_progress

  def onboarding_progress
    progress = object.onboarding_progress || object.create_onboarding_progress!
    OnboardingProgressSerializer.new(progress).as_json
  end
end
```

#### API Endpoints
```ruby
# New endpoint for dismissing congratulations
# PATCH /api/v2/onboarding/dismiss_congratulations
class Api::V2::OnboardingController < Api::V2::BaseController
  def dismiss_congratulations
    current_user.ensure_onboarding_progress!
    current_user.onboarding_progress.update!(congratulations_dismissed_at: Time.current)
    render json: { success: true }
  end
end
```

### Frontend Architecture

#### Onboarding Module Component
```typescript
// src/components/onboarding/OnboardingModule.tsx
interface OnboardingModuleProps {
  user: User;
  currentPath: string;
}

const OnboardingModule: React.FC<OnboardingModuleProps> = ({ user, currentPath }) => {
  const { onboardingProgress } = user;
  
  if (onboardingProgress.onboardingComplete) {
    return null; // No onboarding needed
  }
  
  if (onboardingProgress.readyForCongratulations) {
    return <CongratulationsModule onDismiss={handleCongratulationsDismiss} />;
  }
  
  if (!onboardingProgress.firstCampaignCreatedAt) {
    return <CampaignOnboarding currentPath={currentPath} />;
  }
  
  return <OnboardingCarousel progress={onboardingProgress} currentPath={currentPath} />;
};
```

#### Milestone Configuration
```typescript
// src/lib/onboarding.ts
export const ONBOARDING_MILESTONES = [
  {
    key: 'campaign',
    title: '🎯 Ready to start your first campaign?',
    description: 'Campaigns organize your RPG sessions and characters.',
    targetPages: ['/campaigns'],
    targetElement: 'speed-dial-create',
    timestampField: 'firstCampaignCreatedAt'
  },
  {
    key: 'character',
    title: '👤 Create your first character!',
    description: 'Characters are the heroes and villains of your story.',
    targetPages: ['/characters', '/campaigns/[id]/characters'],
    targetElement: 'speed-dial-create',
    timestampField: 'firstCharacterCreatedAt'
  },
  {
    key: 'faction',
    title: '🏴 Create "The Dragons" faction!',
    description: 'Factions group characters by allegiance. Start with the heroes.',
    targetPages: ['/factions'],
    targetElement: 'speed-dial-create',
    timestampField: 'firstFactionCreatedAt',
    suggestedName: 'The Dragons'
  },
  {
    key: 'fight',
    title: '⚔️ Start your first fight!',
    description: 'Fights manage combat initiative and character actions.',
    targetPages: ['/fights'],
    targetElement: 'speed-dial-create',
    timestampField: 'firstFightCreatedAt'
  },
  {
    key: 'party',
    title: '👥 Organize a party!',
    description: 'Parties group characters for adventures and missions.',
    targetPages: ['/parties'],
    targetElement: 'speed-dial-create',
    timestampField: 'firstPartyCreatedAt'
  },
  {
    key: 'site',
    title: '🏛️ Create your first location!',
    description: 'Sites are the places where your adventures unfold.',
    targetPages: ['/sites'],
    targetElement: 'speed-dial-create',
    timestampField: 'firstSiteCreatedAt'
  }
];
```

#### Layout Integration
```typescript
// src/app/(main)/layout.tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  return (
    <div>
      <AppBar />
      <OnboardingModule user={user} currentPath={pathname} />
      <main>{children}</main>
      <SpeedDial />
    </div>
  );
}
```

### Visual Pointer System

#### Pointer Implementation
```typescript
// src/components/onboarding/OnboardingPointer.tsx
const OnboardingPointer: React.FC<{
  targetSelector: string;
  direction: 'left' | 'right' | 'up' | 'down';
}> = ({ targetSelector, direction }) => {
  // Calculate position relative to target element
  // Render CSS arrow pointing to target
  // Auto-hide when target clicked or milestone completed
};
```

#### CSS Animations
```css
/* Subtle pulse animation for onboarding modules */
.onboarding-module {
  animation: pulse 2s ease-in-out infinite;
  border: 2px solid theme.palette.primary.main;
}

.onboarding-pointer {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  animation: bounce 1s ease-in-out infinite;
}
```

## Implementation Phases

### Phase 1: Backend Infrastructure (2-3 days)
**Deliverables:**
- OnboardingProgress model and migration
- OnboardingTrackable concern
- User association and serialization updates
- API endpoint for congratulations dismissal
- Model tests and concern tests

**Acceptance Criteria:**
- New users automatically get OnboardingProgress record
- Creating campaigns/characters/etc triggers milestone tracking
- User serialization includes onboarding data
- API endpoint successfully dismisses congratulations

### Phase 2: Frontend Onboarding Module (3-4 days)
**Deliverables:**
- OnboardingModule component with conditional rendering
- CampaignOnboarding single CTA component  
- OnboardingCarousel with milestone navigation
- CongratulationsModule with dismissal
- Integration with main layout

**Acceptance Criteria:**
- New users see campaign creation CTA
- After campaign creation, carousel appears with remaining milestones
- Completed milestones show visual indicators
- Congratulations appears after all milestones, dismissible
- Module disappears after congratulations dismissed

### Phase 3: Contextual Guidance & Pointers (2-3 days)
**Deliverables:**
- OnboardingPointer component with CSS animations
- Page-aware messaging system
- Visual highlighting of SpeedDial and other targets
- Responsive design for mobile/desktop

**Acceptance Criteria:**
- Onboarding messages adapt based on current page
- Visual pointers direct attention to relevant UI elements
- Pointers work responsively across device sizes
- Animations are subtle and non-intrusive

### Phase 4: Polish & Testing (1-2 days)
**Deliverables:**
- End-to-end tests for complete onboarding flow
- Edge case handling (deleted campaigns, etc.)
- Performance optimization for milestone checking
- Documentation updates

**Acceptance Criteria:**
- Full user journey tested from registration to graduation
- System handles edge cases gracefully
- No performance impact on page loads
- All components properly documented

## Success Metrics

### User Experience
- **Reduced drop-off** after registration (baseline vs post-implementation)
- **Increased engagement** with core platform features
- **Faster time-to-value** for new users
- **Improved user feedback** on initial experience

### Technical
- **No performance degradation** on page loads
- **Reliable milestone tracking** (100% accuracy)
- **Clean graduation** from onboarding system
- **Responsive design** across all device sizes

## Considerations & Edge Cases

### Data Integrity
- **Orphaned records** - Handle cases where referenced entities are deleted
- **Concurrent creation** - Ensure idempotent milestone tracking
- **Migration strategy** - Handle existing users without onboarding records

### User Experience
- **Power users** - Allow advanced users to skip/dismiss early
- **Re-engagement** - Consider showing onboarding hints for stale accounts  
- **Mobile experience** - Ensure carousel and pointers work on small screens
- **Accessibility** - Ensure onboarding components are screen reader friendly

### Performance
- **Lazy loading** - Only load onboarding components when needed
- **Caching** - Cache onboarding state to avoid repeated database queries
- **Bundle size** - Minimize impact on main application bundle

This progressive onboarding system provides a comprehensive solution for guiding new users through platform adoption while maintaining flexibility for different user paths and usage patterns.