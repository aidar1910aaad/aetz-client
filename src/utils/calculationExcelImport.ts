import * as XLSX from 'xlsx';
import { Material } from '@/api/material';

export const CATEGORY_MARKER = 'category';
export const LABOR_MARKER = 'labor';

export interface ParsedMaterialRow {
  line: number;
  code: string;
  excelName: string;
  quantity: number;
}

export interface ParsedCategory {
  name: string;
  line: number;
  materials: ParsedMaterialRow[];
}

export interface ParseExcelResult {
  categories: ParsedCategory[];
  laborHours: number;
  headerRow: number;
}

export interface MissingMaterialItem {
  line: number;
  code: string;
  excelName: string;
  quantity: number;
  categoryName: string;
}

export interface ResolvedMaterialItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  code: string;
}

export interface ResolvedCategory {
  name: string;
  items: ResolvedMaterialItem[];
}

export interface PreviewItem {
  status: 'found' | 'missing';
  id?: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  code: string;
  line: number;
}

export interface PreviewCategory {
  name: string;
  items: PreviewItem[];
}

export interface ImportPreview {
  categories: ResolvedCategory[];
  previewCategories: PreviewCategory[];
  missingMaterials: MissingMaterialItem[];
  laborHours: number;
  foundCount: number;
  missingCount: number;
  totalCategoryCount: number;
  totalMaterialCount: number;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[\s\u00a0_.\-/\\]+/g, '');
}

const CODE_ALIASES = [
  'oneccode',
  'onec',
  'код',
  'код1с',
  'номенклатурныйномер',
  'артикул',
  'nomenclature',
];

const NAME_ALIASES = [
  'материалы',
  'materials',
  'наименование',
  'название',
  'номенклатура',
  'наименованиеновое',
  'описание',
];

const QTY_ALIASES = [
  'excelqty',
  'qty',
  'колво',
  'количество',
  'кво',
];

function matchesAlias(normalized: string, aliases: string[]): boolean {
  if (!normalized) return false;
  return aliases.some((alias) => {
    if (normalized === alias) return true;
    // Длинные алиасы — ищем вхождение в заголовок
    if (alias.length >= 4 && normalized.includes(alias)) return true;
    if (normalized.length >= 4 && alias.includes(normalized)) return true;
    return false;
  });
}

/** Если все заголовки в одной ячейке — разбиваем */
function expandCombinedHeaderRow(row: unknown[]): unknown[] {
  const nonEmpty = row.map((c) => String(c ?? '').trim()).filter(Boolean);
  if (nonEmpty.length !== 1) return row;

  const text = nonEmpty[0];
  const lower = text.toLowerCase();
  if (!lower.includes('onec') && !lower.includes('excel')) return row;

  const byTab = text.split(/\t+/).map((s) => s.trim()).filter(Boolean);
  if (byTab.length >= 3) return byTab;

  // "onec_code Материалы Ед. изм. excel_qty Цена Сумма"
  const known = text.match(
    /onec[_\s]?code|onec_code/i
  );
  if (known) {
    const parts = text.split(/\s{2,}|\t+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) return parts;
    // Разбивка по шаблону известных заголовков
    const regex =
      /(onec_code|onec\s*code)\s+(материалы)\s+(ед\.?\s*изм\.?)\s+(excel_qty|excel\s*qty)\s*(?:цена)?\s*(?:сумма)?/i;
    const m = text.match(regex);
    if (m) {
      return [m[1], m[2], m[3], m[4], 'Цена', 'Сумма'].filter(Boolean);
    }
  }

  return row;
}

/** Точный формат: onec_code | Материалы | Ед. изм. | excel_qty | Цена | Сумма */
function tryKnownFormatRow(row: unknown[]): Omit<ColumnMap, 'headerRow'> | null {
  const expanded = expandCombinedHeaderRow(row);
  const normalized = expanded.map(normalizeHeader);

  // Позиционный формат (6 колонок)
  if (
    normalized.length >= 4 &&
    (normalized[0] === 'oneccode' || normalized[0] === 'onec') &&
    normalized[1] === 'материалы' &&
    (normalized[3] === 'excelqty' || normalized[3] === 'qty')
  ) {
    return { codeCol: 0, nameCol: 1, qtyCol: 3 };
  }

  const codeCol = normalized.findIndex(
    (h) => h === 'oneccode' || h === 'onec' || h === 'код'
  );
  const nameCol = normalized.findIndex((h) => h === 'материалы' || h === 'materials');
  const qtyCol = normalized.findIndex((h) => h === 'excelqty' || h === 'qty' || h === 'колво');

  if (nameCol >= 0 && qtyCol >= 0) {
    return { codeCol: codeCol >= 0 ? codeCol : 0, nameCol, qtyCol };
  }

  return null;
}

