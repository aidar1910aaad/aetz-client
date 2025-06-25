interface RusnPresenceSelectorProps {
  skip: boolean;
  onSkipChange: (skip: boolean) => void;
  onShowCellsChange: (show: boolean) => void;
}

export const RusnPresenceSelector = ({
  skip,
  onSkipChange,
  onShowCellsChange,
}: RusnPresenceSelectorProps) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">Будет ли РУСН?</p>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => {
            onSkipChange(false);
            onShowCellsChange(true);
          }}
          className={`px-4 py-2 rounded text-sm font-medium border ${
            !skip
              ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
        >
          Да
        </button>
        <button
          onClick={() => {
            onSkipChange(true);
            onShowCellsChange(false);
          }}
          className={`px-4 py-2 rounded text-sm font-medium border ${
            skip
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
        >
          Нет
        </button>
      </div>
    </div>
  );
};
