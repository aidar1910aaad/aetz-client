'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft } from 'lucide-react';
import { sidebarLinks } from './Sidebar/sidebarLinks';
import SidebarLink from './Sidebar/SidebarLink';
import SidebarGroup from './Sidebar/SidebarGroup';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={clsx(
        'bg-white shadow transition-all duration-300 flex flex-col justify-between h-[calc(100vh-64px)]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Навигация (прокручиваемая) */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {sidebarLinks.map((item, index) => {
          if (item.type === 'group') {
            return (
              <SidebarGroup
                key={index}
                item={item}
                collapsed={collapsed}
                isOpen={openGroups[item.label]}
                onToggle={() => toggleGroup(item.label)}
              />
            );
          }

          return (
            <SidebarLink
              key={index}
              href={item.href}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
            />
          );
        })}
      </div>

      {/* Кнопка свернуть/развернуть */}
      <div className="p-4 border-t">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          <ChevronLeft
            size={16}
            className={clsx('transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>
    </aside>
  );
}
