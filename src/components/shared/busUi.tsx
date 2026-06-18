import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const BUS_ACCENT = '#8eba1e';
export const BUS_ACCENT_HOVER = '#7aa31a';

interface BusSectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export function BusSectionHeader({ title, subtitle, badge, icon }: BusSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: BUS_ACCENT }}
        >
          {icon ?? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {badge}
        </span>
      )}
    </div>
  );
}

interface BusCardProps {
  children: React.ReactNode;
  className?: string;
}

export function BusCard({ children, className = '' }: BusCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface BusMaterialToggleProps {
  label?: string;
  value: string | null;
  options: { id: string; label: string; hint?: string }[];
  onChange: (id: string) => void;
}

export function BusMaterialToggle({
  label = 'Материал шины',
  value,
  options,
  onChange,
}: BusMaterialToggleProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                selected
                  ? 'border-[#8eba1e] bg-[#8eba1e]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-[#8eba1e] bg-[#8eba1e]' : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className={`font-medium ${selected ? 'text-gray-900' : 'text-gray-600'}`}>
                  {opt.label}
                </span>
              </div>
              {opt.hint && (
                <p className="mt-1 pl-6 text-xs text-gray-500">{opt.hint}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BusAlertProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
}

const alertStyles = {
  info: {
    box: 'border-gray-200 bg-gray-50',
    icon: 'text-gray-500',
    title: 'text-gray-800',
    body: 'text-gray-600',
    Icon: Info,
  },
  warning: {
    box: 'border-amber-200 bg-amber-50',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    body: 'text-amber-800',
    Icon: AlertCircle,
  },
  error: {
    box: 'border-red-200 bg-red-50',
    icon: 'text-red-600',
    title: 'text-red-900',
    body: 'text-red-700',
    Icon: AlertCircle,
  },
  success: {
    box: 'border-[#8eba1e]/30 bg-[#8eba1e]/5',
    icon: 'text-[#8eba1e]',
    title: 'text-gray-900',
    body: 'text-gray-600',
    Icon: CheckCircle2,
  },
};

export function BusAlert({ variant, title, children }: BusAlertProps) {
  const s = alertStyles[variant];
  const Icon = s.Icon;
  return (
    <div className={`flex gap-3 rounded-xl border p-4 ${s.box}`}>
      <Icon className={`h-5 w-5 shrink-0 ${s.icon}`} />
      <div className="min-w-0">
        {title && <p className={`text-sm font-medium ${s.title}`}>{title}</p>}
        <div className={`text-sm ${title ? 'mt-1' : ''} ${s.body}`}>{children}</div>
      </div>
    </div>
  );
}

interface BusEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function BusEmptyState({ title, description, action }: BusEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface BusAccentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
}

export function BusAccentButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: BusAccentButtonProps) {
  const base =
    variant === 'primary'
      ? 'bg-[#8eba1e] text-white hover:bg-[#7aa31a] shadow-sm'
      : 'border border-gray-200 bg-white text-gray-700 hover:border-[#8eba1e]/40 hover:bg-[#8eba1e]/5';
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
