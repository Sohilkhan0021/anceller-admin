import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define input size variants
const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-surface-1 text-sm transition-colors placeholder:text-muted-foreground hover:border-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-8 px-2 py-1',
        lg: 'h-11 px-4 py-3'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, // Omit native `size`
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input type={type} className={cn(inputVariants({ size }), className)} ref={ref} {...props} />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
