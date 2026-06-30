'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBktpStore } from '@/store/useBktpStore';
import { showToast } from '@/shared/modals/ToastProvider';

const steps = [
  { label: 'Заявка', href: '/dashboard/bktp' },
  { label: 'Здание подстанции', href: '/dashboard/bktp/bmz' },
  { label: 'Трансформатор', href: '/dashboard/bktp/transformers' },
  { label: 'РУСН', href: '/dashboard/bktp/rusn' },
  { label: 'РУНН', href: '/dashboard/bktp/runn' },
  { label: 'Доп Оборудование', href: '/dashboard/bktp/additional-equipment' },
  { label: 'Работы', href: '/dashboard/bktp/work' },
  { label: 'Текущая заявка', href: '/dashboard/final' },
];

const BKTP_ROOT = '/dashboard/bktp';

function isStepActive(pathname: string, href: string) {
  if (href === BKTP_ROOT) return pathname === BKTP_ROOT;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getCurrentStepIndex(pathname: string) {
  const index = steps.findIndex((step) => isStepActive(pathname, step.href));
  return index === -1 ? 0 : index;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const furthestStepIndex = useBktpStore((s) => s.furthestStepIndex);
  const markStepReached = useBktpStore((s) => s.markStepReached);

  useEffect(() => {
    markStepReached(getCurrentStepIndex(pathname));
  }, [pathname, markStepReached]);

  return (
    <nav className="mb-6">
      <ul className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
        {steps.map((step, idx) => {
          const isActive = isStepActive(pathname, step.href);
          const isDisabled = idx > furthestStepIndex;

          return (
            <li key={step.href} className="flex items-center">
              {idx > 0 && <span className="mx-1 text-xs text-gray-400">›</span>}

              {isDisabled ? (
                <button
                  type="button"
                  onClick={() =>
                    showToast('Сначала пройдите предыдущие этапы кнопкой «Далее»', 'error')
                  }
                  className="px-2 py-1 rounded-md text-gray-400 cursor-not-allowed"
                >
                  {step.label}
                </button>
              ) : (
                <Link
                  href={step.href}
                  className={`px-2 py-1 rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium'
                      : 'hover:bg-gray-100 hover:text-[#8eba1e]'
                  }`}
                >
                  {step.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
