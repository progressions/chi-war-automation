# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-07-basepanel-extraction/spec.md

## Technical Requirements

### BasePanel Component Structure

The BasePanel will be a React component that encapsulates the common Paper structure found in CheeseItPanel and SpeedCheckPanel:

```typescript
interface BasePanelProps {
  title: string
  icon?: React.ReactNode
  borderColor?: string
  children: React.ReactNode
  sx?: SxProps
}
```

### Core Styling

Based on existing panels, the BasePanel will provide:
- **Paper component** with consistent padding (`p: 3`)
- **2px solid border** with configurable color (default from theme)
- **Consistent background color** (`background.paper`)
- **Header section** with icon and title in flex layout
- **Content area** for children components

### Implementation Details

**File Location:** `src/components/encounters/BasePanel.tsx`

**Key Features:**
- Material-UI Paper component as the root element
- Flex header with optional icon (size 24) and Typography variant="h6"
- Children rendered in the content area
- Support for additional sx prop overrides
- TypeScript interfaces for type safety

### Migration Pattern

**Current Structure (CheeseItPanel):**
```tsx
<Paper sx={{
  p: 3,
  mb: 2,
  position: "relative",
  border: "2px solid",
  borderColor: "warning.main",
  backgroundColor: "background.paper",
}}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    <FaPersonRunning size={24} />
    <Typography variant="h6" component="h2">
      Cheese It
    </Typography>
  </Box>
  {/* Panel content */}
</Paper>
```

**After Migration:**
```tsx
<BasePanel
  title="Cheese It"
  icon={<FaPersonRunning />}
  borderColor="warning.main"
>
  {/* Panel content */}
</BasePanel>
```

### Border Colors

Based on existing panels:
- **CheeseItPanel:** `warning.main` (orange/yellow for escape action)
- **SpeedCheckPanel:** `warning.main` or `info.main` (depending on state)

The BasePanel will accept borderColor as a prop but won't customize it per panel type automatically.

### Component Dependencies

- `@mui/material`: Paper, Box, Typography, SxProps
- `react`: React.ReactNode for children and icon props
- No external dependencies beyond what's already in the project

## Testing Requirements

### Unit Tests
- BasePanel renders with required props
- BasePanel passes through sx prop overrides
- BasePanel renders icon when provided
- BasePanel applies correct border color

### Integration Tests
- CheeseItPanel maintains all existing functionality after migration
- SpeedCheckPanel maintains all existing functionality after migration
- Visual regression tests confirm no UI changes

### E2E Tests
- Existing Playwright tests for encounter actions continue to pass
- No changes needed to test scripts as functionality remains the same