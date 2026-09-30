import React from 'react';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'PRESENT' | 'ABSENT' | 'LATE' | 'COMPLETED' | 'CANCELLED' | 'Good' | 'Low Attendance' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';

  if (['ACTIVE', 'PRESENT', 'COMPLETED', 'GOOD'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['ABSENT', 'CANCELLED', 'LOW ATTENDANCE', 'INACTIVE'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['LATE', 'PENDING', 'WARNING'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${styles} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
