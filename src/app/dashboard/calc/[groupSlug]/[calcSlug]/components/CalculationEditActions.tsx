interface Props {
  onCancel: () => void;
  onSave: () => void;
  onFinishEditing?: () => void; // Новая опция для завершения редактирования
  isSaveDisabled?: boolean; // Флаг для отключения кнопки сохранения
  saveDisabledMessage?: string; // Сообщение о причине отключения
}

export default function CalculationEditActions({ onCancel, onSave, onFinishEditing, isSaveDisabled, saveDisabledMessage }: Props) {
  return (
    <div className="rounded-xl border border-[#8eba1e]/20 bg-white p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Действия</h4>
      <button
        onClick={onCancel}
        className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors"
      >
        Отмена
      </button>
      {onFinishEditing && (
        <button
          onClick={onFinishEditing}
          className="w-full px-4 py-2.5 bg-white text-[#8eba1e] border border-[#8eba1e]/40 rounded-lg hover:bg-[#8eba1e]/10 focus:outline-none transition-colors"
        >
          Завершить редактирование
        </button>
      )}
      <button
        onClick={onSave}
        disabled={isSaveDisabled}
        className={`w-full px-4 py-2.5 rounded-lg focus:outline-none transition-colors ${
          isSaveDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#8eba1e] text-white hover:bg-[#7aa31a]'
        }`}
        title={isSaveDisabled ? saveDisabledMessage : 'Сохранить изменения'}
      >
        Сохранить
      </button>
      
      {/* Показываем сообщение о причине отключения кнопки */}
      {isSaveDisabled && saveDisabledMessage && (
        <div className="text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded border border-red-200">
          {saveDisabledMessage}
        </div>
      )}
    </div>
  );
}
