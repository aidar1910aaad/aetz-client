import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorkItem } from '@/store/useWorksStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import {
  bmzTableConfig,
  transformerTableConfig,
  rusnTableConfig,
  runnTableConfig,
  additionalEquipmentTableConfig,
  worksTableConfig,
} from '@/components/FinalReview/tableConfigs';
import { getRunnTableRows } from '@/utils/runnExportRows';
import type { TableRow } from '@/components/FinalReview/UniversalTable';
import {
  getTransformerUstRows,
  type BusbarMaterialPrices,
} from '@/utils/busbarUstCost';
import type { PdfHeaderMeta } from '@/app/dashboard/final/components/PdfCommercialHeader';

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

interface Totals {
  bmzTotal: number;
  transformerTotal: number;
  rusnTotal: number;
  runnTotal: number;
  additionalEquipmentTotal: number;
  worksTotal: number;
  grandTotal: number;
}

export interface ExportFinalReviewToExcelParams {
  filename: string;
  pdfHeader?: PdfHeaderMeta;
  executor?: string;
  bmzStore: BmzData;
  selectedTransformer: ExtendedTransformer | null;
  rusnStore: RusnState;
  selectedWorks: Record<string, { checked?: boolean }>;
  worksList: WorkItem[];
  runnStore: any;
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  totals: Totals;
  customRowsByTable?: Record<string, any[]>;
  busbarMaterialPrices: BusbarMaterialPrices;
  businessTravelTotal?: number;
}

const COL_COUNT = 6;
const HEADERS = ['№', 'Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'];

const COLORS = {
  brandGreen: 'FF90BD20',
  brandGreenDark: 'FF7BA01C',
  brandGreenLight: 'FFE8F4D0',
  brandGreenPale: 'FFF4FAEB',
  white: 'FFFFFFFF',
  textDark: 'FF1F2937',
  textMuted: 'FF6B7280',
  border: 'FFD1D5DB',
  rowAlt: 'FFF9FAFB',
};

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

function formatMoney(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '—';
  return `${Math.round(value).toLocaleString('ru-RU')} тг`;
}

function formatQuantity(value: unknown): string | number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return value ? String(value) : '—';
}

function formatRusnCellName(name: string): string {
  const withoutPrefix = name.replace('Камера КСО А12-10', '').trim();
  return withoutPrefix
    .replace(/Выключатель:/g, '\nВыключатель:')
    .replace(/РЗА:/g, '\nРЗА:')
    .replace(/Счетчик:/g, '\nСчетчик:')
    .trim();
}

function formatCustomRowName(row: any): string {
  const indentLevel = row.indent || 0;
  const prefix = indentLevel > 0 ? `${'  '.repeat(indentLevel)}` : '';
  return `${prefix}${row.name || ''}`;
}

function applyBorders(row: ExcelJS.Row, fromCol = 1, toCol = COL_COUNT): void {
  for (let col = fromCol; col <= toCol; col += 1) {
    const cell = row.getCell(col);
    cell.border = thinBorder;
  }
}

function setRowValues(row: ExcelJS.Row, values: (string | number)[]): void {
  values.forEach((value, index) => {
    row.getCell(index + 1).value = value;
  });
}

class StyledSheetBuilder {
  private currentRow = 1;
  private dataRowCounter = 0;

  constructor(private readonly ws: ExcelJS.Worksheet) {
    ws.columns = [
      { width: 6 },
      { width: 52 },
      { width: 10 },
      { width: 10 },
      { width: 18 },
      { width: 18 },
    ];
    ws.views = [{ state: 'frozen', ySplit: 0, activeCell: 'A1' }];
  }

  private mergeFullRow(row: number): void {
    this.ws.mergeCells(row, 1, row, COL_COUNT);
  }

  private mergeLeftRight(row: number): void {
    this.ws.mergeCells(row, 1, row, 3);
    this.ws.mergeCells(row, 4, row, COL_COUNT);
  }

