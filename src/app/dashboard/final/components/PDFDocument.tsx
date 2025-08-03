'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import {
  calculateArea,
  calculateBasePrice,
  calculateTotalPrice,
  getActiveEquipment,
  BmzData,
} from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorksState, WorkItem } from '@/store/useWorksStore';

// Регистрируем шрифт с поддержкой кириллицы
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
});

Font.register({
  family: 'Roboto-Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
});

// Создаем стили для PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 8,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 3,
    color: '#666666',
    fontFamily: 'Roboto',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000000',
    fontFamily: 'Roboto-Bold',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: '#3A55DF',
    fontWeight: 'bold',
  },
  tableCellHeader: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    flex: 1,
    backgroundColor: '#3A55DF',
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  tableCell: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    flex: 1,
    fontFamily: 'Roboto',
    color: '#000',
  },
  tableCellNumber: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    width: 25,
    textAlign: 'center',
    fontFamily: 'Roboto',
    color: '#000',
  },
  tableCellName: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    flex: 3,
    fontFamily: 'Roboto',
    color: '#000',
  },
  tableCellUnit: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    width: 35,
    textAlign: 'center',
    fontFamily: 'Roboto',
    color: '#000',
  },
  tableCellQuantity: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    width: 35,
    textAlign: 'center',
    fontFamily: 'Roboto',
    color: '#000',
  },
  tableCellPrice: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    width: 80,
    textAlign: 'right',
    fontFamily: 'Roboto',
    color: '#000',
  },
  tableCellTotal: {
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    fontSize: 7,
    width: 80,
    textAlign: 'right',
    fontFamily: 'Roboto',
    color: '#000',
  },
  totalRow: {
    backgroundColor: '#3A55DF',
    fontWeight: 'bold',
  },
  totalCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
});

// Типы для PDF документа
interface PDFDocumentProps {
  filename: string;
  fullName: string;
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedWorks: WorksState['selected'];
  worksList: WorkItem[];
}

// Функция для форматирования чисел
const formatNumber = (num: number) => {
  return num.toLocaleString('ru-RU');
};

