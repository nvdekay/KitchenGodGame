import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/**
 * Generic, design-system button. Lives in components/ui because it is
 * feature-agnostic and reused everywhere. Feature-specific buttons stay in their
 * feature folder.
 */
type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-brand-fg hover:opacity-90',
  secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
  ghost: 'bg-transparent hover:bg-black/5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
