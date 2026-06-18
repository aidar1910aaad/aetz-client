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

  if (cell.bhaMode) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            Режим BHA: используется калькуляция{' '}
            <span className="font-medium text-gray-900">{currentCalculation || 'не найдена'}</span>
          </p>
        </div>
        {currentCalc && (
          <div className="p-4">
            <BreakerCalculation
              cell={cell}
              materials={materials}
              calculation={{
                data: {
                  categories: currentCalc.data.categories,
                  calculation: currentCalc.data.calculation,
                  cellConfig: currentCalc.data.cellConfig,
                },
              }}
            />
          </div>
        )}
      </div>
    );
  }

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
              calculation: foundCalculations.breakerCalculation.data.calculation,
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
              calculation: foundCalculations.rzaCalculation.data.calculation,
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
              calculation: foundCalculations.disconnectorCalculation.data.calculation,
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
              calculation: foundCalculations.puCalculation.data.calculation,
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
              calculation: foundCalculations.tsnCalculation.data.calculation,
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
              calculation: foundCalculations.tnCalculation.data.calculation,
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
 