import * as React from 'react';
import { cn } from '@oichat/utils';

export interface AppTextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AppText = React.forwardRef<HTMLParagraphElement, AppTextProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn("text-base text-foreground", className)} {...props} />;
  }
);
AppText.displayName = 'AppText';
