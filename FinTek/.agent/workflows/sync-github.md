---
description: Sync project changes with GitHub
---

# Sync Changes with GitHub

This workflow helps you commit and push all local changes to the GitHub repository.

// turbo-all

## Steps

### 1. Check current status

```bash
git status
```

This shows which files have been modified, added, or deleted.

### 2. Add all changes to staging

```bash
git add .
```

This stages all modified and new files for commit.

### 3. Commit the changes

```bash
git commit -m "feat: Update project with recent changes"
```

You can customize the commit message to describe your specific changes:

- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `style:` for styling changes

### 4. Push to GitHub

```bash
git push origin main
```

This uploads your commits to the remote repository on GitHub.

### 5. Verify sync status

```bash
git status
```

Confirms that everything is synchronized.

---

## Quick Sync (All-in-One)

If you want to sync everything quickly with a generic message:

```bash
git add . && git commit -m "feat: Update project" && git push origin main
```

## Tips

- Always review `git status` before committing to see what will be included
- Use descriptive commit messages to track changes over time
- If you get conflicts, you may need to pull changes first: `git pull origin main`
