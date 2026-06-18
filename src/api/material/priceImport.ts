import { api } from '../baseUrl';

export type PreviewAction = 'update' | 'create' | 'skip_unchanged' | 'skip_empty';

export interface PriceImportPreviewRow {
  line: number;
  code: string;
  name: string;
  action: PreviewAction;
  before: {
    id?: number;
    name?: string;
    unit?: string;
    currency?: string;
    price?: number;
  } | null;
  after: {
    name: string;
    unit: string;
    currency: 'KZT';
    price: number;
  } | null;
  priceDiff: number | null;
}

export interface PriceImportPreview {
  generatedAt: string;
  excelFile: string;
  baselineSource: 'database' | 'snapshot';
  baselineExportedAt?: string;
  summary: {
    totalExcelRows: number;
    toUpdate: number;
    toCreate: number;
    unchanged: number;
    skippedEmpty: number;
  };
  duplicateCodes: Array<{ code: string; lines: number[]; mergedName?: string }>;
  rows: PriceImportPreviewRow[];
}

export interface ImportBadges {
  appliedAt: string;
  excelFile: string;
  createdIds: number[];
  updatedIds: number[];
  byId: Record<string, 'create' | 'update'>;
}

export async function getMaterialPriceImportPreview(
  token: string,
): Promise<PriceImportPreview> {
  const response = await fetch(`${api}/materials/price-import/preview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Не удалось получить предпросмотр импорта');
  }

  return response.json();
}

export async function getMaterialImportBadges(token: string): Promise<ImportBadges | null> {
  const response = await fetch(`${api}/materials/price-import/badges`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Не удалось получить метки импорта');
  }

  const data = await response.json();
  return data ?? null;
}
