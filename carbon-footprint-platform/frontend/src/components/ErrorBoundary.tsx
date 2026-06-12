import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary — catches rendering errors and shows a fallback UI.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6" role="alert">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred. Please refresh the page or try again.
                </p>
                {this.state.error && import.meta.env.DEV && (
                  <details className="mt-2 text-left">
                    <summary className="text-xs text-muted-foreground cursor-pointer">Error details</summary>
                    <pre className="mt-1 text-xs text-destructive overflow-auto p-2 bg-muted rounded">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
              <Button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                size="sm"
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
