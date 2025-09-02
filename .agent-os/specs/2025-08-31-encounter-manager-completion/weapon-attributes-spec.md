# Weapon Attributes Implementation Specification

> Created: 2025-09-01
> Part of: Encounter Manager Completion
> Priority: High (Phase 1 requirement)

## Overview

Integrate existing weapon attributes (`mook_bonus` and `kachunk`) into the encounter manager attack resolution system. These attributes modify attack effectiveness under specific conditions and must be clearly presented to users with appropriate UI controls.

## Weapon Attributes

### 1. Mook Bonus
**Database Field**: `mook_bonus` (integer, default: 0)
**Effect**: Adds bonus to attack rolls when attacking mook-type characters
**Target Types**: `:mook` character type only
**Application**: Automatic when attacking mooks, with manual override option

### 2. Ka-chunk
**Database Field**: `kachunk` (boolean)
**Effect**: Provides attack bonus if attacker spends an extra shot
**Cost**: +1 shot cost for the attack action
**Application**: Optional toggle - player chooses to activate or not

## Implementation Requirements

### Backend API Updates

#### Attack Resolution Endpoint
```ruby
# POST /api/v2/encounters/:id/attack
# Enhanced parameters:
{
  attacker_shot_id: uuid,
  target_shot_id: uuid,
  weapon_id: uuid,           # NEW: Required for weapon attribute lookup
  attack_type: string,
  attack_value: integer,
  defense_value: integer,
  use_ka_chunk: boolean,     # NEW: Player choice to spend extra shot
  mook_bonus_override: integer, # NEW: Manual override for mook bonus
  ka_chunk_override: integer    # NEW: Manual override for ka-chunk bonus
}
```

#### Response Format
```json
{
  "suggested_attack_value": 15,
  "weapon_bonuses": {
    "mook_bonus": 2,        // Applied if target is mook
    "ka_chunk_bonus": 2,    // Applied if use_ka_chunk = true
    "total_weapon_bonus": 4
  },
  "shot_cost": 4,           // Base 3 + 1 for ka-chunk if used
  "target_type": "mook",
  "can_apply_mook_bonus": true
}
```

### Frontend UI Components

#### Weapon Selection Dropdown
```typescript
// Enhanced weapon display in Autocomplete
interface WeaponOption {
  id: string;
  name: string;
  damage: string;
  mook_bonus: number;
  kachunk: boolean;
  displayLabel: string; // "AK-47 (Mook: +2, Ka-chunk)"
}
```

#### Attack Panel Controls
- **Weapon Selector**: Show weapon attributes in dropdown options
- **Mook Bonus Indicator**: Auto-activate when target is mook, show bonus value
- **Ka-chunk Toggle**: Checkbox with shot cost warning (+1 shot)
- **Attack Value Display**: Show base + weapon bonuses + manual overrides
- **Override Fields**: Allow manual entry to replace calculated bonuses

#### Visual Design Patterns
```jsx
// Weapon dropdown with attribute indicators
<Autocomplete
  options={weapons}
  getOptionLabel={(weapon) => 
    `${weapon.name} ${weapon.mook_bonus > 0 ? `(Mook: +${weapon.mook_bonus})` : ''} ${weapon.kachunk ? '(Ka-chunk)' : ''}`
  }
  renderOption={(props, weapon) => (
    <Box {...props}>
      <Typography variant="body1">{weapon.name}</Typography>
      <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
        {weapon.mook_bonus > 0 && (
          <Chip size="small" label={`Mook: +${weapon.mook_bonus}`} color="primary" />
        )}
        {weapon.kachunk && (
          <Chip size="small" label="Ka-chunk" color="secondary" />
        )}
      </Box>
    </Box>
  )}
/>

// Ka-chunk activation toggle
<FormControlLabel
  control={
    <Checkbox 
      checked={useKaChunk}
      onChange={(e) => setUseKaChunk(e.target.checked)}
      disabled={!selectedWeapon?.kachunk}
    />
  }
  label={
    <Box>
      <Typography variant="body2">
        Ka-chunk (+{kaChunkBonus} attack, +1 shot cost)
      </Typography>
    </Box>
  }
/>

// Mook bonus indicator  
{targetIsMook && selectedWeapon?.mook_bonus > 0 && (
  <Alert severity="info" sx={{ mb: 1 }}>
    Mook Bonus: +{selectedWeapon.mook_bonus} to attack (included in calculation)
  </Alert>
)}
```

