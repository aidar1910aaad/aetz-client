import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface AirSwitchingDeviceLogicProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number) => void; remove: () => void; };
  categoryMaterials: Material[];
}

export default function AirSwitchingDeviceLogic({ 
  cell, 
  categoryMaterials 
}: AirSwitchingDeviceLogicProps) {
  // Функция для извлечения тока из названия материала
  const extractCurrentFromName = (name: string): number | null => {
    const currentPatterns = [
      /(\d+)\s*A\s*$/i, // 630 A, 1000 A в конце строки
      /(\d+)\s*А\s*$/i, // 630 А, 1000 А в конце строки
      /(\d+)\s*A\s*,/i, // 630 A, в середине
      /(\d+)\s*А\s*,/i, // 630 А, в середине
      /(\d+)\s*а/i, /(\d+)\s*a/i, // старые паттерны
      /(\d+)\s*ампер/i, /(\d+)\s*амп/i,
      /ток\s*(\d+)/i, /номинальный\s*ток\s*(\d+)/i,
      /iн\s*=\s*(\d+)/i, /i\s*=\s*(\d+)/i,
    ];

    for (const pattern of currentPatterns) {
      const match = name.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return null;
  };

  const airBreakers = categoryMaterials.filter(material => {
    const current = extractCurrentFromName(material.name);
    return current !== null && current >= 630 && current <= 6300;
  });

  return null;
} 