# Marketing Page Improvement Tasks

**Spec**: Marketing Page Audit & Image Generation
**Date**: 2025-01-28
**Priority**: High
**Estimated Duration**: 4-6 days

## Phase 1: Critical Fixes & Infrastructure (Day 1)

### 1. Fix Text Visibility Issues
- [ ] Review ScreenshotGallery component for grey[50] background contrast
- [ ] Test all text elements with Chrome DevTools contrast checker
- [ ] Add text shadows or adjust colors where WCAG AA standards not met
- [ ] Verify all overlays provide sufficient contrast (minimum 4.5:1 ratio)

### 2. Set Up Image Infrastructure
- [ ] Create directory structure: `public/images/marketing/`
- [ ] Create subdirectories: `heroes/`, `screenshots/`, `junctures/`, `assets/`
- [ ] Set up Next.js Image component imports in marketing components
- [ ] Create image loading utility with fallback support
- [ ] Implement blur placeholder data URIs for images

### 3. Create Image Fallback System
- [ ] Design fallback placeholder components for each image type
- [ ] Implement error boundaries for image loading failures
- [ ] Add loading skeletons matching image dimensions
- [ ] Create retry mechanism for failed image loads

## Phase 2: Image Generation (Days 2-3)

### 4. Generate Hero Section Images
- [ ] Create hero background prompt using template
- [ ] Generate hero-background.jpg (1920x1080 minimum)
- [ ] Create 3-4 variations for A/B testing
- [ ] Optimize images to WebP format with JPG fallback
- [ ] Test overlay compatibility (rgba(0,0,0,0.3))

### 5. Create Screenshot Images
- [ ] **Campaign Dashboard** (hero-dashboard.png)
  - [ ] Capture or mockup actual dashboard UI
  - [ ] Include campaign banner, character cards, fight modules
  - [ ] Ensure dark theme with #ff8f00 accents visible
  - [ ] Export at 1920x1080
  
- [ ] **Character Sheet** (character-sheet-demo.png)
  - [ ] Show complete character detail page
  - [ ] Include action values, schticks, weapons sections
  - [ ] Display character portrait area
  - [ ] Highlight cinematic UI elements
  
- [ ] **Combat Encounter** (combat-encounter.png)
  - [ ] Create active fight scene mockup
  - [ ] Show shot counter and initiative order
  - [ ] Include multiple participants
  - [ ] Display wounds and action UI
  
- [ ] **AI Generation** (character-creation.png)
  - [ ] Mock up generation form interface
  - [ ] Show AI backstory suggestion
  - [ ] Include template selection
  - [ ] Display image generation preview

### 6. Generate Juncture Showcase Images
- [ ] **Ancient China** (ancient-martial-arts.jpg)
  - [ ] Create mystical temple scene
  - [ ] Include kung fu masters and dragons
  - [ ] Use golden/bronze color palette
  - [ ] Add atmospheric fog effects
  
- [ ] **Colonial Hong Kong** (colonial-hongkong.jpg)
  - [ ] Design Victorian-era harbor scene
  - [ ] Mix Eastern and Western elements
  - [ ] Use green/brown earthy tones
  - [ ] Include period-appropriate details
  
- [ ] **Contemporary** (contemporary-action.jpg)
  - [ ] Create modern Hong Kong skyline
  - [ ] Add neon lights and urban elements
  - [ ] Use blue/teal color scheme
  - [ ] Include action scene elements
  
- [ ] **Future 2056** (cyberpunk-future.jpg)
  - [ ] Design dystopian megacity
  - [ ] Add holographic elements
  - [ ] Use purple/pink neon palette
  - [ ] Blend high-tech with mystical

### 7. Create Brand Assets
- [ ] Design Chi War logo (chi-war-logo.svg)
- [ ] Create logo variations (light/dark/monochrome)
- [ ] Export in multiple formats (SVG, PNG, WebP)
- [ ] Create favicon versions
- [ ] Design optional custom feature icons

## Phase 3: Implementation (Day 4)

