import type { WorkItem } from '@/store/useWorksStore';

export const defaultWorksList: WorkItem[] = [
  {
    name: 'Монтаж БМЗ',
    price: 150000,
    unit: 'компл.',
    category: 'Монтаж',
  },
  {
    name: 'Монтаж трансформатора',
    price: 80000,
    unit: 'шт',
    category: 'Монтаж',
  },
  {
    name: 'Монтаж РУСН',
    price: 200000,
    unit: 'компл.',
    category: 'Монтаж',
  },
  {
    name: 'Прокладка кабелей',
    price: 500,
    unit: 'м',
    category: 'Кабельные работы',
  },
  {
    name: 'Подключение и наладка',
    price: 100000,
    unit: 'компл.',
    category: 'Наладка',
  },
  {
    name: 'Транспортные расходы',
    price: 50000,
    unit: 'рейс',
    category: 'Транспорт',
  },
  {
    name: 'Доставка материалов',
    price: 30000,
    unit: 'рейс',
    category: 'Транспорт',
  },
  {
    name: 'Строительно-монтажные работы',
    price: 120000,
    unit: 'компл.',
    category: 'СМР',
  },
  {
    name: 'Пусконаладочные работы',
    price: 80000,
    unit: 'компл.',
    category: 'ПНР',
  },
  {
    name: 'Гарантийное обслуживание',
    price: 60000,
    unit: 'год',
    category: 'Гарантия',
  },
];

// Функция для инициализации работ в сторе
export const initializeWorks = () => {
  return defaultWorksList;
};