interface Props {
  onCancel: () => void;
  onSave: () => void;
  onFinishEditing?: () => void; // Новая опция для завершения редактирования
  isSaveDisabled?: boolean; // Флаг для отключения кнопки сохранения
  saveDisabledMessage?: string; // Сообщение о причине отключения
}

export default function CalculationEditActions({ onCancel, onSave, onFinishEditing, isSaveDisabled, saveDisabledMessage }: Props) {
  return (
    <div className="flex justify-end space-x-4 mt-8">
      <button
        onClick={onCancel}
        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
      >
        Отмена
      </button>
      {onFinishEditing && (
        <button
          onClick={onFinishEditing}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Завершить редактирование
        </button>
      )}
      <button
        onClick={onSave}
        disabled={isSaveDisabled}
        className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
          isSaveDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#3A55DF] text-white hover:bg-[#2A45CF] focus:ring-[#3A55DF]'
        }`}
        title={isSaveDisabled ? saveDisabledMessage : 'Сохранить изменения'}
      >
        Сохранить
      </button>
      
      {/* Показываем сообщение о причине отключения кнопки */}
      {isSaveDisabled && saveDisabledMessage && (
        <div className="absolute -top-8 right-0 text-sm text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
          {saveDisabledMessage}
        </div>
      )}
    </div>
  );
}
