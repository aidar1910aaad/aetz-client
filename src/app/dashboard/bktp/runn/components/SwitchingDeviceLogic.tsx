import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import AirSwitchingDeviceLogic from './switching-devices/AirSwitchingDeviceLogic';
import SimplifiedRpsSelector from './SimplifiedRpsSelector';

interface SwitchingDeviceLogicProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  categoryMaterials: Material[];
  rpsLeftMaterials?: Material[];
}

export default function SwitchingDeviceLogic({ 
  cell, 
  categoryMaterials,
  rpsLeftMaterials = []
}: SwitchingDeviceLogicProps) {
  const switchingDevice = cell.switchingDevice;

  // Отладочная информация для РПС
  if (switchingDevice === 'РПС') {
    console.log('🔍 РПС выбрано! Материалы:', rpsLeftMaterials.length, 'шт.');
  }

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
    case 'РПС':
      return (
        <div className="p-3 bg-purple-50 rounded border">
          <h5 className="text-sm font-medium text-purple-800 mb-3">Логика для РПС (Разъединитель Переключатель Секций):</h5>
          <div className="text-xs text-purple-700 space-y-1 mb-4">
            <p>• Разъединение и переключение секций</p>
            <p>• Ручное управление</p>
            <p>• Высокая надежность</p>
            <p>• Видимый разрыв цепи</p>
          </div>
          <SimplifiedRpsSelector cell={cell} rpsLeftMaterials={rpsLeftMaterials} />
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