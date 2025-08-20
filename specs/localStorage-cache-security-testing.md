# localStorage Cache Security Fix - Testing Specification

## 🧪 **Testing Strategy for localStorage Cache Fix**

### **1. Manual Multi-User Cache Isolation Test**

**Objective**: Verify different users don't see each other's cached data

**Steps**:
```bash
# Setup: Start both servers
cd shot-server && RAILS_ENV=development rails server -p 3000 &
cd shot-client-next && npm run dev &
```

**Test Scenario A: Sequential User Login**
1. **Login as User A** (e.g., `progressions@gmail.com` - admin/gamemaster)
   - Navigate around the app, let cache populate
   - Verify admin menus are visible ("Users" menu item)
   - Check browser localStorage: `currentUser-{jwt}` should contain User A data

2. **Logout User A**
   - Click logout button
   - Check localStorage: should be cleared of `currentUser-*` entries
   - Check cookies: both `jwtToken` and `userId` should be removed

3. **Login as User B** (e.g., `progressions+david@gmail.com` - regular player)
   - Should NOT see admin menus
   - Check localStorage: `currentUser-{new-jwt}` should contain User B data
   - Check cookies: `userId` should match User B's ID

**Expected Results**:
- ✅ User B never sees User A's admin privileges
- ✅ Navigation menu shows correct user name/avatar
- ✅ Profile page shows User B's information
- ✅ No cache pollution between users

### **2. Browser DevTools Cache Validation Test**

**Objective**: Verify cache validation logic catches mismatches

**Steps**:
1. **Login as User A**, let cache populate
2. **Open DevTools → Application → Local Storage**
3. **Manually corrupt cache**:
   ```javascript
   // In DevTools console:
   // Get current JWT from cookies
   const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
   
   // Corrupt the cached user data
   const fakeUser = {
     id: "wrong-user-id",
     email: "fake@example.com", 
     admin: true,
     gamemaster: true
   }
   localStorage.setItem(`currentUser-${jwt}`, JSON.stringify(fakeUser))
   ```
4. **Refresh page**
5. **Check console logs** for cache mismatch warning

**Expected Results**:
- ✅ Console shows: `"🔧 Cache mismatch detected, clearing user cache"`
- ✅ Corrupted cache is cleared
- ✅ Fresh user data is fetched from API
- ✅ Correct user is displayed

### **3. Cookie/localStorage Cleanup Verification Test**

**Objective**: Confirm comprehensive cleanup prevents pollution

**Steps**:
1. **Login as User A**, navigate to populate cache
2. **Check storage before logout**:
   ```javascript
   // DevTools console
   console.log("Cookies:", document.cookie)
   console.log("LocalStorage keys:", Object.keys(localStorage))
   ```
3. **Perform logout**
4. **Check storage after logout**:
   ```javascript
   // Should show cleared data
   console.log("Cookies after logout:", document.cookie)
   console.log("LocalStorage keys after logout:", Object.keys(localStorage))
   ```

**Expected Results**:
- ✅ `jwtToken` cookie removed
- ✅ `userId` cookie removed  
- ✅ All `currentUser-*` localStorage entries removed
- ✅ All `currentCampaign-*` localStorage entries removed

### **4. User ID Cookie Persistence Test**

**Objective**: Verify userId cookie is properly stored and used

**Steps**:
1. **Login as any user**
2. **Check cookies in DevTools**:
   ```javascript
   // DevTools console
   const jwtToken = document.cookie.split('jwtToken=')[1]?.split(';')[0]
   const userId = document.cookie.split('userId=')[1]?.split(';')[0]
   console.log("JWT Token:", jwtToken)
   console.log("User ID:", userId)
   ```
3. **Verify userId matches current user**:
   - Go to profile page
   - Compare userId cookie with displayed user ID

**Expected Results**:
- ✅ `userId` cookie exists and matches current user ID
- ✅ Cookie has same security settings as JWT (secure, sameSite: 'Lax')
- ✅ Cookie expires in 1 day

### **5. Cache Validation Edge Cases Test**

**Test Case A: Missing userId Cookie**
1. Login normally
2. Manually delete `userId` cookie in DevTools
3. Refresh page
4. **Expected**: App continues to work, fetches fresh data

**Test Case B: Expired JWT with Valid Cache**
1. Login and populate cache
2. Wait for JWT to expire OR manually corrupt JWT
3. Try to use app
4. **Expected**: Authentication error, redirect to login

