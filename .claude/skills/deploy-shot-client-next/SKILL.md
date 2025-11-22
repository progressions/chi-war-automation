---
name: deploy-shot-client-next
description: DEPRECATED - Use deploy-phoenix-client for production or deploy-rails-client for legacy Rails backend. This skill redirects to the appropriate deployment skill.
---

# ⚠️ DEPRECATED: Use Specific Deployment Skills

This skill is deprecated. Use the specific deployment skills instead:

## Primary Production Deployment (Phoenix Backend)

**Use this for normal deployments:**
```
deploy-phoenix-client
```

Deploys to `shot-client-phoenix` app with Phoenix/Elixir backend at `shot-elixir.fly.dev`.

## Legacy Rails Backend Deployment

**Only use when explicitly requested:**
```
deploy-rails-client
```

Deploys to `shot-client-next` app with Rails backend at `shot-counter.fly.dev`.

## Quick Reference

**Production deployment:**
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next
./deploy_phoenix.sh
```

**Rails deployment (legacy):**
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next
./deploy_rails.sh
```

## Examples

- User: "Deploy the latest frontend changes" → Use `deploy-phoenix-client`
- User: "Release the new UI updates to Fly.io" → Use `deploy-phoenix-client`
- User: "Deploy to production" → Use `deploy-phoenix-client`
- User: "Deploy the client" → Use `deploy-phoenix-client`
- User: "Deploy with Rails backend" → Use `deploy-rails-client`
- User: "Deploy to Rails client" → Use `deploy-rails-client`

## Guidelines

- Always verify the build succeeds locally before deploying
- Ensure API endpoint URLs are correct for production environment
- Monitor deployment logs for build or startup errors
- Test responsive design and critical flows after deployment
- Clear browser cache when testing UI changes
- Verify WebSocket connections work properly
- Deployment typically takes 3-5 minutes (includes Docker build)

## Pre-Deployment Checklist

- [ ] All changes committed to git
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] Environment variables configured in Fly.io
- [ ] API base URL points to correct backend

## Post-Deployment Checks

- Test user login/registration
- Verify campaign switching works
- Test WebSocket real-time updates
- Check fight creation and management
- Test character creation with AI image generation
- Verify autocomplete components work
- Test drawer forms and modals
- Check responsive design on mobile

## Environment Variables

Ensure these are set on Fly.io:
- `NEXT_PUBLIC_API_URL` - Backend API URL (https://shot-elixir.fly.dev)
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- Any other required environment variables

## Troubleshooting

If deployment fails:
- Check `fly logs` for build errors
- Verify Next.js build succeeds locally
- Check environment variables with `fly secrets list`
- Review recent git commits for breaking changes
- Test API connectivity from production environment
- Rollback if needed: `fly releases rollback`

## Docker Build Notes

- Uses Node.js 18+ base image
- Multi-stage build for optimized image size
- Production build with `npm run build`
- Deployment process caches layers for faster rebuilds
