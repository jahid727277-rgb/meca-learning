#!/bin/bash
echo "Starting Git Auto-Sync..."

# Configure git identity if not set
git config user.email "jahid1882008@gmail.com"
git config user.name "Jahid"

# Add remote if not already exists
if ! git remote get-url origin > /dev/null 2>&1; then
  git remote add origin https://github.com/jahid72777-rgb/meca-learning.git
fi

git add .

# Determine commit message from argument, environment variables, or fallback
COMMIT_MSG="${1:-${COMMIT_MESSAGE:-${GIT_COMMIT_MESSAGE:-${MESSAGE:-}}}}"

if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="Auto-sync update: $(date +'%Y-%m-%d %H:%M:%S')"
fi

echo "Using commit message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

# Try pushing to main or master
git branch -M main
git push -u origin main || git push -u origin master || echo "Push failed. Please check your GitHub authentication/token."
echo "Git sync process completed!"
