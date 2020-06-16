import React, { Component } from "react";
import PropTypes from "prop-types";

function handleError(error, componentStack) {
  console.log(error);
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const { onError = handleError } = this.props;
    onError(error.toString(), info.componentStack);
  }

  render() {
    const { children, fallback = <></> } = this.props;

    if (this.state.hasError) {
      return fallback;
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  onError: PropTypes.func,
};
