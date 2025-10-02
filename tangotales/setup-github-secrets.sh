#!/bin/bash
# Setup GitHub Secrets for TangoTales
# This script requires GitHub CLI (gh) to be installed and authenticated
# Run: gh auth login first, then ./setup-github-secrets.sh

echo "Setting up GitHub Secrets for TangoTales..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub CLI first:"
    echo "gh auth login"
    exit 1
fi

# Repository info
REPO="kmkarakaya/TangoTales"

# Firebase configuration secrets
echo "Setting Firebase secrets..."
gh secret set REACT_APP_FIREBASE_API_KEY --body "AIzaSyD385eVfUZsz4vDrNKSGWL9r5ueOmfVrOM" --repo $REPO
gh secret set REACT_APP_FIREBASE_AUTH_DOMAIN --body "tangotales-app.firebaseapp.com" --repo $REPO
gh secret set REACT_APP_FIREBASE_PROJECT_ID --body "tangotales-app" --repo $REPO
gh secret set REACT_APP_FIREBASE_STORAGE_BUCKET --body "tangotales-app.firebasestorage.app" --repo $REPO
gh secret set REACT_APP_FIREBASE_MESSAGING_SENDER_ID --body "175288878983" --repo $REPO
gh secret set REACT_APP_FIREBASE_APP_ID --body "1:175288878983:web:9ed70e0ae7fd460fe93522" --repo $REPO

# Gemini API Key (you need to add your actual key)
echo "Please enter your Gemini API key:"
read -s GEMINI_KEY
gh secret set REACT_APP_GEMINI_API_KEY --body "$GEMINI_KEY" --repo $REPO

echo "GitHub Secrets setup complete!"
echo "You can verify the secrets in your repository settings:"
echo "https://github.com/$REPO/settings/secrets/actions"