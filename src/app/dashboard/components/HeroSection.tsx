'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useRoleCheck } from '@/hooks/useRoleCheck';

export default function HeroSection() {
  const { user } = useUserStore();
  const { isManagerUser } = useRoleCheck();

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.username || 'Пользователь';
  };

  const displayName = getUserDisplayName();
  const firstName = displayName.split(' ')[0];

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="border-b border-[#7aa31a]/40 bg-gradient-to-r from-[#7aa31a] to-[#8eba1e]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm capitalize text-white/75">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold text-white md:text-[1.65rem]">
            {isManagerUser ? `Здравствуйте, ${firstName}` : `Добро пожаловать, ${firstName}`}
          </h1>
          <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-white/90">
            {isManagerUser
              ? 'Каталог материалов, журнал изменений и контроль заявок'
              : 'Проектирование и расчёт электротехнического оборудования — БКТП, спецификации и коммерческие предложения'}
          </p>
        </div>

        {!isManagerUser && (
          <Link
            href="/dashboard/bktp"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-[15px] font-semibold text-[#7aa31a] shadow-sm transition-colors hover:bg-white/90"
          >
            + Новая заявка БКТП
          </Link>
        )}

        {isManagerUser && (
          <Link
            href="/dashboard/materials"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-white/20"
          >
            Открыть материалы
          </Link>
        )}
      </div>
    </div>
  );
}
