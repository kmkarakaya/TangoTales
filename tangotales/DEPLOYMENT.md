# 🚀 TangoTales Deployment Guide

## Firebase + GitHub Actions Deployment Strategy

This guide covers secure deployment from GitHub to Firebase Hosting using your existing workflows with proper environment variable management.

## 🔧 Current Workflow Setup

Your repository already has Firebase deployment workflows:
- `firebase-hosting-merge.yml` - Deploys to production on main branch pushes
- `firebase-hosting-pull-request.yml` - Creates preview deployments for PRs

These workflows have been updated to include environment variables for the Gemini AI integration.

## 🔒 Security Architecture

### Development Environment
- Use `.env.local` for Firebase config (safe to commit structure, not values)
- Use `REACT_APP_GEMINI_API_KEY` environment variable for local development
- Never commit actual API keys to repository

### Production Environment
- GitHub Secrets for all sensitive environment variables
- Firebase Hosting with GitHub Actions auto-deployment
- Environment variables injected during build process

## 📋 Setup Instructions

### 1. GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and Variables → Actions, and add these secrets:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT=your_service_account_json
```

### 2. Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Copy the entire JSON content
4. Add it as `FIREBASE_SERVICE_ACCOUNT` secret in GitHub

### 3. Local Development Setup

For local development, set the environment variable in your session:

**Windows PowerShell:**
```powershell
$env:REACT_APP_GEMINI_API_KEY = "your_gemini_api_key_here"
npm start
```

**Windows Command Prompt:**
```cmd
set REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
npm start
```

**Linux/macOS:**
```bash
export REACT_APP_GEMINI_API_KEY="your_gemini_api_key_here"
npm start
```

### 4. Alternative: Create .env.local for Development

If you prefer file-based development (not recommended for production):

```bash
# .env.local
REACT_APP_GEMINI_API_KEY=your_development_api_key
```

**⚠️ Important:** Never commit `.env.local` with real API keys. The `.gitignore` already excludes it.

## 🔄 Deployment Workflow

### Automatic Deployment
1. Push to `main` branch
2. GitHub Actions triggers
3. Environment variables injected from GitHub Secrets
4. App builds with production configuration
5. Deploys to Firebase Hosting automatically

### Manual Deployment
```bash
# Set environment variable
$env:REACT_APP_GEMINI_API_KEY = "your_key"

# Build and deploy
npm run build
firebase deploy --only hosting
```

## 🛡️ Security Best Practices

### ✅ DO:
- Use GitHub Secrets for all API keys in production
- Use environment variables (not files) for local development
- Keep `.env.local` in `.gitignore`
- Use different API keys for development and production
- Regularly rotate API keys

### ❌ DON'T:
- Commit API keys to the repository
- Share API keys in chat/email
- Use production API keys in development
- Store API keys in code files

## 🔍 Verification Commands

### Check Environment Setup
```bash
npm run check-env
```

### Check GitHub Actions
- Go to your repository → Actions tab
- Verify deployment workflow runs successfully

### Check Firebase Deployment
```bash
firebase hosting:channel:list
```

## 🚨 Emergency Procedures

### If API Key is Compromised:
1. Immediately revoke the key in Google AI Studio
2. Generate a new API key
3. Update GitHub Secrets
4. Redeploy the application

### If Deployment Fails:
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Run `npm run check-env` locally
4. Check Firebase service account permissions

## 📞 Support

- Firebase Console: https://console.firebase.google.com
- Google AI Studio: https://aistudio.google.com
- GitHub Actions Documentation: https://docs.github.com/en/actions