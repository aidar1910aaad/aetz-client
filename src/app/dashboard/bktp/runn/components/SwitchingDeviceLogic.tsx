import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import AirSwitchingDeviceLogic from './switching-devices/AirSwitchingDeviceLogic';

interface SwitchingDeviceLogicProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number) => void; remove: () => void; };
  categoryMaterials: Material[];
}

export default function SwitchingDeviceLogic({ 
  cell, 
  categoryMaterials 
}: SwitchingDeviceLogicProps) {
  const switchingDevice = cell.switchingDevice;

  switch (switchingDevice) {
    case 'Воздушный':
      return <AirSwitchingDeviceLogic cell={cell} categoryMaterials={categoryMaterials} />;
    case 'Литой корпус':
    case 'Литой корпус + Рубильник':
      return (
        <div className="p-3 bg-green-50 rounded border">
          <h5 className="text-sm font-medium text-green-800 mb-2">
            {switchingDevice === 'Литой корпус' ? 'Логика для Литого корпуса:' : 'Логика для Литого корпуса + Рубильник:'}
          </h5>
          <div className="text-xs text-green-700 space-y-1">
            <p>• Компактная конструкция</p>
            <p>• Номинальный ток: до 1600А</p>
            <p>• Встроенная защита</p>
            <p>• Подходит для большинства применений</p>
            {switchingDevice === 'Литой корпус + Рубильник' && (
              <>
                <p>• Дополнительная изоляция</p>
                <p>• Ручное отключение</p>
                <p>• Повышенная безопасность</p>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-green-600">
            <p className="font-medium">Выберите конфигурацию в поле "Автомат выкатной" выше</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="p-3 bg-gray-50 rounded border">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Выберите коммутационный аппарат:</h5>
          <div className="text-xs text-gray-700">
            <p>Выберите тип коммутационного аппарата для настройки параметров ячейки</p>
          </div>
        </div>
      );
  }
} 