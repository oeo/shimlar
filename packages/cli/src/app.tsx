import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { MainMenu } from './components/views/MainMenu.js';
import { itemAffixes, version as dataVersion } from '@shimlar/data';

export type ViewType = 
  | 'main-menu'
  | 'character-creation'
  | 'combat'
  | 'inventory'
  | 'stash'
  | 'character-sheet'
  | 'settings';

export function App() {
  const [currentView, setCurrentView] = useState<ViewType>('main-menu');
  const { exit } = useApp();

  useInput((input, key) => {
    // global escape handler
    if (key.escape) {
      if (currentView === 'main-menu') {
        exit();
      } else {
        setCurrentView('main-menu');
      }
    }
  });

  const renderView = () => {
    switch (currentView) {
      case 'main-menu':
        return <MainMenu onNavigate={setCurrentView} />;
      default:
        return (
          <Box flexDirection="column">
            <Text>View not implemented: {currentView}</Text>
            <Text dimColor>Press ESC to return to main menu</Text>
          </Box>
        );
    }
  };

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {renderView()}
    </Box>
  );
}