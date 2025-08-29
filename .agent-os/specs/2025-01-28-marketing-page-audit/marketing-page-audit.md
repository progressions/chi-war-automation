# Marketing Page Audit & Image Generation Spec

**Date**: 2025-01-28
**Author**: Claude
**Status**: In Progress
**Type**: UI/UX Audit & Asset Generation

## Executive Summary

This document audits the Chi War marketing landing page for text visibility issues and catalogs all required images for a professional marketing presentation. The landing page currently uses placeholder elements and needs proper imagery to convey the cinematic action RPG experience.

## 1. Text Visibility Issues

### 1.1 Potential Problem Areas

After reviewing the marketing page components, I found the following text visibility concerns:

#### ScreenshotGallery Component (`src/components/marketing/ScreenshotGallery.tsx`)
- **Issue**: Component uses `grey[50]` background with potential white text overlay areas
- **Location**: Lines 22-23 - `backgroundColor: theme.palette.grey[50]`
- **Risk**: Medium - The grey background might not provide enough contrast with white text
- **Recommendation**: Ensure all text uses dark colors (`text.primary` or `text.secondary`) on light backgrounds

#### JunctureShowcase Component 
- **Issue**: Uses gradient overlays with white text that may have insufficient contrast
- **Location**: Lines 172-179 - White text over gradient backgrounds
- **Risk**: Low-Medium - Text has shadows and overlays but should be tested for accessibility

### 1.2 Verified Safe Areas

The following components have proper text contrast:
- **HeroSection**: Uses text shadows and dark overlay (rgba(0,0,0,0.3)) ensuring white text visibility
- **FeatureShowcase**: Uses proper theme colors with good contrast
- **TestimonialsSection**: Uses standard Material-UI theming with proper contrast
- **CallToAction**: Has dark overlays and text shadows for white text visibility

## 2. Required Images Inventory

### 2.1 Hero Section Background
**Location**: `HeroSection.tsx`
**Current State**: Gradient background only
**Required Image**: 
- **Filename**: `hero-background.jpg`
- **Dimensions**: 1920x1080 (minimum)
- **Description**: Cinematic action scene showing multiple time periods blending together - ancient warriors, modern fighters, cyber-enhanced characters in dynamic combat
- **Style**: Dark, moody, with motion blur suggesting action
- **Overlay**: Should work with rgba(0,0,0,0.3) overlay

### 2.2 Screenshot Gallery (4 images needed)

