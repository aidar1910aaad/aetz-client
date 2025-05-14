import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import '@/fonts/Roboto-Medium'; // кастомный шрифт, зарегистрированный как 'RobotoMedium'

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

type BktpData = {
  client?: string;
  executor?: string;
  date?: string;
  taskNumber?: string;
};

export function exportFinalReviewToPdf(
  bmz: BmzData,
  transformer: TransformerData | null,
  rusn: RusnData,
  bktp: BktpData
) {
  const doc = new jsPDF();
  doc.setFont('RobotoMedium');

  const area = Math.round(((Number(bmz.length) * Number(bmz.width)) / 1_000_000) * 100) / 100;

  const rows: (string | number)[][] = [
    [
      `БМЗ ${bmz.length}x${bmz.width}x${bmz.height} мм, ${bmz.thickness || '—'} мм`,
      'м2',
      area,
      0,
      0,
    ],
  ];

  if (bmz.heatedFloor) rows.push(['Утеплённый пол', 'м2', area, 7500, area * 7500]);
  if (bmz.lighting) rows.push(['Освещение', 'м2', area, 5000, area * 5000]);
  if (bmz.fireAlarm) rows.push(['Охранно-пожарная сигнализация', 'м2', area, 0, 0]);

  if (transformer) {
    rows.push(['', '', '', '', '']);
    rows.push(['Силовой трансформатор', '', '', '', '']);
    rows.push([
      transformer.spec,
      'шт',
      transformer.quantity,
      transformer.price,
      transformer.price * transformer.quantity,
    ]);
  }

  rows.push(['', '', '', '', '']);
  rows.push([
    'РУ-' + (rusn.selectedCellTypes[0]?.includes('20') ? '20' : '10') + 'кВ',
    '',
    '',
    '',
    '',
  ]);
  rows.push([
    `${rusn.selectedCellTypes[0] || '—'} / ${rusn.breaker || '—'} / ${rusn.rza || '—'}`,
    'шт',
    Object.values(rusn.cells).reduce((a, b) => a + b, 0),
    3200000,
    7000000,
  ]);

  const total = rows.reduce((sum, r) => sum + (typeof r[4] === 'number' ? Number(r[4]) : 0), 0);
  rows.push(['', '', '', '', '']);
  rows.push(['ИТОГО', '', '', '', total]);

  // Заголовок
  doc.setFontSize(16);
  doc.text('Спецификация оборудования', 14, 15);

  doc.setFontSize(11);
  doc.text(`Объект: ${bktp.client || '—'}`, 14, 23);
  doc.text(`Утверждаю: ${bktp.executor || '—'}`, 14, 29);
  doc.text(`Дата: ${bktp.date || '—'}`, 14, 35);
  doc.text(`РАСЧЁТ №${bktp.taskNumber || '000-000'}`, 100, 35);

  // 🔵 Отрисовка заголовка таблицы вручную
  const headers = ['Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'];
  const columnWidths = [50, 30, 30, 30, 30];
  const startX = 14;
  const startY = 42;
  const rowHeight = 8;

  let x = startX;
  doc.setFont('RobotoMedium');
  doc.setFontSize(11);
  doc.setFillColor(58, 85, 223);
  doc.setTextColor(255);
  for (let i = 0; i < headers.length; i++) {
    doc.rect(x, startY, columnWidths[i], rowHeight, 'F'); // Заливка ячеек
    doc.text(headers[i], x + 2, startY + 5, { maxWidth: columnWidths[i] - 4 }); // Добавляем перенос

    x += columnWidths[i];
  }

  // 🟢 Таблица
  autoTable(doc, {
    body: rows,
    startY: startY + rowHeight + 2,
    styles: {
      font: 'RobotoMedium',
      fontSize: 10,
      textColor: 20,
    },
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: columnWidths[0] },
      1: { cellWidth: columnWidths[1] },
      2: { cellWidth: columnWidths[2] },
      3: { cellWidth: columnWidths[3] },
      4: { cellWidth: columnWidths[4] },
    },
    margin: { left: startX },
  });

  doc.save('Спецификация.pdf');
}
