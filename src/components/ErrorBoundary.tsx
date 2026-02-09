import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-gray-100 text-gray-900">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-600 max-w-md text-center">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
