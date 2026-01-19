#!/bin/bash
cd /home/shakil/Projects/Outcome_Based_Education/obe-system

# Configure git
git config core.editor "cat"
git config pull.rebase false

# Abort any pending merge
git merge --abort 2>/dev/null

# Pull with merge
echo "Pulling from remote development branch..."
git pull origin development --allow-unrelated-histories --no-edit

# Push to remote
echo "Pushing to remote development branch..."
git push -u origin development

echo "Done!"
