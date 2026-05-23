import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  children,
  loading = false,
  disabled,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-xl hover:shadow-primary/30 shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-border',
    ghost: 'bg-transparent text-primary hover:bg-primary/10'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}
