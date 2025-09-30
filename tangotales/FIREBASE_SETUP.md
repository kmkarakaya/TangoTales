# Firebase Setup Guide for TangoTales

This guide explains how to set up Firebase Firestore and Hosting for the TangoTales project using the **FREE tier only**.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- A Google account
- Node.js 18+ installed

## Step 1: Create Firebase Project ✅ COMPLETED

**Project Created**: `tangotales-app`
- **Project ID**: tangotales-app
- **Project Name**: TangoTales
- **Console URL**: https://console.firebase.google.com/project/tangotales-app/overview
- **Status**: ✅ Created and connected via Firebase CLI

## Step 2: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for FREE tier)
4. Choose a location (select closest to your users)
5. Click "Done"

## Step 3: Enable Firebase Hosting

1. In Firebase Console, go to "Hosting"
2. Click "Get started"
3. Follow the setup instructions
4. Note your hosting URL (will be used later)

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</>) 
4. Enter app nickname (e.g., "tangotales-web")
5. Enable Firebase Hosting for this app
6. Copy the configuration object

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase configuration in `.env.local`:
   ```bash
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. Add your Gemini AI API key:
   ```bash
   REACT_APP_GEMINI_API_KEY=your_gemini_key_here
   ```

## Step 6: Firebase CLI Setup

1. Login to Firebase CLI:
   ```bash
   firebase login
   ```

2. Set the active project:
   ```bash
   firebase use --add
   ```
   Select your project and give it an alias (e.g., "default")

## Step 7: Deploy Firestore Rules

Deploy the security rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

## Step 8: Test Firebase Connection

1. Start your development server:
   ```bash
   npm start
   ```

2. Check the browser console for Firebase connection validation messages
3. You should see "✅ All Firebase environment variables are configured"

## Step 9: Deploy to Firebase Hosting

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

3. Your app will be available at: `https://your-project-id.web.app`

## Firebase Project Structure

```
Firebase Project (FREE Tier)
├── Firestore Database
│   ├── Collection: songs
│   │   ├── Document: {songId}
│   │   │   ├── title: string
│   │   │   ├── explanation: string
│   │   │   ├── sources: array
│   │   │   ├── createdAt: timestamp
│   │   │   ├── searchCount: number
│   │   │   ├── averageRating: number
│   │   │   ├── totalRatings: number
│   │   │   └── tags: array
│   └── Collection: ratings
│       ├── Document: {ratingId}
│       │   ├── songId: string
│       │   ├── rating: number
│       │   ├── comment: string
│       │   └── timestamp: timestamp
└── Hosting
    └── Static files from /build directory
```

## Firestore Security Rules

The current security rules allow public read/write access, suitable for the FREE tier:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /songs/{songId} {
      allow read: if true;
      allow write: if true;
    }
    match /ratings/{ratingId} {
      allow read, write: if true;
    }
  }
}
```

## FREE Tier Limitations

- **Firestore**: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day
- **Hosting**: 10GB storage, 360MB/day transfer
- **No Cloud Functions**: All logic runs client-side
- **No Firebase Extensions**: Not available in FREE tier

## Useful Commands

```bash
# Check Firebase CLI version
firebase --version

# List all Firebase projects
firebase projects:list

# Check current active project
firebase use

# View Firestore data in browser
firebase firestore:delete --recursive /

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy

# Open Firebase console
firebase open

# View hosting URL
firebase hosting:sites:list
```

## Troubleshooting

### "Permission denied" errors
- Check that Firestore is enabled in your Firebase project
- Verify security rules are deployed correctly
- Ensure your project ID is correct in environment variables

### "API key not valid" errors
- Verify all environment variables are set correctly in `.env.local`
- Check that the API key matches your Firebase project
- Ensure `.env.local` is not committed to version control

### Build fails with Firebase errors
- Check that all required environment variables are prefixed with `REACT_APP_`
- Verify Firebase configuration object is complete
- Make sure Firebase SDK versions are compatible

### Deployment fails
- Ensure you're logged in to Firebase CLI (`firebase login`)
- Check that you've run `npm run build` before deploying
- Verify the correct project is selected (`firebase use`)

## Security Notes

1. **Never commit** `.env.local` to version control
2. Firebase API keys are **safe to expose** in client-side code
3. Security is enforced by **Firestore rules**, not by hiding the API key
4. Consider implementing user authentication for production use
5. Review and update security rules based on your app's requirements

## Next Steps

After completing this setup:
1. Test all Firebase operations work correctly
2. Implement the search functionality using the Firestore service
3. Add the Gemini AI integration for new song research
4. Deploy your app and test in production environment