import React from 'react';
import { Box as InkBox, Text } from 'ink';

interface BoxProps {
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderStyle?: 'single' | 'double' | 'round' | 'bold';
}

export function Box({ title, children, width, height, borderStyle = 'single' }: BoxProps) {
  return (
    <InkBox
      borderStyle={borderStyle}
      width={width}
      height={height}
      flexDirection="column"
      paddingX={1}
    >
      {title && (
        <InkBox marginBottom={1}>
          <Text bold>{title}</Text>
        </InkBox>
      )}
      {children}
    </InkBox>
  );
}