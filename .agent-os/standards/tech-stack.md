# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

- App Framework: Ruby on Rails 8.0+ API
- Language: Ruby 3.2.2
- Primary Database: PostgreSQL
- ORM: Active Record
- JavaScript Framework: Next.js 15+ with React 19+
- Build Tool: npm
- Import Strategy: Node.js modules
- Package Manager: npm
- Node Version: 22 LTS
- CSS Framework: Material-UI v7 + SCSS modules
- UI Components: Material-UI components with custom theme
- Authentication: Devise + JWT tokens
- Font Provider: Google Fonts
- Font Loading: Self-hosted for performance
- Icons: Material UI Icons + React Icons
- Background Jobs: Sidekiq + Redis
- Real-time: Rails ActionCable WebSocket
- Application Hosting: Fly.io
- Hosting Region: Primary region based on user base
- Database Hosting: Fly.io
- Database Backups: Daily automated
- Asset Storage: ImageKit + Active Storage
- PDF Generation: PDF forms
- Code Quality: ESLint + Prettier + TypeScript strict mode
- Testing: RSpec (backend) + Jest (frontend)
- CDN: CloudFront
- Asset Access: Private with signed URLs
- CI/CD Platform: GitHub Actions
- CI/CD Trigger: Push to main/staging branches
- Tests: Run before deployment
- Production Environment: main branch
- Staging Environment: staging branch
