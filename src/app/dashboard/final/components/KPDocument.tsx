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
import type { WorkItem } from '@/store/useWorksStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import { rusnTableConfig, bmzTableConfig, transformerTableConfig, runnTableConfig, additionalEquipmentTableConfig, worksTableConfig } from '@/components/FinalReview/tableConfigs';
import { getRunnTableRows } from '@/utils/runnExportRows';
import { PdfSpecTableSection } from './PdfSpecTableSection';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { calculateBusbarUstCost } from '@/utils/busbarUstCost';
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
  totalAmount: {
    padding: 3,
    fontSize: 7,
    textAlign: 'right',
    fontFamily: PDF_FONT_BOLD,
    fontWeight: 'bold',
    color: '#fff',
    flexWrap: 'nowrap',
  },
});

interface Totals {
  bmzTotal: number;
  transformerTotal: number;
  rusnTotal: number;
  runnTotal: number;
  additionalEquipmentTotal: number;
  worksTotal: number;
  grandTotal: number;
}

interface KPDocumentProps {
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
  tableMarkupTotals: Record<string, number | null>;
  customRowsByTable?: Record<string, any[]>;
}

// Функция для форматирования чисел
const formatNumber = (num: number) => {
  return Math.round(num).toLocaleString('ru-RU', { maximumFractionDigits: 0 });
};

