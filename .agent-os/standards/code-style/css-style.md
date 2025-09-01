# CSS Style Guide

We always use Material-UI (MUI) for all CSS and component styling.

### Material-UI Styling Approach

- We use Material-UI v7 components and styling system with Emotion CSS-in-JS
- All styling should use MUI's theme system and sx prop for custom styles
- Components should leverage MUI's responsive breakpoints and design tokens
- Custom styling should extend MUI's theme rather than override it
- We implement responsive design using MUI's breakpoint system

**Example of Material-UI component styling:**

```tsx
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

<Box
  sx={{
    bgcolor: 'grey.50',
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 1,
    cursor: 'pointer',
    width: '100%',
    '&:hover': {
      bgcolor: 'grey.100',
    },
    [theme.breakpoints.up('sm')]: {
      fontWeight: 'medium',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.125rem',
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.25rem',
      fontWeight: 'semibold',
    },
  }}
>
  <Typography variant="h6">I'm a call-to-action!</Typography>
</Box>
```

### MUI Responsive Breakpoints

Use MUI's standard breakpoint system:
- **xs**: 0px (extra small devices)
- **sm**: 600px (small devices)
- **md**: 960px (medium devices)
- **lg**: 1280px (large devices)
- **xl**: 1920px (extra large devices)

### Theme Integration

- Use theme colors: `primary.main`, `secondary.main`, `grey.50`, etc.
- Use theme spacing: `theme.spacing(1)` or shorthand `p: 2`
- Use theme typography: `theme.typography.h1`, `variant="h6"`
- Use theme breakpoints: `theme.breakpoints.up('md')`