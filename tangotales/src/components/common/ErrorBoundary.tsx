import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto mt-8">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold mb-4 text-tango-red">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-700 mb-6">
            Don't worry, even the best tango dancers sometimes miss a step.
          </p>
          <button 
            className="bg-tango-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;