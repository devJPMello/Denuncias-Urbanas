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
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusColors[status]} ${className}`}>
      {children}
    </span>
  );
}
