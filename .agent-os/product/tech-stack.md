# Technical Stack

## Application Framework
- **Backend:** Ruby on Rails 8.0
- **Frontend:** Next.js 15.4 with TypeScript

## Database System
- **Primary Database:** PostgreSQL with UUID primary keys
- **Caching Layer:** Redis for session storage and background job queues

## JavaScript Framework
- **Frontend Framework:** React 19 with Next.js App Router
- **State Management:** React Context API with custom hooks
- **Real-time:** Action Cable WebSockets

## Import Strategy
- **Backend:** Ruby gems with Bundler
- **Frontend:** Node.js with npm package management

## CSS Framework
- **UI Framework:** Material-UI v7 (MUI)
- **Styling:** Emotion CSS-in-JS with theme system
- **Responsive Design:** Mobile-first responsive grid system

## UI Component Library
- **Primary:** Material-UI (MUI) components
- **Rich Text:** TipTap editor with mentions
- **Icons:** Material-UI icons
- **Notifications:** Snackbar/Alert components

## Fonts Provider
- **Web Fonts:** Google Fonts integration
- **Icon Fonts:** Material-UI icon library

## Icon Library
- **Primary:** Material-UI Icons
- **Custom:** SVG icons for game-specific elements

## Application Hosting
- **Backend:** Fly.io (Rails application)
- **Frontend:** Vercel or similar Next.js hosting
- **Background Jobs:** Sidekiq with Redis

## Database Hosting
- **Production:** Fly.io PostgreSQL
- **Development:** Local PostgreSQL
- **Test:** Isolated test database

## Asset Hosting
- **Images:** AWS S3 with ImageKit integration
- **Static Assets:** CDN distribution
- **User Uploads:** Secure S3 bucket storage

## Deployment Solution
- **Backend:** Fly.io deployment with Docker
- **Frontend:** Vercel automatic deployments
- **CI/CD:** GitHub Actions integration

## Code Repository URL
- **Root Coordination:** https://github.com/isaacpriestley/chi-war
- **Backend:** Separate private repository (shot-server)
- **Frontend:** Separate private repository (shot-client-next)

## Additional Technologies
- **Authentication:** Devise with JWT tokens
- **Background Processing:** Sidekiq with Redis
- **Real-time Communication:** Action Cable WebSockets
- **External APIs:** Discord API, Notion API, ImageKit
- **Testing:** RSpec (backend), Jest (frontend), Playwright (E2E)
- **AI Integration:** OpenAI API for character generation