'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBktpStore } from '@/store/useBktpStore';
import { showToast } from '@/shared/modals/ToastProvider';

const steps = [
  { label: 'Заявка', href: '/dashboard/bktp' },
  { label: 'БМЗ', href: '/dashboard/bktp/bmz' },
  { label: 'Трансформатор', href: '/dashboard/bktp/transformers' },
  { label: 'РУСН', href: '/dashboard/bktp/rusn' },
  { label: 'РУНН', href: '/dashboard/bktp/runn' },
  { label: 'Доп Оборудование', href: '/dashboard/bktp/additional-equipment' },
  { label: 'Работы', href: '/dashboard/bktp/work' },
  { label: 'Текущая заявка', href: '/dashboard/final' },
];

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { taskNumber, client, date, time } = useBktpStore();

  const isAllowedToNavigate = !!taskNumber && !!client && !!date && !!time;

  return (
    <nav className="mb-6">
      <ul className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
        {steps.map((step, idx) => {
          const isActive = pathname === step.href;
          const isFirst = step.href === '/dashboard/bktp';
          const isDisabled = !isAllowedToNavigate && !isFirst;

          return (
            <li key={step.href} className="flex items-center">
              {idx > 0 && <span className="mx-1 text-xs text-gray-400">›</span>}

              {isDisabled ? (
                <button
                  onClick={() =>
                    showToast('Заполните заявку перед переходом к следующему этапу', 'error')
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
                      ? 'bg-[#3A55DF]/10 text-[#3A55DF] font-medium'
                      : 'hover:bg-gray-100 hover:text-[#3A55DF]'
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
