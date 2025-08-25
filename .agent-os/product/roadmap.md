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

## Phase 1: Enhanced Encounter Management (CURRENT)

**Goal:** Complete the encounter management system with full interface for running fights
**Success Criteria:** Seamless combat sessions with <30s turn resolution, player satisfaction >95%

### Features

- [x] **Dismissable Onboarding Modules** - Add dismiss buttons to each module of the onboarding system for improved user control `S`
- [ ] **Full Encounter Interface** - Complete gamemaster interface to manage and run fights with drag-and-drop initiative management `XL`
- [ ] **Character Health & State Tracking** - Real-time health, wound penalties, and status effect management for all participants `L`
- [ ] **Player Combat Interface** - Dedicated player interface for managing character actions, rolling dice, and tracking personal stats during encounters `L`
- [ ] **Advanced Initiative System** - Enhanced shot counter with automatic next-action calculation and turn announcements `M`
- [ ] **Combat Action Resolution** - Streamlined action declaration, dice rolling, and result application system `L`
- [ ] **Real-Time Encounter Sync** - WebSocket updates for all encounter state changes visible to all participants instantly `M`
- [ ] Mobile Interface Optimization - Enhanced responsive design for mobile gameplay `M`
- [ ] Performance Optimization - Database query optimization and caching improvements for real-time updates `L`

### Dependencies

- Existing WebSocket infrastructure via Action Cable
- Character and fight data models
- Real-time update system foundation

## Phase 2: Advanced Features & Integration

**Goal:** Expand platform capabilities with advanced AI and comprehensive game management
**Success Criteria:** AI character generation success rate >95%, Discord integration adoption >70%

### Features

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