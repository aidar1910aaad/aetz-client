'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';

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

  const handleClick = () => {
    if (label === 'Новая заявка') {
      bktp.reset();
      bmz.reset();
      transformer.reset();
      rusn.reset();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={clsx(
        'flex items-center gap-2 rounded px-2 py-2 transition',
        'hover:bg-gray-100',
        isActive && 'bg-blue-100 text-blue-700 font-medium'
      )}
    >
      <Icon className="w-5 h-5 text-[#3A55DF]" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
