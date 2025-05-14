import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type BmzData = {
  length?: number;
  width?: number;
  height?: number;
  thickness?: number;
  heatedFloor?: boolean;
  lighting?: boolean;
  fireAlarm?: boolean;
};

type TransformerData = {
  spec: string;
  price: number;
  quantity: number;
};

type RusnData = {
  selectedCellTypes: string[];
  breaker?: string;
  rza?: string;
  cells: Record<string, number>;
};

export function exportFinalReviewToExcel(
  bmz: BmzData,
  transformer: TransformerData | null,
  rusn: RusnData
) {
  const length = Number(bmz.length);
  const width = Number(bmz.width);
  const area = Math.round(((length * width) / 1_000_000) * 100) / 100;

  const rows: (string | number)[][] = [
    ['Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'],
    [
      `Блочно-модульное здание ${bmz.length}x${bmz.width}x${bmz.height} мм, стенки ${
        bmz.thickness || '—'
      } мм`,
      'м2',
      area,
      0,
      0,
    ],
  ];

  if (bmz.heatedFloor) {
    rows.push(['Утеплённый пол', 'м2', area, 7500, area * 7500]);
  }

  if (bmz.lighting) {
    rows.push(['Освещение', 'м2', area, 5000, area * 5000]);
  }

  if (bmz.fireAlarm) {
    rows.push(['Охранно-пожарная сигнализация', 'м2', area, 0, 0]);
  }

  if (transformer) {
    rows.push([]); // пустая строка
    rows.push(['Силовой трансформатор', '', '', '', '']);
    rows.push([
      transformer.spec,
      'шт',
      transformer.quantity,
      transformer.price,
      transformer.price * transformer.quantity,
    ]);
  }

  rows.push([]); // пустая строка
  rows.push([
    'РУ-' + (rusn.selectedCellTypes[0]?.includes('20') ? '20' : '10') + 'кВ',
    '',
    '',
    '',
    '',
  ]);
  rows.push([
    `Камера ${rusn.selectedCellTypes[0] || '—'} / Выключатель: ${rusn.breaker || '—'} / РЗА: ${
      rusn.rza || '—'
    }`,
    'шт',
    Object.values(rusn.cells).reduce((a, b) => a + b, 0),
    3200000,
    7000000,
  ]);

  // Итог
  const total = rows
    .filter((r) => typeof r[4] === 'number')
    .reduce((sum, row) => sum + (Number(row[4]) || 0), 0);

  rows.push([]);
  rows.push(['ИТОГО', '', '', '', total]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Спецификация');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'Спецификация.xlsx');
}