function findColumnsInRow(row: unknown[]): Omit<ColumnMap, 'headerRow'> | null {
  const known = tryKnownFormatRow(row);
  if (known) return known;

  let codeCol = -1;
  let nameCol = -1;
  let qtyCol = -1;

  const expanded = expandCombinedHeaderRow(row);
  for (let i = 0; i < expanded.length; i += 1) {
    const normalized = normalizeHeader(expanded[i]);
    if (!normalized) continue;
    if (matchesAlias(normalized, CODE_ALIASES)) codeCol = i;
    if (matchesAlias(normalized, NAME_ALIASES)) nameCol = i;
    if (matchesAlias(normalized, QTY_ALIASES)) qtyCol = i;
  }

  if (nameCol >= 0 && qtyCol >= 0) {
    return { codeCol, nameCol, qtyCol };
  }
  return null;
}

function describeTableHead(table: unknown[][]): string {
  const lines: string[] = [];
  for (let i = 0; i < Math.min(20, table.length); i += 1) {
    const cells = (table[i] ?? [])
      .slice(0, 8)
      .map((c) => String(c ?? '').trim())
      .filter(Boolean);
    if (cells.length > 0) {
      lines.push(`строка ${i + 1}: ${cells.join(' | ')}`);
    }
  }
  return lines.length > 0 ? lines.join('; ') : 'файл пустой или без текста';
}

interface ColumnMap {
  codeCol: number;
  nameCol: number;
  qtyCol: number;
  headerRow: number;
}

function findHeaderRow(table: unknown[][]): ColumnMap | null {
  const maxScan = Math.min(table.length, 80);
  let bestPartial: ColumnMap | null = null;

  for (let rowIndex = 0; rowIndex < maxScan; rowIndex += 1) {
    const found = findColumnsInRow(table[rowIndex] ?? []);
    if (!found) continue;

    const result: ColumnMap = { ...found, headerRow: rowIndex };

    // Идеальный вариант: все три колонки
    if (found.codeCol >= 0 && found.nameCol >= 0 && found.qtyCol >= 0) {
      return result;
    }

    // Запасной: хотя бы название + количество
    if (!bestPartial) {
      bestPartial = result;
    }
  }

  return bestPartial;
}

export function normalizeCode(raw: unknown): string {
  if (raw === '' || raw == null) return '';

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (Number.isInteger(raw) || Math.abs(raw) >= 1e10) {
      return String(Math.trunc(raw));
    }
    return String(raw).replace(/\.0+$/, '');
  }

  const text = String(raw).trim();
  if (/e/i.test(text)) {
    const num = Number(text);
    if (Number.isFinite(num)) {
      return String(Math.trunc(num));
    }
  }

  return text.replace(/\.0+$/, '');
}

