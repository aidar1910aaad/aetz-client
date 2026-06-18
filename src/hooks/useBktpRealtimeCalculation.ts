import { useEffect, useMemo, useRef } from 'react';
import { calculateApplicationDraft } from '@/api/requests';
import { useDebounce } from '@/hooks/useDebounce';
import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import { useRealtimeCalculationStore } from '@/store/useRealtimeCalculationStore';

/** Стабильный ключ конфига — без полного ustCalculations, чтобы ответ сервера не запускал новый запрос. */
function buildConfigSignature(config: Record<string, unknown>): string {
  const transformer = config.transformer as Record<string, unknown> | null;
  return JSON.stringify({
    meta: config.meta,
    bmz: config.bmz,
    transformer: transformer
      ? {
          id: transformer.id,
          quantity: transformer.quantity,
          price: transformer.price,
          busbars: transformer.busbars,
          busbarUstData: transformer.busbarUstData,
          ustCalculationIds: Array.isArray(transformer.ustCalculations)
            ? transformer.ustCalculations.map((c: { id?: number }) => c.id)
            : [],
          legacyUstId: (transformer.ustCalculation as { id?: number } | null)?.id ?? null,
        }
      : null,
    rusn: config.rusn,
    runn: config.runn,
    additionalEquipment: config.additionalEquipment,
    works: config.works,
    customRowsByTable: config.customRowsByTable,
    tableMarkupPercents: config.tableMarkupPercents,
    tableMarkupTotals: config.tableMarkupTotals,
  });
}

export function useBktpRealtimeCalculation() {
  const bktp = useBktpStore();
  const bmz = useBmzStore();
  const transformer = useTransformerStore((s) => s.selectedTransformer);
  const rusn = useRusnStore();
  const runn = useRunnStore();
  const additionalEquipment = useAdditionalEquipmentStore();
  const works = useWorksStore();

  const {
    customRowsByTable,
    tableMarkupPercents,
    tableMarkupTotals,
    setCalculating,
    setResult,
    setError,
    setRequestConfig,
  } = useRealtimeCalculationStore();

  const config = useMemo(
    () => ({
      bmz: {
        buildingType: bmz.buildingType ?? 'none',
        length: bmz.length,
        width: bmz.width,
        height: bmz.height,
        thickness: bmz.thickness,
        blockCount: bmz.blockCount,
        settings: bmz.settings,
        equipmentState: bmz.equipmentState,
      },
      transformer: transformer ? { ...transformer } : null,
      rusn: {
        global: rusn.global,
        cellConfigs: rusn.cellConfigs,
        busbarSummary: rusn.busbarSummary,
        busBridgeSummary: rusn.busBridgeSummary,
        busBridgeSummaries: rusn.busBridgeSummaries,
        cellSummaries: rusn.cellSummaries,
      },
      runn: {
        global: runn.global,
        cellConfigs: runn.cellConfigs,
        cellSummaries: runn.cellSummaries,
        busbarSummary: runn.busbarSummary,
        busBridgeSummary: runn.busBridgeSummary,
        busBridgeSummaries: runn.busBridgeSummaries,
        busBridges: runn.busBridges,
      },
      additionalEquipment: {
        selected: additionalEquipment.selected,
        equipmentList: additionalEquipment.equipmentList,
      },
      works: {
        selected: works.selected,
        worksList: works.worksList,
      },
      customRowsByTable,
      tableMarkupPercents,
      tableMarkupTotals,
      meta: {
        taskNumber: bktp.taskNumber,
        client: bktp.client,
        date: bktp.date,
        time: bktp.time,
      },
    }),
    [
      bktp.taskNumber,
      bktp.client,
      bktp.date,
      bktp.time,
      bmz.buildingType,
      bmz.length,
      bmz.width,
      bmz.height,
      bmz.thickness,
      bmz.blockCount,
      bmz.settings,
      bmz.equipmentState,
      transformer,
      rusn.global,
      rusn.cellConfigs,
      rusn.busbarSummary,
      rusn.busBridgeSummary,
      rusn.busBridgeSummaries,
      rusn.cellSummaries,
      runn.global,
      runn.cellConfigs,
      runn.cellSummaries,
      runn.busbarSummary,
      runn.busBridgeSummary,
      runn.busBridgeSummaries,
      runn.busBridges,
      additionalEquipment.selected,
      additionalEquipment.equipmentList,
      works.selected,
      works.worksList,
      customRowsByTable,
      tableMarkupPercents,
      tableMarkupTotals,
    ],
  );

  const configSignature = useMemo(() => buildConfigSignature(config), [config]);
  const debouncedSignature = useDebounce(configSignature, 600);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let cancelled = false;
    const requestConfig = configRef.current;

    setCalculating(true);
    setError(null);
    setRequestConfig(requestConfig);

    calculateApplicationDraft(
      {
        type: 'БКТП',
        data: {
          config: requestConfig,
          customRowsByTable: requestConfig.customRowsByTable,
          tableMarkupPercents: requestConfig.tableMarkupPercents,
          tableMarkupTotals: requestConfig.tableMarkupTotals,
        },
      },
      token,
    )
      .then((result) => {
        if (cancelled) return;
        setResult(result);
        // Не пишем ответ в zustand: это вызывало цикл calculate → setTransformer → config → calculate.
      })
      .catch((error) => {
        if (cancelled) return;
        setError(error?.message || 'Ошибка онлайн пересчета');
      })
      .finally(() => {
        if (cancelled) return;
        setCalculating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSignature, setCalculating, setError, setRequestConfig, setResult]);
}
