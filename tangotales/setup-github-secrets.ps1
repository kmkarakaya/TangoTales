# Setup GitHub Secrets for TangoTales
# This script requires GitHub CLI (gh) to be installed and authenticated
# Run: gh auth login first, then .\setup-github-secrets.ps1

Write-Host "Setting up GitHub Secrets for TangoTales..." -ForegroundColor Green

# Check if GitHub CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI (gh) is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if authenticated
try {
    gh auth status 2>$null
} catch {
    Write-Host "Please authenticate with GitHub CLI first:" -ForegroundColor Red
    Write-Host "gh auth login" -ForegroundColor Yellow
    exit 1
}

# Repository info
$REPO = "kmkarakaya/TangoTales"

# Firebase configuration secrets
Write-Host "Setting Firebase secrets..." -ForegroundColor Blue
gh secret set REACT_APP_FIREBASE_API_KEY --body "AIzaSyD385eVfUZsz4vDrNKSGWL9r5ueOmfVrOM" --repo $REPO
gh secret set REACT_APP_FIREBASE_AUTH_DOMAIN --body "tangotales-app.firebaseapp.com" --repo $REPO
gh secret set REACT_APP_FIREBASE_PROJECT_ID --body "tangotales-app" --repo $REPO
gh secret set REACT_APP_FIREBASE_STORAGE_BUCKET --body "tangotales-app.firebasestorage.app" --repo $REPO
gh secret set REACT_APP_FIREBASE_MESSAGING_SENDER_ID --body "175288878983" --repo $REPO
gh secret set REACT_APP_FIREBASE_APP_ID --body "1:175288878983:web:9ed70e0ae7fd460fe93522" --repo $REPO


Write-Host "GitHub Secrets setup complete!" -ForegroundColor Green
Write-Host "You can verify the secrets in your repository settings:" -ForegroundColor Blue
Write-Host "https://github.com/$REPO/settings/secrets/actions" -ForegroundColor Yellow