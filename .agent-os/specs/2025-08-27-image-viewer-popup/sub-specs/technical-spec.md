# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-27-image-viewer-popup/spec.md

## Technical Requirements

### Component Architecture
- Create a new reusable `ImageViewerModal` component in `shot-client-next/src/components/ui/`
- Implement as a controlled component that accepts `open`, `onClose`, `imageUrl`, and `altText` props
- Use Material-UI's `Modal` or `Dialog` component as the base overlay implementation
- Include a semi-transparent backdrop with configurable opacity (default 0.8)

### Integration with Existing Components

#### Modify PositionableImage Component
- Add click handler to the `ImageBox` component when not in repositioning mode
- Pass a new `onClick` prop to `ImageBox` that triggers the modal
- Maintain existing drag/reposition functionality without conflicts
- Only enable click-to-view when `isRepositioning` is false

#### Modify ImageBox Component  
- Add optional `onClick` prop that triggers when not dragging
- Differentiate between drag interactions and click interactions
- Add cursor style `pointer` when clickable (not repositioning)
- Prevent modal trigger during drag operations

### Image Display Logic
- Implement responsive image sizing that fits within viewport bounds while maintaining aspect ratio
- Add a toggle button to switch between "Fit to Screen" and "Original Size" display modes
- For "Original Size" mode, center the image and allow scrolling if it exceeds viewport dimensions
- Support the same image URL format used by existing entity.image_url fields

### Interaction Handlers
- Click handler on `ImageBox` component (when not repositioning) opens modal
- Implement keyboard event listener for ESC key dismissal when modal is open
- Add click handler on backdrop for dismissal (with stopPropagation on image container)
- Include explicit close button (X icon) positioned in top-right corner of modal
- Prevent body scroll when modal is open using CSS overflow management

### Loading State Management
- Display skeleton loader or spinner while full-resolution image loads
- Reuse existing image URL from entity.image_url (no separate full-res URL needed)
- Add error state handling for failed image loads with fallback placeholder
- Show loading indicator for images over 500KB

### Performance Optimizations
- Lazy load the ImageViewerModal component using Next.js dynamic imports
- Leverage browser caching for images already loaded in PositionableImage
- Use CSS transform for animations instead of position properties
- Debounce resize event handlers for responsive behavior

### Accessibility Requirements
- Add proper ARIA labels and roles (role="dialog", aria-modal="true")
- Ensure focus management: trap focus within modal, restore focus on close
- Support screen reader announcements for image load states
- Maintain keyboard navigation support throughout modal interaction

### Animation and Transitions
- Implement fade-in animation for backdrop (200ms duration)
- Add scale-up animation for image appearance (250ms ease-out)
- Use CSS transitions for smooth display mode switching
- Add subtle fade-out on modal dismissal

## Implementation Details

### Files to Modify

1. **src/components/ui/positionable/ImageBox.tsx**
   - Add optional `onClick` prop
   - Add click handler that checks if not dragging/repositioning
   - Update cursor styles based on clickable state

2. **src/components/ui/PositionableImage.tsx**
   - Add state for modal open/closed
   - Import and render ImageViewerModal component
   - Pass click handler to ImageBox

3. **src/components/ui/ImageViewerModal.tsx** (new file)
   - Create new modal component
   - Implement all display modes and interactions
   - Export from ui components index

4. **src/components/ui/index.ts**
   - Export the new ImageViewerModal component

### Component Props Interface

```typescript
interface ImageViewerModalProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  altText?: string
  entity?: Entity // Optional for additional context
}
```

### State Management
- Local state in PositionableImage for modal open/closed
- Local state in ImageViewerModal for display mode and loading
- No global state changes required