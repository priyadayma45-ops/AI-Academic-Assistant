import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-md p-8 rounded-3xl glass shadow-2xl text-center flex flex-col items-center">
            <div className="p-4 bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl mb-6">
              <AlertTriangle className="w-12 h-12" />
            </div>
            
            <h1 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              An unexpected client-side error occurred. We have logged this error and are working on it.
            </p>

            {this.state.error?.message && (
              <pre className="w-full p-4 rounded-xl bg-slate-100 dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border text-left text-xs font-mono overflow-auto mb-6 text-red-500 dark:text-red-450 max-h-32">
                {this.state.error.message}
              </pre>
            )}

            <Button
              variant="primary"
              onClick={this.handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
