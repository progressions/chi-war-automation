# Building a Real-Time Encounter Manager for Feng Shui 2

## Introduction

The encounter manager represents the core gameplay system of Chi War, handling the complex initiative and combat mechanics that make Feng Shui 2 unique among tabletop RPGs. This feature manages turn-based combat using the game's distinctive "shot counter" system, where characters act on numbered shots in descending order, spending shots to perform actions.

## The Shot Counter System

Feng Shui 2 uses an unconventional initiative system that required careful consideration during implementation. Instead of traditional turn orders, entities act on "shots" - numerical values that count down from roughly 20 to 0. Higher shot values act first, and performing actions costs shots, moving the entity down the initiative order.

```typescript
// From shot-client-next/src/components/encounters/attacks/shotSorting.ts
export const sortShots = (a: Shot, b: Shot): number => {
  // Hidden shots (null) sort to the end
  if (a.shot === null && b.shot === null) return sortByEntity(a, b)
  if (a.shot === null) return 1
  if (b.shot === null) return -1
  
  // Higher shot values come first
  if (a.shot !== b.shot) {
    return b.shot - a.shot
  }
  
  // Same shot value - sort by entity
  return sortByEntity(a, b)
}
```

This system creates dynamic combat where faster characters can take multiple actions before slower ones act once, but at the cost of delaying their next turn.

## Architecture Overview

The encounter manager consists of three main layers:

### Frontend State Management

The `EncounterContext` serves as the central hub for encounter state, managing real-time updates and user interactions:

```typescript
// From shot-client-next/src/contexts/EncounterContext.tsx
const spendShots = useCallback(
  async (shotId: string, shotCost: number) => {
    const shot = encounter?.shots?.find((s) => s.id === shotId)
    if (!shot) return

    const currentShot = shot.shot ?? 0
    const newShot = currentShot - shotCost

    // Optimistic update
    setLocalActions((prev) => ({
      ...prev,
      [shotId]: { shot: newShot, lastAction: "act" },
    }))

    try {
      await client.actOnShot(encounter.id, shotId, shotCost)
    } catch (error) {
      // Revert on failure
      setLocalActions((prev) => {
        const updated = { ...prev }
        delete updated[shotId]
        return updated
      })
    }
  },
  [encounter, client]
)
```

### Backend Processing

The Rails backend handles persistence and broadcasts using a sophisticated serialization system:

```ruby
# From shot-server/app/serializers/encounter_serializer.rb
def as_json(*)
  shots_with_associations = object.shots
    .includes(
      :character_effects,
      character: [:faction, :juncture, :user, 
                  { image_attachment: :blob }],
      vehicle: { image_attachment: :blob }
    )
    .order(Arel.sql('CASE WHEN shots.shot IS NULL THEN 1 ELSE 0 END, 
                     shots.shot DESC'))
```

### Real-Time Broadcasting

WebSocket connections ensure all participants see updates immediately:

```ruby
# From shot-server/app/models/fight.rb
def broadcast_encounter_update!
  return unless active?
  
  # Skip if broadcasts are disabled (during batched updates)
  return if Thread.current[:disable_broadcasts]
  
  Rails.logger.info "🔄 WEBSOCKET: Broadcasting encounter update for fight #{id}"
  BroadcastEncounterUpdateJob.perform_later(self)
end
```

## Recent Development: Vehicle Chase Mechanics

The most significant recent addition was comprehensive vehicle support with driver/vehicle relationships. This feature addresses a core Feng Shui 2 mechanic where characters can drive vehicles during chase scenes.

### Implementation Challenges

The primary challenge was maintaining separate initiative tracks for drivers and vehicles while keeping them visually and mechanically linked. The solution involved bidirectional relationships in the Shot model:

```ruby
# From shot-server/app/models/shot.rb
belongs_to :driver_shot, optional: true, class_name: "Shot", 
           foreign_key: "driver_id"
belongs_to :driving_shot, optional: true, class_name: "Shot", 
           foreign_key: "driving_id"
```

This allows the system to track who is driving what while maintaining independent shot values for tactical flexibility.

