# Project Tracking & Git Workflow

> **Rule:** After completing every phase, run the Git commands in the "Git Commit & Push" section of that phase.

## Phase 1: Database & ORM
- [ ] Prisma initialized
- [ ] Schema migrated to NeonDB
- [ ] Prisma singleton created in `lib/prisma.ts`
**Git Commit & Push:**
```bash
git add .
git commit -m "feat(db): setup prisma, schema, and neondb migration"
git push origin dev