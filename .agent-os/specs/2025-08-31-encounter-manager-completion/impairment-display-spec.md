# Impairment Display & Calculation Specification

## Overview

Impairment is a critical combat mechanic in Feng Shui 2 that represents how wounds affect a character's combat effectiveness. The encounter manager must prominently display impairment levels and automatically factor them into all attack and defense calculations.

## Core Mechanics

### Impairment Thresholds

#### Player Characters (PC) and Allies
- **0-29 wounds**: No impairment (healthy)
- **30-34 wounds**: 1 Impairment (-1 to Attack Value and Defense Value)
- **35+ wounds**: 2 Impairment (-2 to Attack Value and Defense Value)

#### Named NPCs and Featured Foes
- **0-29 wounds**: No impairment
- **30-34 wounds**: 1 Impairment (-1 AV/DV)
- **35+ wounds**: 2 Impairment (-2 AV/DV)

#### Boss Characters
- **0-49 wounds**: No impairment
- **50+ wounds**: 1 Impairment (-1 AV/DV)
- **Higher thresholds**: Configurable based on specific boss

#### Uber-Boss Characters
- **0-59 wounds**: No impairment
- **60+ wounds**: 1 Impairment (-1 AV/DV)
- **Multiple levels**: Can have 2+ impairment levels at higher wound counts

#### Mook Characters
- **No impairment**: Mooks are defeated with any successful hit, no wound/impairment tracking

## Technical Implementation

### Calculation Functions

```javascript
// Core impairment calculation
function calculateImpairment(wounds, characterType) {
  // Normalize character type
  const type = characterType?.toLowerCase();
  
  // Mooks never take impairment
  if (type === 'mook') return 0;
  
  // Player characters and allies
  if (type === 'pc' || type === 'ally') {
    if (wounds >= 35) return 2;
    if (wounds >= 30) return 1;
    return 0;
  }
  
  // Boss characters have higher thresholds
  if (type === 'boss') {
    if (wounds >= 50) return 1;
    return 0;
  }
  
  // Uber-boss characters have even higher thresholds
  if (type === 'uber_boss') {
    if (wounds >= 60) return 1;
    return 0;
  }
  
  // Default for NPCs and featured foes (same as PCs)
  if (wounds >= 35) return 2;
  if (wounds >= 30) return 1;
  return 0;
}

// Apply impairment to combat values
function applyImpairment(baseValue, impairmentLevel) {
  return Math.max(0, baseValue - impairmentLevel);
}

// Get impairment status for display
function getImpairmentStatus(wounds, characterType) {
  const impairment = calculateImpairment(wounds, characterType);
  
  if (impairment === 0) return { level: 0, status: 'Healthy', color: 'success' };
  if (impairment === 1) return { level: 1, status: '1 Impairment', color: 'warning' };
  if (impairment >= 2) return { level: impairment, status: `${impairment} Impairment`, color: 'error' };
}
```

### Component Integration

