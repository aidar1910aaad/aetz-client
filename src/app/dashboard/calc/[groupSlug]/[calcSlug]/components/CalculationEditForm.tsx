import { useState, useEffect, useRef } from 'react';
import { CalculationSummary } from './CalculationSummary';
import CellConfig from '@/components/calculation/CellConfig';
import CalculationCategoriesEditor from './CalculationCategoriesEditor';
import CalculationEditActions from './CalculationEditActions';
import { CellConfiguration, CellType } from '@/types/calculation';
import { getBhaPreset, isBhaCellType, isKsoA12CalculationGroup } from '@/domain/calculation/bhaPresets';
import { isKsoA17CalculationGroup, isKsoA17CellType } from '@/domain/calculation/ksoA17Presets';
import { normalizeCellType } from '@/domain/calculation/cellTypes';
import { generateCalculationSlug } from '@/utils/calculationSlug';

interface CalculationMaterial {
  id?: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationMaterial[];
}

interface CalculationData {
  categories: CalculationCategory[];
  calculation: {
    manufacturingHours: number;
    hourlyRate?: number;
    overheadPercentage?: number;
    adminPercentage?: number;
    plannedProfitPercentage?: number;
    ndsPercentage?: number;
  };
  cellConfig?: CellConfiguration;
}

interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: CalculationData;
}

interface CalculationEditFormProps {
  calculation: Calculation;
  groupSlug?: string;
  onSave: (updatedCalculation: Calculation) => Promise<void>;
  onCancel: () => void;
  onFinishEditing?: () => void;
}

