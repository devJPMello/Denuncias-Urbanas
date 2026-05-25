interface BadgeProps {
  status: 'open' | 'analysis' | 'resolved';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ status, children, className = '' }: BadgeProps) {
  const statusColors = {
    open: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
    analysis: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
    resolved: 'bg-green-500 text-white shadow-lg shadow-green-500/30'
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold leading-normal sm:px-4 sm:py-2 sm:text-sm ${statusColors[status]} ${className}`}
    >
      {children}
    </span>
  );
}
