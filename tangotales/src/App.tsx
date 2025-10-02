import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common';
import { SearchProvider } from './contexts/SearchContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import { validateFirebaseConfig } from './services/firebaseTest';
import './App.css';

// Development utilities - enhanced database setup available via DatabaseSetupButton

function App() {
  useEffect(() => {
    // Validate Firebase configuration on app startup (development only)
    if (process.env.NODE_ENV === 'development') {
      validateFirebaseConfig();
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
