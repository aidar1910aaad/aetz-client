interface Props {
  onCancel: () => void;
  onSave: () => void;
}

export default function CalculationEditActions({ onCancel, onSave }: Props) {
  return (
    <div className="flex justify-end space-x-4 mt-8">
      <button
        onClick={onCancel}
        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
      >
        Отмена
      </button>
      <button
        onClick={onSave}
        className="px-6 py-2 bg-[#3A55DF] text-white rounded-lg hover:bg-[#2A45CF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A55DF] transition-colors"
      >
        Сохранить
      </button>
    </div>
  );
}