### 8. Update Hero Section Component
- [ ] Replace gradient-only background with image
- [ ] Implement Next.js Image component
- [ ] Add proper alt text
- [ ] Test text visibility over image
- [ ] Implement responsive sizing

### 9. Update Screenshot Gallery
- [ ] Replace all placeholder boxes with actual images
- [ ] Implement image lazy loading for performance
- [ ] Add hover effects and interactions
- [ ] Create modal/lightbox for full-size viewing
- [ ] Add captions and feature highlights

### 10. Update Juncture Showcase
- [ ] Replace gradient placeholders with images
- [ ] Ensure text overlays remain readable
- [ ] Add parallax scrolling effects (optional)
- [ ] Implement responsive image sizing
- [ ] Test on mobile devices

### 11. Optimize CallToAction Section
- [ ] Verify background gradients work with content
- [ ] Test all button hover states
- [ ] Ensure CTAs are prominent and accessible
- [ ] Add micro-animations for engagement

## Phase 4: Optimization & Testing (Day 5)

### 12. Image Optimization
- [ ] Convert all images to WebP with fallbacks
- [ ] Create responsive image sizes (mobile/tablet/desktop)
- [ ] Implement lazy loading below the fold
- [ ] Add blur-up placeholders using plaiceholder
- [ ] Compress images without quality loss

### 13. Performance Testing
- [ ] Run Lighthouse performance audit
- [ ] Ensure page load under 3 seconds on 3G
- [ ] Test Cumulative Layout Shift (CLS < 0.1)
- [ ] Verify First Contentful Paint (FCP < 1.8s)
- [ ] Check Total Blocking Time (TBT < 300ms)

### 14. Accessibility Testing
- [ ] Verify all images have descriptive alt text
- [ ] Test with screen readers (NVDA/JAWS)
- [ ] Check keyboard navigation works
- [ ] Validate WCAG AA color contrast (4.5:1)
- [ ] Test with browser zoom at 200%

### 15. Cross-Browser Testing
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Verify mobile browsers (iOS Safari, Chrome Android)

## Phase 5: Deployment & Monitoring (Day 6)

### 16. Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run full regression test suite
- [ ] Get stakeholder approval
- [ ] Document any issues found
- [ ] Create rollback plan

### 17. Production Deployment
- [ ] Deploy during low-traffic window
- [ ] Monitor error rates post-deployment
- [ ] Check image CDN performance
- [ ] Verify analytics tracking works
- [ ] Monitor Core Web Vitals

### 18. Post-Launch Tasks
- [ ] Set up A/B testing for hero images
- [ ] Configure image CDN caching rules
- [ ] Document image generation process
- [ ] Create image update workflow
- [ ] Schedule follow-up optimization review

## Acceptance Criteria

- [ ] All placeholder images replaced with real images
- [ ] No text visibility issues (WCAG AA compliant)
- [ ] Page loads in under 3 seconds on 3G
- [ ] Lighthouse performance score > 90
- [ ] All images have proper alt text
- [ ] Mobile responsive design works perfectly
- [ ] Zero console errors in production
- [ ] Positive stakeholder feedback

## Dependencies

- Access to AI image generation tools (Midjourney/DALL-E)
- Design team approval for brand assets
- Staging environment for testing
- CDN configuration for image delivery
- Analytics setup for conversion tracking

## Risk Mitigation

1. **Image Generation Delays**: Have backup stock images ready
2. **Performance Issues**: Implement progressive enhancement
3. **Browser Compatibility**: Use feature detection and polyfills
4. **CDN Failures**: Implement fallback to local hosting
5. **Accessibility Issues**: Schedule accessibility audit pre-launch

## Success Metrics

- 20% increase in landing page conversion rate
- 15% decrease in bounce rate
- 95+ Lighthouse performance score
- Zero accessibility violations
- Positive user feedback score > 4.5/5

## Notes

- Prioritize mobile experience (60% of traffic)
- Consider seasonal themes for juncture images
- Plan for future localization of images
- Document all AI prompts for consistency
- Create style guide for future images