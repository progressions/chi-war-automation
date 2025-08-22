# Marketing Landing Page Implementation Specification

## Overview

This specification outlines the implementation of a marketing landing page for Chi War - a Feng Shui 2 RPG campaign management tool. The landing page will serve as the primary entry point for unauthenticated users, showcasing the application's capabilities and encouraging user sign-ups.

## Implementation Strategy

### Phase 1: Core Infrastructure
1. **Routing Updates**
   - Update middleware to allow unauthenticated access to root route
   - Implement conditional routing based on authentication status
   - Create marketing layout separate from main application layout

2. **Layout Structure**
   - Create `(marketing)` route group for unauthenticated pages
   - Implement dedicated marketing layout without sidebar/navigation
   - Ensure proper SEO metadata and structured data

### Phase 2: Component Development

#### 2.1 Hero Section
- **Component**: `src/components/marketing/HeroSection.tsx`
- **Features**:
  - Compelling headline: "Master Epic Cinematic Adventures"
  - Subtitle: "The ultimate Feng Shui 2 campaign management platform"
  - Primary CTA: "Start Your Legendary Campaign" (sign-up)
  - Secondary CTA: "Already a Hero? Login"
  - Background with martial arts/action theming

#### 2.2 Feature Showcase
- **Component**: `src/components/marketing/FeatureShowcase.tsx`
- **Key Features to Highlight**:
  - Real-time combat initiative tracking
  - Cross-juncture character development
  - AI-powered character generation
  - Discord integration for remote play
  - Campaign organization tools
  - Collaborative storytelling features

#### 2.3 Screenshot Gallery
- **Component**: `src/components/marketing/ScreenshotGallery.tsx`
- **Image Placeholders**:
  - Campaign dashboard interface
  - Character sheet editor
  - Live combat encounter
  - Character creation flow
- **Implementation**: Styled placeholder divs with aspect ratios and descriptive labels

#### 2.4 Feng Shui 2 Theming Section
- **Component**: `src/components/marketing/JunctureShowcase.tsx`
- **Juncture Highlights**:
  - Ancient China mystical powers
  - Colonial Hong Kong adventures
  - Contemporary action scenes
  - Cyberpunk future battles
- **Visual**: Image placeholders with juncture-specific theming

#### 2.5 Social Proof
- **Component**: `src/components/marketing/TestimonialsSection.tsx`
- **Content**: Placeholder testimonials and community highlights
- **Features**: Rotating testimonials with user avatars

#### 2.6 Call-to-Action
- **Component**: `src/components/marketing/CallToAction.tsx`
- **Final conversion section** with prominent sign-up buttons

### Phase 3: Technical Implementation

#### 3.1 File Structure
```
src/app/
├── (marketing)/
│   ├── layout.tsx          # Marketing-specific layout
│   └── page.tsx            # Landing page composition
├── (main)/                 # Existing authenticated routes
└── middleware.ts           # Updated authentication logic

src/components/marketing/
├── HeroSection.tsx
├── FeatureShowcase.tsx
├── ScreenshotGallery.tsx
├── JunctureShowcase.tsx
├── TestimonialsSection.tsx
└── CallToAction.tsx
```

#### 3.2 Routing Logic
- **Unauthenticated users at `/`**: Show marketing landing page
- **Authenticated users at `/`**: Redirect to `/campaigns` (dashboard)
- **Preserve existing authentication flows**

#### 3.3 SEO Implementation
- Server-side rendering for optimal SEO
- Meta tags optimized for "Feng Shui 2 campaign manager"
- Structured data markup for search engines
- Open Graph and Twitter Card support

### Phase 4: Styling and UX

#### 4.1 Design System Integration
- Use existing Material-UI theme and components
- Implement responsive design with mobile-first approach
- Ensure accessibility compliance (WCAG 2.1)

#### 4.2 Performance Optimization
- Optimize component rendering
- Implement proper image loading strategies
- Target sub-3-second page load times

#### 4.3 Conversion Optimization
- Multiple sign-up touchpoints without being pushy
- Clear visual hierarchy guiding user attention
- Compelling copy that emphasizes cinematic action

## Testing Strategy

### Unit Tests
- Component rendering tests
- Routing logic tests
- Authentication middleware tests

### End-to-End Tests
- Unauthenticated user journey to sign-up
- Authenticated user redirect behavior
- Mobile responsive testing
- Cross-browser compatibility

### Performance Tests
- Page load speed testing
- Mobile performance validation
- SEO metadata verification

## Content Strategy

### Messaging Framework
- **Primary Value Proposition**: "Master Epic Cinematic Adventures"
- **Key Benefits**: Real-time collaboration, cross-time storytelling, AI assistance
- **Feng Shui 2 Focus**: Emphasize cinematic action movie experience

### Call-to-Action Hierarchy
1. **Primary**: "Start Your Legendary Campaign" (sign-up)
2. **Secondary**: "Join the Action" (alternative sign-up)
3. **Tertiary**: "Already a Hero? Login"
4. **Supporting**: "Explore Documentation"

## Success Metrics

### Conversion Goals
- Increased sign-up conversion rate
- Reduced bounce rate on landing page
- Higher user engagement before authentication

### Technical Goals
- Page load time under 3 seconds
- 100% mobile responsive
- Accessibility score 95+
- SEO optimization complete

## Implementation Phases

### Phase 1: Foundation (2-3 hours)
- Routing and middleware updates
- Basic layout structure
- Hero section implementation

### Phase 2: Core Content (3-4 hours)
- Feature showcase component
- Screenshot gallery with placeholders
- Juncture theming section

### Phase 3: Enhancement (2-3 hours)
- Social proof section
- Final CTA section
- Footer integration

### Phase 4: Polish (2-3 hours)
- SEO optimization
- Performance tuning
- Responsive design refinement

### Phase 5: Testing (2-3 hours)
- End-to-end test implementation
- Cross-browser testing
- Performance validation

## Risk Mitigation

### Authentication Conflicts
- Carefully test existing user flows
- Ensure no breaking changes to authenticated users
- Implement fallback routing logic

### SEO Considerations
- Validate structured data markup
- Test server-side rendering
- Ensure proper canonical URLs

### Performance Concerns
- Monitor bundle size impact
- Implement lazy loading where appropriate
- Optimize image placeholders

## Acceptance Criteria

- [ ] Marketing landing page renders at root route for unauthenticated users
- [ ] Authenticated users redirect to dashboard
- [ ] All marketing components display correctly
- [ ] Image placeholders properly positioned and labeled
- [ ] Responsive design works on all screen sizes
- [ ] Sign-up and login CTAs are functional
- [ ] Page loads under 3 seconds
- [ ] SEO metadata optimized
- [ ] End-to-end tests pass
- [ ] No regression in existing functionality