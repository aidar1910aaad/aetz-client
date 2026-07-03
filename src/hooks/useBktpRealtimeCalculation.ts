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
  const rusnGlobal = useRusnStore((s) => s.global);
  const rusnCellConfigs = useRusnStore((s) => s.cellConfigs);
  const rusnBusbarSummary = useRusnStore((s) => s.busbarSummary);
  const rusnBusBridgeSummary = useRusnStore((s) => s.busBridgeSummary);
  const rusnBusBridgeSummaries = useRusnStore((s) => s.busBridgeSummaries);
  const rusnCellSummaries = useRusnStore((s) => s.cellSummaries);
  const runnGlobal = useRunnStore((s) => s.global);
  const runnCellConfigs = useRunnStore((s) => s.cellConfigs);
  const runnCellSummaries = useRunnStore((s) => s.cellSummaries);
  const runnBusbarSummary = useRunnStore((s) => s.busbarSummary);
  const runnBusBridgeSummary = useRunnStore((s) => s.busBridgeSummary);
  const runnBusBridgeSummaries = useRunnStore((s) => s.busBridgeSummaries);
  const runnBusBridges = useRunnStore((s) => s.busBridges);
  const additionalEquipmentSelected = useAdditionalEquipmentStore((s) => s.selected);
  const additionalEquipmentList = useAdditionalEquipmentStore((s) => s.equipmentList);
  const worksSelected = useWorksStore((s) => s.selected);
  const worksList = useWorksStore((s) => s.worksList);

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
        global: rusnGlobal,
        cellConfigs: rusnCellConfigs,
        busbarSummary: rusnBusbarSummary,
        busBridgeSummary: rusnBusBridgeSummary,
        busBridgeSummaries: rusnBusBridgeSummaries,
        cellSummaries: rusnCellSummaries,
      },
      runn: {
        global: runnGlobal,
        cellConfigs: runnCellConfigs,
        cellSummaries: runnCellSummaries,
        busbarSummary: runnBusbarSummary,
        busBridgeSummary: runnBusBridgeSummary,
        busBridgeSummaries: runnBusBridgeSummaries,
        busBridges: runnBusBridges,
      },
      additionalEquipment: {
        selected: additionalEquipmentSelected,
        equipmentList: additionalEquipmentList,
      },
      works: {
        selected: worksSelected,
        worksList: worksList,
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
      rusnGlobal,
      rusnCellConfigs,
      rusnBusbarSummary,
      rusnBusBridgeSummary,
      rusnBusBridgeSummaries,
      rusnCellSummaries,
      runnGlobal,
      runnCellConfigs,
      runnCellSummaries,
      runnBusbarSummary,
      runnBusBridgeSummary,
      runnBusBridgeSummaries,
      runnBusBridges,
      additionalEquipmentSelected,
      additionalEquipmentList,
      worksSelected,
      worksList,
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