  private nextRow(): ExcelJS.Row {
    const row = this.ws.getRow(this.currentRow);
    this.currentRow += 1;
    return row;
  }

  addTitle(text: string): void {
    const rowNum = this.currentRow;
    const row = this.nextRow();
    setRowValues(row, [text]);
    this.mergeFullRow(rowNum);
    row.height = 32;
    row.getCell(1).font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.brandGreenDark } };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
  }

  addMetaRow(left: string, right: string): void {
    const rowNum = this.currentRow;
    const row = this.nextRow();
    setRowValues(row, [left, '', '', right, '', '']);
    this.mergeLeftRight(rowNum);
    row.height = 20;
    row.getCell(1).font = { name: 'Calibri', size: 11, color: { argb: COLORS.textDark } };
    row.getCell(4).font = { name: 'Calibri', size: 11, color: { argb: COLORS.textDark } };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
  }

  addBlankRow(): void {
    this.currentRow += 1;
  }

  addSectionTitle(title: string): void {
    const rowNum = this.currentRow;
    const row = this.nextRow();
    setRowValues(row, [title]);
    this.mergeFullRow(rowNum);
    row.height = 24;
    row.getCell(1).font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLORS.brandGreenDark } };
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.brandGreenLight },
    };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    applyBorders(row, 1, COL_COUNT);
  }

  addTableHeader(): void {
    const row = this.nextRow();
    setRowValues(row, HEADERS);
    row.height = 22;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > COL_COUNT) return;
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.brandGreen },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 2 ? 'left' : 'center',
        wrapText: true,
      };
      cell.border = thinBorder;
    });
  }

  addDataRow(
    num: number | string,
    name: string,
    unit: string,
    quantity: string | number,
    price: string,
    total: string,
  ): void {
    const row = this.nextRow();
    setRowValues(row, [num, name, unit, quantity, price, total]);
    const isAlt = this.dataRowCounter % 2 === 1;
    this.dataRowCounter += 1;

    row.height = name.includes('\n') ? 42 : 20;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > COL_COUNT) return;
      cell.font = { name: 'Calibri', size: 10, color: { argb: COLORS.textDark } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isAlt ? COLORS.rowAlt : COLORS.white },
      };
      cell.border = thinBorder;

      if (colNumber === 1 || colNumber === 3 || colNumber === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }
    });
  }

  addSectionTotal(label: string, total: number): void {
    const rowNum = this.currentRow;
    const row = this.nextRow();
    setRowValues(row, ['', '', '', '', label, formatMoney(total)]);
    this.ws.mergeCells(rowNum, 1, rowNum, 5);
    row.height = 22;
    row.getCell(5).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.textDark } };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(6).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.brandGreenDark } };
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' };
    for (let col = 1; col <= COL_COUNT; col += 1) {
      const cell = row.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.brandGreenPale },
      };
      cell.border = thinBorder;
    }
    this.dataRowCounter = 0;
  }

  addGrandTotal(label: string, total: number): void {
    const rowNum = this.currentRow;
    const row = this.nextRow();
    setRowValues(row, ['', '', '', '', label, formatMoney(total)]);
    this.ws.mergeCells(rowNum, 1, rowNum, 5);
    row.height = 28;
    for (let col = 1; col <= COL_COUNT; col += 1) {
      const cell = row.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.brandGreen },
      };
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLORS.white } };
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: col === 5 ? 'right' : col === 6 ? 'right' : 'center',
      };
    }
  }

  addSectionTable(
    title: string,
    dataRows: TableRow[],
    customRows: any[],
    sectionTotal: number,
    formatName?: (name: string) => string,
  ): void {
    if (!dataRows.length && !customRows.length) return;

    this.addSectionTitle(title);
    this.addTableHeader();

    let dataRowNumber = 0;
    dataRows.forEach((row) => {
      const isSectionHeader = (row as TableRow).isSectionHeader === true;
      if (!isSectionHeader) {
        dataRowNumber += 1;
      }
      const name = formatName ? formatName(String(row.name || '')) : String(row.name || '—');
      this.addDataRow(
        isSectionHeader ? '' : dataRowNumber,
        name,
        isSectionHeader ? '' : String(row.unit || 'шт'),
        isSectionHeader ? '' : formatQuantity(row.quantity),
        isSectionHeader ? '' : formatMoney(row.price),
        isSectionHeader ? '' : formatMoney(row.total),
      );
    });

    customRows.forEach((row, idx) => {
      this.addDataRow(
        dataRows.length + 1 + idx,
        formatCustomRowName(row),
        String(row.unit || 'шт.'),
        formatQuantity(row.quantity ?? 1),
        formatMoney(row.price),
        formatMoney(row.total),
      );
    });

    this.addSectionTotal('Итого:', sectionTotal);
    this.addBlankRow();
  }
}

