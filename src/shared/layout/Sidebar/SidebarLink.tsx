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
    if (label === 'Главная') {
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
        'flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 group',
        'hover:bg-gray-100 hover:shadow-md hover:scale-[1.02]',
        isActive && !collapsed && 'bg-[#8eba1e] text-white shadow-lg',
        isActive && collapsed && 'bg-gray-100 shadow-md'
      )}
    >
      {collapsed && isActive ? (
        <Icon className="w-5 h-5 text-[#8eba1e]" />
      ) : (
        <div className={clsx(
          'p-2 rounded-lg transition-all duration-200',
          !collapsed && isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#8eba1e]'
        )}>
          <Icon className={clsx(
            'w-5 h-5 transition-colors duration-200',
            !collapsed && isActive ? 'text-white' : 'text-[#8eba1e] group-hover:text-white'
          )} />
        </div>
      )}
      {!collapsed && (
        <span className={clsx(
          'font-medium transition-colors duration-200',
          isActive ? 'text-white' : 'text-gray-700 group-hover:text-[#8eba1e]'
        )}>
          {label}
        </span>
      )}
    </Link>
  );
}
