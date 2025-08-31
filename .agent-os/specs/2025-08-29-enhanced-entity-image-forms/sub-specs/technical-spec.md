# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-29-enhanced-entity-image-forms/spec.md

## Technical Requirements

### Component Architecture Modifications

- **PositionableImage Creation Mode** - Extend PositionableImage component with `creationMode` prop that bypasses entity ID requirements and uses local state for positioning data
- **Temporary Position State** - Implement position data storage in creation form state before entity persistence, using `{ x: number, y: number, zoom?: number }` interface
- **Form Integration Pattern** - Replace `<input type="file">` + `AddPhotoAlternateIcon` pattern in all entity creation forms with PositionableImage component
- **State Management** - Extend existing `useEntity` hook to handle image positioning data during creation workflow
- **Preview Integration** - Ensure HeroImage component receives position data from creation form state for real-time preview

### API Integration Requirements  

- **Entity Creation Payload** - Modify entity creation endpoints to accept optional `image_position` parameter alongside existing image file upload
- **Position Data Format** - Use consistent `{ x: number, y: number, zoom?: number }` structure matching existing PositionableImage save format
- **Temporary Storage** - Store position data in form state until entity creation, then persist with entity creation request
- **Backward Compatibility** - Maintain existing `createEntity(data, image)` signature while extending to support position data

### UI/UX Implementation Specifications

- **Form Layout Consistency** - Maintain existing form layouts while replacing image upload sections with PositionableImage component
- **Context-Aware AI Generation** - Implement entity-type-specific AI generation prompts using existing GenerateImageDialog infrastructure
- **Mobile Responsiveness** - Ensure PositionableImage creation mode works within existing responsive form layouts
- **Loading States** - Integrate with existing form loading/submission states during AI generation and file upload processes
- **Error Handling** - Extend existing form validation to include image positioning validation and error display

### Integration Patterns

- **Component Replacement** - Systematically replace basic upload pattern across all entity forms: Characters, Campaigns, Vehicles, Sites, Parties, Factions, Weapons, Schticks, Junctures, Users, Fights
- **Shared Interface** - Implement consistent `ImageCreationProps` interface for all entity forms to standardize PositionableImage integration
- **TypeScript Support** - Extend existing entity type definitions to include optional position data during creation phase
- **Testing Integration** - Update existing Playwright test scripts to handle new image creation workflows in entity forms

### Performance Considerations

- **Lazy Loading** - Ensure PositionableImage component lazy loads AI generation and upload dialogs to maintain form performance
- **Memory Management** - Properly cleanup temporary image URLs and positioning state when creation form is cancelled or completed
- **Bundle Size** - Leverage existing PositionableImage component without duplicating image handling logic across creation forms