#!/bin/bash
set -e

cd "$(dirname "$0")/teensim"

echo "🔨 Building..."
npm run build

cd ..

echo "📦 Staging changes..."
git add -A

echo "💬 Commit message (leave blank to cancel):"
read -r MSG
if [ -z "$MSG" ]; then
  echo "❌ Cancelled — no commit message provided."
  exit 1
fi

git commit -m "$MSG

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo "🚀 Pushing to GitHub..."
git push origin master

echo ""
echo "✅ Deployed! Live at: https://leon-anavy.github.io/TeenSimulatorOOP/"
echo "   Workflow: https://github.com/leon-anavy/TeenSimulatorOOP/actions"
