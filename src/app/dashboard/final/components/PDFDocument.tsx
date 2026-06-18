'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  calculateArea,
  calculateBasePrice,
  calculateTotalPrice,
  getActiveEquipment,
  BmzData,
} from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
// Расширенный тип трансформатора с УСТ
type ExtendedTransformer = Transformer & {
  quantity?: number;
  ustCalculation?: any;
  ustCalculations?: any[];
  busbarUstData?: {
    mainUstWeight: number;
    zeroUstWeight: number;
    material: string;
  };
};
import type { RusnState } from '@/store/useRusnStore';
// import { useRunnStore } from '@/store/useRunnStore';
import type { WorkItem } from '@/store/useWorksStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import { rusnTableConfig } from '@/components/FinalReview/tableConfigs';
import { getRunnTableRows } from '@/utils/runnExportRows';
import { PdfSpecTableSection } from './PdfSpecTableSection';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { calculateBusbarUstCost, isUst04CalculationName } from '@/utils/busbarUstCost';
import { PdfCommercialHeader, type PdfHeaderMeta } from './PdfCommercialHeader';
import { registerPdfFonts, PDF_FONT_REGULAR, PDF_FONT_BOLD } from '@/lib/pdfFonts';

registerPdfFonts();

// Создаем стили для PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontSize: 8,
    fontFamily: PDF_FONT_REGULAR,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
    fontFamily: PDF_FONT_BOLD,
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 3,
    color: '#666666',
    fontFamily: PDF_FONT_REGULAR,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000000',
    fontFamily: PDF_FONT_BOLD,
  },
  table: {
    width: '100%',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: '#90bd20',
    fontWeight: 'bold',
  },
  tableCellHeader: {
    padding: 3,
    fontSize: 7,
    flex: 1,
    backgroundColor: '#90bd20',
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: PDF_FONT_BOLD,
  },
  tableCell: {
    padding: 3,
    fontSize: 7,
    flex: 1,
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  tableCellNumber: {
    padding: 3,
    fontSize: 7,
    width: 25,
    textAlign: 'center',
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  tableCellName: {
    padding: 3,
    fontSize: 7,
    flex: 3,
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  tableCellUnit: {
    padding: 3,
    fontSize: 7,
    width: 35,
    textAlign: 'center',
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  tableCellQuantity: {
    padding: 3,
    fontSize: 7,
    width: 35,
    textAlign: 'center',
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  tableCellPrice: {
    padding: 3,
    fontSize: 7,
    width: 80,
    textAlign: 'right',
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  tableCellTotal: {
    padding: 3,
    fontSize: 7,
    width: 80,
    textAlign: 'right',
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  totalRow: {
    backgroundColor: '#90bd20',
    fontWeight: 'bold',
  },
  totalCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: PDF_FONT_BOLD,
  },
});

/** Минимум места под заголовком секции (заголовок + шапка таблицы) */
const SECTION_TITLE_MIN_AHEAD = 32;
/** Минимум места под шапкой таблицы (шапка + одна строка) */
const TABLE_HEADER_MIN_AHEAD = 22;

// Типы для PDF документа
interface Totals {
  bmzTotal: number;
  transformerTotal: number;
  rusnTotal: number;
  runnTotal: number;
  additionalEquipmentTotal: number;
  worksTotal: number;
  grandTotal: number;
}

interface PDFDocumentProps {
  filename: string;
  fullName: string;
  user: any;
  pdfHeader?: PdfHeaderMeta;
  pdfLogoSrc?: string;
  bmzStore: BmzData;
  selectedTransformer: ExtendedTransformer | null;
  rusnStore: RusnState;
  selectedWorks: any;
  worksList: WorkItem[];
  runnStore: any;
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  totals: Totals;
  customRowsByTable?: Record<string, any[]>;
}

// Функция для форматирования чисел
const formatNumber = (num: number) => {
  return Math.round(num).toLocaleString('ru-RU', { maximumFractionDigits: 0 });
};

export const PDFDocument = ({
  filename,
  fullName,
  user,
  pdfHeader,
  pdfLogoSrc,
  bmzStore,
  selectedTransformer,
  rusnStore,
  selectedWorks,
  worksList,
  runnStore,
  selectedEquipment,
  equipmentList,
  totals,
  customRowsByTable = {},
}: PDFDocumentProps) => {
  const { aluminum: aluminumPrice, copper: copperPrice } = useMaterialPrices();
  const busbarMaterialPrices = { aluminum: aluminumPrice, copper: copperPrice };

  // Проверяем наличие необходимых данных
  if (!bmzStore || !rusnStore || !selectedWorks || !worksList || !runnStore) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Ошибка создания PDF</Text>
            <Text style={styles.subtitle}>Недостаточно данных для создания документа</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Дополнительная проверка структуры данных
  const hasValidBmzStore = bmzStore && typeof bmzStore === 'object' && 
    typeof bmzStore.width === 'number' && typeof bmzStore.length === 'number';
  const hasValidRusnStore = rusnStore && typeof rusnStore === 'object' && 
    Array.isArray(rusnStore.cellConfigs);
  const hasValidWorksList = Array.isArray(worksList);
  const hasValidRunnStore = runnStore && typeof runnStore === 'object';

  if (!hasValidBmzStore || !hasValidRusnStore || !hasValidWorksList || !hasValidRunnStore) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Ошибка создания PDF</Text>
            <Text style={styles.subtitle}>Некорректная структура данных</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Используем переданные суммы из родительского компонента (единый источник истины)
  const { bmzTotal, transformerTotal, rusnTotal, runnTotal, additionalEquipmentTotal, worksTotal, grandTotal } = totals;

  // Данные для отображения таблиц (только для рендеринга, не для расчета сумм)
  const bmzArea = calculateArea(bmzStore.width || 0, bmzStore.length || 0);
  const roundedArea = Math.round(bmzArea * 10) / 10;
  const unitPrice = calculateBasePrice(
    bmzStore.settings,
    bmzStore.thickness,
    bmzArea,
    bmzStore.height,
  );
  const buildingTotal = unitPrice * roundedArea;
  const activeEquipment = getActiveEquipment(bmzStore);

  // Функция для расчета цены УСТ (только для отображения в таблице)
  const calculateUstPrice = (calc: any, additionalUstCost: number = 0) => {
    if (!calc?.data?.categories) return 0;
    
    let materialsTotal = 0;
    calc.data.categories.forEach((category: any) => {
      category.items.forEach((item: any) => {
        materialsTotal += (item.price || 0) * (item.quantity || 0);
      });
    });

    const totalMaterialsWithUst = materialsTotal + additionalUstCost;
    const calculation = calc.data.calculation;
    if (!calculation) return totalMaterialsWithUst;

    const manufacturingCost = (calculation.manufacturingHours || 0) * (calculation.hourlyRate || 0);
    const overheadCost = totalMaterialsWithUst * ((calculation.overheadPercentage || 0) / 100);
    const productionCost = totalMaterialsWithUst + manufacturingCost + overheadCost;
    const adminCost = totalMaterialsWithUst * ((calculation.adminPercentage || 0) / 100);
    const fullCost = productionCost + adminCost;
    const profitCost = fullCost * ((calculation.plannedProfitPercentage || 0) / 100);
    const wholesalePrice = fullCost + profitCost;
    const vatCost = wholesalePrice * ((calculation.ndsPercentage || 0) / 100);
    const finalPrice = wholesalePrice + vatCost;

    return finalPrice;
  };

  // Данные для отображения трансформатора (только для таблицы)
  const transformerQuantity = selectedTransformer?.quantity || 2;
  const transformerBasePrice = selectedTransformer?.price || 0;
  const transformerBaseTotal = transformerBasePrice * transformerQuantity;
  const busbarUstData = selectedTransformer?.busbarUstData;
  const busbarUstCost = calculateBusbarUstCost(busbarUstData, busbarMaterialPrices);

  const runnTableRows = getRunnTableRows(runnStore);

  // Данные для отображения дополнительного оборудования (только для таблицы)
  const additionalEquipmentItems = Object.entries(selectedEquipment || {})
    .filter(([name, val]) => val.checked && (val.count ?? 0) > 0)
    .map(([name, val]) => {
      const equipmentItem = (equipmentList || []).find(item => item.name === name);
      return {
        name,
        unit: equipmentItem?.unit || 'шт.',
        quantity: val.count ?? 0,
        price: val.price || 0,
        total: (val.price || 0) * (val.count ?? 0),
      };
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {pdfHeader ? (
          <PdfCommercialHeader meta={pdfHeader} user={user} logoSrc={pdfLogoSrc} />
        ) : (
          <View style={styles.header}>
            <Text style={styles.title}>Итоговая спецификация {filename}</Text>
            <Text style={styles.subtitle}>Исполнитель: ТОО &#34;АЭТЗ&#34;</Text>
            <Text style={styles.subtitle}>
              Исполнитель {user?.lastName || ''} {user?.firstName || ''}
              {user?.phone && ` | ${user.phone}`}
              {user?.email && ` | ${user.email}`}
            </Text>
            <Text style={styles.subtitle}>Дата: {new Date().toLocaleDateString('ru-RU')}</Text>
          </View>
        )}

        {/* Секция БМЗ */}
        {bmzStore.buildingType !== 'none' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={SECTION_TITLE_MIN_AHEAD}>
              Блочно модульное здание
            </Text>
            <View style={styles.table}>
              <View
                style={[styles.tableRow, styles.tableHeader]}
                wrap={false}
                minPresenceAhead={TABLE_HEADER_MIN_AHEAD}
              >
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
              </View>

              {/* Здание БМЗ */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCellNumber}>1</Text>
                <Text style={styles.tableCellName}>
                  Здание БМЗ ({bmzStore.length}×{bmzStore.width}×{bmzStore.height} мм, толщина{' '}
                  {bmzStore.thickness} мм, {bmzStore.blockCount} блоков)
                </Text>
                <Text style={styles.tableCellUnit}>м²</Text>
                <Text style={styles.tableCellQuantity}>{roundedArea}</Text>
                <Text style={styles.tableCellPrice}>{formatNumber(unitPrice)} тг</Text>
                <Text style={styles.tableCellTotal}>{formatNumber(buildingTotal)} тг</Text>
              </View>

              {/* Оборудование */}
              {activeEquipment.map((eq, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCellNumber}>{idx + 2}</Text>
                  <Text style={styles.tableCellName}>{eq.name}</Text>
                  <Text style={styles.tableCellUnit}>{eq.unit}</Text>
                  <Text style={styles.tableCellQuantity}>{eq.quantity}</Text>
                  <Text style={styles.tableCellPrice}>{formatNumber(eq.price)} тг</Text>
                  <Text style={styles.tableCellTotal}>{formatNumber(eq.totalPrice)} тг</Text>
                </View>
              ))}

              {/* Пользовательские строки для БМЗ */}
              {(customRowsByTable?.bmz || []).map((row: any, idx: number) => {
                const rowNumber = activeEquipment.length + 2 + idx;
                const indentLevel = row.indent || 0;
                const indentPadding = indentLevel * 8; // Отступ для PDF
                return (
                  <View key={row.id || `custom-bmz-${idx}`} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{rowNumber}</Text>
                    <Text style={[styles.tableCellName, { paddingLeft: indentPadding }]}>
                      {indentLevel > 0 && '└'.repeat(Math.min(indentLevel, 3))}
                      {row.name || ''}
                    </Text>
                    <Text style={styles.tableCellUnit}>{row.unit || 'шт.'}</Text>
                    <Text style={styles.tableCellQuantity}>{row.quantity || 1}</Text>
                    <Text style={styles.tableCellPrice}>{formatNumber(row.price || 0)} тг</Text>
                    <Text style={styles.tableCellTotal}>{formatNumber(row.total || 0)} тг</Text>
                  </View>
                );
              })}

              {/* Итог БМЗ */}
              <View style={[styles.tableRow, styles.totalRow]} wrap={false}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>ВСЕГО:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}></Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(bmzTotal)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Секция трансформатора */}
        {selectedTransformer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={SECTION_TITLE_MIN_AHEAD}>
              Трансформатор
            </Text>
            <View style={styles.table}>
              <View
                style={[styles.tableRow, styles.tableHeader]}
                wrap={false}
                minPresenceAhead={TABLE_HEADER_MIN_AHEAD}
              >
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
              </View>
              
              {/* Сам трансформатор */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCellNumber}>1</Text>
                <Text style={styles.tableCellName}>
                  Силовой трансформатор {selectedTransformer.model}
                </Text>
                <Text style={styles.tableCellUnit}>шт</Text>
                <Text style={styles.tableCellQuantity}>{transformerQuantity}</Text>
                <Text style={styles.tableCellPrice}>
                  {formatNumber(transformerBasePrice)} тг
                </Text>
                <Text style={styles.tableCellTotal}>
                  {formatNumber(transformerBaseTotal)} тг
                </Text>
              </View>

              {/* УСТ калькуляции */}
              {selectedTransformer.ustCalculations && selectedTransformer.ustCalculations.length > 0 ? (
                selectedTransformer.ustCalculations.map((calc: any, index: number) => {
                  const shouldAddBusbarCost = isUst04CalculationName(calc.name || '');
                  const additionalCost = shouldAddBusbarCost ? busbarUstCost : 0;
                  const ustPrice = calculateUstPrice(calc, additionalCost);
                  const ustTotal = ustPrice * transformerQuantity;
                  
                  return (
                    <View key={`ust-${index}`} style={styles.tableRow}>
                      <Text style={styles.tableCellNumber}>{index + 2}</Text>
                      <Text style={styles.tableCellName}>{calc.name || 'УСТ'}</Text>
                      <Text style={styles.tableCellUnit}>шт</Text>
                      <Text style={styles.tableCellQuantity}>{transformerQuantity}</Text>
                      <Text style={styles.tableCellPrice}>
                        {formatNumber(ustPrice)} тг
                      </Text>
                      <Text style={styles.tableCellTotal}>
                        {formatNumber(ustTotal)} тг
                      </Text>
                    </View>
                  );
                })
              ) : selectedTransformer.ustCalculation ? (
                (() => {
                  const ustPrice = calculateUstPrice(selectedTransformer.ustCalculation);
                  const ustTotal = ustPrice * transformerQuantity;
                  
                  return (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCellNumber}>2</Text>
                      <Text style={styles.tableCellName}>
                        {selectedTransformer.ustCalculation.name || 'УСТ'}
                      </Text>
                      <Text style={styles.tableCellUnit}>шт</Text>
                      <Text style={styles.tableCellQuantity}>{transformerQuantity}</Text>
                      <Text style={styles.tableCellPrice}>
                        {formatNumber(ustPrice)} тг
                      </Text>
                      <Text style={styles.tableCellTotal}>
                        {formatNumber(ustTotal)} тг
                      </Text>
                    </View>
                  );
                })()
              ) : null}

              {/* Пользовательские строки для трансформатора */}
              {(customRowsByTable?.transformer || []).map((row: any, idx: number) => {
                const baseRowCount = 1 + (selectedTransformer.ustCalculations?.length || (selectedTransformer.ustCalculation ? 1 : 0));
                const rowNumber = baseRowCount + 1 + idx;
                const indentLevel = row.indent || 0;
                const indentPadding = indentLevel * 8;
                return (
                  <View key={row.id || `custom-transformer-${idx}`} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{rowNumber}</Text>
                    <Text style={[styles.tableCellName, { paddingLeft: indentPadding }]}>
                      {indentLevel > 0 && '└'.repeat(Math.min(indentLevel, 3))}
                      {row.name || ''}
                    </Text>
                    <Text style={styles.tableCellUnit}>{row.unit || 'шт.'}</Text>
                    <Text style={styles.tableCellQuantity}>{row.quantity || 1}</Text>
                    <Text style={styles.tableCellPrice}>{formatNumber(row.price || 0)} тг</Text>
                    <Text style={styles.tableCellTotal}>{formatNumber(row.total || 0)} тг</Text>
                  </View>
                );
              })}

              {/* Итого по трансформатору */}
              <View style={[styles.tableRow, styles.totalRow]} wrap={false}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>ВСЕГО:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}></Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(transformerTotal)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        <PdfSpecTableSection
          title="РУСН-10кВ"
          rows={rusnTableConfig.dataMapper(rusnStore)}
          total={rusnTotal}
          customRows={customRowsByTable?.rusn || []}
          totalLabel="ВСЕГО:"
        />

        <PdfSpecTableSection
          title="РУ-0.4кВ"
          rows={runnTableRows}
          total={runnTotal}
          customRows={customRowsByTable?.runn || []}
        />

        {/* Секция дополнительного оборудования */}
        {additionalEquipmentItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={SECTION_TITLE_MIN_AHEAD}>
              Дополнительное оборудование
            </Text>
            <View style={styles.table}>
              <View
                style={[styles.tableRow, styles.tableHeader]}
                wrap={false}
                minPresenceAhead={TABLE_HEADER_MIN_AHEAD}
              >
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
              </View>

              {additionalEquipmentItems.map((item, index) => (
                <View key={item.name} style={styles.tableRow}>
                  <Text style={styles.tableCellNumber}>{index + 1}</Text>
                  <Text style={styles.tableCellName}>{item.name}</Text>
                  <Text style={styles.tableCellUnit}>{String(item.unit)}</Text>
                  <Text style={styles.tableCellQuantity}>{item.quantity}</Text>
                  <Text style={styles.tableCellPrice}>{formatNumber(item.price)} тг</Text>
                  <Text style={styles.tableCellTotal}>{formatNumber(item.total)} тг</Text>
                </View>
              ))}

              {/* Пользовательские строки для дополнительного оборудования */}
              {(customRowsByTable?.additionalEquipment || []).map((row: any, idx: number) => {
                const rowNumber = additionalEquipmentItems.length + 1 + idx;
                const indentLevel = row.indent || 0;
                const indentPadding = indentLevel * 8;
                return (
                  <View key={row.id || `custom-additional-${idx}`} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{rowNumber}</Text>
                    <Text style={[styles.tableCellName, { paddingLeft: indentPadding }]}>
                      {indentLevel > 0 && '└'.repeat(Math.min(indentLevel, 3))}
                      {row.name || ''}
                    </Text>
                    <Text style={styles.tableCellUnit}>{row.unit || 'шт.'}</Text>
                    <Text style={styles.tableCellQuantity}>{row.quantity || 1}</Text>
                    <Text style={styles.tableCellPrice}>{formatNumber(row.price || 0)} тг</Text>
                    <Text style={styles.tableCellTotal}>{formatNumber(row.total || 0)} тг</Text>
                  </View>
                );
              })}

              {/* Итого дополнительного оборудования */}
              <View style={[styles.tableRow, styles.totalRow]} wrap={false}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>ВСЕГО:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}></Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(additionalEquipmentTotal)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Секция работ */}
        {(worksList || []).filter((work) => selectedWorks[work.name]?.checked).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={SECTION_TITLE_MIN_AHEAD}>
              Работы и транспортные расходы
            </Text>
            <View style={styles.table}>
              <View
                style={[styles.tableRow, styles.tableHeader]}
                wrap={false}
                minPresenceAhead={TABLE_HEADER_MIN_AHEAD}
              >
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
              </View>

              {(worksList || [])
                .filter((work) => selectedWorks[work.name]?.checked)
                .map((work, index) => {
                  const count = 1; // Всегда 1
                  const totalPrice = work.price || 0; // Сумма равна цене
                  return (
                    <View key={work.name} style={styles.tableRow}>
                      <Text style={styles.tableCellNumber}>{index + 1}</Text>
                      <Text style={styles.tableCellName}>{work.name}</Text>
                      <Text style={styles.tableCellUnit}>{work.unit || 'раб'}</Text>
                      <Text style={styles.tableCellQuantity}>{count}</Text>
                      <Text style={styles.tableCellPrice}>{formatNumber(work.price || 0)} тг</Text>
                      <Text style={styles.tableCellTotal}>{formatNumber(totalPrice)} тг</Text>
                    </View>
                  );
                })}

              {/* Пользовательские строки для работ */}
              {(customRowsByTable?.works || []).map((row: any, idx: number) => {
                const worksCount = (worksList || []).filter((work) => selectedWorks[work.name]?.checked).length;
                const rowNumber = worksCount + 1 + idx;
                const indentLevel = row.indent || 0;
                const indentPadding = indentLevel * 8;
                return (
                  <View key={row.id || `custom-works-${idx}`} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{rowNumber}</Text>
                    <Text style={[styles.tableCellName, { paddingLeft: indentPadding }]}>
                      {indentLevel > 0 && '└'.repeat(Math.min(indentLevel, 3))}
                      {row.name || ''}
                    </Text>
                    <Text style={styles.tableCellUnit}>{row.unit || 'раб'}</Text>
                    <Text style={styles.tableCellQuantity}>{row.quantity || 1}</Text>
                    <Text style={styles.tableCellPrice}>{formatNumber(row.price || 0)} тг</Text>
                    <Text style={styles.tableCellTotal}>{formatNumber(row.total || 0)} тг</Text>
                  </View>
                );
              })}

              {/* Итого работ */}
              <View style={[styles.tableRow, styles.totalRow]} wrap={false}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>ВСЕГО:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}></Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(worksTotal)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Итоговая сумма по всем секциям */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
          <Text
            style={{ fontSize: 11, fontWeight: 'bold', fontFamily: PDF_FONT_BOLD, color: '#000' }}
          >
            Сумма: {formatNumber(grandTotal)} тг
          </Text>
        </View>
      </Page>
    </Document>
  );
};
