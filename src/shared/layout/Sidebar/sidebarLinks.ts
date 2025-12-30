import {
  Cpu,
  FileText,
  ClipboardList,
  History,
  Users,
  Layers,
  Boxes,
  PackagePlus,
  Calculator,
  DollarSign,
  Settings,
  FileDiff,
} from 'lucide-react';

export const sidebarLinks = [
 
  {
    type: 'link',
    label: 'Главная',
    icon: PackagePlus,
    href: '/dashboard',
  },
  {
    type: 'link',
    label: 'Пользователи',
    icon: Users,
    href: '/dashboard/users',
  },
  {
    type: 'link',
    label: 'Материалы',
    icon: Boxes,
    href: '/dashboard/materials',
  },
  {
    type: 'link',
    label: 'Категории',
    icon: Layers,
    href: '/dashboard/materials/categories',
  },
  {
    type: 'link',
    label: 'История заявок',
    icon: History,
    href: '/dashboard/requests',
  },
  {
    type: 'link',
    label: 'Расчёты стоимости',
    icon: Calculator,
    href: '/dashboard/calc',
  },
  {
    type: 'link',
    label: 'Курсы валют',
    icon: DollarSign,
    href: '/dashboard/currency',
  },
  {
    type: 'link',
    label: 'Настройки БКТП',
    icon: Settings,
    href: '/dashboard/bktp/settings',
  },
  {
    type: 'link',
    label: 'История изменений',
    icon: FileDiff,
    href: '/dashboard/history',
  },
];
