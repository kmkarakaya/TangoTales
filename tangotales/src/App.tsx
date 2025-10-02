import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common';
import { SearchProvider } from './contexts/SearchContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import { validateFirebaseConfig } from './services/firebaseTest';
import { validateConfig } from './utils/config';
import './App.css';

// Development utilities - enhanced database setup available via DatabaseSetupButton

function App() {
  useEffect(() => {
    // Validate Firebase configuration on app startup (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 APP DEBUG - Starting configuration validation');
      
      // Validate Firebase config
      validateFirebaseConfig();
      
      // Validate overall config including Gemini API
      const configErrors = validateConfig();
      if (configErrors.length > 0) {
        console.error('❌ APP DEBUG - Configuration errors found:');
        configErrors.forEach(error => console.error(`  - ${error}`));
      } else {
        console.log('✅ APP DEBUG - All configuration validated successfully');
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <SearchProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </SearchProvider>
    </ErrorBoundary>
  );
}

export default App;
