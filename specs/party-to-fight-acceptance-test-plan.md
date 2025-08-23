# Party-to-Fight Feature - Acceptance Test Plan

**Date**: 2025-08-23  
**Status**: Planning  
**Component**: End-to-End Testing

## Test Objective

Verify that a gamemaster can successfully add an entire party (with all characters and vehicles) to a fight through the UI, with proper feedback and UI updates.

## Test Requirements

### Prerequisites
1. **User Account**: Gamemaster credentials (`progressions@gmail.com` / `password`)
2. **Test Data**: "The Heroes" party must exist with:
   - 4 Characters: Captain Strongarm, Shadow Ninja, Lucky Luke, Doctor Wisdom
   - 1 Vehicle: The Hero Mobile
3. **Fight**: Must create or have an existing fight (not in seed data)

## Test Steps

### 1. Login as Gamemaster
```javascript
await loginAsGamemaster(page, { 
  takeScreenshot: true, 
  screenshotPath: 'test-results' 
});
```

### 2. Navigate to Fight Page
- **Option A**: Create new fight via UI first
- **Option B**: Use existing fight if available
- Navigate directly to: `/campaigns/[campaignId]/fights/[fightId]`

### 3. Select Party from Dropdown
- Locate the Parties dropdown/autocomplete component
- Click to open dropdown
- Type "The Heroes" to filter options
- Select "The Heroes" from the dropdown list

### 4. Click Add Button
- Locate "Add Party to Fight" button
- Verify button is enabled (not disabled)
- Click the button
- Button should show loading state during API call

### 5. Verify Toast Notification
- **Expected Message**: "Party added successfully"
- **Toast Type**: Success (green)
- **Location**: Top of page
- **Selector Options**:
  - `text=Party added successfully`
  - `[role="alert"]:has-text("Party added successfully")`

### 6. Verify UI Updates
- **Characters List** should now include:
  - Captain Strongarm
  - Shadow Ninja
  - Lucky Luke
  - Doctor Wisdom
- **Vehicles List** should now include:
  - The Hero Mobile
- Verify no page refresh occurred (real-time update)

## Implementation Code Pattern

```javascript
// test-party-to-fight.js
const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');
const TEST_CONFIG = require('./test-config');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Step 1: Login
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Step 2: Create or navigate to fight
    // [Implementation depends on whether fight exists]
    
    // Step 3: Select party from dropdown
    const partyDropdown = page.getByRole('combobox', { name: 'Parties' });
    await partyDropdown.click();
    await page.waitForTimeout(500);
    await partyDropdown.type('The Heroes');
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'The Heroes' }).click();
    
    // Step 4: Click Add button
    await page.getByRole('button', { name: 'Add Party to Fight' }).click();
    
    // Step 5: Verify toast
    await page.waitForSelector('text=Party added successfully', { timeout: 10000 });
    
    // Step 6: Verify characters added
    const characterNames = ['Captain Strongarm', 'Shadow Ninja', 'Lucky Luke', 'Doctor Wisdom'];
    for (const name of characterNames) {
      await page.waitForSelector(`text=${name}`, { timeout: 5000 });
    }
    
    // Verify vehicle added
    await page.waitForSelector('text=The Hero Mobile', { timeout: 5000 });
    
    console.log('✅ Party-to-fight test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: `test-results/error-party-to-fight-${Date.now()}.png`,
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
})();
```

## Expected Selectors

Based on existing test patterns:

| Element | Selector Options |
|---------|-----------------|
| Party Dropdown | `input[role="combobox"]`, `getByRole('combobox', { name: 'Parties' })` |
| Dropdown Options | `[role="option"]`, `getByRole('option', { name: 'The Heroes' })` |
| Add Button | `getByRole('button', { name: 'Add Party to Fight' })` |
| Toast Message | `[role="alert"]`, `.MuiAlert-root`, `text=Party added successfully` |
| Character Names | `text=[character name]` for each character |
| Vehicle Name | `text=The Hero Mobile` |

## Waiting Strategies

Following established patterns:
- `waitForLoadState('networkidle')` - After page navigation
- `waitForSelector(..., { timeout: 10000 })` - For critical elements
- `waitForTimeout(500)` - For dropdown interactions
- `waitForURL()` - After navigation actions

## Error Handling

1. Take screenshot on any failure
2. Use descriptive error messages
3. Include timestamp in error screenshots
4. Log each major step for debugging

## Success Criteria

✅ All test steps complete without errors  
✅ Toast message appears with correct text  
✅ All 4 party characters appear in fight  
✅ Party vehicle appears in fight  
✅ No page refresh required  
✅ UI updates happen in real-time  

## Edge Cases to Consider

1. **Empty Party**: What happens if party has no members?
2. **Duplicate Addition**: Can same party be added twice?
3. **Large Party**: Performance with 20+ members
4. **Network Failure**: Error handling for API failures
5. **Authorization**: Non-gamemaster users should not see option

## Notes

- This test follows patterns established in existing tests like `test-fight-creation.js` and `test-campaign-activation.js`
- Uses standard authentication from `login-helper.js`
- Follows Material-UI selector patterns from existing tests
- Screenshots at each major step for debugging