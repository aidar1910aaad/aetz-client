import { useBmzStore } from '@/store/useBmzStore';

const BmzForm = () => {
  const bmz = useBmzStore();

  const isFormValid = () => {
    return (
      bmz.length > 0 && bmz.width > 0 && bmz.height > 0 && bmz.thickness > 0 && bmz.blockCount > 0
    );
  };

  // Получаем доступные толщины стен из настроек
  const availableThicknesses = bmz.settings?.areaPriceRanges
    ? [...new Set(bmz.settings.areaPriceRanges.map((range) => range.minWallThickness))]
    : [50, 80, 100];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Длина (м)</label>
          <input
            type="number"
            value={bmz.length}
            onChange={(e) => bmz.setLength(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ширина (м)</label>
          <input
            type="number"
            value={bmz.width}
            onChange={(e) => bmz.setWidth(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Высота (мм)</label>
        <select
          value={bmz.height}
          onChange={(e) => bmz.setHeight(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={2700}>2700</option>
          <option value={3150}>3150</option>
          <option value="other">Указать другую</option>
        </select>
        {bmz.height === 0 && (
          <input
            type="number"
            placeholder="Введите высоту"
            onChange={(e) => bmz.setHeight(Number(e.target.value))}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Толщина (мм)</label>
        <select
          value={bmz.thickness}
          onChange={(e) => bmz.setThickness(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {availableThicknesses.map((thickness) => (
            <option key={thickness} value={thickness}>
              {thickness}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Количество блоков</label>
        <select
          value={bmz.blockCount}
          onChange={(e) => bmz.setBlockCount(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={0}>Выберите</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Дополнительное оборудование</h3>
        <div className="grid grid-cols-2 gap-4">
          {bmz.settings?.equipment.map((equipment) => {
            let isChecked = false;
            let onChange = () => {};

            switch (equipment.name) {
              case 'Освещение':
                isChecked = bmz.hasLighting;
                onChange = (e) => bmz.setHasLighting(e.target.checked);
                break;
              case 'Отопление':
                isChecked = bmz.hasHeating;
                onChange = (e) => bmz.setHasHeating(e.target.checked);
                break;
              case 'Охрано-пожарная сигнализация':
                isChecked = bmz.hasSecurity;
                onChange = (e) => bmz.setHasSecurity(e.target.checked);
                break;
              case 'Утепленный пол':
                isChecked = bmz.hasInsulatedFloor;
                onChange = (e) => bmz.setHasInsulatedFloor(e.target.checked);
                break;
              case 'Шахта для вентиляции':
                isChecked = bmz.hasVentilationShaft;
                onChange = (e) => bmz.setHasVentilationShaft(e.target.checked);
                break;
              case 'Кабельные полки и стойки':
                isChecked = bmz.hasCableShelves;
                onChange = (e) => bmz.setHasCableShelves(e.target.checked);
                break;
            }

            return (
              <label key={equipment.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={onChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{equipment.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <button
          onClick={() => {
            /* Добавить в спецификацию */
          }}
          disabled={!isFormValid()}
          className={`px-4 py-2 rounded ${
            isFormValid()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Добавить в спецификацию
        </button>
      </div>
    </div>
  );
};

export default BmzForm;