#### 2.2.1 Campaign Dashboard
- **Filename**: `hero-dashboard.png`
- **Dimensions**: 1920x1080
- **Content**: 
  - Show the actual Chi War campaign dashboard
  - Include active campaign banner
  - Display character cards, fight modules, party information
  - Dark theme with orange accents (#ff8f00 primary color)

#### 2.2.2 Character Sheet Interface
- **Filename**: `character-sheet-demo.png`
- **Dimensions**: 1920x1080
- **Content**:
  - Full character detail page
  - Show action values, schticks, weapons
  - Include character portrait and stats
  - Display the cinematic character visualization

#### 2.2.3 Live Combat Session
- **Filename**: `combat-encounter.png`
- **Dimensions**: 1920x1080
- **Content**:
  - Active fight screen with shot counter
  - Multiple characters in initiative order
  - Show wounds, conditions, and actions
  - Real-time combat UI elements

#### 2.2.4 AI Character Generation
- **Filename**: `character-creation.png`
- **Dimensions**: 1920x1080
- **Content**:
  - Character generation form
  - AI-suggested backstory visible
  - Template selection interface
  - Image generation preview

### 2.3 Juncture Showcase Images (4 images needed)

#### 2.3.1 Ancient China (Tang Dynasty - 690 AD)
- **Filename**: `ancient-martial-arts.jpg`
- **Dimensions**: 1920x1080 (16:9 aspect ratio)
- **Content**:
  - Tang Dynasty palace or temple scene during Wu Zetian's reign
  - Kung fu masters in Tang-era robes and armor
  - Dragons or mystical creatures in background
  - Golden/bronze color palette with imperial touches
  - Atmospheric fog and Tang Dynasty architecture

#### 2.3.2 Colonial Hong Kong
- **Filename**: `colonial-hongkong.jpg`
- **Dimensions**: 1920x1080 (16:9 aspect ratio)
- **Content**:
  - Victorian-era Hong Kong harbor
  - Mix of Chinese junks and British ships
  - Gas-lit streets with both Eastern and Western architecture
  - Green/brown earthy palette
  - Period-appropriate clothing and technology

#### 2.3.3 Modern
- **Filename**: `modern-action.jpg`
- **Dimensions**: 1920x1080 (16:9 aspect ratio)
- **Content**:
  - Modern Hong Kong skyline at night
  - Neon lights, high-rises, busy streets
  - Cars, motorcycles in motion
  - Blue/teal modern palette
  - Urban action scene elements

#### 2.3.4 Future (2056) - The Jammers Era
- **Filename**: `cyberpunk-future.jpg`
- **Dimensions**: 1920x1080 (16:9 aspect ratio)
- **Content**:
  - Post-apocalyptic cityscape with destroyed buildings
  - Genetically-enhanced cyber-apes of the New Simian Army
  - Human rebels (The Jammers) with makeshift weapons
  - Neon purple/pink palette mixed with destruction
  - Cyber-simian technology meets revolutionary warfare

### 2.4 Additional Visual Assets

#### Logo/Brand Mark
- **Filename**: `chi-war-logo.svg`
- **Dimensions**: Scalable vector
- **Content**: Chi War brand logo combining martial arts and cinematic elements

#### Feature Icons (Optional Enhancement)
- Current state uses Material-UI icons which are sufficient
- Could create custom illustrated icons for each feature if desired

## 3. Image Generation Recommendations

### 3.1 AI Generation Tools
Recommended tools for generating these images:
- **Midjourney**: Best for cinematic, atmospheric scenes
- **DALL-E 3**: Good for specific UI screenshots mockups
- **Stable Diffusion**: Alternative for customizable generation

### 3.2 Prompt Templates

#### Hero Background Prompt:
```
"Cinematic widescreen action scene blending four time periods: ancient Chinese warriors with glowing chi energy, Victorian-era fighters with steam weapons, modern special forces, and cyberpunk enhanced soldiers, all converging in dynamic combat, dramatic lighting, motion blur, dark moody atmosphere, professional movie poster quality --ar 16:9"
```

#### Ancient Juncture Prompt:
```
"Tang Dynasty palace courtyard 690 AD, Wu Zetian era, kung fu masters in ornate Tang armor and robes, imperial architecture with curved roofs, golden dawn light, dragons silhouetted in clouds, mystical atmosphere, cinematic lighting, photorealistic digital art --ar 16:9"
```

### 3.3 Screenshot Generation Strategy
For UI screenshots, consider:
1. Use actual application screenshots if available
2. Create mockups in Figma/Sketch matching the actual UI
3. Ensure consistent dark theme with #ff8f00 (orange) accents
4. Include realistic data (character names, stats, etc.)

## 4. Implementation Priority

### Phase 1 - Critical (Immediate)
1. Fix any white-on-white text issues in ScreenshotGallery
2. Generate hero background image
3. Create at least 2 screenshot images (Dashboard & Combat)

### Phase 2 - Important (Week 1)
1. Generate all 4 juncture images
2. Complete remaining screenshot images
3. Implement proper image loading with fallbacks

### Phase 3 - Enhancement (Week 2)
1. Add image optimization (WebP format, responsive sizes)
2. Implement lazy loading for performance
3. Add subtle animations/parallax effects
4. Create additional marketing materials

## 5. Technical Implementation

### 5.1 Image Storage
- Store in `public/images/marketing/` directory
- Use Next.js Image component for optimization
- Implement proper alt text for accessibility

### 5.2 Code Updates Required
```typescript
// Example update for ScreenshotGallery.tsx
import Image from 'next/image'

// Replace placeholder with:
<Box position="relative" sx={{ aspectRatio: '16/9' }}>
  <Image
    src={`/images/marketing/${screenshot.filename}`}
    alt={screenshot.title}
    fill
    style={{ objectFit: 'cover' }}
    priority={index < 2}
  />
</Box>
```

### 5.3 Performance Considerations
- Use WebP format with JPG fallback
- Implement responsive image sizes
- Lazy load images below the fold
- Consider using blur placeholders

## 6. Accessibility Requirements

### 6.1 Text Contrast
- Ensure all text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Test with Chrome DevTools contrast checker
- Add text shadows or overlays where needed

### 6.2 Alt Text
All images must have descriptive alt text that conveys:
- The content of the image
- The purpose in context
- Any text visible in the image

## 7. Testing Checklist

- [ ] All text is readable on all backgrounds
- [ ] Images load correctly on slow connections
- [ ] Fallback content displays if images fail
- [ ] Page performance score remains above 90
- [ ] Mobile responsive design works with images
- [ ] Alt text is meaningful and descriptive
- [ ] Color contrast meets WCAG AA standards

## 8. Estimated Timeline

- **Audit Completion**: Done
- **Image Generation**: 2-3 days
- **Implementation**: 1-2 days
- **Testing & Optimization**: 1 day
- **Total**: 4-6 days

## 9. Success Metrics

- No text visibility issues reported
- Page load time under 3 seconds
- All placeholders replaced with actual images
- Positive user feedback on visual appeal
- Increased conversion rate on landing page

## Next Steps

1. Review and approve image descriptions
2. Begin image generation process
3. Fix identified text contrast issues
4. Implement image loading infrastructure
5. Deploy and test on staging environment