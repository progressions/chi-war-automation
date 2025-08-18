import { chromium } from 'playwright'
import { loginAsGamemaster } from './login-helper.js'

async function testJWTFix() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    console.log('Testing JWT Authentication Fix...')
    
    // Track network requests to capture JWT token
    let jwtTokenFound = false
    let loginResponse = null

    page.on('response', async (response) => {
      if (response.url().includes('/users/sign_in')) {
        loginResponse = response
        const authHeader = response.headers()['authorization']
        if (authHeader && authHeader.startsWith('Bearer ')) {
          jwtTokenFound = true
          console.log('✅ JWT token found in Authorization header:', authHeader.substring(0, 30) + '...')
        } else {
          console.log('❌ No JWT token in Authorization header')
          console.log('Response headers:', response.headers())
        }
      }
    })

    // Use the login helper to perform login
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-scripts/test-results' 
    })
    
    // Check if JWT token is stored in cookies
    const cookies = await page.context().cookies()
    const jwtCookie = cookies.find(cookie => cookie.name === 'jwtToken')
    
    if (jwtCookie && jwtCookie.value) {
      console.log('✅ JWT token stored in cookies:', jwtCookie.value.substring(0, 30) + '...')
    } else {
      console.log('❌ JWT token not found in cookies')
      console.log('Available cookies:', cookies.map(c => c.name))
    }

    // Check if login response was successful
    if (loginResponse) {
      console.log('Login response status:', loginResponse.status())
      if (loginResponse.ok()) {
        const responseText = await loginResponse.text()
        console.log('Login response preview:', responseText.substring(0, 200) + '...')
      }
    }

    // Check final page state
    const currentUrl = page.url()
    console.log('Current URL after login:', currentUrl)
    
    // Test if we can make authenticated API calls by checking user data
    const userDataResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/v2/users/current', {
          credentials: 'include'
        })
        return {
          ok: response.ok,
          status: response.status,
          hasData: !!response.headers.get('content-type')?.includes('json')
        }
      } catch (error) {
        return { error: error.message }
      }
    })
    
    console.log('API call test result:', userDataResponse)

    console.log('\n=== Test Summary ===')
    console.log('- JWT token in response header:', jwtTokenFound ? '✅' : '❌')
    console.log('- JWT token stored in cookies:', jwtCookie ? '✅' : '❌')
    console.log('- Login successful (not on login page):', !currentUrl.includes('/login') ? '✅' : '❌')
    console.log('- API authentication working:', userDataResponse.ok ? '✅' : '❌')

    const allTestsPassed = jwtTokenFound && jwtCookie && !currentUrl.includes('/login') && userDataResponse.ok
    console.log('\n🎯 Overall result:', allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED')

  } catch (error) {
    console.error('Test failed:', error)
    await page.screenshot({ 
      path: 'test-scripts/test-results/jwt-fix-test-error.png',
      fullPage: true 
    })
  } finally {
    await browser.close()
  }
}

testJWTFix().catch(console.error)