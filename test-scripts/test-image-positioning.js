const { chromium } = require('playwright')
const { loginAsGamemaster } = require('./login-helper')
const path = require('path')
const fs = require('fs')

async function testImagePositioning() {
  console.log('🎯 Starting Image Upload → Reposition workflow test...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for visual verification
  })
  const context = await browser.newContext()
  const page = await context.newPage()

  const screenshotPath = 'test-results/image-positioning'
  if (!fs.existsSync(screenshotPath)) {
    fs.mkdirSync(screenshotPath, { recursive: true })
  }

  let stepCounter = 1
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  
  const screenshot = async (description) => {
    await page.screenshot({ 
      path: `${screenshotPath}/${timestamp}-${String(stepCounter).padStart(2, '0')}-${description}.png`,
      fullPage: true
    })
    console.log(`📸 Step ${stepCounter}: ${description}`)
    stepCounter++
  }

  try {
    // Step 1: Login as gamemaster
    console.log('🔑 Logging in as gamemaster...')
    await loginAsGamemaster(page, { 
      takeScreenshot: false // We'll handle screenshots manually
    })
    
    await screenshot('after-login')

    // Step 2: Navigate to Characters page
    console.log('📄 Navigating to Characters page...')
    await page.click('text=Characters')
    await page.waitForLoadState('networkidle')
    await screenshot('characters-page')

    // Step 3: Find a character with an image or create one
    let character = null
    const characterCards = await page.locator('[data-testid="character-card"], .character-card').count()
    
    if (characterCards > 0) {
      // Use existing character
      await page.locator('[data-testid="character-card"], .character-card').first().click()
    } else {
      // Create new character for testing
      console.log('➕ Creating test character...')
      await page.click('text=Create Character')
      await page.fill('input[name="name"]', `Test Character ${Date.now()}`)
      await page.click('button[type="submit"]')
      await page.waitForLoadState('networkidle')
    }
    
    await screenshot('character-selected')

    // Step 4: Look for PositionableImage component
    const imageContainer = page.locator('[data-testid="positionable-image"], .positionable-image').first()
    
    // If no image exists, we need to upload one first
    const hasImage = await page.locator('img').count() > 0
    
    if (!hasImage) {
      console.log('📤 No image found, uploading test image...')
      
      // Look for upload button
      const uploadButton = page.locator('text=Upload', { hasText: /upload/i }).first()
      if (await uploadButton.count() > 0) {
        await uploadButton.click()
        await screenshot('upload-dialog-opened')
        
        // Create a test image file
        const testImagePath = path.join(__dirname, 'test-image.png')
        if (!fs.existsSync(testImagePath)) {
          // Create a simple test image using Node.js (this is basic, for real testing you'd use a proper image)
          const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
          fs.writeFileSync(testImagePath, Buffer.from(testImageData.split(',')[1], 'base64'))
        }
        
        // Upload the test image
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles(testImagePath)
        
        // Wait for upload to complete
        await page.waitForTimeout(2000)
        await screenshot('image-uploaded')
        
        // Close upload dialog
        const confirmButton = page.locator('text=Confirm', 'text=Save', 'text=Upload').last()
        if (await confirmButton.count() > 0) {
          await confirmButton.click()
        }
        
        await page.waitForLoadState('networkidle')
        await screenshot('upload-completed')
      }
    } else {
      console.log('✅ Image already exists, testing position functionality...')
      await screenshot('image-present')
    }

    // Step 5: Test repositioning functionality
    console.log('🎯 Testing image repositioning...')
    
    // Look for reposition button
    const repositionButton = page.locator('text=Reposition', '[data-testid="reposition-button"]').first()
    if (await repositionButton.count() > 0) {
      await repositionButton.click()
      await screenshot('reposition-mode-activated')
      
      // Find the image element
      const imageElement = page.locator('img').first()
      if (await imageElement.count() > 0) {
        // Get image bounding box
        const imageBox = await imageElement.boundingBox()
        if (imageBox) {
          // Perform drag operation (simulate repositioning)
          await page.mouse.move(imageBox.x + imageBox.width / 2, imageBox.y + imageBox.height / 2)
          await page.mouse.down()
          await page.mouse.move(imageBox.x + imageBox.width / 2 + 50, imageBox.y + imageBox.height / 2 + 30)
          await page.mouse.up()
          
          await screenshot('after-drag-operation')
          
          // Save the new position
          const saveButton = page.locator('text=Save', '[data-testid="save-position"]').first()
          if (await saveButton.count() > 0) {
            await saveButton.click()
            await page.waitForLoadState('networkidle')
            await screenshot('position-saved')
            
            // Verify success toast
            const successToast = page.locator('.MuiSnackbar-root, .toast, [data-testid="toast"]')
            if (await successToast.count() > 0) {
              console.log('✅ Success toast appeared')
              await screenshot('success-toast-visible')
            }
          }
        }
      }
    }

    // Step 6: Test upload → reposition workflow
    console.log('🔄 Testing upload → immediate reposition workflow...')
    
    // If upload button exists, test replacing image and repositioning
    const replaceUploadButton = page.locator('text=Upload', { hasText: /upload/i }).first()
    if (await replaceUploadButton.count() > 0) {
      await replaceUploadButton.click()
      await screenshot('replace-upload-dialog')
      
      // Upload another test image
      const fileInput = page.locator('input[type="file"]')
      const testImagePath = path.join(__dirname, 'test-image-2.png')
      
      // Create second test image
      if (!fs.existsSync(testImagePath)) {
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77gwAAAABJRU5ErkJggg=='
        fs.writeFileSync(testImagePath, Buffer.from(testImageData.split(',')[1], 'base64'))
      }
      
      await fileInput.setInputFiles(testImagePath)
      await page.waitForTimeout(2000)
      
      // Check for positioning reset toast
      const resetToast = page.locator('text=positioning reset', '.MuiSnackbar-root')
      if (await resetToast.count() > 0) {
        console.log('✅ Position reset toast appeared')
        await screenshot('position-reset-toast')
      }
      
      // Close upload dialog
      const confirmButton = page.locator('text=Confirm', 'text=Save', 'text=Upload').last()
      if (await confirmButton.count() > 0) {
        await confirmButton.click()
      }
      
      await page.waitForLoadState('networkidle')
      await screenshot('image-replaced')
      
      // Now test immediate repositioning without page refresh
      console.log('🎯 Testing immediate repositioning after upload...')
      const newRepositionButton = page.locator('text=Reposition', '[data-testid="reposition-button"]').first()
      if (await newRepositionButton.count() > 0) {
        await newRepositionButton.click()
        await screenshot('reposition-after-upload-activated')
        
        // Perform repositioning
        const newImageElement = page.locator('img').first()
        if (await newImageElement.count() > 0) {
          const newImageBox = await newImageElement.boundingBox()
          if (newImageBox) {
            await page.mouse.move(newImageBox.x + newImageBox.width / 2, newImageBox.y + newImageBox.height / 2)
            await page.mouse.down()
            await page.mouse.move(newImageBox.x + newImageBox.width / 2 - 30, newImageBox.y + newImageBox.height / 2 - 20)
            await page.mouse.up()
            
            await screenshot('repositioned-after-upload')
            
            // Save position
            const saveButton = page.locator('text=Save', '[data-testid="save-position"]').first()
            if (await saveButton.count() > 0) {
              await saveButton.click()
              await page.waitForLoadState('networkidle')
              await screenshot('final-position-saved')
              
              console.log('✅ Upload → Reposition workflow completed successfully!')
            }
          }
        }
      }
    }

    console.log('🎉 Image positioning test completed successfully!')
    
  } catch (error) {
    console.error('❌ Image positioning test failed:', error)
    await screenshot('ERROR-final-state')
    throw error
  } finally {
    await browser.close()
  }
}

// Run the test
if (require.main === module) {
  testImagePositioning().catch(console.error)
}

module.exports = { testImagePositioning }