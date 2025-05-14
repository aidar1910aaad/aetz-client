'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

export default function SidebarGroup({
  item,
  collapsed,
  isOpen,
  onToggle,
}: {
  item: {
    label: string;
    icon: LucideIcon; // теперь это компонент, а не строка
    submenu?: { label: string; href: string }[];
  };
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const isAnySubActive = item.submenu?.some((sub) => pathname === sub.href);

  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={onToggle}
        className={clsx(
          'flex items-center w-full gap-2 hover:bg-gray-100 rounded px-2 py-2 transition',
          isAnySubActive && 'bg-blue-100 text-blue-700 font-medium'
        )}
      >
        <Icon className="w-5 h-5 text-[#3A55DF] " />
        {!collapsed && <span className="flex-1  text-left">{item.label}</span>}
        {!collapsed && (
          <ChevronDown size={20} className={clsx('transition-transform', isOpen && 'rotate-180')} />
        )}
      </button>

      {isOpen && !collapsed && (
        <div className="ml-6 mt-2 space-y-2">
          {item.submenu?.map((sub, subIndex) => {
            const isActive = pathname === sub.href;
            return (
              <Link
                key={subIndex}
                href={sub.href}
                className={clsx(
                  'block text-sm px-2 py-1 rounded hover:underline',
                  isActive && 'bg-blue-50 text-blue-700 font-medium'
                )}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
