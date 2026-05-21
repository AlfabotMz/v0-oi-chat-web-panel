import * as React from 'react';
import { Text, TextProps } from 'react-native';

export interface AppTextProps extends TextProps {
  className?: string;
}

export const AppText = React.forwardRef<Text, AppTextProps>(
  ({ className, ...props }, ref) => {
    // Note: 'className' works out of the box because of NativeWind
    return <Text ref={ref} className={className} {...props} />;
  }
);
AppText.displayName = 'AppText';
