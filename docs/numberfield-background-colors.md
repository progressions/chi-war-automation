# NumberField Label Background Color Audit

This document tracks NumberField components that have labels but are missing the `labelBackgroundColor` prop, which causes a visual "ghost label" effect where the label doesn't properly overlap the border.

## Issue Background

The NumberField component uses MUI's InputLabel with `shrink` prop to create floating labels that overlap the input border. For this to look correct, the label needs a background color that matches its containing element. Without `labelBackgroundColor`, the default `#262626` is used, which may not match the actual background.

## NumberFields Needing `labelBackgroundColor`

| File | Line | Label | URL Pattern | Container |
|------|------|-------|-------------|-----------|
| `src/components/fights/FightForm.tsx` | 181-189 | "Season" | `/fights/create` | Drawer |
| `src/components/fights/FightForm.tsx` | 196-204 | "Session" | `/fights/create` | Drawer |
| `src/components/encounters/chases/ChaseResolution.tsx` | 350-353 | "Swerve" | `/encounters/[id]` | Chase panel |
| `src/components/encounters/chases/ChaseAttackerInfo.tsx` | 80-83 | "Driving Skill" | `/encounters/[id]` | Chase info |
| `src/components/encounters/UpCheckPanel.tsx` | 192-195 | "Die Roll (1-6)" | `/encounters/[id]` | Up check panel |
| `src/components/encounters/UpCheckPanel.tsx` | 240-243 | "Swerve Roll" | `/encounters/[id]` | Up check panel |
| `src/components/encounters/UpCheckPanel.tsx` | 271-274 | "Fortune Die" | `/encounters/[id]` | Up check panel |
| `src/components/encounters/SpendShotsPanel.tsx` | 52-54 | "Shots to Spend" | `/encounters/[id]` | Spend shots panel |
| `src/components/encounters/HealPanel.tsx` | 236-239 | "Medicine Skill" | `/encounters/[id]` | Heal panel |
| `src/components/encounters/HealPanel.tsx` | 252-255 | "Shots" | `/encounters/[id]` | Heal panel |
| `src/components/encounters/HealPanel.tsx` | 339-342 | "Swerve" | `/encounters/[id]` | Heal panel |
| `src/components/encounters/CheeseItPanel.tsx` | 107-110 | "Shots" | `/encounters/[id]` | Cheese it panel |
| `src/components/encounters/SpeedCheckPanel.tsx` | 310-313 | "Swerve" | `/encounters/[id]` | Speed check panel |
| `src/components/encounters/SpeedCheckPanel.tsx` | 321-324 | "Fortune +" | `/encounters/[id]` | Speed check panel |
| `src/components/encounters/SpeedCheckPanel.tsx` | 358-361 | "Shots" | `/encounters/[id]` | Speed check panel |

## NumberFields Already Fixed

| File | Label | `labelBackgroundColor` |
|------|-------|------------------------|
| `src/components/fights/Show.tsx` | "Season", "Session" | `#0a0a0a` |
| `src/components/encounters/attacks/AttackerCombatFields.tsx` | Various | `#873230` |
| `src/components/encounters/attacks/AttackerBar.tsx` | Various | `#424242`, `#f57c00` |
| `src/components/encounters/attacks/ActionZone.tsx` | "Swerve" | `#b71c1c` |
| `src/components/encounters/attacks/TargetSection.tsx` | Various | `#730F10`, `#873230` |
| `src/components/encounters/attacks/CombatResolution.tsx` | "Swerve" | `#904340` |
| `src/components/encounters/chases/ChaseMethodSection.tsx` | Various | `#873230` |
| `src/components/encounters/chases/ChaseTargetSection.tsx` | Various | `#730F10` |

## Theme Background Colors (from theme.ts)

Key theme values for `labelBackgroundColor`:

| Theme Key | Hex Value | Usage |
|-----------|-----------|-------|
| `background.default` | `#0a0a0a` | Page background, main content areas |
| `background.paper` | `#141414` | Paper components, dialogs, drawers, BasePanel |
| `action.hover` | `rgba(245, 158, 11, 0.08)` | Semi-transparent overlay (computed ~`#261f13` on paper) |

## Investigation Results

Verified via Playwright browser automation on 2024-12-11:

### FightForm.tsx (Drawer)
- **Container**: MUI Drawer with Paper element
- **Computed background**: `rgb(20, 20, 20)` = `#141414` (`background.paper`)
- **Recommended `labelBackgroundColor`**: `#141414`
- **NumberFields**: "Season", "Session"

### HealPanel.tsx (Dialog/BasePanel)
- **Container**: BasePanel with `backgroundColor: "background.paper"`
- **Computed background**: `rgb(20, 20, 20)` = `#141414`
- **Sections**:
  - Healer section (lines 236-266): `backgroundColor: "action.hover"` → computed ~`#261f13`
  - Resolution section (lines 339-348): `backgroundColor: "background.default"` → `#0a0a0a`
- **Recommended `labelBackgroundColor`**:
  - "Medicine Skill", "Shots": `#141414` (parent is paper, action.hover is semi-transparent)
  - "Swerve": `#0a0a0a`

### UpCheckPanel.tsx (BasePanel)
- **Container**: BasePanel with `backgroundColor: "background.paper"`
- **Computed background**: `#141414`
- **Recommended `labelBackgroundColor`**: `#141414`
- **NumberFields**: "Die Roll (1-6)", "Swerve Roll", "Fortune Die"

### SpendShotsPanel.tsx (BasePanel)
- **Container**: BasePanel with `backgroundColor: "background.paper"`
- **Computed background**: `#141414`
- **Recommended `labelBackgroundColor`**: `#141414`
- **NumberFields**: "Shots to Spend"

### CheeseItPanel.tsx (BasePanel)
- **Container**: BasePanel with `backgroundColor: "background.paper"`
- **Computed background**: `#141414`
- **Recommended `labelBackgroundColor`**: `#141414`
- **NumberFields**: "Shots"

### SpeedCheckPanel.tsx (BasePanel)
- **Container**: BasePanel with `backgroundColor: "background.paper"`
- **Computed background**: `#141414`
- **Recommended `labelBackgroundColor`**: `#141414`
- **NumberFields**: "Swerve", "Fortune +", "Shots"

### ChaseResolution.tsx
- **Container**: Box with `backgroundColor: "background.default"`
- **Computed background**: `#0a0a0a`
- **Recommended `labelBackgroundColor`**: `#0a0a0a`
- **NumberFields**: "Swerve"

### ChaseAttackerInfo.tsx
- **Container**: Box with `backgroundColor: "action.hover"` on top of paper
- **Computed background**: ~`#261f13` (action.hover overlay on paper)
- **Recommended `labelBackgroundColor`**: `#141414` (since action.hover is semi-transparent, use parent)
- **NumberFields**: "Driving Skill"

## Summary of Required Fixes

| File | NumberField(s) | `labelBackgroundColor` |
|------|----------------|------------------------|
| FightForm.tsx | "Season", "Session" | `#141414` |
| HealPanel.tsx | "Medicine Skill", "Shots" | `#141414` |
| HealPanel.tsx | "Swerve" | `#0a0a0a` |
| UpCheckPanel.tsx | "Die Roll (1-6)", "Swerve Roll", "Fortune Die" | `#141414` |
| SpendShotsPanel.tsx | "Shots to Spend" | `#141414` |
| CheeseItPanel.tsx | "Shots" | `#141414` |
| SpeedCheckPanel.tsx | "Swerve", "Fortune +", "Shots" | `#141414` |
| ChaseResolution.tsx | "Swerve" | `#0a0a0a` |
| ChaseAttackerInfo.tsx | "Driving Skill" | `#141414` |

## Background Colors by Context (Reference)

Colors currently in use across the codebase:

- `#0a0a0a` - Page background (`background.default`)
- `#141414` - Paper/dialog/drawer background (`background.paper`)
- `#262626` - Default NumberField label background (outdated)
- `#424242` - Gray (compact attacker bar)
- `#730F10` - Dark red (target defense fields)
- `#873230` - Red (attacker combat fields)
- `#904340` - Medium red (combat resolution)
- `#b71c1c` - Bright red (action zone swerve)
- `#f57c00` - Orange (fortune field)

## Related Files

- `src/components/ui/NumberField.tsx` - Core component definition
- `src/theme.ts` - Theme color definitions
- `src/customThemeOptions.ts` - Custom theme extensions
- `src/components/encounters/BasePanel.tsx` - Common panel container
- Fizzy Card #18 - "Improve the appearance of NumberField"