### Calculation Logic

#### Attack Value Calculation
```typescript
const calculateAttackValue = (
  baseAttackValue: number,
  weapon: Weapon,
  targetType: CharacterType,
  useKaChunk: boolean,
  overrides: {
    mookBonusOverride?: number;
    kaChunkOverride?: number;
  }
) => {
  let total = baseAttackValue;
  
  // Apply mook bonus if target is mook
  if (targetType === 'mook' && weapon.mook_bonus > 0) {
    const mookBonus = overrides.mookBonusOverride ?? weapon.mook_bonus;
    total += mookBonus;
  }
  
  // Apply ka-chunk bonus if activated
  if (useKaChunk && weapon.kachunk) {
    const kaChunkBonus = overrides.kaChunkOverride ?? 2; // Standard ka-chunk bonus
    total += kaChunkBonus;
  }
  
  return total;
};
```

#### Shot Cost Calculation
```typescript
const calculateShotCost = (
  baseActionCost: number = 3,
  useKaChunk: boolean = false
): number => {
  return baseActionCost + (useKaChunk ? 1 : 0);
};
```

## User Experience Flow

### GM Attack Resolution Flow
1. **Select Attacker**: Choose character from current shot
2. **Choose Weapon**: Dropdown shows weapons with attribute indicators
3. **Select Target**: System detects if target is mook-type
4. **Mook Bonus**: Auto-applies if target is mook, shows in calculation
5. **Ka-chunk Option**: Toggle appears if weapon has ka-chunk attribute
6. **Review Calculation**: Shows total attack value with all bonuses
7. **Override Values**: GM can manually adjust any bonus
8. **Confirm Attack**: Submit with final values

### Visual Feedback Requirements
- **Weapon Attributes**: Clear badges/chips in weapon selection
- **Automatic Application**: Visual confirmation when bonuses auto-apply
- **Cost Indicators**: Shot cost changes prominently displayed
- **Override Capability**: All calculated values can be manually adjusted
- **Help Text**: Tooltips explaining each weapon attribute effect

## Testing Requirements

### Unit Tests
- Mook bonus applies only to mook-type targets
- Ka-chunk bonus applies only when toggled on
- Shot cost increases correctly with ka-chunk
- Manual overrides take precedence over calculated values
- Weapon without attributes shows no bonuses

### Integration Tests
- Attack API accepts weapon attribute parameters
- Combat log records weapon attribute usage
- Real-time updates include weapon bonus information
- Player interface shows weapon attributes correctly

### E2E Tests
- Complete attack flow with mook bonus weapon against mook
- Ka-chunk activation increases shot cost and attack value
- Manual override of weapon bonuses works correctly
- Mobile interface displays weapon attributes appropriately

## Implementation Notes

### Backend Considerations
- Weapon attributes already exist in database schema
- Weapon model and serializers already expose attributes
- CombatAction model should track weapon_id for history
- Attack resolution should validate weapon belongs to attacker

### Frontend Considerations
- Use existing Material-UI patterns for consistency
- Weapon selection should integrate with current component structure
- Toast notifications should mention weapon attribute usage
- Mobile interface needs clear visual indicators for small screens

### Performance Considerations
- Cache weapon attribute lookups during combat
- Minimize re-calculations when only overrides change
- Batch updates for multiple attribute changes
- Optimize weapon dropdown rendering for large weapon lists

## Success Criteria

- [ ] Mook bonus automatically applies when attacking mooks
- [ ] Ka-chunk option clearly visible and functional
- [ ] Shot costs update correctly with ka-chunk usage
- [ ] All weapon bonuses can be manually overridden
- [ ] Combat log tracks weapon attribute usage
- [ ] Mobile interface displays attributes clearly
- [ ] Attack calculations include weapon bonuses correctly
- [ ] GM can run attacks with weapon attributes without confusion