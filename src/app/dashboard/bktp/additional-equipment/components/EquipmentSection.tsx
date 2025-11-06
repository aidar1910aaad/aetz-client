'use client';

import React from 'react';
import { EquipmentConfig } from '../config/equipmentConfig';
import EquipmentSingle from './EquipmentSingle';
import EquipmentDropdown from './EquipmentDropdown';
import { type Calculation } from '@/api/calculations';

interface EquipmentSectionProps {
  config: EquipmentConfig;
  equipmentData?: {
    calculations: Calculation[];
    loading: boolean;
    error: string | null;
  };
}

export default function EquipmentSection({ config, equipmentData }: EquipmentSectionProps) {
  if (config.type === 'single') {
    return <EquipmentSingle config={config} equipmentData={equipmentData} />;
  }

  if (config.type === 'dropdown') {
    return <EquipmentDropdown config={config} equipmentData={equipmentData} />;
  }

  return null;
}