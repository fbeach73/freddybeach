"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`ErrorBoundary (${this.props.name ?? "unnamed"}) caught error:`, error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {this.props.name
              ? `An error occurred in ${this.props.name}.`
              : "An unexpected error occurred."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  name?: string
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary name={name}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`;

  return WithErrorBoundary;
}
