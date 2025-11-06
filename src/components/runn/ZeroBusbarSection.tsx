'use client';

import { useState } from 'react';
import { Settings, Plus, Trash2, Save } from 'lucide-react';
import { useRunnStore, BusMaterial } from '@/store/useRunnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useZeroBusbarCalculation } from '@/hooks/useZeroBusbarCalculation';
import { BusbarResults } from './BusbarSystem/BusbarResults';

interface ZeroBusbarConfig {
  id: string;
  material: string;
  configuration: string;
  weight: number;
  pricePerKg: number;
  totalCost: number;
}

export function ZeroBusbarSection() {
  const runn = useRunnStore();
  const { selectedTransformer } = useTransformerStore();
  const {
    matchingConfig,
    totalWeight,
    totalPrice,
    pricePerKg,
    zeroBusbar,
    getPricePerKg,
    transformerPower,
    hasMatchingConfig
  } = useZeroBusbarCalculation();

  const [configs, setConfigs] = useState<ZeroBusbarConfig[]>([
    {
      id: '1',
      material: zeroBusbar.material || 'МТ2',
      configuration: zeroBusbar.configuration || '35',
      weight: zeroBusbar.weight || 311.00,
      pricePerKg: zeroBusbar.pricePerKg || 5600,
      totalCost: (zeroBusbar.weight || 311.00) * (zeroBusbar.pricePerKg || 5600)
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<ZeroBusbarConfig>>({
    material: zeroBusbar.material || 'МТ2',
    configuration: '',
    weight: 0,
    pricePerKg: zeroBusbar.pricePerKg || 5600
  });

  const materials = [
    { value: 'АД', label: 'АД (Алюминий)' },
    { value: 'АД2', label: 'АД2 (Алюминий улучшенный)' },
    { value: 'МТ', label: 'МТ (Медь)' },
    { value: 'МТ2', label: 'МТ2 (Медь улучшенная)' }
  ];

  const handleAddConfig = () => {
    if (newConfig.configuration && newConfig.weight && newConfig.pricePerKg) {
      const totalCost = newConfig.weight * newConfig.pricePerKg;
      const config: ZeroBusbarConfig = {
        id: Date.now().toString(),
        material: newConfig.material || 'МТ2',
        configuration: newConfig.configuration,
        weight: newConfig.weight,
        pricePerKg: newConfig.pricePerKg,
        totalCost
      };
      setConfigs([...configs, config]);
      
      // Обновляем store
      runn.setGlobal({
        ...runn.global,
        zeroBusbar: {
          enabled: true,
          material: newConfig.material as BusMaterial,
          configuration: newConfig.configuration,
          weight: newConfig.weight,
          pricePerKg: newConfig.pricePerKg
        }
      });
      
      setNewConfig({
        material: 'МТ2',
        configuration: '',
        weight: 0,
        pricePerKg: 5600
      });
    }
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(configs.filter(config => config.id !== id));
  };

  const totalCost = configs.reduce((sum, config) => sum + config.totalCost, 0);

  return (
    <BusbarResults
      title="сборным шинам N"
      matchingConfig={matchingConfig}
      totalWeight={totalWeight}
      totalPrice={totalPrice}
      pricePerKg={pricePerKg}
      hasMatchingConfig={hasMatchingConfig}
      transformerPower={transformerPower}
      selectedTransformer={selectedTransformer}
    />
  );
}