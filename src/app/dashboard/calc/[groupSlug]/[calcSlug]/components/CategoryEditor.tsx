import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Category } from '../types';
import { MaterialSearch } from './MaterialSearch';

interface CategoryEditorProps {
  category: Category;
  categoryIndex: number;
  onUpdate: (category: Category) => void;
  onRemove: () => void;
}

export function CategoryEditor({ category, categoryIndex, onUpdate, onRemove }: CategoryEditorProps) {
  const addItem = () => {
    onUpdate({
      ...category,
      items: [
        ...category.items,
        {
          id: Date.now(),
          name: 'Новый материал',
          quantity: 1,
          price: 0,
          unit: 'шт'
        }
      ]
    });
  };

  const removeItem = (itemIndex: number) => {
    const newItems = [...category.items];
    newItems.splice(itemIndex, 1);
    onUpdate({
      ...category,
      items: newItems
    });
  };

  const updateItem = (itemIndex: number, field: string, value: any) => {
    const newItems = [...category.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      [field]: value
    };
    onUpdate({
      ...category,
      items: newItems
    });
  };

  return (
    <div className="mb-8 border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={category.name}
          onChange={(e) => onUpdate({ ...category, name: e.target.value })}
          className="text-xl font-semibold p-2 border rounded w-1/2"
        />
        <button
          onClick={onRemove}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <TrashIcon className="w-5 h-5" />
          Удалить категорию
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          Добавить материал
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Наименование</th>
            <th className="border p-2 text-left">Ед.</th>
            <th className="border p-2 text-right">Цена</th>
            <th className="border p-2 text-right">Кол-во</th>
            <th className="border p-2 text-right">Сумма</th>
            <th className="border p-2 text-center">Действия</th>
          </tr>
        </thead>
        <tbody>
          {category.items?.map((item, itemIndex) => (
            <tr key={itemIndex}>
              <td className="border p-2">
                <MaterialSearch
                  value={item.name}
                  onChange={(material) => {
                    if (material) {
                      updateItem(itemIndex, 'name', material.name);
                      updateItem(itemIndex, 'price', material.price);
                      updateItem(itemIndex, 'unit', material.unit);
                    }
                  }}
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateItem(itemIndex, 'unit', e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(itemIndex, 'price', Number(e.target.value))}
                  className="w-full p-1 border rounded text-right"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(itemIndex, 'quantity', Number(e.target.value))}
                  className="w-full p-1 border rounded text-right"
                />
              </td>
              <td className="border p-2 text-right">
                {(item.price * item.quantity).toLocaleString()}
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => removeItem(itemIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 