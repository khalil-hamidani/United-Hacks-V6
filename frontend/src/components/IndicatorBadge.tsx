import { indicatorColors } from '../types';

interface IndicatorBadgeProps {
  level: number;
  label: string;
  size?: 'sm' | 'md';
}

export function IndicatorBadge({ level, label, size = 'md' }: IndicatorBadgeProps) {
  const color = indicatorColors[level] || '#6b7280';
  
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <div 
        className="w-2 h-2 rounded-full animate-breathe"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
      />
      <span className="text-slate-300">{label}</span>
    </div>
  );
}
