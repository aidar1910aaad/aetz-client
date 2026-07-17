'use client';

import React from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useUserStore } from '@/store/useUserStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import type { BmzData } from '@/utils/bmzCalculations';
import type { RusnState } from '@/store/useRusnStore';
import type {
  AdditionalEquipmentState,
  AdditionalEquipmentItem,
} from '@/store/useAdditionalEquipmentStore';
import type { WorkItem } from '@/store/useWorksStore';
import { FinalReviewHeader, FinalReviewContent, FinalReviewTotal } from './components';
import { bmzTableConfig, transformerTableConfig, rusnTableConfig, worksTableConfig, runnTableConfig, additionalEquipmentTableConfig } from '@/components/FinalReview/tableConfigs';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { getTransformerUstRows } from '@/utils/busbarUstCost';
import { useRealtimeCalculationStore } from '@/store/useRealtimeCalculationStore';
import { buildDguSnapshotFromStore, hasDguSnapshotData } from '@/utils/dguSnapshot';
import { getRunnTableRows, mergeRunnWithDgu } from '@/utils/runnExportRows';

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildBktpFilename = (taskNumber: string, client: string, date: string) =>
  `${taskNumber}-БКТП-${client}-${date}`;

export default function FinalReview() {
  const { selectedTransformer } = useTransformerStore();
  const bmzStore: BmzData = useBmzStore();
  const { taskNumber, client, date } = useBktpStore();
  const { user } = useUserStore();
  const rusnStore: RusnState = useRusnStore();
  const runnStore = useRunnStore();
  const dguEnabled = useDguStore((s) => s.enabled);
  const dguSettings = useDguStore((s) => s.settings);
  const dguCellSummaries = useDguStore((s) => s.cellSummaries);
  const dguBusbarSummary = useDguStore((s) => s.busbarSummary);
  const dguBusBridgeSummaries = useDguStore((s) => s.busBridgeSummaries);
  const dguSnapshot = React.useMemo(
    () => ({
      enabled: dguEnabled,
      settings: dguSettings,
      cellSummaries: dguCellSummaries,
      busbarSummary: dguBusbarSummary,
      busBridgeSummaries: dguBusBridgeSummaries,
    }),
    [dguEnabled, dguSettings, dguCellSummaries, dguBusbarSummary, dguBusBridgeSummaries]
  );
  const hasDguInSpec = hasDguSnapshotData(dguSnapshot);
  const filename = buildBktpFilename(taskNumber, client, date);
  const { aluminum: aluminumPrice, copper: copperPrice } = useMaterialPrices();
  const busbarMaterialPrices = React.useMemo(
    () => ({ aluminum: aluminumPrice, copper: copperPrice }),
    [aluminumPrice, copperPrice],
  );

  const selectedEquipment: AdditionalEquipmentState['selected'] = useAdditionalEquipmentStore(
    (s) => s.selected
  );
  const equipmentList: AdditionalEquipmentItem[] = useAdditionalEquipmentStore(
    (s) => s.equipmentList
  );

  const selectedWorks = useWorksStore((s) => s.selected);
  const worksList: WorkItem[] = useWorksStore((s) => s.worksList);

  // Р¤РѕСЂРјРёСЂСѓРµРј РїРѕР»РЅРѕРµ РёРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  const fullName = user
    ? `${user.lastName || ''} ${user.firstName || ''}`.trim() || user.username
    : 'Пользователь';

  // РљРѕРјР°РЅРґРёСЂРѕРІРѕС‡РЅС‹Рµ Р±РµСЂС‘Рј СЃ РєР»РёРµРЅС‚Р°, С‡С‚РѕР±С‹ РЅРµ Р±С‹Р»Рѕ SSR СЂР°СЃСЃРёРЅС…СЂРѕРЅР°
  const [businessTravelTotal, setBusinessTravelTotal] = React.useState<number>(0);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('businessTravelTotal');
    const parsed = saved ? Number(saved) : 0;
    if (!Number.isNaN(parsed)) setBusinessTravelTotal(parsed);
  }, []);

  // РЎРѕСЃС‚РѕСЏРЅРёРµ РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёС… СЃС‚СЂРѕРє РІ РєР°Р¶РґРѕР№ С‚Р°Р±Р»РёС†Рµ (РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ РѕР±СЉСЏРІР»РµРЅРѕ РґРѕ СЂР°СЃС‡РµС‚РѕРІ)
  const [customRowsByTable, setCustomRowsByTable] = React.useState<Record<string, any[]>>({});
  const { data: realtimeData, setFinalPricingInputs } = useRealtimeCalculationStore();

  // === Р Р°СЃС‡РµС‚ РёС‚РѕРіРѕРІС‹С… СЃСѓРјРј (РµРґРёРЅС‹Р№ РёСЃС‚РѕС‡РЅРёРє РёСЃС‚РёРЅС‹) ===
  // Р‘РњР—: СЃС‡РёС‚Р°РµРј СЃСѓРјРјСѓ РёР· С‚РµС… Р¶Рµ СЃС‚СЂРѕРє, С‡С‚Рѕ РІ С‚Р°Р±Р»РёС†Рµ Р‘РњР—, РїР»СЋСЃ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёРµ СЃС‚СЂРѕРєРё
  const bmzRows = React.useMemo(() => bmzTableConfig.dataMapper(bmzStore), [bmzStore]);
  const bmzCustomRows = React.useMemo(() => customRowsByTable[bmzTableConfig.id] || [], [customRowsByTable]);
  const bmzTotal = React.useMemo(() => {
    const baseTotal = bmzRows.reduce((sum, row: any) => sum + (row.total || 0), 0);
    const customTotal = bmzCustomRows.reduce((sum, row: any) => sum + (row.total || 0), 0);
    return baseTotal + customTotal;
  }, [bmzRows, bmzCustomRows]);

  // Трансформатор без УСТ: УСТ распределяются по секциям РУСН/РУНН.
  const transformerQuantity = selectedTransformer?.quantity || 2;
  const transformerBasePrice = selectedTransformer?.price || 0;
  const transformerBaseTotal = transformerBasePrice * transformerQuantity;
  const transformerTotal = transformerBaseTotal;
  const transformerCustomRows = React.useMemo(() => customRowsByTable[transformerTableConfig.id] || [], [customRowsByTable]);
  const transformerTotalWithCustom = React.useMemo(() => {
    const customTotal = transformerCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return transformerTotal + customTotal;
  }, [transformerTotal, transformerCustomRows]);

  const rusnBaseTotal =
    rusnStore.cellConfigs.reduce((sum: number, cell: any) => sum + (cell.totalPrice || 0), 0) +
    (rusnStore.busBridgeSummary?.totalPrice || 0) +
    (rusnStore.busbarSummary?.totalPrice || 0);
  const rusnCustomRows = React.useMemo(() => customRowsByTable[rusnTableConfig.id] || [], [customRowsByTable]);
  const rusnTotal = React.useMemo(() => {
    const customTotal = rusnCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const ustTotal = getTransformerUstRows(
      selectedTransformer,
      'rusn',
      busbarMaterialPrices,
    ).reduce((sum, row) => sum + row.total, 0);
    return rusnBaseTotal + ustTotal + customTotal;
  }, [rusnBaseTotal, rusnCustomRows, selectedTransformer, busbarMaterialPrices]);

  // РЎСѓРјРјР° СЂР°Р±РѕС‚ - СЃС‡РёС‚Р°РµРј РёР· С‚РµС… Р¶Рµ СЃС‚СЂРѕРє, С‡С‚Рѕ СЂРµРЅРґРµСЂСЏС‚СЃСЏ РІ С‚Р°Р±Р»РёС†Рµ, РїР»СЋСЃ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёРµ СЃС‚СЂРѕРєРё
  const worksRows = React.useMemo(() => (
    worksTableConfig.dataMapper({ selected: selectedWorks, worksList }, { businessTravelTotal })
  ), [selectedWorks, worksList, businessTravelTotal]);
  const worksCustomRows = React.useMemo(() => customRowsByTable[worksTableConfig.id] || [], [customRowsByTable]);
  const worksTotal = React.useMemo(() => {
    const baseTotal = worksRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const customTotal = worksCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return baseTotal + customTotal;
  }, [worksRows, worksCustomRows]);

  // Сумма РУНН — из тех же строк, что рендерятся в таблице RUNN (+ ДГУ), плюс пользовательские строки
  const runnRows = React.useMemo(
    () =>
      getRunnTableRows(
        runnStore as unknown as Record<string, unknown>,
        dguSnapshot,
      ),
    [
      runnStore.cellSummaries,
      runnStore.cellConfigs,
      runnStore.busbarSummary,
      runnStore.busBridgeSummary,
      runnStore.busBridgeSummaries,
      dguSnapshot,
    ]
  );
  const runnCustomRows = React.useMemo(() => customRowsByTable[runnTableConfig.id] || [], [customRowsByTable]);
  const runnTotal = React.useMemo(() => {
    const baseTotal = runnRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const ustTotal = getTransformerUstRows(
      selectedTransformer,
      'runn',
      busbarMaterialPrices,
    ).reduce((sum, row) => sum + row.total, 0);
    const customTotal = runnCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return baseTotal + ustTotal + customTotal;
  }, [runnRows, runnCustomRows, selectedTransformer, busbarMaterialPrices]);

  // РЎСѓРјРјР° РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕРіРѕ РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ - СЃС‡РёС‚Р°РµРј РёР· С‚РµС… Р¶Рµ СЃС‚СЂРѕРє, С‡С‚Рѕ СЂРµРЅРґРµСЂСЏС‚СЃСЏ РІ С‚Р°Р±Р»РёС†Рµ, РїР»СЋСЃ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёРµ СЃС‚СЂРѕРєРё
  const additionalEquipmentRows = React.useMemo(() => (
    additionalEquipmentTableConfig.dataMapper({ selected: selectedEquipment, equipmentList })
  ), [selectedEquipment, equipmentList]);
  const additionalEquipmentCustomRows = React.useMemo(() => customRowsByTable[additionalEquipmentTableConfig.id] || [], [customRowsByTable]);
  const additionalEquipmentTotal = React.useMemo(() => {
    const baseTotal = additionalEquipmentRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const customTotal = additionalEquipmentCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return baseTotal + customTotal;
  }, [additionalEquipmentRows, additionalEquipmentCustomRows]);

  const grandTotal = bmzTotal + transformerTotalWithCustom + rusnTotal + runnTotal + worksTotal + additionalEquipmentTotal;
  const backendConfig = realtimeData?.config || {};
  const backendTotals = realtimeData?.snapshot?.totals || {};
  const displayBmzStore = backendConfig.bmz ? ({ ...bmzStore, ...backendConfig.bmz } as BmzData) : bmzStore;
  const displaySelectedTransformer = (backendConfig.transformer || selectedTransformer) as any;
  const displayRusnStore = backendConfig.rusn
    ? ({ ...rusnStore, ...backendConfig.rusn } as RusnState)
    : rusnStore;
  const displayRunnStore = React.useMemo(() => {
    const base = backendConfig.runn ? { ...runnStore, ...backendConfig.runn } : runnStore;
    return mergeRunnWithDgu(base, hasDguInSpec ? buildDguSnapshotFromStore() : dguSnapshot);
  }, [backendConfig.runn, runnStore, hasDguInSpec, dguSnapshot]);
  const displayAdditionalEquipment = backendConfig.additionalEquipment || {
    selected: selectedEquipment,
    equipmentList,
  };
  const displayWorks = backendConfig.works || {
    selected: selectedWorks,
    worksList,
  };
  const effectiveTotals = {
    bmzTotal: backendTotals.bmzTotal !== undefined ? toNumber(backendTotals.bmzTotal) : bmzTotal,
    transformerTotal:
      backendTotals.transformerTotal !== undefined
        ? toNumber(backendTotals.transformerTotal)
        : transformerTotalWithCustom,
    rusnTotal: backendTotals.rusnTotal !== undefined ? toNumber(backendTotals.rusnTotal) : rusnTotal,
    // Клиентский runnTotal включает ДГУ; бэкенд часто считает только РУНН без data.dgu
    runnTotal:
      hasDguInSpec || backendTotals.runnTotal === undefined
        ? runnTotal
        : toNumber(backendTotals.runnTotal),
    additionalEquipmentTotal:
      backendTotals.additionalEquipmentTotal !== undefined
        ? toNumber(backendTotals.additionalEquipmentTotal)
        : additionalEquipmentTotal,
    worksTotal: backendTotals.worksTotal !== undefined ? toNumber(backendTotals.worksTotal) : worksTotal,
    grandTotal:
      hasDguInSpec || backendTotals.grandTotal === undefined
        ? bmzTotal +
          transformerTotalWithCustom +
          rusnTotal +
          runnTotal +
          worksTotal +
          additionalEquipmentTotal
        : toNumber(backendTotals.grandTotal),
  };
  // === / Р Р°СЃС‡РµС‚ РёС‚РѕРіРѕРІС‹С… СЃСѓРјРј ===

  // РЎРѕСЃС‚РѕСЏРЅРёРµ РЅР°С†РµРЅРєРё РјРµРЅРµРґР¶РµСЂР° (РѕР±С‰РёР№ РїСЂРѕС†РµРЅС‚ РґР»СЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РІ FinalReviewTotal)
  const [managerMarkupPercent, setManagerMarkupPercent] = React.useState<number>(20);
  
  // РЎРѕСЃС‚РѕСЏРЅРёРµ РґР»СЏ С…СЂР°РЅРµРЅРёСЏ РїСЂРѕС†РµРЅС‚РѕРІ РЅР°С†РµРЅРєРё РґР»СЏ РєР°Р¶РґРѕР№ С‚Р°Р±Р»РёС†С‹
  const [tableMarkupPercents, setTableMarkupPercents] = React.useState<Record<string, number>>({});
  
  // РЎРѕСЃС‚РѕСЏРЅРёРµ РґР»СЏ С…СЂР°РЅРµРЅРёСЏ РёС‚РѕРіРѕРІС‹С… СЃСѓРјРј СЃ РЅР°С†РµРЅРєРѕР№ РґР»СЏ РєР°Р¶РґРѕР№ С‚Р°Р±Р»РёС†С‹
  const [tableMarkupTotals, setTableMarkupTotals] = React.useState<Record<string, number | null>>({});

  React.useEffect(() => {
    setFinalPricingInputs({
      customRowsByTable,
      tableMarkupPercents,
      tableMarkupTotals,
    });
  }, [customRowsByTable, tableMarkupPercents, tableMarkupTotals, setFinalPricingInputs]);

  React.useEffect(() => {
    const backendPercents = realtimeData?.tableMarkupPercents;
    const backendTotals = realtimeData?.tableMarkupTotals;

    if (backendPercents && JSON.stringify(backendPercents) !== JSON.stringify(tableMarkupPercents)) {
      setTableMarkupPercents(backendPercents);
    }

    if (backendTotals && JSON.stringify(backendTotals) !== JSON.stringify(tableMarkupTotals)) {
      setTableMarkupTotals(backendTotals);
    }
  }, [realtimeData?.tableMarkupPercents, realtimeData?.tableMarkupTotals, tableMarkupPercents, tableMarkupTotals]);

  // РЎРѕСЃС‚РѕСЏРЅРёРµ СЂРµР¶РёРјР° СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ
  const [isEditing, setIsEditing] = React.useState(false);
  
  // РЎРѕСЃС‚РѕСЏРЅРёРµ РІРёРґРёРјРѕСЃС‚Рё С‚Р°Р±Р»РёС† (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РІСЃРµ РІРёРґРёРјС‹, РµСЃР»Рё РµСЃС‚СЊ РґР°РЅРЅС‹Рµ)
  const [visibleTables, setVisibleTables] = React.useState<Set<string>>(new Set());

  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РЅР°С‡Р°Р»СЊРЅС‹С… Р·РЅР°С‡РµРЅРёР№ РЅР°С†РµРЅРєРё 20% РґР»СЏ РІСЃРµС… С‚Р°Р±Р»РёС†
  const isInitializedRef = React.useRef(false);
  
  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РІРёРґРёРјРѕСЃС‚Рё С‚Р°Р±Р»РёС† РЅР° РѕСЃРЅРѕРІРµ РЅР°Р»РёС‡РёСЏ РґР°РЅРЅС‹С…
  // РўР°Р±Р»РёС†С‹ СЃ РґР°РЅРЅС‹РјРё Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РґРѕР±Р°РІР»СЏСЋС‚СЃСЏ РІ visibleTables
  React.useEffect(() => {
    setVisibleTables(prev => {
      const newVisible = new Set(prev);
      let changed = false;
      
      // Р”РѕР±Р°РІР»СЏРµРј С‚Р°Р±Р»РёС†С‹ СЃ РґР°РЅРЅС‹РјРё, РµСЃР»Рё РёС… РµС‰Рµ РЅРµС‚
      if (effectiveTotals.bmzTotal > 0 && !newVisible.has(bmzTableConfig.id)) {
        newVisible.add(bmzTableConfig.id);
        changed = true;
      }
      if (effectiveTotals.transformerTotal > 0 && !newVisible.has(transformerTableConfig.id)) {
        newVisible.add(transformerTableConfig.id);
        changed = true;
      }
      if (effectiveTotals.rusnTotal > 0 && !newVisible.has(rusnTableConfig.id)) {
        newVisible.add(rusnTableConfig.id);
        changed = true;
      }
      if ((effectiveTotals.runnTotal > 0 || hasDguInSpec) && !newVisible.has(runnTableConfig.id)) {
        newVisible.add(runnTableConfig.id);
        changed = true;
      }
      if (effectiveTotals.additionalEquipmentTotal > 0 && !newVisible.has(additionalEquipmentTableConfig.id)) {
        newVisible.add(additionalEquipmentTableConfig.id);
        changed = true;
      }
      if (effectiveTotals.worksTotal > 0 && !newVisible.has(worksTableConfig.id)) {
        newVisible.add(worksTableConfig.id);
        changed = true;
      }
      // Р”Р“РЈ РЅРµ РґРѕР±Р°РІР»СЏРµС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё (РЅРµС‚ РґР°РЅРЅС‹С… РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ)
      
      return changed ? newVisible : prev;
    });
    }, [effectiveTotals.bmzTotal, effectiveTotals.transformerTotal, effectiveTotals.rusnTotal, effectiveTotals.runnTotal, effectiveTotals.additionalEquipmentTotal, effectiveTotals.worksTotal, hasDguInSpec]);
  
  React.useEffect(() => {
    // РРЅРёС†РёР°Р»РёР·РёСЂСѓРµРј С‚РѕР»СЊРєРѕ РѕРґРёРЅ СЂР°Р· РїСЂРё РїРµСЂРІРѕР№ Р·Р°РіСЂСѓР·РєРµ
    if (isInitializedRef.current) return;
    
    const initialPercent = 20;
    const initialPercents: Record<string, number> = {};
    const initialTotals: Record<string, number | null> = {};

    // РРЅРёС†РёР°Р»РёР·РёСЂСѓРµРј РґР»СЏ РІСЃРµС… С‚Р°Р±Р»РёС† СЃ РїРѕР»РѕР¶РёС‚РµР»СЊРЅС‹РјРё СЃСѓРјРјР°РјРё
    if (effectiveTotals.bmzTotal > 0) {
      initialPercents[bmzTableConfig.id] = initialPercent;
      initialTotals[bmzTableConfig.id] = Math.round(effectiveTotals.bmzTotal * (1 + initialPercent / 100));
    }
    if (effectiveTotals.transformerTotal > 0) {
      initialPercents[transformerTableConfig.id] = initialPercent;
      initialTotals[transformerTableConfig.id] = Math.round(effectiveTotals.transformerTotal * (1 + initialPercent / 100));
    }
    if (effectiveTotals.rusnTotal > 0) {
      initialPercents[rusnTableConfig.id] = initialPercent;
      initialTotals[rusnTableConfig.id] = Math.round(effectiveTotals.rusnTotal * (1 + initialPercent / 100));
    }
    if (effectiveTotals.runnTotal > 0) {
      initialPercents[runnTableConfig.id] = initialPercent;
      initialTotals[runnTableConfig.id] = Math.round(effectiveTotals.runnTotal * (1 + initialPercent / 100));
    }
    if (effectiveTotals.additionalEquipmentTotal > 0) {
      initialPercents[additionalEquipmentTableConfig.id] = initialPercent;
      initialTotals[additionalEquipmentTableConfig.id] = Math.round(effectiveTotals.additionalEquipmentTotal * (1 + initialPercent / 100));
    }
    if (effectiveTotals.worksTotal > 0) {
      initialPercents[worksTableConfig.id] = initialPercent;
      initialTotals[worksTableConfig.id] = Math.round(effectiveTotals.worksTotal * (1 + initialPercent / 100));
    }

    if (Object.keys(initialPercents).length > 0) {
      setTableMarkupPercents(initialPercents);
      setTableMarkupTotals(initialTotals);
      isInitializedRef.current = true;
    }
  }, [effectiveTotals.bmzTotal, effectiveTotals.transformerTotal, effectiveTotals.rusnTotal, effectiveTotals.runnTotal, effectiveTotals.additionalEquipmentTotal, effectiveTotals.worksTotal]);

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />

      <FinalReviewHeader
        filename={filename}
        fullName={fullName}
        user={user}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
      />

      <FinalReviewContent
        bmzStore={displayBmzStore}
        selectedTransformer={displaySelectedTransformer}
        rusnStore={displayRusnStore}
        runnStore={displayRunnStore}
        selectedEquipment={displayAdditionalEquipment.selected}
        equipmentList={displayAdditionalEquipment.equipmentList}
        selectedWorks={displayWorks.selected}
        worksList={displayWorks.worksList}
        managerMarkupPercent={managerMarkupPercent}
        tableMarkupPercents={tableMarkupPercents}
        setTableMarkupPercents={setTableMarkupPercents}
        tableMarkupTotals={tableMarkupTotals}
        setTableMarkupTotals={setTableMarkupTotals}
        setManagerMarkupPercent={setManagerMarkupPercent}
        isEditing={isEditing}
        visibleTables={visibleTables}
        onToggleTable={(tableId: string) => {
          setVisibleTables(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tableId)) {
              // РџСЂРѕРІРµСЂСЏРµРј, РјРѕР¶РЅРѕ Р»Рё СѓРґР°Р»РёС‚СЊ С‚Р°Р±Р»РёС†Сѓ (С‚Р°Р±Р»РёС†С‹ СЃ РґР°РЅРЅС‹РјРё РЅРµР»СЊР·СЏ СѓРґР°Р»РёС‚СЊ)
              const hasData = 
                (tableId === bmzTableConfig.id && effectiveTotals.bmzTotal > 0) ||
                (tableId === transformerTableConfig.id && effectiveTotals.transformerTotal > 0) ||
                (tableId === rusnTableConfig.id && effectiveTotals.rusnTotal > 0) ||
                (tableId === runnTableConfig.id && (effectiveTotals.runnTotal > 0 || hasDguInSpec)) ||
                (tableId === additionalEquipmentTableConfig.id && effectiveTotals.additionalEquipmentTotal > 0) ||
                (tableId === worksTableConfig.id && effectiveTotals.worksTotal > 0);
              
              // Р•СЃР»Рё Сѓ С‚Р°Р±Р»РёС†С‹ РµСЃС‚СЊ РґР°РЅРЅС‹Рµ, РЅРµ РїРѕР·РІРѕР»СЏРµРј РµС‘ СѓРґР°Р»РёС‚СЊ
              if (hasData) {
                return prev;
              }
              
              // РЈРґР°Р»СЏРµРј С‚Р°Р±Р»РёС†Сѓ С‚РѕР»СЊРєРѕ РµСЃР»Рё Сѓ РЅРµС‘ РЅРµС‚ РґР°РЅРЅС‹С…
              newSet.delete(tableId);
            } else {
              // Р”РѕР±Р°РІР»СЏРµРј С‚Р°Р±Р»РёС†Сѓ
              newSet.add(tableId);
            }
            return newSet;
          });
        }}
        bmzTotal={effectiveTotals.bmzTotal}
        transformerTotal={effectiveTotals.transformerTotal}
        rusnTotal={effectiveTotals.rusnTotal}
        runnTotal={effectiveTotals.runnTotal}
        additionalEquipmentTotal={effectiveTotals.additionalEquipmentTotal}
        worksTotal={effectiveTotals.worksTotal}
        customRowsByTable={customRowsByTable}
        onCustomRowsChange={(tableId: string, rows: any[]) => {
          setCustomRowsByTable(prev => ({
            ...prev,
            [tableId]: rows,
          }));
        }}
      />

      <FinalReviewTotal
        bmzStore={displayBmzStore}
        selectedTransformer={displaySelectedTransformer}
        rusnStore={displayRusnStore}
        runnStore={displayRunnStore}
        selectedEquipment={displayAdditionalEquipment.selected}
        equipmentList={displayAdditionalEquipment.equipmentList}
        selectedWorks={displayWorks.selected}
        worksList={displayWorks.worksList}
        user={user}
        taskNumber={taskNumber}
        client={client}
        date={date}
        totals={effectiveTotals}
        filename={filename}
        fullName={fullName}
        managerMarkupPercent={managerMarkupPercent}
        setManagerMarkupPercent={setManagerMarkupPercent}
        tableMarkupPercents={tableMarkupPercents}
        tableMarkupTotals={tableMarkupTotals}
        customRowsByTable={customRowsByTable}
      />
    </div>
  );
}