export function CalculationEditForm({
  calculation,
  groupSlug,
  onSave,
  onCancel,
  onFinishEditing,
}: CalculationEditFormProps) {
  const [name, setName] = useState(calculation.name);
  const [slug, setSlug] = useState(calculation.slug);
  const slugManuallyEdited = useRef(Boolean(calculation.slug));
  const [categories, setCategories] = useState<CalculationCategory[]>(calculation.data.categories);
  const [cellConfig, setCellConfig] = useState<CellConfiguration | undefined>(
    calculation.data.cellConfig
  );
  const [calculationValues, setCalculationValues] = useState(calculation.data.calculation);
  const [isSaving, setIsSaving] = useState(false);

  const getValidCellType = (type: string | undefined): CellType => normalizeCellType(type);

  useEffect(() => {
    if (slugManuallyEdited.current || isBhaConfig) return;
    if (name.trim().length >= 3) {
      setSlug(generateCalculationSlug(name));
    }
  }, [name, cellConfig?.type]);

  const handleExcelImport = (newCategories: CalculationCategory[], laborHours: number) => {
    setCategories((prev) => [...prev, ...newCategories]);
    if (laborHours > 0) {
      setCalculationValues((prev) => ({
        ...prev,
        manufacturingHours: (prev.manufacturingHours || 0) + laborHours,
      }));
    }
  };

  const calculateTotalMaterialsCost = () => {
    return categories.reduce((total, category) => {
      return (
        total +
        category.items.reduce((categoryTotal, item) => {
          return categoryTotal + item.price * item.quantity;
        }, 0)
      );
    }, 0);
  };

  // Проверяем валидность названия
  const isNameValid = name.trim().length >= 3;
  const isSlugValid = slug.trim().length >= 3;

  const handleSave = async () => {
    if (isSaving) return;

    if (!isNameValid) {
      alert('Название калькуляции должно содержать минимум 3 символа.');
      return;
    }

    if (!isSlugValid) {
      alert('Slug калькуляции должен содержать минимум 3 символа.');
      return;
    }

    const updatedCalculation: Calculation = {
      ...calculation,
      name,
      slug: slug.trim(),
      data: {
        ...calculation.data,
        categories,
        cellConfig,
        calculation: calculationValues,
      },
    };

    setIsSaving(true);
    try {
      await onSave(updatedCalculation);
    } finally {
      setIsSaving(false);
    }
  };

  const isKsoA12Group = isKsoA12CalculationGroup(groupSlug);
  const isKsoA17Group = isKsoA17CalculationGroup(groupSlug);
  const isBhaConfig = isKsoA12Group && isBhaCellType(cellConfig?.type);

  const handleCellConfigChange = (newConfig: CellConfiguration) => {
    if (isKsoA12Group && isBhaCellType(newConfig.type)) {
      const preset = getBhaPreset(newConfig.type);
      const nextConfig: CellConfiguration = {
        ...newConfig,
        materials: {},
      };
      setCellConfig(nextConfig);

      if (preset) {
        setSlug(preset.slug);
        slugManuallyEdited.current = true;
        if (calculation.id === 0 || !name.trim()) {
          setName(preset.name);
        }
      }
      return;
    }

    if (isKsoA17Group && isKsoA17CellType(newConfig.type)) {
      setCellConfig({
        ...newConfig,
        materials: {},
      });
      return;
    }

    setCellConfig(newConfig);
  };

  return (
    <div className="space-y-5">
      {/* Название */}
      <div className="rounded-xl border border-[#8eba1e]/20 bg-white p-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Название калькуляции <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#8eba1e]/30 transition-colors ${
            name.trim().length > 0 && name.trim().length < 3
              ? 'border-red-300 focus:border-red-500'
              : name.trim().length >= 3
              ? 'border-[#8eba1e]/40 focus:border-[#8eba1e]'
              : 'border-gray-300 focus:border-[#8eba1e]'
          }`}
          placeholder="Введите название калькуляции (минимум 3 символа)"
        />
        {name.trim().length > 0 && name.trim().length < 3 && (
          <p className="mt-1.5 text-xs text-red-600">Название должно содержать минимум 3 символа</p>
        )}
        {name.trim().length >= 3 && <p className="mt-1.5 text-xs text-[#8eba1e]">✓ Название корректно</p>}
      </div>

      <div className="rounded-xl border border-[#8eba1e]/20 bg-white p-4">
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Slug (идентификатор) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => {
            slugManuallyEdited.current = true;
            setSlug(e.target.value);
          }}
          disabled={isBhaConfig}
          className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#8eba1e]/30 transition-colors ${
            isBhaConfig
              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 cursor-not-allowed'
              : slug.trim().length >= 3
              ? 'border-[#8eba1e]/40 focus:border-[#8eba1e]'
              : 'border-gray-300 focus:border-[#8eba1e]'
          }`}
          placeholder="bha-input"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          {isBhaConfig
            ? 'Для BHA slug задаётся автоматически и используется в РУСН.'
            : 'Можно оставить автоматически сгенерированный slug или указать свой.'}
        </p>
      </div>

      {/* Конфигурация ячейки */}
      <div className="rounded-xl border border-[#8eba1e]/20 bg-white p-4">
        <CellConfig
          cellType={getValidCellType(cellConfig?.type)}
          groupSlug={groupSlug}
          configuration={
            cellConfig || {
              type: '10kv',
              materials: {
                switch: [], rza: [], counter: [], sr: [], tsn: [], tn: [],
                tt: [], pu: [], disconnector: [], busbar: [], busbridge: [],
                withdrawable_breaker: [], molded_case_breaker: [], rps: [], rubilnik: [],
              },
            }
          }
          onConfigurationChange={handleCellConfigChange}
        />
      </div>

      {/* Категории и материалы */}
      <div className="rounded-xl border border-[#8eba1e]/20 bg-white p-4">
        <CalculationCategoriesEditor
          categories={categories}
          setCategories={setCategories}
          onImport={handleExcelImport}
        />
      </div>

      {/* Расчет стоимости */}
      <CalculationSummary
        totalMaterialsCost={calculateTotalMaterialsCost()}
        onValuesChange={(values) => setCalculationValues(values)}
        initialValues={calculationValues}
      />

      {/* Кнопки действий */}
      <CalculationEditActions
        onCancel={onCancel}
        onSave={handleSave}
        onFinishEditing={onFinishEditing}
        isSaveDisabled={!isNameValid || !isSlugValid}
        saveDisabledMessage={
          !isNameValid
            ? 'Название должно содержать минимум 3 символа'
            : !isSlugValid
              ? 'Slug должен содержать минимум 3 символа'
              : undefined
        }
        isSaving={isSaving}
      />
    </div>
  );
}