export const PDFDocument = ({
  filename,
  fullName,
  bmzStore,
  selectedTransformer,
  rusnStore,
  selectedWorks,
  worksList,
}: PDFDocumentProps) => {
  // Глобальный расчет БМЗ
  const bmzArea = calculateArea(bmzStore.width, bmzStore.length);
  const roundedArea = Math.round(bmzArea * 10) / 10;
  const unitPrice = calculateBasePrice(bmzStore.settings, bmzStore.thickness, bmzArea);
  const buildingTotal = unitPrice * roundedArea;
  const activeEquipment = getActiveEquipment(bmzStore);
  const bmzTotal = calculateTotalPrice(bmzStore);

  // Итог по трансформатору
  const transformerTotal = selectedTransformer?.price ? selectedTransformer.price * 2 : 0;

  // Итог по РУСН
  const rusnTotal =
    rusnStore.cellConfigs.reduce((sum: number, cell: any) => sum + (cell.totalPrice || 0), 0) +
    (rusnStore.busBridgeSummary?.totalPrice || 0) +
    (rusnStore.busbarSummary?.totalPrice || 0);

  // Итог по работам
  const worksTotal = worksList
    .filter((work) => selectedWorks[work.name]?.checked)
    .reduce((sum, work) => {
      const count = selectedWorks[work.name]?.count || 1;
      return sum + work.price * count;
    }, 0);

  // Общая сумма
  const grandTotal = bmzTotal + transformerTotal + rusnTotal + worksTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Итоговая спецификация {filename}</Text>
          <Text style={styles.subtitle}>Исполнитель: ТОО &#34;АЭТЗ&#34;</Text>
          <Text style={styles.subtitle}>Создал: {fullName}</Text>
          <Text style={styles.subtitle}>Дата: {new Date().toLocaleDateString('ru-RU')}</Text>
        </View>

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

              {/* Итог БМЗ */}
              <View style={[styles.tableRow, styles.totalRow]}>
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
            <Text style={styles.sectionTitle}>Трансформатор</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellNumber}>1</Text>
                <Text style={styles.tableCellName}>
                  Силовой трансформатор {selectedTransformer.model}
                </Text>
                <Text style={styles.tableCellUnit}>шт</Text>
                <Text style={styles.tableCellQuantity}>2</Text>
                <Text style={styles.tableCellPrice}>
                  {formatNumber(selectedTransformer.price || 0)} тг
                </Text>
                <Text style={styles.tableCellTotal}>
                  {formatNumber((selectedTransformer.price || 0) * 2)} тг
                </Text>
              </View>
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>ВСЕГО:</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}></Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}></Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>
                  {formatNumber((selectedTransformer.price || 0) * 2)} тг
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Секция РУСН */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>РУСН-10кВ</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
              <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
              <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
              <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
              <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
              <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
            </View>

            {/* Ячейки РУСН */}
            {rusnStore.cellSummaries && rusnStore.cellSummaries.length > 0
              ? // Используем сохраненные сводки ячеек
                rusnStore.cellSummaries.map((summary: any, index: number) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellNumber}>{index + 1}</Text>
                    <Text style={styles.tableCellName}>{summary.name}</Text>
                    <Text style={styles.tableCellUnit}>шт</Text>
                    <Text style={styles.tableCellQuantity}>{summary.quantity}</Text>
                    <Text style={styles.tableCellPrice}>
                      {formatNumber(summary.pricePerUnit)} тг
                    </Text>
                    <Text style={styles.tableCellTotal}>{formatNumber(summary.totalPrice)} тг</Text>
                  </View>
                ))
              : // Fallback к обычному отображению ячеек
                rusnStore.cellConfigs.map((cell: any, index: number) => {
                  // Формируем полное название ячейки
                  let cellName = `Ячейка ${cell.purpose}`;

                  // Добавляем информацию о выключателе если есть
                  if (cell.breaker?.name) {
                    cellName += `, ${cell.breaker.name}`;
                  }

                  // Добавляем информацию о РЗА если есть
                  if (cell.relay?.name) {
                    cellName += `, РЗА: ${cell.relay.name}`;
                  }

                  // Добавляем информацию о трансформаторе тока если есть
                  if (cell.currentTransformer?.name) {
                    cellName += `, ТТ: ${cell.currentTransformer.name}`;
                  }

                  // Добавляем информацию о трансформаторе напряжения если есть
                  if (cell.voltageTransformer?.name) {
                    cellName += `, ТН: ${cell.voltageTransformer.name}`;
                  }

                  // Добавляем информацию о трансформаторе собственных нужд если есть
                  if (cell.auxiliaryTransformer?.name) {
                    cellName += `, ТСН: ${cell.auxiliaryTransformer.name}`;
                  }

                  // Добавляем информацию о приборе учета если есть
                  if (cell.metering?.name) {
                    cellName += `, ПУ: ${cell.metering.name}`;
                  }

                  return (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCellNumber}>{index + 1}</Text>
                      <Text style={styles.tableCellName}>{cellName}</Text>
                      <Text style={styles.tableCellUnit}>шт</Text>
                      <Text style={styles.tableCellQuantity}>1</Text>
                      <Text style={styles.tableCellPrice}>
                        {formatNumber(cell.totalPrice || 0)} тг
                      </Text>
                      <Text style={styles.tableCellTotal}>
                        {formatNumber(cell.totalPrice || 0)} тг
                      </Text>
                    </View>
                  );
                })}

            {/* Шинный мост */}
            {rusnStore.busBridgeSummary && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellNumber}>
                  {(rusnStore.cellSummaries?.length || rusnStore.cellConfigs.length) + 1}
                </Text>
                <Text style={styles.tableCellName}>{rusnStore.busBridgeSummary.name}</Text>
                <Text style={styles.tableCellUnit}>шт</Text>
                <Text style={styles.tableCellQuantity}>{rusnStore.busBridgeSummary.quantity}</Text>
                <Text style={styles.tableCellPrice}>
                  {formatNumber(rusnStore.busBridgeSummary.pricePerUnit)} тг
                </Text>
                <Text style={styles.tableCellTotal}>
                  {formatNumber(rusnStore.busBridgeSummary.totalPrice)} тг
                </Text>
              </View>
            )}

            {/* Сборные шины */}
            {rusnStore.busbarSummary && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellNumber}>
                  {(rusnStore.cellSummaries?.length || rusnStore.cellConfigs.length) +
                    (rusnStore.busBridgeSummary ? 1 : 0) +
                    1}
                </Text>
                <Text style={styles.tableCellName}>{rusnStore.busbarSummary.name}</Text>
                <Text style={styles.tableCellUnit}>шт</Text>
                <Text style={styles.tableCellQuantity}>{rusnStore.busbarSummary.quantity}</Text>
                <Text style={styles.tableCellPrice}>
                  {formatNumber(rusnStore.busbarSummary.pricePerUnit)} тг
                </Text>
                <Text style={styles.tableCellTotal}>
                  {formatNumber(rusnStore.busbarSummary.totalPrice)} тг
                </Text>
              </View>
            )}

            {/* Итого РУСН */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellNumber, styles.totalCell]}></Text>
              <Text style={[styles.tableCellName, styles.totalCell]}>ВСЕГО:</Text>
              <Text style={[styles.tableCellUnit, styles.totalCell]}></Text>
              <Text style={[styles.tableCellQuantity, styles.totalCell]}></Text>
              <Text style={[styles.tableCellPrice, styles.totalCell]}></Text>
              <Text style={[styles.tableCellTotal, styles.totalCell]}>
                {formatNumber(
                  rusnStore.cellConfigs.reduce(
                    (sum: number, cell: any) => sum + (cell.totalPrice || 0),
                    0
                  ) +
                    (rusnStore.busBridgeSummary?.totalPrice || 0) +
                    (rusnStore.busbarSummary?.totalPrice || 0)
                )}{' '}
                тг
              </Text>
            </View>
          </View>
        </View>

        {/* Секция работ */}
        {worksList.filter((work) => selectedWorks[work.name]?.checked).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Работы и транспортные расходы</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
                <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
                <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
                <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
                <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
                <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
              </View>

              {worksList
                .filter((work) => selectedWorks[work.name]?.checked)
                .map((work, index) => {
                  const count = selectedWorks[work.name]?.count || 1;
                  const totalPrice = work.price * count;
                  return (
                    <View key={work.name} style={styles.tableRow}>
                      <Text style={styles.tableCellNumber}>{index + 1}</Text>
                      <Text style={styles.tableCellName}>{work.name}</Text>
                      <Text style={styles.tableCellUnit}>{work.unit || 'раб.'}</Text>
                      <Text style={styles.tableCellQuantity}>{count}</Text>
                      <Text style={styles.tableCellPrice}>{formatNumber(work.price)} тг</Text>
                      <Text style={styles.tableCellTotal}>{formatNumber(totalPrice)} тг</Text>
                    </View>
                  );
                })}

              {/* Итого работ */}
              <View style={[styles.tableRow, styles.totalRow]}>
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
            style={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'Roboto-Bold', color: '#000' }}
          >
            Сумма: {formatNumber(grandTotal)} тг
          </Text>
        </View>
      </Page>
    </Document>
  );
};
