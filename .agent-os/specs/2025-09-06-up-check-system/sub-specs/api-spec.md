# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-06-up-check-system/spec.md

> Created: 2025-09-06
> Version: 1.0.0

## Endpoints

### POST /api/v2/encounters/:encounter_id/apply_combat_action

**Purpose:** Process Up Check resolution as a combat action

**Request Headers:**
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
```

**Request Body:**
```json
{
  "combat_action": {
    "action_type": "up_check",
    "character_id": "uuid",
    "swerve": 3,
    "fortune": 2,
    "notes": "Optional notes about the check"
  }
}
```

**Parameters:**
- `action_type` (string, required): Must be "up_check"
- `character_id` (uuid, required): ID of character making the check
- `swerve` (integer, required): Base die roll result
- `fortune` (integer, optional): Fortune die result, defaults to 0 (costs Fortune point and adds Mark of Death)
- `notes` (string, optional): Additional context or description

**Success Response (Check Passed):**
```json
{
  "success": true,
  "message": "Up Check successful! Character stays in the fight.",
  "result": {
    "total": 7,
    "breakdown": {
      "swerve": 3,
      "fortune": 2,
      "toughness": 2
    },
    "threshold": 5,
    "passed": true
  },
  "character": {
    "id": "uuid",
    "name": "Character Name",
    "status": [],
    "wounds": 36,
    "action_values": {
      "Marks of Death": 1
    },
    "fortune_points": 2
  }
}
```

**Success Response (Check Failed):**
```json
{
  "success": true,
  "message": "Up Check failed. Character is out of the fight.",
  "result": {
    "total": 3,
    "breakdown": {
      "swerve": 1,
      "fortune": 0,
      "toughness": 2
    },
    "threshold": 5,
    "passed": false
  },
  "character": {
    "id": "uuid",
    "name": "Character Name",
    "status": ["out_of_fight"],
    "wounds": 36,
    "action_values": {
      "Marks of Death": 1
    },
    "fortune_points": 2
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters or character doesn't require Up Check
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User doesn't have permission to control this character
- `404 Not Found`: Encounter or character not found
- `422 Unprocessable Entity`: Validation errors

### PATCH /api/v2/characters/:id

**Purpose:** Update character status (including Up Check triggers)

**Additional Status Management:**

When updating character wounds that exceed threshold for PCs:
1. Automatically add "up_check_required" to status array
2. Increment marks_of_death by 1
3. Broadcast status change via WebSocket

**Request Body (Wound Update Triggering Up Check):**
```json
{
  "character": {
    "wounds": 38
  }
}
```

**Response (Auto-triggered Up Check Required):**
```json
{
  "id": "uuid",
  "name": "Character Name",
  "wounds": 38,
  "action_values": {
    "marks_of_death": 1
  },
  "status": ["up_check_required"],
  "character_type": "pc"
}
```

## Controllers

### EncountersController

```ruby
# app/controllers/api/v2/encounters_controller.rb

def combat_action
  @encounter = current_campaign.encounters.find(params[:encounter_id])
  action_params = combat_action_params
  
  case action_params[:action_type]
  when "up_check"
    process_up_check(action_params)
  # ... other action types
  end
end

private

def process_up_check(params)
  character = current_campaign.characters.find(params[:character_id])
  
  # Validate character requires Up Check
  unless character.up_check_required?
    return render json: { 
      error: "Character does not require an Up Check" 
    }, status: :unprocessable_entity
  end
  
  # Calculate result
  service = UpCheckService.new(
    character: character,
    swerve: params[:swerve].to_i,
    fortune: params[:fortune].to_i || 0
  )
  
  result = service.perform
  
  # Log to fight_events
  create_fight_event(
    encounter: @encounter,
    event_type: 'up_check',
    character: character,
    data: result
  )
  
  # Broadcast to all participants
  broadcast_combat_action(
    encounter: @encounter,
    action: "up_check",
    character: character,
    result: result
  )
  
  render json: {
    success: true,
    message: result[:message],
    result: result,
    character: CharacterSerializer.new(character.reload)
  }
end

def combat_action_params
  params.require(:combat_action).permit(
    :action_type, :character_id, :swerve, :fortune, :notes
  )
end
```

### CharactersController

```ruby
# app/controllers/api/v2/characters_controller.rb

def update
  @character = current_campaign.characters.find(params[:id])
  
  # Check for Up Check trigger on wound updates
  if character_params[:wounds].present?
    check_up_check_trigger(@character, character_params[:wounds].to_i)
  end
  
  if @character.update(character_params)
    broadcast_character_update(@character)
    render json: CharacterSerializer.new(@character)
  else
    render json: { errors: @character.errors }, status: :unprocessable_entity
  end
end

private

def check_up_check_trigger(character, new_wounds)
  return unless character.pc?
  
  threshold = SharedService.wound_threshold_for(character)
  old_wounds = character.wounds
  
  # Trigger if crossing threshold (can happen multiple times per fight)
  if new_wounds >= threshold && !character.up_check_required?
    character.add_status("up_check_required")
    increment_marks_of_death(character)
  end
  
  # Clear up_check_required if healed below threshold
  if new_wounds < threshold && character.up_check_required?
    character.remove_status("up_check_required")
  end
end

def increment_marks_of_death(character)
  marks = character.action_values["Marks of Death"] || 0
  character.action_values["Marks of Death"] = marks + 1
  character.save
end
```

## Service Implementation

### UpCheckService

```ruby
# app/services/up_check_service.rb

class UpCheckService
  attr_reader :character, :swerve, :fortune

  def initialize(character:, swerve:, fortune: 0)
    @character = character
    @swerve = swerve
    @fortune = fortune
  end

  def perform
    total = calculate_total
    threshold = 5
    passed = total >= threshold
    fortune_used = fortune > 0

    ActiveRecord::Base.transaction do
      # Handle Fortune point cost and Mark of Death
      if fortune_used
        character.decrement(:fortune_points)
        increment_marks_of_death
      end
      
      # Always increment marks for making the check
      increment_marks_of_death
      
      if passed
        character.remove_status("up_check_required")
      else
        character.remove_status("up_check_required")
        character.add_status("out_of_fight")
        remove_from_initiative
      end
    end

    {
      total: total,
      breakdown: {
        swerve: swerve,
        fortune: fortune,
        toughness: character.toughness
      },
      threshold: threshold,
      passed: passed,
      fortune_used: fortune_used,
      marks_of_death: character.action_values["Marks of Death"],
      message: passed ? 
        "Up Check successful! #{character.name} stays in the fight." :
        "Up Check failed. #{character.name} is out of the fight."
    }
  end
  
  private
  
  def increment_marks_of_death
    marks = character.action_values["Marks of Death"] || 0
    character.action_values["Marks of Death"] = marks + 1
    character.save
  end

  private

  def calculate_total
    swerve + fortune + character.toughness
  end

  def remove_from_initiative
    # Remove character from any active fight shots
    character.shots.active.update_all(active: false)
  end
end
```

## WebSocket Broadcasting

### CombatChannel Updates

```ruby
# app/channels/combat_channel.rb

def broadcast_up_check_result(character, result)
  ActionCable.server.broadcast(
    "combat_#{params[:encounter_id]}",
    {
      type: "up_check_result",
      character_id: character.id,
      character_name: character.name,
      result: result,
      timestamp: Time.current
    }
  )
end

def broadcast_status_change(character)
  ActionCable.server.broadcast(
    "combat_#{params[:encounter_id]}",
    {
      type: "character_status_update",
      character_id: character.id,
      status: character.status,
      timestamp: Time.current
    }
  )
end
```

## Integration Points

1. **Character Damage Application**
   - Hook into existing wound update logic
   - Auto-trigger Up Check requirements for PCs at threshold

2. **Initiative System**
   - Remove "out_of_fight" characters from shot counter
   - Update UI to show defeated status

3. **Combat Resolution**
   - Process Up Checks through standard combat action flow
   - Maintain action history for replay/review

4. **Real-time Updates**
   - Broadcast all status changes to connected clients
   - Ensure UI consistency across all participants
