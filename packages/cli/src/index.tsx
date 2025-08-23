#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import { App } from './app.js';

// clear screen
console.clear();

// render the app
const { unmount } = render(<App />);

// cleanup on exit
process.on('SIGINT', () => {
  unmount();
  process.exit(0);
});

process.on('SIGTERM', () => {
  unmount();
  process.exit(0);
});