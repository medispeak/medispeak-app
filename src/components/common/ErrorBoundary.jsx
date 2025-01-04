import React from "react";
import { useSetAtom } from "jotai";
import { notify } from "../../store/notifications";

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error("Error caught by boundary:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      // Reset the error state after a delay
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 5000);

      return null; // Return null since we're showing the error via notification
    }

    return this.props.children;
  }
}

// Wrapper component to access Jotai atoms
export default function ErrorBoundary({ children }) {
  const handleError = (error) => {
    notify({
      type: "error",
      title: "Something went wrong",
      message: error.message || "An unexpected error occurred",
    });
  };

  return (
    <ErrorBoundaryClass onError={handleError}>{children}</ErrorBoundaryClass>
  );
}
