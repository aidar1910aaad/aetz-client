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
          'flex items-center w-full gap-3 rounded-xl px-3 py-3 transition-all duration-200 group',
          'hover:bg-gray-100 hover:shadow-md hover:scale-[1.02]',
          isAnySubActive && !collapsed && 'bg-[#8eba1e] text-white shadow-lg',
          isAnySubActive && collapsed && 'bg-gray-100 shadow-md'
        )}
      >
        {collapsed && isAnySubActive ? (
          <Icon className="w-5 h-5 text-[#8eba1e]" />
        ) : (
          <div className={clsx(
            'p-2 rounded-lg transition-all duration-200',
            !collapsed && isAnySubActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#8eba1e]'
          )}>
            <Icon className={clsx(
              'w-5 h-5 transition-colors duration-200',
              !collapsed && isAnySubActive ? 'text-white' : 'text-[#8eba1e] group-hover:text-white'
            )} />
          </div>
        )}
        {!collapsed && (
          <>
            <span className={clsx(
              'flex-1 text-left font-medium transition-colors duration-200',
              isAnySubActive ? 'text-white' : 'text-gray-700 group-hover:text-[#8eba1e]'
            )}>
              {item.label}
            </span>
            <ChevronDown 
              size={18} 
              className={clsx(
                'transition-all duration-300',
                isOpen && 'rotate-180',
                isAnySubActive ? 'text-white' : 'text-[#8eba1e] group-hover:text-white'
              )} 
            />
          </>
        )}
      </button>

      {isOpen && !collapsed && (
        <div className="ml-8 mt-3 space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
          {item.submenu?.map((sub, subIndex) => {
            const isActive = pathname === sub.href;
            return (
              <Link
                key={subIndex}
                href={sub.href}
                className={clsx(
                  'block text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-sm',
                  isActive && 'bg-[#8eba1e] text-white shadow-md font-medium'
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
