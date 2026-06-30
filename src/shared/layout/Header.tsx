'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import { useRealtimeCalculationStore } from '@/store/useRealtimeCalculationStore';

function getUserLabel(user: ReturnType<typeof useUserStore.getState>['user']) {
  if (user?.lastName && user?.firstName) {
    return `${user.lastName} ${user.firstName[0]}.`;
  }
  if (user?.firstName) {
    return user.firstName;
  }
  return user?.username || 'Пользователь';
}

function getUserInitials(user: ReturnType<typeof useUserStore.getState>['user']) {
  if (user?.lastName && user?.firstName) {
    return `${user.lastName[0]}${user.firstName[0]}`.toUpperCase();
  }
  if (user?.firstName) {
    return user.firstName.slice(0, 2).toUpperCase();
  }
  return user?.username?.slice(0, 2).toUpperCase() || '?';
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { taskNumber, client, reset: resetBktp } = useBktpStore();
  const router = useRouter();
  const { user } = useUserStore();
  const resetBmz = useBmzStore((s) => s.reset);
  const resetTransformer = useTransformerStore((s) => s.reset);
  const resetRusn = useRusnStore((s) => s.reset);
  const resetRunn = useRunnStore((s) => s.reset);
  const resetDgu = useDguStore((s) => s.reset);
  const resetAdditionalEquipment = useAdditionalEquipmentStore((s) => s.reset);
  const resetWorks = useWorksStore((s) => s.reset);
  const resetRealtimeCalculation = useRealtimeCalculationStore((s) => s.reset);

  const hasStarted = taskNumber.trim() !== '' || client.trim() !== '';
  const displayName = getUserLabel(user);
  const initials = getUserInitials(user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setMenuOpen(false);
    router.push('/');
  };

  const handleStartNewBktp = () => {
    resetBktp();
    resetBmz();
    resetTransformer();
    resetRusn();
    resetRunn();
    resetDgu();
    resetAdditionalEquipment();
    resetWorks();
    resetRealtimeCalculation();
    router.push('/dashboard/bktp');
    setMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: logo + primary action */}
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center transition-opacity hover:opacity-85"
          >
            <Image
              src="/login/logo.png"
              alt="AETZ"
              width={112}
              height={36}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <span className="hidden h-5 w-px bg-gray-200 sm:block" aria-hidden />

          <Link href={hasStarted ? '/dashboard/final' : '/dashboard/bktp'}>
            <span className="inline-flex items-center rounded-lg bg-[#8eba1e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7aa31a]">
              {hasStarted ? 'Текущая заявка' : 'Новая заявка'}
            </span>
          </Link>
        </div>

        {/* Right: nav + user */}
        <div className="flex items-center gap-2 sm:gap-4" ref={menuRef}>
          <Link
            href="/dashboard/requests"
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-[#8eba1e] md:inline-block"
          >
            Заявки
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1.5 transition-colors hover:border-[#8eba1e]/40 hover:bg-gray-50 sm:gap-2.5 sm:px-3"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8eba1e]/15 text-xs font-semibold text-[#6b8f16]">
                {initials}
              </span>
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-gray-800 sm:inline">
                {displayName}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                  {user?.email && (
                    <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                  )}
                </div>

                <ul className="py-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/dashboard/profile');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-[#8eba1e]/5 hover:text-[#8eba1e]"
                    >
                      Профиль
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleStartNewBktp}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-[#8eba1e]/5 hover:text-[#8eba1e]"
                    >
                      БКТП
                    </button>
                  </li>
                </ul>

                <div className="border-t border-gray-100 py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
