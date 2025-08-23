import { test, expect } from 'bun:test';
import React from 'react';
import { render } from 'ink-testing-library';
import { MainMenu } from '../../src/components/views/MainMenu';

test('MainMenu renders correctly', () => {
  const mockNavigate = () => {};
  const { lastFrame } = render(<MainMenu onNavigate={mockNavigate} />);
  
  expect(lastFrame()).toContain('S H I M L A R');
  expect(lastFrame()).toContain('New Character');
  expect(lastFrame()).toContain('Continue');
  expect(lastFrame()).toContain('Inventory');
  expect(lastFrame()).toContain('Settings');
  expect(lastFrame()).toContain('Quit');
});