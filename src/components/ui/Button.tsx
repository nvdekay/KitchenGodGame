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
  /** Shows an inline spinner and disables the button. */
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-brand-fg hover:opacity-90',
  secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
  ghost: 'bg-transparent hover:bg-black/5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
        'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
