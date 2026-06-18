'use client';

import { useRusnStore } from '@/store/useRusnStore';
import { useRusnSettings } from '@/hooks/useRusnSettings';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';
import CameraTypeSelector from './CameraTypeSelector';
import EquipmentSelector from './EquipmentSelector';
import { useState, ReactNode, useEffect, useRef } from 'react';
import { Select } from '@/components/ui/select';

// Компонент SelectWithLabel
interface Option {
  value: string;
  label: string;
}

interface SelectWithLabelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

function SelectWithLabel({ label, value, onChange, options }: SelectWithLabelProps) {
  const isSelected = value && value !== '';
  
  return (
    <div className={`mb-4 rounded-xl border transition-all duration-200 ${
      isSelected 
        ? 'border-[#8eba1e] bg-white shadow-md' 
        : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
    }`}>
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isSelected ? 'bg-[#8eba1e]' : 'bg-gray-400'
          }`} />
          <h4 className="text-sm font-semibold text-gray-800 truncate" title={label}>
            {label}
          </h4>
        </div>
      </div>
      <div className="px-4 py-3">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none ${
            isSelected
              ? 'border-[#8eba1e] bg-white focus:ring-2 focus:ring-[#8eba1e]/20 focus:border-[#8eba1e]'
              : 'border-gray-300 bg-white focus:ring-2 focus:ring-[#8eba1e]/20 focus:border-[#8eba1e]'
          }`}
        >
          <option value="">Выберите</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        {isSelected && (
          <div className="mt-2 text-xs text-[#8eba1e] font-medium">
            ✓ Выбрано
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент TogglerWithInput
type TogglerWithInputProps = {
  label: string;
  children: ReactNode;
  defaultEnabled?: boolean;
  toggled?: boolean;
  onToggle?: () => void;
};

function TogglerWithInput({
  label,
  children,
  defaultEnabled = false,
  toggled,
  onToggle,
}: TogglerWithInputProps) {
  const [internalEnabled, setInternalEnabled] = useState(defaultEnabled);
  const isControlled = toggled !== undefined;
  const isEnabled = isControlled ? toggled : internalEnabled;

  const handleClick = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalEnabled((prev) => !prev);
    }
  };

  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-800 truncate" title={label}>
          {label}
        </h4>
        <button
          onClick={handleClick}
          className={`text-xs font-medium px-2.5 py-1 rounded transition duration-150 ml-2 ${
            isEnabled
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {isEnabled ? 'Нет' : 'Добавить'}
        </button>
      </div>
      {isEnabled && <div className="px-4 py-3 space-y-2">{children}</div>}
    </div>
  );
}

export default function RusnGlobalConfig() {
  const { global, setGlobal, clearAllCells, clearCellSummaries, setBusbarSummary, setBusBridgeSummary, setBusBridgeSummaries, removeCell } = useRusnStore();
  const { rusnSettings, loading, error } = useRusnSettings();
  const { selectedTransformer } = useTransformerStore();
  const { groups } = useCalculationGroups();
  
  // Отслеживаем изменения напряжения трансформатора
  const prevVoltageRef = useRef(selectedTransformer?.voltage || '10');
  
  // Очищаем данные при изменении напряжения трансформатора
  useEffect(() => {
    const currentVoltage = selectedTransformer?.voltage || '10';
    const prevVoltage = prevVoltageRef.current;
    
    if (prevVoltage !== currentVoltage) {
      console.log(`🔄 [RusnGlobalConfig] Смена напряжения трансформатора: ${prevVoltage} → ${currentVoltage}`);
      
      // Очищаем все данные при смене напряжения
      clearAllCells();
      clearCellSummaries();
      setBusbarSummary(null);
      setBusBridgeSummary(null);
      setBusBridgeSummaries([]);
      
      // Очищаем глобальные настройки
      setGlobal('bodyType', '');
      setGlobal('breaker', null);
      setGlobal('rza', null);
      setGlobal('meterType', null);
      setGlobal('sr', null);
      setGlobal('tsn', null);
      setGlobal('tn', null);
      setGlobal('tt', null);
      
      console.log(`🔄 [RusnGlobalConfig] ▶️ ВСЕ ДАННЫЕ ОЧИЩЕНЫ при смене напряжения: ${prevVoltage} → ${currentVoltage}`);
    }
    
    prevVoltageRef.current = currentVoltage;
  }, [selectedTransformer?.voltage, clearAllCells, clearCellSummaries, setBusbarSummary, setBusBridgeSummary, setBusBridgeSummaries, setGlobal]);

  const voltage = selectedTransformer?.voltage || '10';
  const voltageNum = voltage === '0.4' ? 400 : Number(voltage);

  const handleGroupChange = (groupSlug: string) => {
    const group = groups.find((g) => g.slug === groupSlug);
    if (group) {
      setGlobal('bodyType', group.name);
      localStorage.setItem('selectedGroupSlug', groupSlug);
      localStorage.setItem('selectedGroupName', group.name);
    }
  };

  const handleCameraTypeChange = (groupName: string) => {
    console.log(`🔄 Смена типа камеры: ${groupName}`);
    setGlobal('bodyType', groupName);
    localStorage.setItem('selectedGroupName', groupName);
    
    // Очищаем только глобальные настройки оборудования при смене типа камеры
    setGlobal('breaker', null);
    setGlobal('rza', null);
    setGlobal('meterType', null);
    setGlobal('sr', null);
    setGlobal('tsn', null);
    setGlobal('tn', null);
    setGlobal('tt', null);
    
    // Очищаем ВСЕ ячейки при смене типа камеры
    clearAllCells();
    clearCellSummaries();
    
    // Находим группу по имени и сохраняем slug
    const group = groups.find((g) => g.name === groupName);
    if (group) {
      localStorage.setItem('selectedGroupSlug', group.slug);
    }
  };

  const handleGlobalChange = (key: string, value: { id: number; name: string } | null) => {

    setGlobal(key as keyof typeof global, value);
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Загрузка настроек...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Ошибка загрузки: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Тип ячеек */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#8eba1e] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Тип ячеек</h3>
        </div>
        <CameraTypeSelector
          selectedType={global.bodyType || ''}
          onTypeChange={handleCameraTypeChange}
          voltageNum={voltageNum}
        />
        {global.bodyType && (
          <div className="mt-4 p-3 bg-[#8eba1e]/5 border-l-4 border-[#8eba1e] rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-[#8eba1e]">Выбран тип:</span> 
              <span className="ml-2 font-bold text-gray-900">{global.bodyType}</span>
            </p>
          </div>
        )}
      </div>

      {/* Оборудование - скрыто для КСО 366 и 8DJH */}
      {global.bodyType !== 'Камера КСО 366' && 
       global.bodyType !== 'Камера 8DJH' && 
       global.bodyType !== 'Камера Siemens 8DJH' ? (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#8eba1e] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Оборудование</h3>
          </div>
          <EquipmentSelector
            rusnSettings={rusnSettings}
            global={global}
            onGlobalChange={handleGlobalChange}
            voltage={voltageNum}
          />
        </div>
      ) : (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Оборудование</h3>
          </div>
          <div className="text-sm text-blue-700">
            <p className="mb-2">
              <strong>Для {global.bodyType}</strong> выбор оборудования не требуется.
            </p>
            <p>
              Все ячейки будут созданы с предустановленным оборудованием согласно спецификации {global.bodyType}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
