import React from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("ErrorBoundary:", error);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="font-heading text-lg font-semibold text-foreground">
            Qualcosa è andato storto
          </p>
          <p className="text-sm text-muted-foreground">
            Si è verificato un errore inatteso. Ricarica la pagina per continuare.
          </p>
          <Button onClick={this.handleReload}>Ricarica</Button>
        </div>
      );
    }
    return this.props.children;
  }
}