function parseQuantity(raw: unknown): number {
  if (raw === '' || raw == null) return 0;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;

  const text = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function detectColumn(headers: string[], aliases: string[]): number {
  for (let i = 0; i < headers.length; i += 1) {
    const header = headers[i];
    if (!header) continue;
    if (matchesAlias(header, aliases)) {
      return i;
    }
  }
  return -1;
}

function getCell(row: unknown[], index: number): unknown {
  if (index < 0 || index >= row.length) return '';
  return row[index] ?? '';
}

function isLaborRow(code: string, name: string): boolean {
  if (code.toUpperCase() === LABOR_MARKER.toUpperCase()) return true;
  const normalized = name.toLowerCase().replace(/\s+/g, ' ').trim();
  return normalized.includes('время') && normalized.includes('монтаж');
}

function isCategoryRow(code: string, name: string, quantity: number): boolean {
  if (!name) return false;
  if (isLaborRow(code, name)) return false;
  if (code.toUpperCase() === CATEGORY_MARKER.toUpperCase()) return true;
  // Строка-заголовок: есть название, нет количества, код пустой
  return !code && quantity <= 0;
}

function extractCodeFromName(name: string): string | null {
  const match = name.match(/\((\d{4,})\)\s*$/);
  return match ? match[1] : null;
}

function resolveMaterialCode(rawCode: string, excelName: string): string {
  const fromName = extractCodeFromName(excelName);
  if (!rawCode) return fromName || '';
  // Короткий числовой код (1, 2, 3…) — скорее порядковый номер, берём из скобок
  if (/^\d{1,4}$/.test(rawCode) && fromName) return fromName;
  return rawCode;
}

function looksLikeSubtotalRow(code: string, name: string, quantity: number): boolean {
  if (code || name) return false;
  return quantity > 0;
}

function sheetToTable(sheet: XLSX.WorkSheet): unknown[][] {
  const ref = sheet['!ref'];
  if (!ref) return [];

  const range = XLSX.utils.decode_range(ref);
  const table: unknown[][] = [];

  for (let r = range.s.r; r <= range.e.r; r += 1) {
    const row: unknown[] = [];
    for (let c = range.s.c; c <= range.e.c; c += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (!cell) {
        row.push('');
        continue;
      }
      // Для числовых кодов сохраняем точное значение
      if (cell.t === 'n' && cell.v != null) {
        row.push(cell.v);
      } else {
        row.push(cell.w ?? cell.v ?? '');
      }
    }
    table.push(row);
  }

  return table;
}

function readSheetTable(sheet: XLSX.WorkSheet): unknown[][] {
  const direct = sheetToTable(sheet);
  if (findHeaderRow(direct)) return direct;

  const json = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    blankrows: true,
  }) as unknown[][];
  if (findHeaderRow(json)) return json;

  return direct.length > 0 ? direct : json;
}

function pickSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet | null {
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const table = readSheetTable(sheet);
    if (findHeaderRow(table)) {
      return sheet;
    }
  }
  return workbook.Sheets[workbook.SheetNames[0]] ?? null;
}

export async function readExcelFile(file: File): Promise<unknown[][]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'xlsx' && ext !== 'xls') {
    throw new Error('Поддерживаются только файлы .xlsx и .xls');
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = pickSheet(workbook);
  if (!sheet) {
    throw new Error('Файл не содержит листов');
  }

  return readSheetTable(sheet);
}

export function parseCalculationExcel(table: unknown[][]): ParseExcelResult {
  if (!table.length) {
    throw new Error('Файл пустой');
  }

  const columns = findHeaderRow(table);
  if (!columns) {
    throw new Error(
      `Не найдена строка заголовков. Нужны колонки onec_code, Материалы, excel_qty (регистр не важен). Начало файла: ${describeTableHead(table)}`
    );
  }

  const { codeCol, nameCol, qtyCol, headerRow } = columns;
  const categories: ParsedCategory[] = [];
  let currentCategory: ParsedCategory | null = null;
  let laborHours = 0;
  let skipNextRow = false;

  for (let rowIndex = headerRow + 1; rowIndex < table.length; rowIndex += 1) {
    if (skipNextRow) {
      skipNextRow = false;
      continue;
    }

    const row = table[rowIndex] ?? [];
    const line = rowIndex + 1;
    const rawCode = codeCol >= 0 ? normalizeCode(getCell(row, codeCol)) : '';
    const excelName = String(getCell(row, nameCol) ?? '').trim();
    let quantity = parseQuantity(getCell(row, qtyCol));

    if (!rawCode && !excelName) continue;
    if (looksLikeSubtotalRow(rawCode, excelName, quantity)) continue;

    if (isLaborRow(rawCode, excelName)) {
      if (quantity <= 0 && rowIndex + 1 < table.length) {
        const nextQty = parseQuantity(getCell(table[rowIndex + 1] ?? [], qtyCol));
        if (nextQty > 0) {
          quantity = nextQty;
          skipNextRow = true;
        }
      }
      laborHours += quantity;
      continue;
    }

    if (isCategoryRow(rawCode, excelName, quantity)) {
      currentCategory = { name: excelName, line, materials: [] };
      categories.push(currentCategory);
      continue;
    }

    const materialCode = resolveMaterialCode(rawCode, excelName);
    if (!materialCode) continue;

    if (!currentCategory) {
      currentCategory = { name: 'Импорт', line, materials: [] };
      categories.push(currentCategory);
    }

    // Количество может быть на следующей строке (объединённые ячейки)
    if (quantity <= 0 && rowIndex + 1 < table.length) {
      const nextRow = table[rowIndex + 1] ?? [];
      const nextCode = codeCol >= 0 ? normalizeCode(getCell(nextRow, codeCol)) : '';
      const nextName = String(getCell(nextRow, nameCol) ?? '').trim();
      const nextQty = parseQuantity(getCell(nextRow, qtyCol));

      if (
        nextQty > 0 &&
        !nextCode &&
        !nextName &&
        !isCategoryRow(nextCode, nextName, nextQty) &&
        !isLaborRow(nextCode, nextName)
      ) {
        quantity = nextQty;
        skipNextRow = true;
      }
    }

    if (quantity <= 0) continue;

    currentCategory.materials.push({
      line,
      code: materialCode,
      excelName: excelName || materialCode,
      quantity,
    });
  }

  return {
    categories: categories.filter((cat) => cat.materials.length > 0),
    laborHours,
    headerRow,
  };
}

