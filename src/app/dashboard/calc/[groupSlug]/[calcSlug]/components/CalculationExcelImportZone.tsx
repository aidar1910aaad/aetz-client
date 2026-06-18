'use client';

import { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { getMaterialsByCodes } from '@/api/material';
import {
  readExcelFile,
  parseCalculationExcel,
  buildImportPreview,
  extractCodesFromParsed,
  ImportPreview,
} from '@/utils/calculationExcelImport';
import CalculationExcelImportModal from './CalculationExcelImportModal';

interface CalculationMaterial {
  id?: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationMaterial[];
}

interface ImportProgress {
  percent: number;
  message: string;
}

interface Props {
  onImport: (categories: CalculationCategory[], laborHours: number) => void;
}

export default function CalculationExcelImportZone({ onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setProgress({ percent: 5, message: 'Читаем файл...' });

    try {
      const table = await readExcelFile(file);
      setProgress({ percent: 25, message: 'Разбираем категории и материалы...' });

      const parsed = parseCalculationExcel(table);

      if (parsed.categories.length === 0 && parsed.laborHours === 0) {
        throw new Error(
          'В файле не найдено категорий или материалов. Убедитесь, что есть строка заголовков (onec_code, Материалы, excel_qty) и данные ниже неё.'
        );
      }

      const codes = extractCodesFromParsed(parsed);
      let materials: Awaited<ReturnType<typeof getMaterialsByCodes>> = [];

      if (codes.length > 0) {
        const token = localStorage.getItem('token') || '';
        if (!token) throw new Error('Необходима авторизация');

        setProgress({ percent: 40, message: `Ищем ${codes.length} кодов в базе...` });

        materials = await getMaterialsByCodes(codes, token, (processed, total) => {
          const lookupPercent = 40 + Math.round((processed / total) * 45);
          setProgress({
            percent: lookupPercent,
            message: `Сопоставляем с БД: ${processed} из ${total} кодов...`,
          });
        });
      }

      setProgress({ percent: 90, message: 'Формируем превью...' });

      const importPreview = buildImportPreview(parsed, materials);
      setFileName(file.name);
      setPreview(importPreview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при чтении файла');
    } finally {
      setProgress(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isBusy = Boolean(progress);

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-[#8eba1e] bg-[#8eba1e]/10'
            : 'border-[#8eba1e]/30 bg-[#8eba1e]/5 hover:border-[#8eba1e]/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-[#8eba1e]/20">
              <FileSpreadsheet className="w-5 h-5 text-[#8eba1e]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Перетащите Excel-файл сюда</p>
              <p className="text-xs text-gray-500">
                .xlsx / .xls · onec_code, Материалы, Ед. изм., excel_qty, Цена, Сумма
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors text-sm font-medium disabled:opacity-50 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Импорт из Excel
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {progress &&
        createPortal(
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Импорт Excel</p>
                <p className="text-xs text-gray-500 mt-1">{progress.message}</p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8eba1e] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-right tabular-nums">{progress.percent}%</p>
            </div>
          </div>,
          document.body
        )}

      <CalculationExcelImportModal
        preview={preview}
        fileName={fileName}
        onClose={() => setPreview(null)}
        onApply={onImport}
      />
    </>
  );
}
