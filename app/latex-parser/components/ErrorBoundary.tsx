"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="mt-6 border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-destructive">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-destructive mb-2">
                  Something went wrong
                </div>
                <div className="text-sm text-destructive/90 mb-4">
                  {this.state.error?.message || "An unexpected error occurred"}
                </div>
                {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm text-destructive/80 hover:text-destructive">
                      Error Details (Development Only)
                    </summary>
                    <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-destructive/5 p-3 text-xs text-destructive/70">
                      {this.state.error?.stack}
                      {"\n\n"}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleReset}
                  className="border-destructive/50 text-destructive hover:bg-destructive/20"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