export function extractCodesFromParsed(parsed: ParseExcelResult): string[] {
  const codes = new Set<string>();
  for (const category of parsed.categories) {
    for (const material of category.materials) {
      if (material.code) codes.add(material.code);
    }
  }
  return [...codes];
}

export function buildMaterialCodeIndex(materials: Material[]): Map<string, Material> {
  const index = new Map<string, Material>();
  for (const material of materials) {
    const code = normalizeCode(material.code);
    if (code && !index.has(code)) {
      index.set(code, material);
    }
  }
  return index;
}

function toMaterialPrice(material: Material): number {
  const price = material.currentPriceKzt ?? material.price;
  return Number(price) || 0;
}

export function buildImportPreview(
  parsed: ParseExcelResult,
  materials: Material[]
): ImportPreview {
  const codeIndex = buildMaterialCodeIndex(materials);
  const resolvedCategories: ResolvedCategory[] = [];
  const previewCategories: PreviewCategory[] = [];
  const missingMaterials: MissingMaterialItem[] = [];
  let foundCount = 0;

  for (const category of parsed.categories) {
    const resolvedItems: ResolvedMaterialItem[] = [];
    const previewItems: PreviewItem[] = [];

    for (const row of category.materials) {
      const material = codeIndex.get(row.code);
      if (!material) {
        missingMaterials.push({
          line: row.line,
          code: row.code,
          excelName: row.excelName,
          quantity: row.quantity,
          categoryName: category.name,
        });
        previewItems.push({
          status: 'missing',
          name: row.excelName,
          unit: '—',
          price: 0,
          quantity: row.quantity,
          code: row.code,
          line: row.line,
        });
        continue;
      }

      foundCount += 1;
      const item: ResolvedMaterialItem = {
        id: material.id,
        name: material.name,
        unit: material.unit || 'шт',
        price: toMaterialPrice(material),
        quantity: row.quantity,
        code: row.code,
      };
      resolvedItems.push(item);
      previewItems.push({
        status: 'found',
        id: material.id,
        name: material.name,
        unit: item.unit,
        price: item.price,
        quantity: row.quantity,
        code: row.code,
        line: row.line,
      });
    }

    if (previewItems.length > 0) {
      previewCategories.push({ name: category.name, items: previewItems });
    }
    if (resolvedItems.length > 0) {
      resolvedCategories.push({ name: category.name, items: resolvedItems });
    }
  }

  const totalMaterialCount = foundCount + missingMaterials.length;

  return {
    categories: resolvedCategories,
    previewCategories,
    missingMaterials,
    laborHours: parsed.laborHours,
    foundCount,
    missingCount: missingMaterials.length,
    totalCategoryCount: previewCategories.length,
    totalMaterialCount,
  };
}
