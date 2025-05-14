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
} from 'lucide-react';

export const sidebarLinks = [
  {
    type: 'group',
    label: 'Основные модули',
    icon: Cpu,
    submenu: [
      { label: 'Трансформатор', href: '/dashboard/module1' },
      { label: 'Среднее напряжение', href: '/dashboard/module2' },
      { label: 'Низкое напряжение', href: '/dashboard/module2' },
      { label: 'БМЗ', href: '/dashboard/module2' },
      { label: 'Доп. оборудование', href: '/dashboard/module2' },
    ],
  },
  {
    type: 'link',
    label: 'Новая заявка',
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
    label: 'Форма заявки',
    icon: FileText,
    href: '/dashboard/form',
  },
  {
    type: 'link',
    label: 'Чек лист',
    icon: ClipboardList,
    href: '/dashboard/checklist',
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
];