export const KPDocument = ({
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
  tableMarkupTotals,
  customRowsByTable = {},
}: KPDocumentProps) => {
  const { aluminum: aluminumPrice, copper: copperPrice } = useMaterialPrices();
  const busbarMaterialPrices = { aluminum: aluminumPrice, copper: copperPrice };
  const { bmzTotal, transformerTotal, rusnTotal, runnTotal, additionalEquipmentTotal, worksTotal, grandTotal } = totals;

  // Получаем итоговые суммы с наценкой для каждой таблицы
  const getMarkupTotal = (tableId: string, baseTotal: number): number => {
    const markupTotal = tableMarkupTotals[tableId];
    return markupTotal !== null && markupTotal !== undefined ? markupTotal : baseTotal;
  };

  const bmzMarkupTotal = getMarkupTotal(bmzTableConfig.id, bmzTotal);
  const transformerMarkupTotal = getMarkupTotal(transformerTableConfig.id, transformerTotal);
  const rusnMarkupTotal = getMarkupTotal(rusnTableConfig.id, rusnTotal);
  const runnMarkupTotal = getMarkupTotal(runnTableConfig.id, runnTotal);
  const equipmentMarkupTotal = getMarkupTotal(additionalEquipmentTableConfig.id, additionalEquipmentTotal);
  const worksMarkupTotal = getMarkupTotal(worksTableConfig.id, worksTotal);

  // Расчет итоговой суммы с наценкой
  const finalTotalWithMarkup = bmzMarkupTotal + transformerMarkupTotal + rusnMarkupTotal + runnMarkupTotal + equipmentMarkupTotal + worksMarkupTotal;

  // БМЗ данные
  const area = calculateArea(bmzStore.length || 0, bmzStore.width || 0);
  const roundedArea = Math.round(area);
  const unitPrice = bmzStore.buildingType === 'bmz' 
    ? calculateBasePrice(bmzStore.settings, bmzStore.thickness || 0, area, bmzStore.height || 0)
    : 0;
  const buildingTotal = unitPrice * roundedArea;
  const activeEquipment = getActiveEquipment(bmzStore);

  // Трансформатор данные
  const transformerQuantity = selectedTransformer?.quantity || 2;
  const transformerBasePrice = selectedTransformer?.price || 0;
  const transformerBaseTotal = transformerBasePrice * transformerQuantity;

  // Функция для расчета цены УСТ
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

  const busbarUstCost = calculateBusbarUstCost(
    selectedTransformer?.busbarUstData,
    busbarMaterialPrices,
  );

  // Дополнительное оборудование
  const additionalEquipmentItems = Object.entries(selectedEquipment || {})
    .filter(([name, val]) => val.checked && (val.count ?? 0) > 0)
    .map(([name, val]) => {
      const equipmentItem = equipmentList.find((item) => item.name === name);
      return {
        name,
        unit: equipmentItem?.unit || 'шт.',
        quantity: val.count ?? 0,
        price: val.price || 0,
        total: (val.price || 0) * (val.count ?? 0),
      };
    });

  const runnTableRows = getRunnTableRows(runnStore);

  // Проверяем наличие необходимых данных
  if (!bmzStore || !rusnStore || !selectedWorks || !worksList || !runnStore) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Ошибка создания КП</Text>
            <Text style={styles.subtitle}>Недостаточно данных для создания документа</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {pdfHeader ? (
          <PdfCommercialHeader meta={pdfHeader} user={user} logoSrc={pdfLogoSrc} />
        ) : (
          <View style={styles.header}>
            <Text style={styles.title}>Коммерческое предложение {filename}</Text>
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
            <Text style={styles.sectionTitle}>Блочно модульное здание</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
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
              </View>

              {/* Оборудование */}
              {activeEquipment.map((eq, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCellNumber}>{idx + 2}</Text>
                  <Text style={styles.tableCellName}>{eq.name}</Text>
                  <Text style={styles.tableCellUnit}>{eq.unit}</Text>
                  <Text style={styles.tableCellQuantity}>{eq.quantity}</Text>
                </View>
              ))}

              {/* Пользовательские строки для БМЗ */}
              {(customRowsByTable?.bmz || []).map((row: any, idx: number) => {
                const rowNumber = activeEquipment.length + 2 + idx;
                const indentLevel = row.indent || 0;
                const indentPadding = indentLevel * 8;
                return (
                  <View key={row.id || `custom-bmz-${idx}`} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{rowNumber}</Text>
                    <Text style={[styles.tableCellName, { paddingLeft: indentPadding }]}>
                      {indentLevel > 0 && '└'.repeat(Math.min(indentLevel, 3))}
                      {row.name || ''}
                    </Text>
                    <Text style={styles.tableCellUnit}>{row.unit || 'шт.'}</Text>
                    <Text style={styles.tableCellQuantity}>{row.quantity || 1}</Text>
                  </View>
                );
              })}

              {/* Итог БМЗ */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Всего:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(bmzMarkupTotal)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Секция трансформатора */}
        {selectedTransformer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Трансформатор</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
              </View>
              
              {/* Сам трансформатор */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCellNumber}>1</Text>
                <Text style={styles.tableCellName}>
                  Силовой трансформатор {selectedTransformer.model}
                </Text>
                <Text style={styles.tableCellUnit}>шт</Text>
                <Text style={styles.tableCellQuantity}>{transformerQuantity}</Text>
              </View>

              {/* УСТ калькуляции */}
              {selectedTransformer.ustCalculations && selectedTransformer.ustCalculations.length > 0 ? (
                selectedTransformer.ustCalculations.map((calc: any, index: number) => (
                  <View key={`ust-${index}`} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{index + 2}</Text>
                    <Text style={styles.tableCellName}>{calc.name || 'УСТ'}</Text>
                    <Text style={styles.tableCellUnit}>шт</Text>
                    <Text style={styles.tableCellQuantity}>{transformerQuantity}</Text>
                  </View>
                ))
              ) : selectedTransformer.ustCalculation ? (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCellNumber}>2</Text>
                  <Text style={styles.tableCellName}>
                    {selectedTransformer.ustCalculation.name || 'УСТ'}
                  </Text>
                  <Text style={styles.tableCellUnit}>шт</Text>
                  <Text style={styles.tableCellQuantity}>{transformerQuantity}</Text>
                </View>
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
                  </View>
                );
              })}

              {/* Итого по трансформатору */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Всего:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(transformerMarkupTotal)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Секция РУСН */}
        {(() => {
          const rusnRows = rusnTableConfig.dataMapper(rusnStore);

          if (!rusnRows || rusnRows.length === 0) {
            return null;
          }

          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>РУСН-10кВ</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                  <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                  <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                  <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
                </View>

                {/* Строки данных РУСН */}
                {rusnRows.map((row: any, index: number) => (
                  <View key={row.id || `rusn-row-${index}`} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{index + 1}</Text>
                    <Text style={styles.tableCellName}>{row.name || '—'}</Text>
                    <Text style={styles.tableCellUnit}>{row.unit || 'шт'}</Text>
                    <Text style={styles.tableCellQuantity}>{row.quantity || 0}</Text>
                  </View>
                ))}

                {/* Пользовательские строки для РУСН */}
                {(customRowsByTable?.rusn || []).map((row: any, idx: number) => {
                  const rowNumber = rusnRows.length + 1 + idx;
                  const indentLevel = row.indent || 0;
                  const indentPadding = indentLevel * 8;
                  return (
                    <View key={row.id || `custom-rusn-${idx}`} style={styles.tableRow}>
                      <Text style={styles.tableCellNumber}>{rowNumber}</Text>
                      <Text style={[styles.tableCellName, { paddingLeft: indentPadding }]}>
                        {indentLevel > 0 && '└'.repeat(Math.min(indentLevel, 3))}
                        {row.name || ''}
                      </Text>
                      <Text style={styles.tableCellUnit}>{row.unit || 'шт.'}</Text>
                      <Text style={styles.tableCellQuantity}>{row.quantity || 1}</Text>
                    </View>
                  );
                })}

                {/* Итого РУСН */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                  <Text style={[styles.tableCellName, styles.totalCell]}>Всего:</Text>
                  <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                  <Text style={[styles.tableCellTotal, styles.totalCell]}>
                    {formatNumber(rusnMarkupTotal)} тг
                  </Text>
                </View>
              </View>
            </View>
          );
        })()}

        <PdfSpecTableSection
          title="РУ-0.4кВ"
          rows={runnTableRows}
          total={runnMarkupTotal}
          customRows={customRowsByTable?.runn || []}
          showPrices={false}
          totalLabel="Всего:"
        />

        {/* Секция дополнительного оборудования */}
        {additionalEquipmentItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Дополнительное оборудование</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
              </View>

              {additionalEquipmentItems.map((item, index) => (
                <View key={item.name} style={styles.tableRow}>
                  <Text style={styles.tableCellNumber}>{index + 1}</Text>
                  <Text style={styles.tableCellName}>{item.name}</Text>
                  <Text style={styles.tableCellUnit}>{String(item.unit)}</Text>
                  <Text style={styles.tableCellQuantity}>{item.quantity}</Text>
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
                  </View>
                );
              })}

              {/* Итого дополнительного оборудования */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Всего:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(equipmentMarkupTotal)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Секция работ */}
        {(worksList || []).filter((work) => selectedWorks[work.name]?.checked).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Работы и транспортные расходы</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
              </View>

              {(worksList || [])
                .filter((work) => selectedWorks[work.name]?.checked)
                .map((work, index) => (
                  <View key={work.name} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{index + 1}</Text>
                    <Text style={styles.tableCellName}>{work.name}</Text>
                    <Text style={styles.tableCellUnit}>{work.unit || 'раб'}</Text>
                    <Text style={styles.tableCellQuantity}>1</Text>
                  </View>
                ))}

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
                  </View>
                );
              })}

              {/* Итого работ */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Всего:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber(worksMarkupTotal)} тг
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
            Сумма: {formatNumber(finalTotalWithMarkup)} тг
          </Text>
        </View>
      </Page>
    </Document>
  );
};

