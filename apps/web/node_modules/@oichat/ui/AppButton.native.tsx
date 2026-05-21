import * as React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';

export interface AppButtonProps extends TouchableOpacityProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const AppButton = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, AppButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    // Basic nativewind mapping for AppButton
    let bgClass = "bg-primary";
    if (variant === 'outline') bgClass = "bg-transparent border border-input";
    if (variant === 'ghost') bgClass = "bg-transparent";

    return (
      <TouchableOpacity
        ref={ref}
        className={`flex-row items-center justify-center rounded-md px-4 py-2 ${bgClass} ${className || ''}`}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text className="text-primary-foreground font-medium text-sm">{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);
AppButton.displayName = "AppButton";
