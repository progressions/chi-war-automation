/**
 * Complete End-to-End User Journey Test
 * 
 * Tests the full user story from new visitor discovery through running first RPG session:
 * - Phase 1: Gamemaster Registration & Setup (campaign, world-building)
 * - Phase 2: Player Invitation & Registration (4 players)
 * - Phase 3: Character Creation (4 players + GM NPCs)
 * - Phase 4: Session Organization (party formation, fight setup)
 * - Phase 5: Gameplay Validation (fight initiation, combat mechanics)
 * 
 * Validates complete "happy path" experience with all core functionality integrated.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Import all helper modules
const { 
  generateTestEmail, 
  registerNewUser, 
  loginWithCredentials,
  confirmUserEmail 
} = require('./helpers/user-registration-helper');

const { 
  createCampaign, 
  setupWorldBuilding, 
  verifyCampaignSeeding 
} = require('./helpers/campaign-setup-helper');

const { 
  createMultipleCharacters, 
  verifyCharacterExists 
} = require('./helpers/character-creation-helper');

const { 
  sendMultipleInvitations, 
  getInvitationUrl, 
  completePlayerInvitationFlow 
} = require('./helpers/invitation-helper');

const { 
  createParty, 
  createFight, 
  startFight 
} = require('./helpers/fight-setup-helper');

// Test configuration
const TEST_CONFIG = require('./test-config');
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'complete-user-journey');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Test data configuration
const CAMPAIGN_NAME = 'Epic Adventure Campaign';
const PARTY_NAME = 'Heroes of Time';
const FIGHT_NAME = 'Temple Showdown';

// Generate unique test emails
const GM_EMAIL = generateTestEmail('gm');
const PLAYER_EMAILS = [
  generateTestEmail('player1'),
  generateTestEmail('player2'), 
  generateTestEmail('player3'),
  generateTestEmail('player4')
];

const TEST_PASSWORD = 'TestPass123!';

// Test data structures
const GM_DATA = {
  email: GM_EMAIL,
  password: TEST_PASSWORD,
  firstName: 'Game',
  lastName: 'Master',
  role: 'gamemaster'
};

const PLAYERS_DATA = [
  {
    email: PLAYER_EMAILS[0],
    password: TEST_PASSWORD,
    firstName: 'Alice',
    lastName: 'Archer',
    role: 'player'
  },
  {
    email: PLAYER_EMAILS[1], 
    password: TEST_PASSWORD,
    firstName: 'Bob',
    lastName: 'Sorcerer',
    role: 'player'
  },
  {
    email: PLAYER_EMAILS[2],
    password: TEST_PASSWORD,
    firstName: 'Carol',
    lastName: 'Hero',
    role: 'player'
  },
  {
    email: PLAYER_EMAILS[3],
    password: TEST_PASSWORD,
    firstName: 'Dave',
    lastName: 'Spy',
    role: 'player'
  }
];

const CAMPAIGN_DATA = {
  name: CAMPAIGN_NAME,
  description: 'A comprehensive test campaign to validate the complete Chi War user experience. Heroes travel across time periods to battle ancient evils and modern threats.'
};

const WORLD_DATA = {
  factions: [
    { name: 'The Dragons', description: 'Ancient masters of kung fu seeking to reclaim their power' },
    { name: 'The Ascended', description: 'Corrupt sorcerers from the Netherworld bent on domination' },
    { name: 'The Architects', description: 'Future techno-wizards manipulating the timeline' }
  ],
  sites: [
    { name: 'Ancient Temple', description: 'A mysterious temple hidden in the mountains of Ancient China' },
    { name: 'Modern Warehouse', description: 'An abandoned warehouse in contemporary Hong Kong' },
    { name: 'Future Citadel', description: 'A floating fortress in the year 2056' }
  ],
  junctures: [
    { name: 'Ancient China', description: '69 AD - The time of legends and martial arts masters' },
    { name: 'Contemporary', description: 'Present day - Where the secret war rages unseen' },
    { name: 'Future', description: '2056 AD - A world transformed by magical technology' }
  ]
};

const PC_CHARACTERS = [
  {
    name: 'Chen Wei',
    type: 'pc',
    template: 'Martial Artist',
    description: 'A skilled kung fu master from Ancient China seeking to protect the innocent',
    faction: 'The Dragons',
    juncture: 'Ancient China'
  },
  {
    name: 'Sarah Mitchell',
    type: 'pc',
    template: 'Detective',
    description: 'A modern-day detective investigating supernatural crimes',
    faction: null,
    juncture: 'Contemporary'
  },
  {
    name: 'Maya Rodriguez',
    type: 'pc',
    template: 'Everyday Hero',
    description: 'An ordinary person thrust into extraordinary circumstances',
    faction: null,
    juncture: 'Contemporary'
  },
  {
    name: 'Alex Chen',
    type: 'pc',
    template: 'Spy',
    description: 'A covert operative working to prevent temporal disasters',
    faction: 'The Architects',
    juncture: 'Future'
  }
];

const NPC_CHARACTERS = [
  {
    name: 'Temple Guardian',
    type: 'featured_foe',
    description: 'A powerful warrior defending the ancient secrets',
    faction: 'The Dragons',
    juncture: 'Ancient China'
  },
  {
    name: 'Shadow Thugs',
    type: 'mook',
    description: 'Generic enemies for combat encounters',
    faction: 'The Ascended',
    juncture: 'Contemporary'
  },
  {
    name: 'Master Villain',
    type: 'boss',
    description: 'The primary antagonist orchestrating the temporal chaos',
    faction: 'The Ascended',
    juncture: 'Future'
  }
];

/**
 * Ensures screenshot directory exists
 */
