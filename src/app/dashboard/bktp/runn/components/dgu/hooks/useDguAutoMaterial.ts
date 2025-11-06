import { useState, useEffect } from 'react';
import { Material } from '@/api/material';
import { useDguStore } from '@/store/useDguStore';
import {
  calculateNominalCurrentForDgu,
  findBestMaterialByNominalCurrent,
} from '../../utils/runnDguMaterialFinder';

export function useDguAutoMaterial(categoryMaterials: Material[]) {
  const dgu = useDguStore();
  const [autoSelectedMaterial, setAutoSelectedMaterial] = useState<Material | null>(null);
  const [nominalCurrent, setNominalCurrent] = useState<number>(0);

  // Автоматический выбор материала при изменении мощности
  useEffect(() => {
    const nominalPowerKva = dgu.settings.nominalPowerKva;
    if (nominalPowerKva > 0 && categoryMaterials.length > 0) {
      const calculatedCurrent = calculateNominalCurrentForDgu(nominalPowerKva);
      setNominalCurrent(calculatedCurrent);
      
      const bestMaterial = findBestMaterialByNominalCurrent(categoryMaterials, calculatedCurrent);
      setAutoSelectedMaterial(bestMaterial);
    } else {
      setNominalCurrent(0);
      setAutoSelectedMaterial(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dgu.settings.nominalPowerKva, categoryMaterials]);

  return { autoSelectedMaterial, nominalCurrent };
}

