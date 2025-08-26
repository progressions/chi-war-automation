# PC Character Creation Screen Redesign Specification

**Date:** 2025-01-29  
**Priority:** Medium  
**Category:** UI/UX  
**Status:** Specification  

## Overview

This specification defines a comprehensive redesign of the PC (Player Character) creation screen to match the successful design patterns implemented in the GMC (Game Master Character) template selection interface. The goal is to create a consistent, clean, and efficient character creation experience across both PC and NPC workflows.

## Current State Analysis

### PC Creation Page Issues (`/characters/create`)

**File:** `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/components/characters/CreatePage.tsx`

**Problems Identified:**

1. **Dark/Gray Design**: Uses carousel with dark background (`bgcolor: "grey.800"`, `bgcolor: "grey.900"`)
2. **Information Overload**: Template component shows excessive detail:
   - Header with manage controls
   - Full action values display
   - Skills section
   - Associations section  
   - Rich text background
   - Schticks section
   - Weapons section
3. **Clunky Carousel Navigation**: 
   - Awkward movement mechanics for browsing 36 templates
   - Forces sequential browsing (can't jump to specific templates)
   - Can't compare templates side-by-side
   - Carousel transitions feel sluggish and unnatural
4. **Friction**: Requires confirmation dialog before character creation
5. **No Search/Filter Options**: With 36 templates, users need ways to quickly find specific archetypes or abilities
5. **Visual Inconsistency**: Uses generic avatar icons instead of clean card design
6. **Fixed Dimensions**: Template component has fixed width (770px) unsuitable for cards

**Current Template Component Structure:**
```typescript
// Template.tsx - Shows everything
<Box sx={{ width: 770, mt: 2, mx: "auto" }}>
  <Header character={template} manage={false} />
  <ActionValues character={template} size="large" />
  <Skills character={template} />
  <Associations character={template} />
  <RichTextRenderer html={CS.background(template)} />
  <Schticks character={template} />
  <Weapons character={template} />
</Box>
```

### GMC Page Success Patterns (`/characters/gmc`)

**File:** `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/app/(main)/characters/gmc/page.tsx`

**Successful Design Elements:**

1. **Clean White Cards**: Uses `bgcolor: "background.paper"` with subtle borders
2. **Comprehensive Information**: Shows all essential details for informed decision-making:
   - Character name and archetype
   - Action values (attack, defense, speed, toughness, fortune)
   - **Skills** - Character's trained abilities
   - **Schticks** - Special powers and abilities
   - **Weapons** - Starting equipment and combat options
   - Brief description via RichTextRenderer
3. **Grid Layout**: Responsive 2-column desktop layout for larger cards (xs=12, md=6)
4. **Filtering Options**: Search and filter capabilities for 36+ templates
5. **Direct Action**: Click-to-create without confirmation dialog
6. **Loading States**: Overlay during creation process
7. **Consistent Styling**: Clean typography and spacing

## Objectives

### Primary Goals

1. **Visual Consistency**: Align PC creation with GMC design language
2. **Informed Decision Making**: Display essential template information including schticks/powers
3. **Improved Navigation**: Replace carousel with responsive grid layout
4. **Streamlined Workflow**: Remove confirmation dialog friction
5. **Better Organization**: Implement tab-based archetype categorization if applicable

### Success Criteria

1. **Design Consistency**: PC and GMC pages use identical card styling and layout patterns
2. **Performance**: Page loads and renders templates efficiently in grid format
3. **Usability**: Users can quickly scan and select character archetypes
4. **Responsiveness**: Layout works across desktop, tablet, and mobile devices
5. **Accessibility**: Proper ARIA labels and keyboard navigation support

## Technical Specification

### Component Architecture

#### 1. New PC Template Preview Card

**File:** `src/components/characters/create/PCTemplatePreviewCard.tsx`

```typescript
interface PCTemplatePreviewCardProps {
  template: Character
  onSelect: (template: Character) => void
}

function PCTemplatePreviewCard({ template, onSelect }: PCTemplatePreviewCardProps) {
  const actionValues = template.action_values || {}
  
  return (
    <Card 
      sx={{ 
        height: "100%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardActionArea onClick={() => onSelect(template)} sx={{ height: "100%", p: 0 }}>
        <CardContent sx={{ p: 2 }}>
          {/* Name Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {template.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {CS.archetype(template)}
            </Typography>
          </Box>

          {/* Action Values Section - Compact Display */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Action Values
            </Typography>
            
            <Grid container spacing={1}>
              {/* Show primary action values for PCs */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    {CS.mainAttack(template)}
                  </Typography>
                  <Typography variant="h6">
                    {CS.mainAttackValue(template)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>Defense</Typography>
                  <Typography variant="h6">{actionValues["Defense"] || 0}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>Toughness</Typography>
                  <Typography variant="h6">{actionValues["Toughness"] || 0}</Typography>
                </Box>
              </Grid>

              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>Speed</Typography>
                  <Typography variant="h6">{actionValues["Speed"] || 0}</Typography>
                </Box>
              </Grid>

              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    {CS.fortuneType(template)}
                  </Typography>
                  <Typography variant="h6">{CS.fortune(template)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Skills Section */}
          {template.skills && Object.keys(template.skills).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {Object.entries(template.skills)
                  .filter(([_, value]) => value > 0)
                  .map(([skill, value]) => (
                    <Chip 
                      key={skill}
                      label={`${skill}: ${value}`}
                      size="small"
                      variant="filled"
                      sx={{ 
                        fontSize: "0.75rem",
                        bgcolor: "action.selected",
                      }}
                    />
                  ))}
              </Box>
            </Box>
          )}

          {/* Schticks Section - Critical for PC decision making */}
          {template.schticks && template.schticks.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Schticks (Powers & Abilities)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {template.schticks.map(schtick => (
                  <Chip 
                    key={schtick.id}
                    label={schtick.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Weapons Section */}
          {template.weapons && template.weapons.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Weapons
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {template.weapons.slice(0, 3).map(weapon => (
                  <Typography key={weapon.id} variant="caption" sx={{ 
                    bgcolor: "background.default",
                    p: 0.5,
                    borderRadius: 1,
                  }}>
                    {weapon.name} ({weapon.damage}/{weapon.concealment}/{weapon.reload})
                  </Typography>
                ))}
                {template.weapons.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{template.weapons.length - 3} more weapons
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Description - Brief excerpt */}
          {CS.background(template) && (
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: "1px solid", 
              borderColor: "divider",
              "& .tiptap": {
                fontSize: "0.875rem",
                lineHeight: 1.4,
                color: "text.secondary",
                "& p": { margin: 0 },
                /* Truncate long descriptions */
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            }}>
              <RichTextRenderer html={CS.background(template) || ""} />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
```

#### 2. Updated Create Page Layout

**File:** `src/components/characters/CreatePage.tsx`

```typescript
export default function CreatePage({ templates }: CreatePageProps) {
  const router = useRouter()
  const { client } = useClient()
  const { refreshUser } = useApp()
  const { toastSuccess, toastError } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<{
    archetype?: string
    hasWeapons?: boolean
    hasSchticks?: boolean
  }>({})
  const [loading, setLoading] = useState(false)
  const [creatingFrom, setCreatingFrom] = useState<string | null>(null)

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Search by name or description
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      // Filter by archetype if selected
      if (selectedFilters.archetype && template.archetype !== selectedFilters.archetype) {
        return false
      }
      // Filter by has weapons
      if (selectedFilters.hasWeapons && (!template.weapons || template.weapons.length === 0)) {
        return false
      }
      // Filter by has schticks
      if (selectedFilters.hasSchticks && (!template.schticks || template.schticks.length === 0)) {
        return false
      }
      return true
    })
  }, [templates, searchTerm, selectedFilters])

  // Get unique archetypes for filter dropdown
  const archetypes = useMemo(() => {
    const unique = [...new Set(templates.map(t => t.archetype).filter(Boolean))]
    return unique.sort()
  }, [templates])

  const handleSelectTemplate = async (template: Character) => {
    if (creatingFrom) return
    
    setCreatingFrom(template.id)
    try {
      const response = await client.duplicateCharacter(template)
      const newCharacter = response.data
      
      await refreshUser()
      
      toastSuccess(`Created new character: ${newCharacter.name}`)
      router.push(`/characters/${newCharacter.id}`)
    } catch (error) {
      console.error("Error creating character from template:", error)
      toastError("Failed to create character from template")
    } finally {
      setCreatingFrom(null)
    }
  }

  return (
    <Box sx={{ position: "relative" }}>
      <SpeedDial />
      <MainHeader
        title="Create Player Character"
        icon={<Icon keyword="Characters" size="36" />}
        subtitle="Choose an archetype to create your character"
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Search and Filter Bar */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Archetype</InputLabel>
                  <Select
                    value={selectedFilters.archetype || ""}
                    onChange={(e) => setSelectedFilters({
                      ...selectedFilters,
                      archetype: e.target.value
                    })}
                    label="Archetype"
                  >
                    <MenuItem value="">All Archetypes</MenuItem>
                    {archetypes.map(arch => (
                      <MenuItem key={arch} value={arch}>{arch}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12} md={5}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFilters.hasWeapons || false}
                        onChange={(e) => setSelectedFilters({
                          ...selectedFilters,
                          hasWeapons: e.target.checked
                        })}
                      />
                    }
                    label="Has Weapons"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFilters.hasSchticks || false}
                        onChange={(e) => setSelectedFilters({
                          ...selectedFilters,
                          hasSchticks: e.target.checked
                        })}
                      />
                    }
                    label="Has Schticks"
                  />
                  <Button
                    variant="text"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedFilters({})
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Results Count */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredTemplates.length} of {templates.length} templates
          </Typography>

          {/* Template Grid */}
          <Grid container spacing={3}>
            {filteredTemplates.map(template => (
              <Grid item xs={12} md={6} key={template.id}>
                <PCTemplatePreviewCard
                  template={template}
                  onSelect={handleSelectTemplate}
                />
              </Grid>
            ))}
          </Grid>

          {/* Loading Overlay */}
          {creatingFrom && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
```

### Data Requirements

#### Template Categorization

PC templates need archetype-based organization. Update the API call to group templates:

```typescript
// Fetch templates by archetype
const response = await client.getCharacters({
  is_template: true,
  character_type: 'pc',
  archetype: archetype.value,
  per_page: 50,
})
```

#### Backend Support

Ensure the characters API supports:
- `character_type: 'pc'` filtering
- `archetype` parameter filtering
- Template categorization logic

### Styling Specifications

#### Card Design

```scss
.pc-template-card {
  // Match GMC card styling exactly
  background-color: var(--mui-palette-background-paper);
  border: 1px solid var(--mui-palette-divider);
  border-radius: 8px;
  
  &:hover {
    box-shadow: var(--mui-shadows-2);
  }
  
  .card-content {
    padding: 16px;
  }
  
  .character-name {
    font-weight: bold;
    font-size: 1.25rem;
    margin-bottom: 8px;
  }
  
  .archetype-label {
    color: var(--mui-palette-text-secondary);
    font-size: 0.875rem;
    margin-bottom: 16px;
  }
  
  .action-values-grid {
    gap: 8px;
    
    .stat-box {
      border: 1px solid var(--mui-palette-divider);
      border-radius: 4px;
      padding: 8px;
      text-align: center;
      background-color: var(--mui-palette-background-default);
      min-height: 60px;
    }
  }
  
  .description-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--mui-palette-divider);
    
    .rich-text-content {
      font-size: 0.875rem;
      line-height: 1.4;
      color: var(--mui-palette-text-secondary);
      
      /* Truncate long descriptions */
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}
```

#### Responsive Behavior

```scss
.pc-template-grid {
  // Desktop: 3 columns
  @media (min-width: 960px) {
    .template-card {
      width: calc(33.333% - 16px);
    }
  }
  
  // Tablet: 2 columns  
  @media (min-width: 600px) and (max-width: 959px) {
    .template-card {
      width: calc(50% - 16px);
    }
  }
  
  // Mobile: 1 column
  @media (max-width: 599px) {
    .template-card {
      width: 100%;
    }
  }
}
```

## Implementation Tasks

### Phase 1: Component Development

1. **Create PCTemplatePreviewCard Component**
   - [ ] Implement clean card design matching GMC style
   - [ ] Add action values display (simplified for PCs)
   - [ ] Include truncated description rendering
   - [ ] Add click handler for direct character creation

2. **Update CreatePage Component**
   - [ ] Replace Carousel with Grid layout
   - [ ] Implement tab-based archetype navigation
   - [ ] Add loading states and error handling
   - [ ] Remove confirmation dialog

3. **Remove Deprecated Components**
   - [ ] Mark old Template.tsx component for removal
   - [ ] Update imports and dependencies
   - [ ] Clean up Carousel component if unused elsewhere

### Phase 2: Data Integration

4. **Update Template Data Loading**
   - [ ] Modify API calls to group by archetype
   - [ ] Implement archetype-based filtering
   - [ ] Add fallback for ungrouped templates

5. **Backend API Enhancement**
   - [ ] Verify character_type filtering works for PCs
   - [ ] Add archetype parameter support if needed
   - [ ] Ensure template serialization includes archetype data

### Phase 3: Styling and Polish

6. **Apply Consistent Styling**
   - [ ] Match GMC card appearance exactly
   - [ ] Implement responsive grid layout
   - [ ] Add hover and focus states
   - [ ] Ensure accessibility compliance

7. **Testing and Refinement**
   - [ ] Test on multiple screen sizes
   - [ ] Verify character creation flow
   - [ ] Validate loading and error states
   - [ ] Conduct usability testing

### Phase 4: Integration and Cleanup

8. **Remove Old Components**
   - [ ] Delete unused Template.tsx component
   - [ ] Remove ConfirmDialog dependency
   - [ ] Clean up Carousel if not used elsewhere
   - [ ] Update related imports

9. **Update Documentation**
   - [ ] Update component documentation
   - [ ] Add examples to CLAUDE.md
   - [ ] Document new API patterns

## User Experience Improvements

### Before (Current PC Creation)

1. User navigates to `/characters/create`
2. Views single template in dark carousel
3. Uses arrows to navigate between templates
4. Clicks floating action button to select
5. Confirms selection in dialog
6. Character is created and user redirected

### After (New PC Creation)

1. User navigates to `/characters/create`
2. Views clean grid of archetype templates
3. Uses tabs to switch between archetypes
4. Clicks directly on desired template card
5. Character is created immediately with loading overlay
6. User redirected with success toast

### Key Improvements

- **Faster Decision Making**: Grid view allows comparison of multiple templates
- **Reduced Friction**: No confirmation dialog interruption
- **Better Organization**: Archetype tabs provide clear categorization
- **Visual Consistency**: Matches established GMC design patterns
- **Responsive Design**: Works well on all device sizes

## Testing Strategy

### Unit Tests

```typescript
// PCTemplatePreviewCard.test.tsx
describe('PCTemplatePreviewCard', () => {
  it('displays character name and archetype', () => {
    // Test component rendering
  })
  
  it('shows simplified action values', () => {
    // Test action values display
  })
  
  it('truncates long descriptions', () => {
    // Test description truncation
  })
  
  it('calls onSelect when clicked', () => {
    // Test click handler
  })
})

// CreatePage.test.tsx  
describe('CreatePage', () => {
  it('renders template grid layout', () => {
    // Test grid rendering
  })
  
  it('switches archetypes via tabs', () => {
    // Test tab navigation
  })
  
  it('creates character directly without confirmation', () => {
    // Test streamlined creation flow
  })
})
```

### Integration Tests

```javascript
// test-pc-character-creation-redesign.js
async function testPCCreationRedesign(page) {
  // Navigate to PC creation page
  await page.goto('/characters/create')
  
  // Verify grid layout
  const templateCards = await page.locator('.pc-template-card')
  expect(await templateCards.count()).toBeGreaterThan(0)
  
  // Test archetype tabs
  const tabs = await page.locator('[role="tab"]')
  expect(await tabs.count()).toBeGreaterThan(1)
  
  // Test direct character creation
  await templateCards.first().click()
  
  // Verify creation without confirmation
  await page.waitForURL('/characters/**')
  
  // Verify success toast
  const toast = await page.locator('.popup-toast')
  expect(await toast.isVisible()).toBe(true)
}
```

### Visual Regression Tests

- Screenshot comparison with GMC page cards
- Responsive layout verification across breakpoints
- Dark/light theme consistency checks

## Risk Assessment

### Technical Risks

1. **Breaking Changes**: Modifying core character creation flow
   - **Mitigation**: Implement feature flag for gradual rollout
   - **Fallback**: Keep old components until new flow is proven

2. **Template Data Dependencies**: Archetype categorization may not exist
   - **Mitigation**: Implement graceful fallback to single category
   - **Enhancement**: Add archetype field to character templates

3. **Performance Impact**: Loading multiple templates in grid
   - **Mitigation**: Implement pagination and lazy loading
   - **Optimization**: Use template index serializer for minimal data

### User Experience Risks

1. **Change Resistance**: Users familiar with current carousel
   - **Mitigation**: Provide onboarding hints for new interface
   - **Communication**: Announce improvement in release notes

2. **Mobile Usability**: Grid may be challenging on small screens
   - **Mitigation**: Thorough mobile testing and refinement
   - **Alternative**: Consider list view option for mobile

## Success Metrics

### Quantitative Measures

- **Creation Time**: Reduce average time from template selection to character creation by 30%
- **Conversion Rate**: Increase template selection to character creation conversion by 20%
- **User Satisfaction**: Achieve >85% positive feedback on new interface
- **Performance**: Page load time under 2 seconds for template grid
- **Accessibility**: Pass WCAG 2.1 AA compliance testing

### Qualitative Measures

- **Visual Consistency**: Design review confirms alignment with GMC interface
- **Usability Testing**: Users can successfully navigate and create characters
- **Developer Experience**: Code maintainability and component reusability improved
- **Cross-Platform**: Consistent experience across desktop, tablet, mobile

## Conclusion

This specification provides a comprehensive roadmap for redesigning the PC character creation interface to match the successful patterns established in the GMC template selection system. The proposed changes will create a more consistent, efficient, and user-friendly experience while maintaining all existing functionality.

The phased implementation approach allows for careful testing and validation at each step, ensuring a smooth transition from the current carousel-based system to the new grid-based design. The resulting interface will provide better visual consistency, improved usability, and a more modern user experience across the entire character creation workflow.