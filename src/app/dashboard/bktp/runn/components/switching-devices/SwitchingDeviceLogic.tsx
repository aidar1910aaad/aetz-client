import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface SwitchingDeviceLogicProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
}

export default function SwitchingDeviceLogic({ 
  cell, 
  categoryMaterials,
  rpsLeftMaterials = []
}: SwitchingDeviceLogicProps) {
  const switchingDevice = cell.switchingDevice;

  // Отладочная информация для РПС
  if (switchingDevice === 'РПС') {

  }

  switch (switchingDevice) {
    case 'Воздушный':
    case 'Литой корпус':
    case 'Литой корпус + Рубильник':
    case 'РПС':
    default:
      return null;
  }
} 