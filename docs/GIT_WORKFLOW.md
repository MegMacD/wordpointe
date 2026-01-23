# Git Workflow Guide

## Overview

This project now follows a branch-based workflow instead of pushing directly to `main`. This allows for better code review, testing, and collaboration.

## Branch Strategy

### Protected Branches
- **`main`** - Production-ready code, auto-deploys to Vercel
- Only merge to `main` via pull requests or after testing

### Feature Branches
- Create a new branch for each feature or bug fix
- Naming convention: `feature/description` or `fix/description`

## Common Workflows

### Starting a New Feature

```powershell
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/admin-user-creation-ui
git checkout -b fix/login-mobile-layout
git checkout -b feature/password-reset
```

### Working on Your Feature

```powershell
# Make your changes, then stage and commit
git add .
git commit -m "Add user creation form to admin panel"

# Push your feature branch to GitHub
git push origin feature/your-feature-name
```

### Finishing a Feature

#### Option 1: Merge Locally (Simple Projects)

```powershell
# Switch back to main
git checkout main

# Pull any changes from remote
git pull origin main

# Merge your feature branch
git merge feature/your-feature-name

# Push to main (triggers Vercel deployment)
git push origin main

# Clean up the feature branch (optional)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

#### Option 2: Pull Request on GitHub (Recommended)

```powershell
# Push your feature branch
git push origin feature/your-feature-name
```

Then on GitHub:
1. Go to your repository
2. Click "Pull requests" → "New pull request"
3. Select your feature branch to merge into `main`
4. Add a description of what changed
5. Click "Create pull request"
6. Review the changes, then click "Merge pull request"
7. Vercel will automatically deploy the changes

### Switching Between Branches

```powershell
# See all branches
git branch

# Switch to an existing branch
git checkout feature/some-feature

# Switch back to main
git checkout main

# Create and switch to new branch in one command
git checkout -b feature/new-feature
```

### Saving Work in Progress

If you need to switch branches but aren't ready to commit:

```powershell
# Save your work temporarily
git stash

# Switch branches
git checkout main

# Come back and restore your work
git checkout feature/your-feature
git stash pop
```

## Current Branch Workflow

You're currently on: `feature/enhanced-login`

### To commit your authentication improvements:

```powershell
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix authentication issues and improve security

- Fix duplicate bible_version TypeScript error
- Fix admin login redirect loop  
- Require authentication for all pages
- Add helpful login messaging
- Ensure all admin pages require admin role
- Add user creation script and documentation"

# Push to feature branch
git push origin feature/enhanced-login
```

### Then merge to main:

```powershell
# Switch to main
git checkout main

# Merge the feature
git merge feature/enhanced-login

# Push to main (triggers deployment)
git push origin main
```

## Branch Naming Conventions

Good branch names are descriptive and follow a pattern:

### Feature Branches
- `feature/admin-user-ui` - Adding admin user management interface
- `feature/password-reset` - Password reset functionality
- `feature/export-history` - Export user history to CSV

### Bug Fix Branches
- `fix/login-redirect` - Fix login redirect issue
- `fix/points-calculation` - Fix bonus points calculation
- `fix/mobile-menu` - Fix mobile navigation menu

### Improvement Branches
- `improve/loading-states` - Better loading indicators
- `improve/error-messages` - More helpful error messages
- `improve/mobile-ui` - Mobile UI enhancements

## Best Practices

✅ **Do:**
- Create a new branch for each feature/fix
- Write descriptive commit messages
- Keep branches focused (one feature per branch)
- Merge or delete branches after they're done
- Pull from `main` before creating a new branch
- Test your changes before merging to `main`

❌ **Don't:**
- Work directly on `main` for new features
- Mix unrelated changes in one branch
- Push untested code to `main`
- Keep old branches around indefinitely
- Use vague commit messages like "fixes" or "updates"

## Commit Message Guidelines

### Good Commit Messages
```
Add user creation script for admins

Creates a new Node.js script that generates SQL for creating
leader or admin users with hashed passwords. Includes validation
and helpful output formatting.
```

```
Fix admin login redirect loop

Changes AuthGuard to use router.replace() and fixes the login
success handler to use window.location.href for proper page refresh.
This prevents the flash/redirect issue admins were experiencing.
```

### Short Commit Messages (Also Fine)
```
Fix duplicate bible_version TypeScript error
```

```
Add login requirement to all pages
```

### Poor Commit Messages (Avoid These)
```
fixes
```

```
updates
```

```
wip
```

## Viewing History

```powershell
# View commit history
git log --oneline

# View changes in last commit
git show

# View changes between branches
git diff main feature/your-feature

# View current branch
git branch --show-current
```

## Emergency: Need to Undo

### Undo Last Commit (Keep Changes)
```powershell
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```powershell
git reset --hard HEAD~1
```

### Undo Uncommitted Changes
```powershell
# Undo all changes to tracked files
git reset --hard

# Undo changes to specific file
git checkout -- path/to/file.ts
```

## Quick Reference

```powershell
# Status check
git status                              # See what's changed
git branch                              # List branches
git branch --show-current               # Current branch

# Creating branches
git checkout -b feature/name            # Create and switch to new branch
git checkout main                       # Switch to main

# Committing
git add .                               # Stage all changes
git commit -m "message"                 # Commit with message
git push origin branch-name             # Push to GitHub

# Merging
git checkout main                       # Switch to main
git merge feature/name                  # Merge feature into main
git push origin main                    # Push merged code

# Cleanup
git branch -d feature/name              # Delete local branch
git push origin --delete feature/name   # Delete remote branch
```

## Next Steps

Since you're on `feature/enhanced-login`, you can:

1. **Review your changes**: `git status` and `git diff`
2. **Commit**: `git add . && git commit -m "your message"`
3. **Push feature branch**: `git push origin feature/enhanced-login`
4. **Merge to main**: 
   ```powershell
   git checkout main
   git merge feature/enhanced-login
   git push origin main
   ```
5. **Vercel will auto-deploy** from main

Happy coding! 🚀
