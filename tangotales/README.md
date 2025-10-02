# 🎵 TangoTales

A React-based web application for exploring Argentine Tango songs with AI-powered explanations and ratings.

**Tech Stack**: React 18, TypeScript, Tailwind CSS, Firebase (Firestore, Hosting), Gemini AI API  
**Development Status**: Database Populated ✅ - 5 sample songs operational! �

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project (free tier)
- Gemini AI API key

### Environment Setup

1. **Set System Environment Variable (Recommended for Security):**
   ```bash
   # Windows PowerShell
   $env:GEMINI_API_KEY = "your_actual_gemini_api_key_here"
   
   # Windows Command Prompt
   set GEMINI_API_KEY=your_actual_gemini_api_key_here
   
   # Linux/macOS
   export GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

2. **Configure Firebase (in .env.local):**
   ```bash
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config variables
   ```

   > 🔒 **Security Note**: We use system environment variables for API keys instead of storing them in files for better security.

### Installation and Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### 🧪 **Testing Search Functionality**

1. **Start the app**: App runs on http://localhost:3001 (configured port)
2. **Sample data ready**: Database now contains 5 classic tango songs:
   - La Cumparsita (1916)
   - Por Una Cabeza (1935)
   - El Choclo (1903)
   - Adiós Nonino (1959)
   - Libertango (1974)
3. **Test search**: Try searching for "La Cumparsita", "Por Una Cabeza", "Piazzolla", etc.
4. **Explore features**: 
   - Click "Show Popular Songs" to see all 5 songs
   - Use A-Z letter navigation (L, P, E, A for filtering)
   - Test mobile responsiveness with browser dev tools

**Note**: If you need to reset/repopulate data, open browser console and run:
```javascript
window.populateSampleData()
```

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