### UI Improvements

The vehicle edit dialog underwent significant enhancement to support driver assignment:

```typescript
// From shot-client-next/src/components/encounters/VehicleEditDialog.tsx
const availableDrivers = encounter?.shots
  ?.filter(
    (s) =>
      s.character &&
      !s.driving_id &&
      s.id !== shot.id
  )
  .map((s) => ({
    id: s.id,
    name: s.character!.name,
    shot: s.shot,
  }))
  .sort((a, b) => {
    if (a.shot === null && b.shot === null) return 0
    if (a.shot === null) return 1
    if (b.shot === null) return -1
    return b.shot - a.shot
  })
```

## Performance Optimizations

Managing real-time updates for potentially dozens of entities required careful optimization:

### Batched Updates

The `CombatActionService` processes multiple character updates in a single transaction, broadcasting only once after all changes commit:

```ruby
# From shot-server/app/services/combat_action_service.rb
def apply
  ActiveRecord::Base.transaction do
    # Disable individual broadcasts during the transaction
    Thread.current[:disable_broadcasts] = true
    
    @character_updates.each do |update|
      apply_character_update(update)
    end
    
    # Touch triggers after_touch callback for single broadcast
    @fight.touch
  ensure
    Thread.current[:disable_broadcasts] = false
  end
end
```

### Optimistic Updates

The frontend applies changes immediately while awaiting server confirmation, providing responsive feedback:

```typescript
// Optimistic update applied before server response
setLocalActions((prev) => ({
  ...prev,
  [shotId]: { shot: newShot, lastAction: "act" },
}))
```

## User Experience Enhancements

Several UI improvements enhance usability during intense combat sessions:

### Persistent Preferences

The system remembers user preferences using localStorage:

```typescript
// From shot-client-next/src/components/encounters/ShotCounter.tsx
useEffect(() => {
  const savedShowHidden = getLocally(`fight_${encounter.id}_showHidden`)
  if (savedShowHidden !== null) {
    setShowHidden(savedShowHidden as boolean)
  }
}, [encounter.id, getLocally])
```

### Smart Sorting

Entities are sorted by type priority, speed, and name for consistent, predictable ordering:

```typescript
const typeOrder: Record<string, number> = {
  "Uber-Boss": 0,
  "Boss": 1,
  "PC": 2,
  "Ally": 3,
  "Featured Foe": 4,
  "Mook": 5,
}
```

## Challenges and Solutions

### Broadcast Duplication

An interesting challenge arose when implementing the after_touch callback pattern. Initially, both the Shot model and the CombatActionService were triggering broadcasts, causing duplicate WebSocket messages. The solution was recognizing that the Fight model's `after_touch` callback handled broadcasting automatically when touched by associated Shot updates.

### Avatar Alignment

A subtle but annoying UI issue involved avatar alignment when impairment badges were displayed. The problem traced to inconsistent padding in the badge wrapper component. Removing the wrapper padding entirely provided consistent alignment regardless of badge presence.

## Future Development

Several enhancements are planned for the encounter manager:

1. **Advanced Effect System**: Expanding the character effects to support more complex modifiers and duration tracking
2. **Combat Automation**: Automatic damage calculation and application based on attack rolls
3. **Chase Scene Enhancements**: Specialized UI for vehicle chases with position tracking and obstacle management
4. **Combat History**: Detailed logging of all actions taken during an encounter for post-session review
5. **Initiative Presets**: Save and load common encounter setups for recurring battles

## Conclusion

The encounter manager represents a significant technical achievement in translating complex tabletop mechanics to a digital platform. The real-time synchronization, sophisticated sorting algorithms, and recent vehicle integration create a fluid combat experience that maintains the tactical depth of Feng Shui 2 while eliminating the bookkeeping burden.

The system's architecture, built on WebSockets for real-time updates and React contexts for state management, provides a solid foundation for future enhancements. As Chi War continues through alpha development, the encounter manager will remain central to the gameplay experience, evolving to support increasingly complex combat scenarios while maintaining the responsive, intuitive interface that makes digital tabletop gaming accessible.