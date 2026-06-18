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
    icon: LucideIcon;
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
        type="button"
        onClick={onToggle}
        className={clsx(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150',
          isAnySubActive
            ? 'bg-[#8eba1e] text-white hover:bg-[#7aa31a]'
            : 'text-gray-700 hover:bg-[#8eba1e]/10 hover:text-[#6b8f16]'
        )}
      >
        <Icon
          className={clsx(
            'h-5 w-5 shrink-0 transition-colors duration-150',
            isAnySubActive ? 'text-white' : 'text-[#8eba1e] group-hover:text-[#7aa31a]'
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            <ChevronDown
              size={18}
              className={clsx(
                'shrink-0 transition-transform duration-200',
                isOpen && 'rotate-180',
                isAnySubActive ? 'text-white/90' : 'text-[#8eba1e] group-hover:text-[#7aa31a]'
              )}
            />
          </>
        )}
      </button>

      {isOpen && !collapsed && (
        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[#8eba1e]/20 py-1 pl-3">
          {item.submenu?.map((sub, subIndex) => {
            const isActive = pathname === sub.href;
            return (
              <Link
                key={subIndex}
                href={sub.href}
                className={clsx(
                  'block rounded-md px-3 py-2 text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-[#8eba1e] font-medium text-white hover:bg-[#7aa31a]'
                    : 'text-gray-600 hover:bg-[#8eba1e]/10 hover:text-[#6b8f16]'
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
