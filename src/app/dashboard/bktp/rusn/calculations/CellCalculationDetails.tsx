import { useState } from 'react';
import { RusnCell } from '@/store/useRusnStore';
import { RusnMaterials } from '@/utils/rusnMaterials';
import BreakerCalculation from './BreakerCalculation';
import RzaCalculation from './RzaCalculation';

interface CellCalculationDetailsProps {
  cell: RusnCell;
  materials: RusnMaterials;
  currentCalculation: string;
  calculations: any;
  rzaCalculation?: {
    id: number;
    name: string;
    slug: string;
    data: {
      categories: Array<{
        name: string;
        items: Array<{
          name: string;
          unit: string;
          price: number;
          quantity: number;
        }>;
      }>;
      calculation?: {
        manufacturingHours?: number;
        hourlyRate?: number;
        overheadPercentage?: number;
        adminPercentage?: number;
        plannedProfitPercentage?: number;
        ndsPercentage?: number;
      };
    };
  } | null;
  foundCalculations?: {
    breakerCalculation?: any;
    rzaCalculation?: any;
    disconnectorCalculation?: any;
    puCalculation?: any;
    tsnCalculation?: any;
    tnCalculation?: any;
    cellType?: string;
  };
}

export default function CellCalculationDetails({
  cell,
  materials,
  currentCalculation,
  calculations,
  rzaCalculation,
  foundCalculations,
}: CellCalculationDetailsProps) {
  const [showBreakerDetails, setShowBreakerDetails] = useState(false);
  const [showRzaDetails, setShowRzaDetails] = useState(false);
  const [showDisconnectorDetails, setShowDisconnectorDetails] = useState(false);
  const [showPuDetails, setShowPuDetails] = useState(false);
  const [showTsnDetails, setShowTsnDetails] = useState(false);
  const [showTnDetails, setShowTnDetails] = useState(false);

  const currentCalc = calculations.cell.find((c: any) => c.name === currentCalculation);

  // Определяем какие кнопки показывать на основе найденных калькуляций
  const hasBreakerCalculation = foundCalculations?.breakerCalculation;
  const hasRzaCalculation = foundCalculations?.rzaCalculation;
  const hasDisconnectorCalculation = foundCalculations?.disconnectorCalculation;
  const hasPuCalculation = foundCalculations?.puCalculation;
  const hasTsnCalculation = foundCalculations?.tsnCalculation;
  const hasTnCalculation = foundCalculations?.tnCalculation;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
      <div className="flex gap-4 p-4 border-b border-gray-100 flex-wrap">
        {hasBreakerCalculation && (
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${
              showBreakerDetails
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setShowBreakerDetails((v) => !v)}
          >
            {showBreakerDetails ? 'Скрыть' : 'Показать'} расчет выключателя
          </button>
        )}

        {hasRzaCalculation && (
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${
              showRzaDetails
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setShowRzaDetails((v) => !v)}
          >
            {showRzaDetails ? 'Скрыть' : 'Показать'} расчет РЗА
          </button>
        )}

        {hasDisconnectorCalculation && (
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${
              showDisconnectorDetails
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setShowDisconnectorDetails((v) => !v)}
          >
            {showDisconnectorDetails ? 'Скрыть' : 'Показать'} расчет разъединителя
          </button>
        )}

        {hasPuCalculation && (
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${
              showPuDetails
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setShowPuDetails((v) => !v)}
          >
            {showPuDetails ? 'Скрыть' : 'Показать'} расчет ПУ
          </button>
        )}

        {hasTsnCalculation && (
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${
              showTsnDetails
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setShowTsnDetails((v) => !v)}
          >
            {showTsnDetails ? 'Скрыть' : 'Показать'} расчет ТСН
          </button>
        )}

        {hasTnCalculation && (
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${
              showTnDetails
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setShowTnDetails((v) => !v)}
          >
            {showTnDetails ? 'Скрыть' : 'Показать'} расчет ТН
          </button>
        )}
      </div>

      {/* Калькуляция выключателя */}
      {showBreakerDetails && hasBreakerCalculation && (
        <BreakerCalculation
          cell={cell}
          materials={materials}
          calculation={{
            data: {
              categories: foundCalculations.breakerCalculation.data.categories,
              calculation: {
                manufacturingHours:
                  foundCalculations.breakerCalculation.data.calculation?.manufacturingHours || 4,
                hourlyRate:
                  foundCalculations.breakerCalculation.data.calculation?.hourlyRate || 1000,
                overheadPercentage:
                  foundCalculations.breakerCalculation.data.calculation?.overheadPercentage || 15,
                adminPercentage:
                  foundCalculations.breakerCalculation.data.calculation?.adminPercentage || 10,
                plannedProfitPercentage:
                  foundCalculations.breakerCalculation.data.calculation?.plannedProfitPercentage ||
                  20,
                ndsPercentage:
                  foundCalculations.breakerCalculation.data.calculation?.ndsPercentage || 12,
              },
            },
            cellConfig: {
              type: 'switch',
            },
          }}
        />
      )}

      {/* Калькуляция РЗА */}
      {showRzaDetails && hasRzaCalculation && (
        <RzaCalculation
          cell={cell}
          materials={materials}
          calculation={{
            data: {
              categories: foundCalculations.rzaCalculation.data.categories,
              calculation: {
                manufacturingHours:
                  foundCalculations.rzaCalculation.data.calculation?.manufacturingHours || 4,
                hourlyRate: foundCalculations.rzaCalculation.data.calculation?.hourlyRate || 1000,
                overheadPercentage:
                  foundCalculations.rzaCalculation.data.calculation?.overheadPercentage || 15,
                adminPercentage:
                  foundCalculations.rzaCalculation.data.calculation?.adminPercentage || 10,
                plannedProfitPercentage:
                  foundCalculations.rzaCalculation.data.calculation?.plannedProfitPercentage || 20,
                ndsPercentage:
                  foundCalculations.rzaCalculation.data.calculation?.ndsPercentage || 12,
              },
            },
          }}
        />
      )}

      {/* Калькуляция разъединителя */}
      {showDisconnectorDetails && hasDisconnectorCalculation && (
        <BreakerCalculation
          cell={cell}
          materials={materials}
          calculation={{
            data: {
              categories: foundCalculations.disconnectorCalculation.data.categories,
              calculation: {
                manufacturingHours:
                  foundCalculations.disconnectorCalculation.data.calculation?.manufacturingHours ||
                  4,
                hourlyRate:
                  foundCalculations.disconnectorCalculation.data.calculation?.hourlyRate || 1000,
                overheadPercentage:
                  foundCalculations.disconnectorCalculation.data.calculation?.overheadPercentage ||
                  15,
                adminPercentage:
                  foundCalculations.disconnectorCalculation.data.calculation?.adminPercentage || 10,
                plannedProfitPercentage:
                  foundCalculations.disconnectorCalculation.data.calculation
                    ?.plannedProfitPercentage || 20,
                ndsPercentage:
                  foundCalculations.disconnectorCalculation.data.calculation?.ndsPercentage || 12,
              },
              cellConfig: {
                type: 'disconnector',
              },
            },
          }}
        />
      )}

      {/* Калькуляция ПУ */}
      {showPuDetails && hasPuCalculation && (
        <BreakerCalculation
          cell={cell}
          materials={materials}
          calculation={{
            data: {
              categories: foundCalculations.puCalculation.data.categories,
              calculation: {
                manufacturingHours:
                  foundCalculations.puCalculation.data.calculation?.manufacturingHours || 4,
                hourlyRate: foundCalculations.puCalculation.data.calculation?.hourlyRate || 1000,
                overheadPercentage:
                  foundCalculations.puCalculation.data.calculation?.overheadPercentage || 15,
                adminPercentage:
                  foundCalculations.puCalculation.data.calculation?.adminPercentage || 10,
                plannedProfitPercentage:
                  foundCalculations.puCalculation.data.calculation?.plannedProfitPercentage || 20,
                ndsPercentage:
                  foundCalculations.puCalculation.data.calculation?.ndsPercentage || 12,
              },
              cellConfig: {
                type: 'pu',
              },
            },
          }}
        />
      )}

      {/* Калькуляция ТСН */}
      {showTsnDetails && hasTsnCalculation && (
        <BreakerCalculation
          cell={cell}
          materials={materials}
          calculation={{
            data: {
              categories: foundCalculations.tsnCalculation.data.categories,
              calculation: {
                manufacturingHours:
                  foundCalculations.tsnCalculation.data.calculation?.manufacturingHours || 4,
                hourlyRate: foundCalculations.tsnCalculation.data.calculation?.hourlyRate || 1000,
                overheadPercentage:
                  foundCalculations.tsnCalculation.data.calculation?.overheadPercentage || 15,
                adminPercentage:
                  foundCalculations.tsnCalculation.data.calculation?.adminPercentage || 10,
                plannedProfitPercentage:
                  foundCalculations.tsnCalculation.data.calculation?.plannedProfitPercentage || 20,
                ndsPercentage:
                  foundCalculations.tsnCalculation.data.calculation?.ndsPercentage || 12,
              },
              cellConfig: {
                type: 'tsn',
              },
            },
          }}
        />
      )}

      {/* Калькуляция ТН */}
      {showTnDetails && hasTnCalculation && (
        <BreakerCalculation
          cell={cell}
          materials={materials}
          calculation={{
            data: {
              categories: foundCalculations.tnCalculation.data.categories,
              calculation: {
                manufacturingHours:
                  foundCalculations.tnCalculation.data.calculation?.manufacturingHours || 4,
                hourlyRate: foundCalculations.tnCalculation.data.calculation?.hourlyRate || 1000,
                overheadPercentage:
                  foundCalculations.tnCalculation.data.calculation?.overheadPercentage || 15,
                adminPercentage:
                  foundCalculations.tnCalculation.data.calculation?.adminPercentage || 10,
                plannedProfitPercentage:
                  foundCalculations.tnCalculation.data.calculation?.plannedProfitPercentage || 20,
                ndsPercentage:
                  foundCalculations.tnCalculation.data.calculation?.ndsPercentage || 12,
              },
              cellConfig: {
                type: 'tn',
              },
            },
          }}
        />
      )}
    </div>
  );
}
 