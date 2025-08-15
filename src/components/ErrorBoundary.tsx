import React from "react";

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("UI error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Une erreur est survenue</h2>
          <p>Veuillez rafraîchir la page. Si le problème persiste, contactez le support.</p>
        </div>
      );
    }
    return this.props.children as any;
  }
}