**Test Case C: Valid JWT with Missing Cache**
1. Login normally
2. Clear localStorage manually
3. Refresh page  
4. **Expected**: Fresh data fetched from API, new cache created

### **6. End-to-End Playwright Test**

Create automated test: `test-scripts/test-localStorage-cache-security.js`

```javascript
async function testCacheSecurityFix() {
  // Test 1: User isolation
  await loginAsUser(page, "admin@example.com")
  await expect(page.locator('a[href="/users"]')).toBeVisible()
  await logout(page)
  
  await loginAsUser(page, "player@example.com") 
  await expect(page.locator('a[href="/users"]')).not.toBeVisible()
  
  // Test 2: Cache validation
  await page.evaluate(() => {
    const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
    localStorage.setItem(`currentUser-${jwt}`, JSON.stringify({
      id: "fake-user-id", admin: true
    }))
  })
  
  await page.reload()
  
  // Should show cache mismatch warning and correct user
  const consoleMessages = await page.evaluate(() => 
    localStorage.getItem('test-console-logs')
  )
  expect(consoleMessages).toContain('Cache mismatch detected')
}
```

### **7. Performance Impact Test**

**Objective**: Ensure security fixes don't degrade performance

**Steps**:
1. **Measure page load times** before/after fix
2. **Monitor API calls** - cache hits should reduce `/api/v2/users/current` calls
3. **Test with large localStorage** - ensure cleanup doesn't freeze browser

**Expected Results**:
- ✅ Page load time impact < 100ms
- ✅ Successful cache hits reduce API calls
- ✅ No browser freezing during cleanup

### **8. Security Validation Checklist**

**Critical Security Checks**:
- [ ] Regular player never sees admin menus
- [ ] Cache pollution eliminated between users  
- [ ] Privilege escalation through UI prevented
- [ ] User context consistent across all components
- [ ] Clean logout prevents data leakage
- [ ] Cache validation prevents wrong user display
- [ ] No sensitive data exposed in localStorage

### **9. Cross-Browser Compatibility Test**

**Test on**:
- Chrome/Chromium
- Firefox  
- Safari (if on macOS)
- Mobile browsers

**Focus Areas**:
- Cookie handling consistency
- localStorage behavior
- Console logging visibility

---

## 🎯 **Success Criteria Summary**

The fix is **successful** if:

1. **Zero instances** of wrong user displayed in navigation
2. **Clean user transitions** without cache pollution
3. **Proper privilege isolation** - players don't see admin menus
4. **Console warnings** appear and resolve cache mismatches
5. **Complete cleanup** on logout prevents data leakage
6. **Performance maintained** - no significant slowdown

The most critical test is the **multi-user scenario** where you login as different users sequentially and verify no admin privileges leak to regular players.

## Test Execution Log

### Test Run 1: [Date]
**Tester**: [Name]
**Environment**: [Development/Staging]

#### Test 1: Multi-User Cache Isolation
- [ ] User A login and admin menu visibility
- [ ] User A logout and storage cleanup
- [ ] User B login and privilege isolation
- [ ] No cache pollution detected

#### Test 2: Cache Validation
- [ ] Cache corruption detected
- [ ] Console warning logged
- [ ] Fresh data fetched
- [ ] Correct user displayed

#### Test 3: Cookie/localStorage Cleanup
- [ ] Pre-logout storage populated
- [ ] Post-logout storage cleared
- [ ] Both cookies removed

#### Test 4: User ID Cookie Persistence
- [ ] userId cookie created
- [ ] Cookie matches current user
- [ ] Security settings correct

#### Test 5: Edge Cases
- [ ] Missing userId cookie handled
- [ ] Expired JWT handled
- [ ] Missing cache handled

#### Test 6: E2E Playwright Test
- [ ] Automated test passes
- [ ] User isolation verified
- [ ] Cache validation working

#### Test 7: Performance
- [ ] Load time acceptable
- [ ] API calls reduced
- [ ] No browser freezing

#### Test 8: Security Checklist
- [ ] Admin menus properly restricted
- [ ] Cache pollution eliminated
- [ ] Privilege escalation prevented
- [ ] Context consistency maintained
- [ ] Logout cleanup complete
- [ ] Cache validation active
- [ ] No sensitive data exposure

#### Test 9: Cross-Browser
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

**Overall Result**: ✅ PASS / ❌ FAIL
**Notes**: [Any issues or observations]