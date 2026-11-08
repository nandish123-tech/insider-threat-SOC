import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { html } from './html.js';
import { App } from './App.jsx';

// Error boundary: shows an error message instead of a blank screen
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { e: null }; }
  static getDerivedStateFromError(e) { return { e }; }
  render() {
    return this.state.e
      ? React.createElement('pre', { style: { padding: 20, color: '#b91c1c', whiteSpace: 'pre-wrap' } }, 'Dashboard error: ' + (this.state.e.message || this.state.e))
      : this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary, null, html`<${App} />`)
);
