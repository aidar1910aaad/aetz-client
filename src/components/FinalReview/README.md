# Универсальная система таблиц

## Обзор

Универсальная система таблиц позволяет создавать однотипные таблицы для отображения данных без написания отдельных компонентов для каждого типа данных.

## Основные компоненты

### UniversalTable
Основной компонент для отображения таблиц с данными.

```tsx
import UniversalTable from '@/components/FinalReview/UniversalTable';
import { someTableConfig } from '@/components/FinalReview/tableConfigs';

<UniversalTable 
  config={someTableConfig}
  data={yourData}
  additionalData={optionalAdditionalData}
/>
```

### TableConfig
Конфигурация определяет структуру и поведение таблицы:

```typescript
interface TableConfig {
  id: string;                    // Уникальный идентификатор
  title: string;                 // Заголовок секции
  columns: TableColumn[];        // Определение колонок
  dataMapper: (data: any, additionalData?: any) => TableRow[]; // Функция преобразования данных
  emptyMessage: string;          // Сообщение при отсутствии данных
  showTotal?: boolean;           // Показывать ли итоговую строку
  totalFormatter?: (rows: TableRow[]) => number; // Кастомная функция подсчета итогов
}
```

## Готовые конфигурации

### БМЗ (Блочно-модульное здание)
```tsx
import { bmzTableConfig, emptyBmzTableConfig } from '@/components/FinalReview/tableConfigs';

// Для БМЗ с данными
<UniversalTable config={bmzTableConfig} data={bmzStore} />

// Для пустого БМЗ
<UniversalTable config={emptyBmzTableConfig} data={bmzStore} />
```

### Трансформатор
```tsx
import { transformerTableConfig } from '@/components/FinalReview/tableConfigs';

<UniversalTable config={transformerTableConfig} data={selectedTransformer} />
```

### Дополнительное оборудование
```tsx
import { additionalEquipmentTableConfig } from '@/components/FinalReview/tableConfigs';

<UniversalTable 
  config={additionalEquipmentTableConfig} 
  data={{ selected: selectedEquipment, equipmentList }} 
/>
```

### Работы и транспортные расходы
```tsx
import { worksTableConfig } from '@/components/FinalReview/tableConfigs';

<UniversalTable 
  config={worksTableConfig} 
  data={{ selected: selectedWorks, worksList }} 
/>
```

### РУСН
```tsx
import { rusnTableConfig } from '@/components/FinalReview/tableConfigs';

<UniversalTable config={rusnTableConfig} data={rusnStore} />
```

## Создание новой конфигурации

### 1. Определите структуру данных
```typescript
interface MyData {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}
```

### 2. Создайте конфигурацию
```typescript
export const myTableConfig: TableConfig = {
  id: 'my-section',
  title: 'Моя секция',
  columns: [
    {
      key: 'name',
      title: 'Наименование',
      width: 'w-2/5',
      align: 'left',
    },
    {
      key: 'unit',
      title: 'Ед. изм.',
      width: 'w-20',
      align: 'center',
    },
    {
      key: 'quantity',
      title: 'Кол-во',
      width: 'w-20',
      align: 'center',
    },
    {
      key: 'price',
      title: 'Цена',
      width: 'w-32',
      align: 'center',
      formatter: (value) => value ? value.toLocaleString('ru-RU') + ' ₸' : '—',
    },
    {
      key: 'total',
      title: 'Сумма',
      width: 'w-32',
      align: 'center',
      formatter: (value, row) => {
        const total = (row.price || 0) * (row.quantity || 1);
        return total.toLocaleString('ru-RU') + ' ₸';
      },
    },
  ],
  dataMapper: (data: MyData[]) => {
    return data.map((item, idx) => ({
      id: `item-${idx}`,
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }));
  },
  emptyMessage: 'Данные не найдены',
  showTotal: true,
};
```

### 3. Используйте в компоненте
```tsx
import UniversalTable from '@/components/FinalReview/UniversalTable';
import { myTableConfig } from './myTableConfig';

export default function MyComponent({ data }: { data: MyData[] }) {
  return (
    <UniversalTable 
      config={myTableConfig}
      data={data}
    />
  );
}
```

## Кастомизация

### Форматирование колонок
```typescript
{
  key: 'price',
  title: 'Цена',
  formatter: (value, row) => {
    // Кастомная логика форматирования
    return value ? `$${value.toFixed(2)}` : 'N/A';
  },
}
```

### Кастомный подсчет итогов
```typescript
{
  showTotal: true,
  totalFormatter: (rows) => {
    // Кастомная логика подсчета
    return rows.reduce((sum, row) => sum + (row.price * row.quantity), 0);
  },
}
```

### Дополнительные данные
```tsx
<UniversalTable 
  config={config}
  data={mainData}
  additionalData={additionalData} // Передается в dataMapper как второй параметр
/>
```

## Преимущества

1. **DRY принцип** - один компонент для всех таблиц
2. **Легкость добавления** новых секций - только конфигурация
3. **Единообразие** - все таблицы выглядят одинаково
4. **Гибкость** - можно настроить любые колонки и логику
5. **Переиспользование** - компонент можно использовать в других местах
6. **Типобезопасность** - полная поддержка TypeScript

## Примеры использования

Смотрите файл `exampleNewSection.tsx` для примера создания новой секции с материалами.