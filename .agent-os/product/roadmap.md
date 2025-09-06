# Product Roadmap

## Phase 0: Already Completed

The following features have been implemented:

- [x] User Authentication & Authorization - Complete JWT-based auth with Devise, role management (admin, gamemaster, player)
- [x] Campaign Management - Full CRUD operations with member invitation system and role-based access control
- [x] Character Creation System - AI-powered generation supporting all character types (PCs, NPCs, bosses, mooks, allies, uber-bosses)
- [x] Basic Combat System - Shot counter initiative tracking with real-time WebSocket updates via Action Cable
- [x] World Building Tools - Sites, factions, parties, and junctures management for campaign organization
- [x] Equipment Management - Schticks (abilities) and weapons with automatic prerequisite validation
- [x] Vehicle Chase Mechanics - Specialized tools for Feng Shui 2's signature chase sequences
- [x] Discord Bot Integration - Basic Discord server connection with automated notifications
- [x] Real-Time Infrastructure - Action Cable WebSocket connections for live campaign updates
- [x] User Onboarding System - Comprehensive new user guidance with progressive milestone tracking
- [x] Campaign Template Seeding - Pre-built campaign structures with seed data for quick setup
- [x] AI Character Image Generation - Automated character portrait creation using AI services
- [x] PDF Character Sheets - Generate printable character sheets for hybrid gameplay
- [x] Notion Integration - Sync character data with external Notion workspaces
- [x] Comprehensive Testing Infrastructure - RSpec (backend), Jest (frontend), Playwright (E2E) with 90%+ coverage
- [x] **Dismissable Onboarding Modules** - User-controlled dismissal of onboarding modules with persistent state and restore functionality `S` - Completed 2025-08-31
- [x] **Character PDF Backup Actions** - Enhanced PDF parsing to extract backup action values from character sheets during import `S` - Completed 2025-08-31
- [x] **Vehicle Chase Defeat Thresholds** - Vehicles show "CRASHED" when defeated after being rammed or "BOXED IN" when defeated without being rammed, with defeat thresholds based on driver type (35 for PC/Featured Foe, 50 for Boss/Uber-Boss) `M` - Completed 2025-09-05
- [x] **Image Viewer Popup System** - Full-screen modal image viewer with click-to-expand functionality for all entity images, supporting multiple dismiss methods and responsive sizing options `S` - Completed 2025-09-05

## Phase 1: Enhanced Encounter Management (CURRENT - 75% Complete)

**Goal:** Complete the encounter management system with full interface for running fights
**Success Criteria:** Seamless combat sessions with <30s turn resolution, player satisfaction >95%

### Features

- [x] **Enhanced Shot Counter Display** - ShotCounter component with character grouping by shot value, wound indicators, and character type distinctions `L` - **COMPLETE**: Core display features already implemented
- [x] **Basic Wound Tracking System** - Health and wound state tracking with visual indicators on character cards `M` - **COMPLETE**: Wounds are displayed and tracked in current UI
- [x] **Boost Actions System** - Tactical team support mechanics allowing characters to enhance allies' attack (+1/+2) or defense (+3/+5) capabilities with 3-shot cost and automatic expiration `M` - **COMPLETE**: Full boost system implemented with Fortune die enhancement, visual indicators, and integration with attack calculations
- [x] **Attack & Damage Resolution Interface** - Complete gamemaster interface for resolving attacks, applying damage, and managing combat actions with manual overrides `XL` - **COMPLETE**: AttackPanel component implemented with comprehensive damage application UI
- [x] **CRITICAL: Impairment Display & Calculation System** - Automatic calculation and prominent display of wound-based combat penalties for all character types with real-time updates `L` - **COMPLETE**: ImpairmentBadge component and calculation system implemented throughout interface with color-coded indicators and automatic value adjustments
- [x] **Character Health & State Management** - Real-time health, wound penalties, and impairment calculation system for all participant types `L` - **COMPLETE**: Comprehensive health tracking with impairment effects calculation
- [ ] **Player Combat Interface** - Dedicated player interface for managing character actions, rolling dice, and tracking personal stats during encounters `L`
- [ ] **Advanced Initiative System** - Enhanced shot management with automatic next-action calculation, sequence transitions, and turn announcements `M` - **PARTIAL**: Basic shot counter exists, needs sequence management
- [ ] **Combat Action Resolution** - Streamlined action declaration, dice rolling, and result application system `L`
- [ ] **Real-Time Encounter Sync** - WebSocket updates for all encounter state changes visible to all participants instantly `M` - **PARTIAL**: Basic ActionCable exists, needs combat-specific events
- [ ] Mobile Interface Optimization - Enhanced responsive design for mobile gameplay `M`
- [ ] Performance Optimization - Database query optimization and caching improvements for real-time updates `L`

