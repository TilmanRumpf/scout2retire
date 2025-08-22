import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, Home } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

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
            <div className={`max-w-md w-full ${uiConfig.colors.card} rounded-lg shadow-lg p-6 text-center`}>
              <div className="flex justify-center mb-4">
                <div className={`w-12 h-12 ${uiConfig.colors.dangerSecondary} rounded-full flex items-center justify-center`}>
                  <AlertCircle className={`w-6 h-6 ${uiConfig.colors.danger}`} />
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-2`}>
                {fallbackTitle || 'Something went wrong'}
              </h3>
              
              <p className={`text-sm ${uiConfig.colors.body} mb-6`}>
                {fallbackMessage || 'We encountered an error loading this content. Please try again.'}
              </p>

              <button
                onClick={this.handleReset}
                className={`inline-flex items-center gap-2 px-4 py-2 ${uiConfig.colors.success} hover:${uiConfig.colors.successHover} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              {/* Show error details in development */}
              {isDevelopment && this.state.error && (
                <div className={`mt-4 p-3 ${uiConfig.colors.secondary} rounded text-left`}>
                  <p className={`text-xs font-mono ${uiConfig.colors.body}`}>
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
        <div className={`min-h-screen ${uiConfig.colors.page} flex items-center justify-center px-4`}>
          <div className="max-w-md w-full">
            <div className={`${uiConfig.colors.card} rounded-lg shadow-lg p-6 sm:p-8`}>
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 ${uiConfig.colors.dangerSecondary} rounded-full flex items-center justify-center`}>
                  <AlertTriangle className={`w-10 h-10 ${uiConfig.colors.danger}`} />
                </div>
              </div>

              {/* Error Message */}
              <h1 className={`text-2xl font-bold text-center ${uiConfig.colors.heading} mb-4`}>
                {fallbackTitle || 'Oops! Something went wrong'}
              </h1>
              
              <p className={`text-center ${uiConfig.colors.body} mb-8`}>
                {fallbackMessage || "We're sorry, but something unexpected happened. Please try refreshing the page or return to the home page."}
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${uiConfig.colors.success} hover:${uiConfig.colors.successHover} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>

                {showReloadButton && (
                  <button
                    onClick={this.handleReload}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${uiConfig.colors.btnPrimary} hover:${uiConfig.colors.btnPrimaryHover} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reload Page
                  </button>
                )}

                {showHomeButton && (
                  <button
                    onClick={this.handleGoHome}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${uiConfig.colors.btnSecondary} hover:${uiConfig.colors.btnSecondaryHover} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                  >
                    <Home className="w-5 h-5" />
                    Go to Home
                  </button>
                )}
              </div>

              {/* Error Details (Development Only) */}
              {isDevelopment && this.state.error && (
                <div className={`mt-8 p-4 ${uiConfig.colors.secondary} rounded-lg`}>
                  <h3 className={`text-sm font-semibold ${uiConfig.colors.heading} mb-2`}>
                    Error Details (Development Mode)
                  </h3>
                  <pre className={`text-xs ${uiConfig.colors.body} overflow-x-auto`}>
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