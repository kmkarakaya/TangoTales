# 🎵**Tech Stack**: React 18, TypeScript, Tailwind CSS, Firebase (Firestore, Hosting), Gemini AI API  
**Development Status**: ✅ **AI Research Feature Complete!** - Users can research unknown songs with AI and see results immediately!angoTales

A React-based web application for exploring Argentine Tango songs with AI-powered explanations and ratings.

**Tech Stack**: React 18, TypeScript, Tailwind CSS, Firebase (Firestore, Hosting), Gemini AI API  
**Development Status**: Database Populated ✅ - 5 sample songs operational! �

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project (free tier)
- Gemini AI API key

### Environment Setup

1. **Create .env.local file from template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure all environment variables in .env.local:**
   ```bash
   # Gemini AI API Key (required for song research)
   REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key_here
   
   # Firebase Configuration (required for database)
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. **Verify configuration:**
   ```bash
   npm run check-env
   ```

   > 🔒 **Security Note**: We use system environment variables for API keys instead of storing them in files for better security.

## 🤖 **AI Research Feature**

TangoTales now features intelligent song research powered by Google Gemini AI:

### **How it Works**
1. **Search for any tango song** - known or unknown
2. **If not found** - see "🤖 Research with AI" button
3. **Click to research** - Gemini AI analyzes the song
4. **Instant results** - researched song appears immediately with:
   - Title translation and meaning
   - Historical context and composer information
   - Cultural significance and notable performances
   - Reliable source references

### **Technical Details**
- **API**: Google Gemini 2.0 Flash model (@google/genai v1.21.0)
- **Response Format**: Structured JSON with title, date, meaning, cultural notes, sources
- **Auto-Save**: Researched songs automatically saved to Firestore
- **Smart Ordering**: New songs appear first in search results (ordered by creation date)
- **Error Handling**: Graceful fallbacks with retry options
- **Security**: API keys managed via environment variables and GitHub Secrets

### **User Experience**
- **No Page Reload**: Search results refresh seamlessly to show new song
- **Loading States**: Beautiful loading indicators during research
- **Context Preservation**: Search query and results maintained throughout the process
- **Immediate Visibility**: Newly researched songs appear at the top of search results

### Installation and Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### 🧪 **Testing Search & AI Research**

1. **Start the app**: App runs on http://localhost:3001 (configured port)
2. **Sample data ready**: Database contains classic tango songs plus AI-researched songs
3. **Test regular search**: Try searching for existing songs like "La Cumparsita", "Por Una Cabeza"
4. **Test AI research**: 
   - Search for unknown songs like "Nostalgias", "Mi Buenos Aires Querido"
   - Click "🤖 Research with AI" when no results are found
   - Watch as AI researches the song and adds it to the database
   - See the newly researched song appear immediately at the top of results
5. **Explore features**: 
   - Click "Show Popular Songs" to see all songs
   - Use A-Z letter navigation for filtering
   - Test mobile responsiveness with browser dev tools
   - Notice how newly researched songs appear first in search results

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
