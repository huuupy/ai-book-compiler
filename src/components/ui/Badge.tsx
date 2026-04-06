'use client';

import { cn } from '@/lib/utils';
import { statusColors, statusIcons } from '@/lib/utils';
import type { ArticleStatus } from '@/types';
import { Clock, Loader2, CheckCircle2, XCircle, Play } from 'lucide-react';

interface BadgeProps {
  status: ArticleStatus;
  className?: string;
}

const iconMap = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

const labelMap = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
};

export function StatusBadge({ status, className }: BadgeProps) {
  const Icon = iconMap[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        statusColors[status],
        className
      )}
    >
      <Icon className={cn('w-3 h-3', status === 'processing' && 'animate-spin')} />
      {labelMap[status]}
    </span>
  );
}

// 任务状态指示器
interface TaskProgressProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  label?: string;
}

export function TaskProgress({ status, progress, label }: TaskProgressProps) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{label}</span>
          <span className="text-slate-900 font-medium">{progress}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            status === 'completed' ? 'bg-green-500' :
            status === 'failed' ? 'bg-red-500' :
            status === 'running' ? 'bg-primary' : 'bg-slate-400'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// 状态图标
export function StatusIcon({ status, className }: { status: string; className?: string }) {
  const icons: Record<string, typeof Play> = {
    pending: Clock,
    processing: Loader2,
    completed: CheckCircle2,
    failed: XCircle,
    running: Play,
  };
  const Icon = icons[status] || Clock;
  return <Icon className={cn('w-5 h-5', status === 'processing' && 'animate-spin', className)} />;
}
