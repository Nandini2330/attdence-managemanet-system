import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'warning' | 'neutral';
  icon: LucideIcon;
  subtitle?: string;
  iconColor?: 'blue' | 'green' | 'amber' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  subtitle,
  iconColor = 'blue',
}) => {
  const iconColorStyles = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-100/80',
    green: 'bg-emerald-50 text-emerald-600 border border-emerald-100/80',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100/80',
    red: 'bg-rose-50 text-rose-600 border border-rose-100/80',
  }[iconColor];

  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    negative: 'bg-rose-50 text-rose-700 border border-rose-200/70',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/70',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200/70',
  }[changeType || 'neutral'];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-xs transition-shadow min-w-0 h-full">
      {/* Top Row: Full Title and Icon Box */}
      <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
        <h3 className="text-xs sm:text-[13px] font-semibold text-slate-700 leading-snug break-words min-w-0">
          {title}
        </h3>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColorStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Middle: Prominent Number (Stand alone, never squished) */}
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight my-1">
        {value}
      </div>

      {/* Bottom Row: Clear Context Pill & Subtitle */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-1 min-h-[22px] flex-wrap">
        {change && (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${badgeStyles}`}>
            {change}
          </span>
        )}
        {subtitle && (
          <span className="truncate text-slate-500 text-[11px]" title={subtitle}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