export async function exportFinalReviewToExcel(params: ExportFinalReviewToExcelParams): Promise<void> {
  const {
    filename,
    pdfHeader,
    executor,
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
    busbarMaterialPrices,
    businessTravelTotal = 0,
  } = params;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'АЭТЗ';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Спецификация', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  const builder = new StyledSheetBuilder(ws);

  const client = pdfHeader?.client?.trim() || '—';
  const date = pdfHeader?.date?.trim() || new Date().toLocaleDateString('ru-RU');
  const taskNumber = pdfHeader?.taskNumber?.trim() || '000-000';
  const approver = executor?.trim() || '—';

  builder.addTitle('Спецификация оборудования');
  builder.addMetaRow(`Объект: ${client}`, `Дата: ${date}`);
  builder.addMetaRow(`РАСЧЁТ №${taskNumber}`, `Утверждаю: ${approver}`);
  builder.addBlankRow();

  const bmzRows =
    bmzStore.buildingType && bmzStore.buildingType !== 'none'
      ? bmzTableConfig.dataMapper(bmzStore)
      : [];
  builder.addSectionTable(
    bmzTableConfig.title,
    bmzRows,
    customRowsByTable[bmzTableConfig.id] || [],
    totals.bmzTotal,
  );

  if (selectedTransformer) {
    const transformerRows = transformerTableConfig.dataMapper(selectedTransformer);
    builder.addSectionTable(
      transformerTableConfig.title,
      transformerRows,
      customRowsByTable[transformerTableConfig.id] || [],
      totals.transformerTotal,
    );
  }

  builder.addSectionTable(
    rusnTableConfig.title,
    [
      ...rusnTableConfig.dataMapper(rusnStore),
      ...getTransformerUstRows(selectedTransformer, 'rusn', busbarMaterialPrices),
    ],
    customRowsByTable[rusnTableConfig.id] || [],
    totals.rusnTotal,
    formatRusnCellName,
  );

  builder.addSectionTable(
    runnTableConfig.title,
    [
      ...getRunnTableRows(runnStore),
      ...getTransformerUstRows(selectedTransformer, 'runn', busbarMaterialPrices),
    ],
    customRowsByTable[runnTableConfig.id] || [],
    totals.runnTotal,
  );

  builder.addSectionTable(
    additionalEquipmentTableConfig.title,
    additionalEquipmentTableConfig.dataMapper({ selected: selectedEquipment, equipmentList }),
    customRowsByTable[additionalEquipmentTableConfig.id] || [],
    totals.additionalEquipmentTotal,
  );

  builder.addSectionTable(
    worksTableConfig.title,
    worksTableConfig.dataMapper({ selected: selectedWorks, worksList }, { businessTravelTotal }),
    customRowsByTable[worksTableConfig.id] || [],
    totals.worksTotal,
  );

  builder.addGrandTotal('Сумма:', totals.grandTotal);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const safeName = (filename || 'Спецификация').replace(/[\\/:*?"<>|]/g, '-');
  saveAs(blob, `${safeName}.xlsx`);
}
