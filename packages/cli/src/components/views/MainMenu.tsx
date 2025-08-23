import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ViewType } from '../../app.js';

interface MainMenuProps {
  onNavigate: (view: ViewType) => void;
}

interface MenuOption {
  key: string;
  label: string;
  description: string;
  action: () => void;
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuOptions: MenuOption[] = [
    {
      key: 'n',
      label: 'New Character',
      description: 'Create a new exile',
      action: () => onNavigate('character-creation')
    },
    {
      key: 'c',
      label: 'Continue',
      description: 'Load existing character',
      action: () => onNavigate('combat')
    },
    {
      key: 'i',
      label: 'Inventory',
      description: 'View inventory (test)',
      action: () => onNavigate('inventory')
    },
    {
      key: 's',
      label: 'Settings',
      description: 'Configuration',
      action: () => onNavigate('settings')
    },
    {
      key: 'q',
      label: 'Quit',
      description: 'Exit to terminal',
      action: () => process.exit(0)
    }
  ];

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev - 1 + menuOptions.length) % menuOptions.length);
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev + 1) % menuOptions.length);
    } else if (key.return) {
      menuOptions[selectedIndex].action();
    } else {
      // handle hotkeys
      const option = menuOptions.find(opt => opt.key === input.toLowerCase());
      if (option) {
        option.action();
      }
    }
  });

  return (
    <Box flexDirection="column" borderStyle="double" paddingX={2} paddingY={1}>
      <Box marginBottom={1} justifyContent="center">
        <Text bold color="yellow">S H I M L A R</Text>
      </Box>
      <Box marginBottom={1} justifyContent="center">
        <Text dimColor>[REALM OF ENDLESS NIGHT]</Text>
      </Box>
      
      <Box flexDirection="column" marginTop={1}>
        {menuOptions.map((option, index) => (
          <Box key={option.key} marginY={0}>
            <Box width={3}>
              <Text color="cyan">[{option.key.toUpperCase()}]</Text>
            </Box>
            <Box width={20}>
              <Text
                color={selectedIndex === index ? 'yellow' : 'white'}
                bold={selectedIndex === index}
              >
                {selectedIndex === index ? '► ' : '  '}
                {option.label}
              </Text>
            </Box>
            <Text dimColor>{option.description}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text dimColor>Latest News: Terminal ARPG prototype initialized!</Text>
        <Text dimColor>Online: 1 exile testing</Text>
      </Box>
    </Box>
  );
}