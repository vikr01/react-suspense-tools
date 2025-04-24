import * as React from "react";
import { Component } from "react";

type Props<T> = {
  children: React.ReactNode;
  fallback: React.ReactNode;
  resetErrorRef: React.RefObject<T | (() => void)>;
};

export default class RecoverableErrorBoundary<T> extends Component<Props<T>> {
  state = { hasError: false };

  static getDerivedStateFromError(err: unknown) {
    let res = false;
    if (err != null) {
      res = true;
    }

    return { hasError: res };
  }

  render() {
    this.props.resetErrorRef.current = () => {
      this.setState({ hasError: false });
    };

    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
