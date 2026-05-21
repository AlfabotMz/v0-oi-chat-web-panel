import * as React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export interface AppInputProps extends TextInputProps {
  className?: string;
}

export const AppInput = React.forwardRef<React.ElementRef<typeof TextInput>, AppInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={`h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ${className || ''}`}
        placeholderTextColor="#a1a1aa"
        {...props}
      />
    )
  }
);
AppInput.displayName = "AppInput";
