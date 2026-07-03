interface Props {
  onCancel: () => void;
  onSave: () => void;
  onFinishEditing?: () => void;
  isSaveDisabled?: boolean;
  saveDisabledMessage?: string;
  isSaving?: boolean;
}

export default function CalculationEditActions({
  onCancel,
  onSave,
  onFinishEditing,
  isSaveDisabled,
  saveDisabledMessage,
  isSaving = false,
}: Props) {
  const isSaveBlocked = isSaveDisabled || isSaving;

  return (
    <div className="rounded-xl border border-[#8eba1e]/20 bg-white p-4 flex flex-wrap items-center justify-end gap-3">
      {isSaving && (
        <span className="text-xs text-[#5a7a12] mr-auto flex items-center gap-2">
          <svg
            className="w-4 h-4 animate-spin text-[#8eba1e]"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Сохранение калькуляции...
        </span>
      )}
      {!isSaving && isSaveDisabled && saveDisabledMessage && (
        <span className="text-xs text-red-500 mr-auto">{saveDisabledMessage}</span>
      )}
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Отмена
      </button>
      {onFinishEditing && (
        <button
          type="button"
          onClick={onFinishEditing}
          disabled={isSaving}
          className="px-5 py-2.5 bg-white text-[#8eba1e] border border-[#8eba1e]/40 rounded-lg hover:bg-[#8eba1e]/10 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Завершить редактирование
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaveBlocked}
        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
          isSaveBlocked
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#8eba1e] text-white hover:bg-[#7aa31a] shadow-sm'
        }`}
        title={isSaveDisabled ? saveDisabledMessage : 'Сохранить изменения'}
      >
        {isSaving && (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isSaving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}