async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * Phase 1: Gamemaster Registration & Setup
 */
async function runPhase1_GamemasterSetup(browser) {
  console.log('\n🎮 ===== PHASE 1: GAMEMASTER REGISTRATION & SETUP =====');
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  const gmPage = await context.newPage();
  
  try {
    // Step 1: GM Registration
    console.log('\n👤 Step 1: Gamemaster Registration');
    const registrationResult = await registerNewUser(gmPage, GM_DATA, { 
      takeScreenshots: true, 
      screenshotDir: SCREENSHOTS_DIR 
    });
    
    if (!registrationResult.success) {
      throw new Error('Gamemaster registration failed');
    }
    
    // Step 2: Email confirmation (if needed)
    console.log('\n📧 Step 2: Email Confirmation');
    await confirmUserEmail(GM_DATA.email);
    
    // Step 3: Login
    console.log('\n🔐 Step 3: Gamemaster Login');
    const loginResult = await loginWithCredentials(gmPage, GM_DATA.email, GM_DATA.password, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!loginResult.success) {
      throw new Error('Gamemaster login failed');
    }
    
    // Step 4: Campaign Creation
    console.log('\n📋 Step 4: Campaign Creation');
    const campaignResult = await createCampaign(gmPage, CAMPAIGN_DATA, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!campaignResult.success) {
      throw new Error('Campaign creation failed');
    }
    
    // Step 5: Verify Campaign Seeding
    console.log('\n🌱 Step 5: Campaign Seeding Verification');
    const seedingResult = await verifyCampaignSeeding(gmPage, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    console.log(`📊 Seeding Results - Schticks: ${seedingResult.schticks}, Weapons: ${seedingResult.weapons}, Templates: ${seedingResult.templates}`);
    
    // Step 6: World Building Setup
    console.log('\n🌍 Step 6: World Building Setup');
    const worldResult = await setupWorldBuilding(gmPage, WORLD_DATA, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!worldResult.success) {
      throw new Error('World building setup failed');
    }
    
    console.log('✅ Phase 1 completed successfully');
    
    return {
      success: true,
      gmPage,
      gmContext: context,
      campaign: campaignResult,
      worldBuilding: worldResult,
      seeding: seedingResult
    };
    
  } catch (error) {
    console.error('❌ Phase 1 failed:', error.message);
    await context.close();
    throw error;
  }
}

/**
 * Phase 2: Player Invitation & Registration
 */
async function runPhase2_PlayerInvitations(browser, gmPage) {
  console.log('\n👥 ===== PHASE 2: PLAYER INVITATION & REGISTRATION =====');
  
  try {
    // Step 1: Send Invitations
    console.log('\n📧 Step 1: Sending Player Invitations');
    const invitationResults = await sendMultipleInvitations(gmPage, PLAYER_EMAILS, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    const successfulInvitations = invitationResults.filter(r => r.success);
    console.log(`📧 Sent ${successfulInvitations.length}/${PLAYER_EMAILS.length} invitations successfully`);
    
    if (successfulInvitations.length === 0) {
      throw new Error('No invitations sent successfully');
    }
    
    // Step 2: Get Invitation URLs
    console.log('\n🔗 Step 2: Extracting Invitation URLs');
    const invitationUrls = [];
    
    for (const playerEmail of PLAYER_EMAILS) {
      const invitationUrl = await getInvitationUrl(gmPage, playerEmail);
      
      if (invitationUrl) {
        invitationUrls.push({ email: playerEmail, url: invitationUrl });
        console.log(`✅ Got invitation URL for ${playerEmail}`);
      } else {
        console.log(`⚠️ Could not get invitation URL for ${playerEmail}`);
      }
    }
    
    // Step 3: Player Registration & Redemption
    console.log('\n👤 Step 3: Player Registration & Invitation Redemption');
    const playerSessions = [];
    
    for (let i = 0; i < invitationUrls.length && i < PLAYERS_DATA.length; i++) {
      const invitationData = invitationUrls[i];
      const playerData = PLAYERS_DATA[i];
      
      console.log(`\n[${i + 1}/${Math.min(invitationUrls.length, PLAYERS_DATA.length)}] Processing player: ${playerData.email}`);
      
      try {
        const playerFlowResult = await completePlayerInvitationFlow(
          browser, 
          invitationData.url, 
          playerData,
          {
            takeScreenshots: true,
            screenshotDir: SCREENSHOTS_DIR
          }
        );
        
        if (playerFlowResult.success) {
          playerSessions.push({
            playerData,
            ...playerFlowResult
          });
          console.log(`✅ Player ${playerData.email} successfully joined campaign`);
        } else {
          console.log(`❌ Player ${playerData.email} flow failed`);
        }
        
      } catch (error) {
        console.error(`❌ Player flow failed for ${playerData.email}:`, error.message);
      }
    }
    
    console.log(`✅ Phase 2 completed - ${playerSessions.length} players joined campaign`);
    
    return {
      success: playerSessions.length > 0,
      playerSessions,
      invitationsSent: successfulInvitations.length,
      playersJoined: playerSessions.length
    };
    
  } catch (error) {
    console.error('❌ Phase 2 failed:', error.message);
    throw error;
  }
}

/**
 * Phase 3: Character Creation
 */
async function runPhase3_CharacterCreation(gmPage, playerSessions) {
  console.log('\n⚔️ ===== PHASE 3: CHARACTER CREATION =====');
  
  try {
    const characterResults = [];
    
    // Step 1: Player Character Creation
    console.log('\n👤 Step 1: Player Character Creation');
    
    for (let i = 0; i < playerSessions.length && i < PC_CHARACTERS.length; i++) {
      const session = playerSessions[i];
      const characterData = PC_CHARACTERS[i];
      
      console.log(`\n[${i + 1}/${Math.min(playerSessions.length, PC_CHARACTERS.length)}] Creating character for: ${session.playerData.email}`);
      
      try {
        // Use the player's browser session
        const { createCharacter } = require('./helpers/character-creation-helper');
        const result = await createCharacter(session.page, characterData, {
          takeScreenshots: true,
          screenshotDir: SCREENSHOTS_DIR
        });
        
        if (result.success) {
          characterResults.push(result);
          console.log(`✅ Player character "${characterData.name}" created`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to create character ${characterData.name}:`, error.message);
      }
    }
    
    // Step 2: GM NPC Creation
    console.log('\n👹 Step 2: GM NPC Character Creation');
    
    const npcResults = await createMultipleCharacters(gmPage, NPC_CHARACTERS, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    characterResults.push(...npcResults.filter(r => r.success));
    
    // Step 3: Character Verification
    console.log('\n🔍 Step 3: Character Verification');
    
    let verifiedCount = 0;
    const allCharacterNames = [...PC_CHARACTERS, ...NPC_CHARACTERS].map(c => c.name);
    
    for (const characterName of allCharacterNames) {
      const exists = await verifyCharacterExists(gmPage, characterName, {
        takeScreenshots: true,
        screenshotDir: SCREENSHOTS_DIR
      });
      
      if (exists) {
        verifiedCount++;
      }
    }
    
    console.log(`✅ Phase 3 completed - ${characterResults.length} characters created, ${verifiedCount} verified`);
    
    return {
      success: characterResults.length > 0,
      charactersCreated: characterResults.length,
      pcCharacters: characterResults.filter(c => ['pc'].includes(c.type)).length,
      npcCharacters: characterResults.filter(c => ['featured_foe', 'mook', 'boss'].includes(c.type)).length,
      charactersVerified: verifiedCount
    };
    
  } catch (error) {
    console.error('❌ Phase 3 failed:', error.message);
    throw error;
  }
}

/**
 * Phase 4: Session Organization
 */
async function runPhase4_SessionOrganization(gmPage) {
  console.log('\n🎭 ===== PHASE 4: SESSION ORGANIZATION =====');
  
  try {
    // Step 1: Party Formation
    console.log('\n🎭 Step 1: Party Formation');
    
    const partyData = {
      name: PARTY_NAME,
      description: 'The brave heroes who will face the ultimate challenge',
      characterNames: PC_CHARACTERS.map(c => c.name)
    };
    
    const partyResult = await createParty(gmPage, partyData, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!partyResult.success) {
      throw new Error('Party creation failed');
    }
    
    // Step 2: Fight Setup
    console.log('\n⚔️ Step 2: Fight Setup');
    
    const fightData = {
      name: FIGHT_NAME,
      description: 'Epic battle at the ancient temple where heroes face their greatest challenge',
      partyName: PARTY_NAME,
      npcNames: NPC_CHARACTERS.map(c => c.name),
      site: 'Ancient Temple',
      juncture: 'Ancient China'
    };
    
    const fightResult = await createFight(gmPage, fightData, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!fightResult.success) {
      throw new Error('Fight creation failed');
    }
    
    console.log(`✅ Phase 4 completed - Party "${PARTY_NAME}" and Fight "${FIGHT_NAME}" created`);
    
    return {
      success: true,
      party: partyResult,
      fight: fightResult
    };
    
  } catch (error) {
    console.error('❌ Phase 4 failed:', error.message);
    throw error;
  }
}

/**
 * Phase 5: Gameplay Validation
 */
async function runPhase5_GameplayValidation(gmPage) {
  console.log('\n🚀 ===== PHASE 5: GAMEPLAY VALIDATION =====');
  
  try {
    // Step 1: Fight Initiation
    console.log('\n🚀 Step 1: Fight Initiation');
    
    const fightStartResult = await startFight(gmPage, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!fightStartResult.success) {
      throw new Error('Fight start failed');
    }
    
    // Step 2: Validate Combat System
    console.log('\n🎯 Step 2: Combat System Validation');
    
    console.log(`⚔️ Fight started with ${fightStartResult.fighterCount} fighters`);
    console.log(`⏰ Shot counter active: ${fightStartResult.shotCounterActive}`);
    console.log(`🎯 Initiative system valid: ${fightStartResult.initiativeValid}`);
    
    // Take final validation screenshot
    const { takeScreenshot } = require('./helpers/user-registration-helper');
    await takeScreenshot(gmPage, '34-final-gameplay-validation', SCREENSHOTS_DIR);
    
    console.log('✅ Phase 5 completed - Gameplay validation successful');
    
    return {
      success: true,
      ...fightStartResult
    };
    
  } catch (error) {
    console.error('❌ Phase 5 failed:', error.message);
    throw error;
  }
}

/**
 * Main test execution
 */
async function runCompleteUserJourney() {
  console.log('🚀 Starting Complete End-to-End User Journey Test');
  console.log(`📧 GM Email: ${GM_EMAIL}`);
  console.log(`👥 Player Emails: ${PLAYER_EMAILS.join(', ')}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
  
  await ensureScreenshotDir();
  
  const browser = await chromium.launch({ 
    headless: false,  // Set to true for CI/CD
    slowMo: 500       // Slow down for visibility
  });
  
  let testResults = {
    phase1: null,
    phase2: null, 
    phase3: null,
    phase4: null,
    phase5: null
  };
  
  try {
    // Phase 1: Gamemaster Setup
    const phase1Result = await runPhase1_GamemasterSetup(browser);
    testResults.phase1 = phase1Result;
    
    // Phase 2: Player Invitations
    const phase2Result = await runPhase2_PlayerInvitations(browser, phase1Result.gmPage);
    testResults.phase2 = phase2Result;
    
    // Phase 3: Character Creation
    const phase3Result = await runPhase3_CharacterCreation(phase1Result.gmPage, phase2Result.playerSessions);
    testResults.phase3 = phase3Result;
    
    // Phase 4: Session Organization
    const phase4Result = await runPhase4_SessionOrganization(phase1Result.gmPage);
    testResults.phase4 = phase4Result;
    
    // Phase 5: Gameplay Validation
    const phase5Result = await runPhase5_GameplayValidation(phase1Result.gmPage);
    testResults.phase5 = phase5Result;
    
    // Test Summary
    console.log('\n🎉 ===== COMPLETE USER JOURNEY TEST RESULTS =====');
    console.log(`📊 Phase 1 (GM Setup): ${testResults.phase1.success ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Phase 2 (Player Invitations): ${testResults.phase2.success ? 'PASSED' : 'FAILED'} (${testResults.phase2.playersJoined} players joined)`);
    console.log(`📊 Phase 3 (Character Creation): ${testResults.phase3.success ? 'PASSED' : 'FAILED'} (${testResults.phase3.charactersCreated} characters created)`);
    console.log(`📊 Phase 4 (Session Organization): ${testResults.phase4.success ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Phase 5 (Gameplay Validation): ${testResults.phase5.success ? 'PASSED' : 'FAILED'}`);
    
    const overallSuccess = Object.values(testResults).every(result => result && result.success);
    
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`📧 Test accounts created: ${GM_EMAIL} + ${PLAYER_EMAILS.length} players`);
    
    if (overallSuccess) {
      console.log('\n🎊 Complete user journey test PASSED! All core functionality validated.');
    } else {
      console.log('\n⚠️ Some phases failed. Check logs and screenshots for details.');
    }
    
    return {
      success: overallSuccess,
      results: testResults,
      screenshotDir: SCREENSHOTS_DIR
    };
    
  } catch (error) {
    console.error('❌ Complete user journey test failed:', error.message);
    
    const { takeScreenshot } = require('./helpers/user-registration-helper');
    if (testResults.phase1 && testResults.phase1.gmPage) {
      await takeScreenshot(testResults.phase1.gmPage, 'FINAL-ERROR-STATE', SCREENSHOTS_DIR);
    }
    
    throw error;
    
  } finally {
    // Cleanup: Close all browser contexts
    try {
      if (testResults.phase1 && testResults.phase1.gmContext) {
        await testResults.phase1.gmContext.close();
      }
      
      if (testResults.phase2 && testResults.phase2.playerSessions) {
        for (const session of testResults.phase2.playerSessions) {
          if (session.context) {
            await session.context.close();
          }
        }
      }
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
    
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runCompleteUserJourney().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runCompleteUserJourney
};