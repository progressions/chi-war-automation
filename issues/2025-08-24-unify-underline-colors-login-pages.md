# Unify Underline Colors on Login and Other Pages

**Date**: 2025-08-24  
**Priority**: Low  
**Category**: UI/UX  
**Status**: Open

## Description

The login page and some other pages have inconsistent underline colors for links and form elements. Some have white underlines, others have blue underlines, when they should all match the site's consistent styling.

## Steps to Reproduce
1. Navigate to login page
2. Observe link underline colors
3. Compare with other pages in the application
4. Notice inconsistency between white and blue underlines

## Expected Behavior
- All underlines should use consistent colors that match the site's design system
- Underline colors should be uniform across login page and other pages

## Actual Behavior
- Mixed white and blue underlines creating visual inconsistency
- Login page styling doesn't match rest of site

## Related Files
**Frontend (shot-client-next/):**
- Login page components and styling files
- Global CSS/styling configuration files
- Theme configuration files

## Investigation Notes

**Areas to Check:**
- Login page component styles
- Link component default styling  
- Global CSS variables for underline colors
- Theme configuration for consistent color palette

**Potential Solution:**
- Audit all underline styles across login and related pages
- Update to use consistent color from site's design system
- Ensure hover states also match site standards

## Screenshots
Reference any relevant screenshots from test-results/ directory showing the inconsistent underline colors.

## Related Issues
- General UI/UX consistency improvements