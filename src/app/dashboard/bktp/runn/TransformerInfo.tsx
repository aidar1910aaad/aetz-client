import { useTransformerStore } from '@/store/useTransformerStore';

export default function TransformerInfo() {
  const { selectedTransformer } = useTransformerStore();

  if (!selectedTransformer) {
    return <div className="text-gray-500 italic">Трансформатор не выбран</div>;
  }

  return (
    <div className="p-4 bg-white rounded-xl border shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-2">Выбранный трансформатор</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Модель:</span> {selectedTransformer.model}
        </div>
        <div>
          <span className="font-medium text-gray-700">Тип:</span> {selectedTransformer.type}
        </div>
        <div>
          <span className="font-medium text-gray-700">Мощность (кВА):</span>{' '}
          {selectedTransformer.power}
        </div>
        <div>
          <span className="font-medium text-gray-700">Напряжение (кВ):</span>{' '}
          {selectedTransformer.voltage}
        </div>
        <div>
          <span className="font-medium text-gray-700">Производитель:</span>{' '}
          {selectedTransformer.manufacturer}
        </div>
        <div>
          <span className="font-medium text-gray-700">Цена за 1 шт:</span>{' '}
          {selectedTransformer.price?.toLocaleString()} ₸
        </div>
        <div>
          <span className="font-medium text-gray-700">Количество:</span>{' '}
          {selectedTransformer.quantity}
        </div>
      </div>
    </div>
  );
}
