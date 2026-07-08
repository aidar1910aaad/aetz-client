'use client';

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { TableRow } from '@/components/FinalReview/UniversalTable';
import { PDF_FONT_REGULAR, PDF_FONT_BOLD } from '@/lib/pdfFonts';

const styles = StyleSheet.create({
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
  tableRow: {
    flexDirection: 'row',
    minHeight: 20,
    alignItems: 'flex-start',
  },
  tableHeader: {
    backgroundColor: '#90bd20',
    fontWeight: 'bold',
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
    flexGrow: 1,
    flexBasis: 0,
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
    width: 72,
    textAlign: 'right',
    fontFamily: PDF_FONT_REGULAR,
    color: '#000',
  },
  tableCellTotal: {
    padding: 3,
    fontSize: 7,
    width: 72,
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

const formatNumber = (num: number) =>
  Math.round(num).toLocaleString('ru-RU', { maximumFractionDigits: 0 });

export interface PdfSpecTableSectionProps {
  title: string;
  rows: TableRow[];
  total: number;
  customRows?: any[];
  /** КП: без колонок цены */
  showPrices?: boolean;
  totalLabel?: string;
}

/**
 * Таблица спецификации для PDF: строки не режутся при переносе страницы (wrap={false}),
 * без вложенного flex-контейнера «table», из-за которого react-pdf обрезает содержимое.
 */
export function PdfSpecTableSection({
  title,
  rows,
  total,
  customRows = [],
  showPrices = true,
  totalLabel = 'Итого:',
}: PdfSpecTableSectionProps) {
  if (rows.length === 0 && customRows.length === 0) {
    return null;
  }

  let rowNumber = 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View wrap={false} style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCellNumber, styles.totalCell]}>№</Text>
        <Text style={[styles.tableCellName, styles.totalCell]}>Наименование</Text>
        <Text style={[styles.tableCellUnit, styles.totalCell]}>Ед. изм.</Text>
        <Text style={[styles.tableCellQuantity, styles.totalCell]}>Кол-во</Text>
        {showPrices && (
          <>
            <Text style={[styles.tableCellPrice, styles.totalCell]}>Цена</Text>
            <Text style={[styles.tableCellTotal, styles.totalCell]}>Сумма</Text>
          </>
        )}
      </View>

      {rows.map((row) => {
        const isSectionHeader = row.isSectionHeader === true;
        if (!isSectionHeader) {
          rowNumber += 1;
        }
        const price = typeof row.price === 'number' ? row.price : 0;
        const rowTotal = typeof row.total === 'number' ? row.total : 0;

        return (
          <View key={String(row.id)} wrap={false} style={styles.tableRow}>
            <Text style={styles.tableCellNumber}>
              {isSectionHeader ? '' : String(rowNumber)}
            </Text>
            <Text style={styles.tableCellName}>{row.name || ''}</Text>
            <Text style={styles.tableCellUnit}>
              {isSectionHeader ? '' : row.unit || 'шт.'}
            </Text>
            <Text style={styles.tableCellQuantity}>
              {isSectionHeader ? '' : String(row.quantity ?? 1)}
            </Text>
            {showPrices && (
              <>
                <Text style={styles.tableCellPrice}>
                  {isSectionHeader ? '' : price > 0 ? `${formatNumber(price)} тг` : '—'}
                </Text>
                <Text style={styles.tableCellTotal}>
                  {isSectionHeader ? '' : rowTotal > 0 ? `${formatNumber(rowTotal)} тг` : '—'}
                </Text>
              </>
            )}
          </View>
        );
      })}

      {customRows.map((row: any, idx: number) => {
        const customRowNumber = rowNumber + 1 + idx;
        const indentLevel = row.indent || 0;
        const indentPadding = indentLevel * 8;
        return (
          <View key={row.id || `custom-${idx}`} wrap={false} style={styles.tableRow}>
            <Text style={styles.tableCellNumber}>{customRowNumber}</Text>
            <Text style={[styles.tableCellName, { paddingLeft: indentPadding }]}>
              {indentLevel > 0 && '└'.repeat(Math.min(indentLevel, 3))}
              {row.name || ''}
            </Text>
            <Text style={styles.tableCellUnit}>{row.unit || 'шт.'}</Text>
            <Text style={styles.tableCellQuantity}>{String(row.quantity || 1)}</Text>
            {showPrices && (
              <>
                <Text style={styles.tableCellPrice}>{formatNumber(row.price || 0)} тг</Text>
                <Text style={styles.tableCellTotal}>{formatNumber(row.total || 0)} тг</Text>
              </>
            )}
          </View>
        );
      })}

      <View wrap={false} style={[styles.tableRow, styles.totalRow]}>
        <Text style={[styles.tableCellNumber, styles.totalCell]}>
          {showPrices ? '—' : ''}
        </Text>
        <Text style={[styles.tableCellName, styles.totalCell]}>{totalLabel}</Text>
        <Text style={[styles.tableCellUnit, styles.totalCell]}>
          {showPrices ? '—' : ''}
        </Text>
        {showPrices ? (
          <>
            <Text style={[styles.tableCellQuantity, styles.totalCell]}>—</Text>
            <Text style={[styles.tableCellPrice, styles.totalCell]}>—</Text>
            <Text style={[styles.tableCellTotal, styles.totalCell]}>
              {formatNumber(total)} тг
            </Text>
          </>
        ) : (
          <Text style={[styles.tableCellTotal, styles.totalCell]}>
            {formatNumber(total)} тг
          </Text>
        )}
      </View>
    </View>
  );
}
