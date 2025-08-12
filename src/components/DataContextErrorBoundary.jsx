// Error boundary specifically for DataContext-related errors
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class DataContextErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DataContext Error:', error, errorInfo);
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // You could send to Sentry, LogRocket, etc here
    }
    
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDataContextError = this.state.error?.message?.includes('useData') || 
                                this.state.error?.message?.includes('DataContext') ||
                                this.state.error?.message?.includes('Cannot read properties of undefined');
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
              {isDataContextError ? 'Data Loading Error' : 'Something went wrong'}
            </h2>
            
            <p className="mt-2 text-sm text-center text-gray-600">
              {isDataContextError 
                ? 'We encountered an issue loading your data. This is usually temporary.'
                : 'An unexpected error occurred. Please try refreshing the page.'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <summary className="cursor-pointer text-gray-700 font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="mt-6 space-y-3">
              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </button>
            </div>

            {this.state.retryCount >= 3 && (
              <p className="mt-4 text-xs text-center text-gray-500">
                Multiple retry attempts failed. Please contact support if this issue persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DataContextErrorBoundary;