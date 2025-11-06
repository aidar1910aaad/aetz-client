'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, Menu } from 'lucide-react';
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
        'bg-white shadow-xl transition-all duration-300 flex flex-col justify-between h-[calc(100vh-64px)] border-r border-gray-200',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8eba1e] rounded-lg flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">Меню</h2>
              <p className="text-xs text-gray-600">Навигация</p>
            </div>
          )}
        </div>
      </div>

      {/* Навигация (прокручиваемая) */}
      <div className="p-4 space-y-2 overflow-y-auto flex-1">
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
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center px-3 py-3 bg-[#8eba1e] hover:bg-[#7aa31a] text-white rounded-xl transition-all duration-200 hover:shadow-lg"
        >
          <ChevronLeft
            size={18}
            className={clsx('transition-transform duration-300', collapsed && 'rotate-180')}
          />
          {!collapsed && (
            <span className="ml-2 text-sm font-medium">
              {collapsed ? 'Развернуть' : 'Свернуть'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