#### Character Card Display
```typescript
interface CharacterCardProps {
  character: Character;
  wounds: number;
  showAdjustedValues?: boolean;
}

// Example character card with impairment
function CharacterCard({ character, wounds, showAdjustedValues = true }: CharacterCardProps) {
  const impairment = calculateImpairment(wounds, character.character_type);
  const impairmentStatus = getImpairmentStatus(wounds, character.character_type);
  
  const adjustedAV = applyImpairment(character.guns, impairment);
  const adjustedDV = applyImpairment(character.defense, impairment);
  
  return (
    <Card>
      <CardHeader 
        title={character.name}
        subheader={
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${wounds} Wounds`} 
              color={wounds >= 30 ? 'error' : 'default'} 
              size="small" 
            />
            {impairment > 0 && (
              <Chip 
                label={impairmentStatus.status}
                color={impairmentStatus.color}
                size="small"
              />
            )}
          </Box>
        }
      />
      <CardContent>
        {showAdjustedValues ? (
          <Box>
            <Typography variant="body2">
              Attack: {character.guns} {impairment > 0 && `(-${impairment})`} = {adjustedAV}
            </Typography>
            <Typography variant="body2">
              Defense: {character.defense} {impairment > 0 && `(-${impairment})`} = {adjustedDV}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2">Guns: {character.guns}</Typography>
            <Typography variant="body2">Defense: {character.defense}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Attack Panel Integration
```typescript
interface AttackCalculation {
  baseAttackValue: number;
  impairmentPenalty: number;
  weaponBonuses: number;
  activeBoosts: number;
  manualOverride?: number;
  finalAttackValue: number;
}

function AttackValueDisplay({ attacker, weapon, target }: AttackProps) {
  const attackerImpairment = calculateImpairment(attacker.wounds, attacker.character_type);
  const targetImpairment = calculateImpairment(target.wounds, target.character_type);
  
  const baseAV = attacker.guns; // or selected skill
  const adjustedAV = applyImpairment(baseAV, attackerImpairment);
  
  const baseDV = target.defense;
  const adjustedDV = applyImpairment(baseDV, targetImpairment);
  
  return (
    <Box>
      <Typography variant="h6">Attack Calculation</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2">Attacker: {attacker.name}</Typography>
              <Typography variant="body2">
                Base AV: {baseAV}
                {attackerImpairment > 0 && (
                  <Chip 
                    label={`-${attackerImpairment} impairment`} 
                    size="small" 
                    color="warning"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="h6" color="primary">
                Adjusted AV: {adjustedAV}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2">Target: {target.name}</Typography>
              <Typography variant="body2">
                Base DV: {baseDV}
                {targetImpairment > 0 && (
                  <Chip 
                    label={`-${targetImpairment} impairment`} 
                    size="small" 
                    color="warning"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="h6" color="secondary">
                Adjusted DV: {adjustedDV}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

### Shot Counter Integration

#### Enhanced Shot Display
```typescript
function ShotGroup({ shotValue, characters }: ShotGroupProps) {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 1 }}>
      <Typography variant="h6" gutterBottom>
        Shot {shotValue} {shotValue === currentShot && '← CURRENT'}
      </Typography>
      <Grid container spacing={1}>
        {characters.map(character => (
          <Grid item xs={12} sm={6} md={4} key={character.id}>
            <CharacterCard 
              character={character}
              wounds={getCharacterWounds(character)}
              showAdjustedValues={true}
              showBoostStatus={true}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
```

### Real-time Updates

#### WebSocket Events
```javascript
// Impairment-related events
const IMPAIRMENT_EVENTS = {
  IMPAIRMENT_CHANGED: 'impairment_changed',
  WOUNDS_UPDATED: 'wounds_updated',
  CALCULATIONS_UPDATED: 'calculations_updated'
};

// Event payload examples
{
  type: 'impairment_changed',
  character_id: 'uuid',
  old_impairment: 0,
  new_impairment: 1,
  wound_count: 32,
  adjusted_values: {
    attack_value: 12,  // was 13
    defense_value: 12  // was 13
  }
}
```

### Visual Design Guidelines

#### Color Coding
- **Healthy (0 impairment)**: Green indicators, normal text
- **1 Impairment**: Yellow/orange indicators, warning styling
- **2+ Impairment**: Red indicators, error styling

#### Typography Patterns
- **Base values**: Regular weight, normal color
- **Impairment penalty**: Parentheses, muted color: `(−1)`
- **Adjusted values**: Bold weight, primary color
- **Format**: `"AV 15 (−1) = 14"` or `"15 → 14"`

#### Badge and Chip Usage
```typescript
// Impairment level badge
<Badge 
  badgeContent={impairment > 0 ? impairment : null}
  color="warning"
  overlap="circular"
>
  <Avatar src={character.avatar} />
</Badge>

// Impairment status chip
<Chip 
  label={`${impairment} Impairment`}
  color={impairment === 1 ? 'warning' : 'error'}
  size="small"
  icon={<WarningIcon />}
/>
```

### Integration Points

#### Attack Panel
- Show attacker's impairment and adjusted AV
- Show target's impairment and adjusted DV
- Include impairment in calculation breakdown
- Real-time updates as wounds change

#### Shot Counter
- Display impairment level on each character card
- Show adjusted AV/DV values when expanded
- Color-code impaired characters
- Update immediately when wounds change

#### Player Interface
- Prominent impairment display for player's character
- Show how impairment affects available actions
- Clear indication of adjusted combat values
- Mobile-optimized impairment indicators

#### Combat Log
- Record impairment changes in combat history
- Note when impairment affects attack/defense outcomes
- Track impairment progression over time

### Testing Requirements

#### Unit Tests
```javascript
describe('Impairment Calculations', () => {
  test('PC impairment thresholds', () => {
    expect(calculateImpairment(29, 'pc')).toBe(0);
    expect(calculateImpairment(30, 'pc')).toBe(1);
    expect(calculateImpairment(34, 'pc')).toBe(1);
    expect(calculateImpairment(35, 'pc')).toBe(2);
  });
  
  test('Boss impairment thresholds', () => {
    expect(calculateImpairment(49, 'boss')).toBe(0);
    expect(calculateImpairment(50, 'boss')).toBe(1);
  });
  
  test('Value adjustment', () => {
    expect(applyImpairment(15, 1)).toBe(14);
    expect(applyImpairment(12, 2)).toBe(10);
    expect(applyImpairment(5, 10)).toBe(0); // Never below 0
  });
});
```

#### E2E Tests
- Verify impairment calculation updates in real-time
- Test attack/defense value adjustments throughout interface
- Validate visual indicators for different impairment levels
- Confirm integration with boost actions and weapon attributes

### Performance Considerations

#### Calculation Optimization
- Cache impairment calculations to avoid repeated computation
- Update only affected UI components when wounds change
- Use React.memo for character cards with impairment display
- Debounce rapid wound updates to prevent calculation spam

#### Visual Performance
- Use CSS animations for smooth impairment level transitions
- Optimize re-renders when impairment values change
- Lazy load impairment tooltips and help content
- Efficient color theme switching for impairment indicators

This comprehensive impairment system ensures that the physical consequences of combat are clearly visible and automatically factored into all game mechanics, providing both mechanical accuracy and clear visual feedback for players and GMs.