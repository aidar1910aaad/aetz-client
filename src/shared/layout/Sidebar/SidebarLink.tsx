'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import { useRealtimeCalculationStore } from '@/store/useRealtimeCalculationStore';

export default function SidebarLink({
  href,
  icon: Icon,
  label,
  collapsed,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const bktp = useBktpStore();
  const bmz = useBmzStore();
  const transformer = useTransformerStore();
  const rusn = useRusnStore();
  const runn = useRunnStore();
  const dgu = useDguStore();
  const additionalEquipment = useAdditionalEquipmentStore();
  const works = useWorksStore();
  const realtimeCalculation = useRealtimeCalculationStore();

  const handleClick = () => {
    if (label === 'Главная') {
      bktp.reset();
      bmz.reset();
      transformer.reset();
      rusn.reset();
      runn.reset();
      dgu.reset();
      additionalEquipment.reset();
      works.reset();
      realtimeCalculation.reset();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      title={collapsed ? label : undefined}
      className={clsx(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150',
        isActive
          ? 'bg-[#8eba1e] text-white hover:bg-[#7aa31a]'
          : 'text-gray-700 hover:bg-[#8eba1e]/10 hover:text-[#6b8f16]'
      )}
    >
      <Icon
        className={clsx(
          'h-5 w-5 shrink-0 transition-colors duration-150',
          isActive ? 'text-white' : 'text-[#8eba1e] group-hover:text-[#7aa31a]'
        )}
      />
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
}