### Critical Integration Requirements

The **Boost Actions** and **Impairment Display** systems must integrate with:
- **AttackPanel component** for automatic calculation of final attack/defense values ✓
- **ShotCounter component** for displaying boost and impairment status on character cards ✓
- **Combat API endpoints** for boost application, expiration tracking, and impairment calculations ✓
- **Real-time WebSocket events** for boost status changes and impairment updates
- **Mobile Player Interface** for boost action buttons and impairment indicators
- **Combat Log** for tracking boost actions and impairment changes

### Dependencies

- Existing WebSocket infrastructure via Action Cable ✓
- Character and fight data models ✓
- Real-time update system foundation ✓

**Updated Progress Assessment:**
- **Foundation Complete**: Shot counter, wound display, character type distinctions, grouping by shot, boost actions system ✓
- **Architecture Correct**: PC wounds on Character model, NPC wounds on Shot model - no migration needed ✓
- **Core Components Complete**: AttackPanel, ImpairmentBadge, damage application interface ✓
- **Estimated Completion**: ~90% of core display functionality complete, ~60% of interaction features complete

## Phase 2: Advanced Features & Integration

**Goal:** Expand platform capabilities with advanced AI and comprehensive game management
**Success Criteria:** AI character generation success rate >95%, Discord integration adoption >70%

### Features

- [ ] **Bulk Table Operations** - Multi-select functionality with bulk delete and bulk edit operations across all entity table components (Characters, Vehicles, Schticks, Weapons, Sites, Parties, Factions, Junctures, Users, Campaigns) including checkbox selection, select all/none, confirmation dialogs, and contextual action toolbar `L`
- [ ] Enhanced AI Character Generation - Multi-modal character creation with contextual personality and background generation `XL`
- [ ] Advanced Discord Integration - Automated session management, dice rolling, and encounter status in Discord channels `L`
- [ ] Campaign Analytics - Session tracking, character progression analytics, and campaign health metrics `M`
- [ ] Tactical Combat Features - Battle maps, positioning, and advanced encounter mechanics `L`
- [ ] Export/Import System - Character and campaign data portability with standard formats `M`
- [ ] Collaborative World Building - Multi-user faction and site management with conflict resolution `L`
- [ ] Advanced PDF Generation - Custom character sheet templates and campaign documentation `M`
- [ ] Comprehensive Test Coverage Enhancement - Expanded E2E test suite for all user workflows `L`

### Dependencies

- Phase 1 encounter management completion
- Enhanced AI API integrations
- Discord bot framework expansion

## Phase 3: Enterprise & Scale Features

**Goal:** Support larger communities and professional game management
**Success Criteria:** Support for 100+ concurrent users per campaign, multi-campaign management

### Features

- [ ] Multi-Campaign Management - Cross-campaign character sharing and comprehensive gamemaster dashboard `XL`
- [ ] Advanced User Management - Organization-level user administration and bulk operations `L`
- [ ] Campaign Templates & Marketplace - Community-driven campaign sharing and template ecosystem `XL`
- [ ] Advanced Notion Integration - Bi-directional sync with comprehensive campaign documentation `L`
- [ ] Public API for Third-Party Integration - RESTful API for community tool development and extensions `XL`
- [ ] Enterprise Security Features - SSO, audit logs, advanced permissions, and compliance features `L`
- [ ] Offline Mode Support - Progressive web app with offline encounter management `XL`
- [ ] Advanced Analytics & Reporting - Campaign performance metrics and player engagement analytics `M`

### Dependencies

- Scalable infrastructure architecture
- Advanced caching and database optimization
- Community platform integration