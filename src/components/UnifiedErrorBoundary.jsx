import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, Home } from 'lucide-react';

class UnifiedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you would send this to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;
      const {
        variant = 'full', // 'full' for app-level, 'compact' for component-level
        fallbackTitle,
        fallbackMessage,
        showHomeButton = true,
        showReloadButton = true
      } = this.props;

      // Compact variant for component-level errors
      if (variant === 'compact') {
        return (
          <div className="min-h-[400px] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {fallbackTitle || 'Something went wrong'}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {fallbackMessage || 'We encountered an error loading this content. Please try again.'}
              </p>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              {/* Show error details in development */}
              {isDevelopment && this.state.error && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-left">
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Full variant for app-level errors
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
                {fallbackTitle || 'Oops! Something went wrong'}
              </h1>
              
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                {fallbackMessage || "We're sorry, but something unexpected happened. Please try refreshing the page or return to the home page."}
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>

                {showReloadButton && (
                  <button
                    onClick={this.handleReload}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reload Page
                  </button>
                )}

                {showHomeButton && (
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <Home className="w-5 h-5" />
                    Go to Home
                  </button>
                )}
              </div>

              {/* Error Details (Development Only) */}
              {isDevelopment && this.state.error && (
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development Mode)
                  </h3>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default UnifiedErrorBoundary;