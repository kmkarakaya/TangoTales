import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-tango-red mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link 
          to="/" 
          className="bg-tango-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;