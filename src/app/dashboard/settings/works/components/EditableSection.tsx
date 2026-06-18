'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, RefreshCw } from 'lucide-react';
import { useWorkPricesStore, WorkPricesValues, PriceKey } from '@/store/useWorkPricesStore';
import { showToast } from '@/shared/modals/ToastProvider';
import type { FieldDef, SectionDef, SectionLayoutBlock } from '../types';
import { digitsOnly } from '@/utils/formatIntSpace';
import PriceInput from './PriceInput';
import { workPricesApi } from '@/api/workPrices';

interface Props {
  section: SectionDef;
  forceOpen: boolean;
}

function resolveFieldsByKeys(keys: PriceKey[], all: FieldDef[]): FieldDef[] {
  return keys.map((k) => {
    const f = all.find((x) => x.key === k);
    if (!f) throw new Error(`[works settings] неизвестный ключ поля: ${k}`);
    return f;
  });
}

export default function EditableSection({ section, forceOpen }: Props) {
  const store = useWorkPricesStore();
  const [open, setOpen] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const editableKeys = [...new Set(
    section.fields.filter((f) => !f.computed).map((f) => f.key),
  )];

  const buildLocal = (): Record<string, string> => {
    const obj: Record<string, string> = {};
    editableKeys.forEach((k) => {
      obj[k] = String((store as unknown as Record<string, number>)[k] ?? 0);
    });
    return obj;
  };

  const [local, setLocal] = useState<Record<string, string>>(buildLocal);

  useEffect(() => { setOpen(forceOpen); }, [forceOpen]);
  useEffect(() => {
    if (!dirty && !saving) {
      setLocal(buildLocal());
    }
  }, [store, dirty, saving]);

  const handleChange = (key: string, val: string) => {
    setLocal((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const patch: Partial<WorkPricesValues> = {};
      editableKeys.forEach((k) => {
        (patch as Record<string, number>)[k] = Number(digitsOnly(String(local[k] ?? ''))) || 0;
      });
      const updatedSettings = await workPricesApi.updateSettings(patch);
      store.updateMany(updatedSettings);
      setDirty(false);
      showToast(`«${section.title}» сохранено`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Ошибка сохранения настроек работ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocal(buildLocal());
    setDirty(false);
  };

  const Icon = section.icon;
  const useLayout = !!section.layoutBlocks?.length;
  const longSection = !useLayout && section.fields.length >= 10;

  const renderFieldRow = (field: FieldDef, rowKey: string, rowOpts?: { isLast?: boolean }) => {
    const isComputed = !!field.computed;
    const displayValue = isComputed
      ? String(Math.round(Number(field.computed!(local as Record<PriceKey, string>)) || 0))
      : (local[field.key] ?? '0');

    return (
      <div
        key={rowKey}
        className={[
          'flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100',
          rowOpts?.isLast ? 'border-b-0' : '',
          isComputed ? 'bg-purple-50/35' : '',
        ].join(' ')}
      >
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-sm text-gray-800 leading-snug">{field.label}</span>
          {field.note && (
            <span className="text-xs text-gray-500"> ({field.note})</span>
          )}
        </div>
        <PriceInput
          value={displayValue}
          onChange={isComputed ? undefined : (v) => handleChange(field.key, v)}
          readOnly={isComputed}
          highlight={isComputed}
          suffix={field.inputSuffix}
        />
      </div>
    );
  };

  const renderLayoutBlock = (block: SectionLayoutBlock, blockIndex: number) => {
    if (block.kind === 'full') {
      const fields = resolveFieldsByKeys(block.keys, section.fields);
      return (
        <div
          key={blockIndex}
          className={blockIndex > 0 ? 'border-t border-gray-100' : ''}
        >
          {fields.map((field, i) =>
            renderFieldRow(field, `f-${blockIndex}-${i}`, { isLast: i === fields.length - 1 }),
          )}
        </div>
      );
    }

    const leftF = resolveFieldsByKeys(block.left, section.fields);
    const rightF = resolveFieldsByKeys(block.right, section.fields);

    return (
      <div
        key={blockIndex}
        className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-100"
      >
        <div className="flex flex-col md:border-r border-gray-100 min-w-0">
          {block.leftTitle && (
            <div className="px-3 py-2 bg-emerald-50/80 border-b border-gray-100 text-sm font-semibold text-emerald-900">
              {block.leftTitle}
            </div>
          )}
          {leftF.map((field, i) =>
            renderFieldRow(field, `L-${blockIndex}-${i}`, { isLast: i === leftF.length - 1 }),
          )}
        </div>
        <div className="flex flex-col min-w-0 border-t md:border-t-0 border-gray-100">
          {block.rightTitle && (
            <div className="px-3 py-2 bg-slate-50/90 border-b border-gray-100 text-sm font-semibold text-slate-800">
              {block.rightTitle}
            </div>
          )}
          {rightF.map((field, i) =>
            renderFieldRow(field, `R-${blockIndex}-${i}`, { isLast: i === rightF.length - 1 }),
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={[
      'bg-white rounded-lg border shadow-sm overflow-hidden transition-all duration-200',
      dirty ? 'border-[#8eba1e]/50 shadow-[#8eba1e]/10' : 'border-gray-200',
    ].join(' ')}>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50/80 transition-colors duration-150"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-md border shrink-0 ${section.badge}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{section.title}</span>
              {dirty && (
                <span className="text-[11px] font-medium px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-200/80 leading-none">
                  не сохранено
                </span>
              )}
            </div>
            {section.subtitle && (
              <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">{section.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${section.badge}`}>
            {section.fields.length} поз.
          </span>
          {open
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <>
          <div className="border-t border-gray-100">
            {useLayout ? (
              section.layoutBlocks!.map((b, i) => renderLayoutBlock(b, i))
            ) : (
              <div
                className={longSection ? 'grid grid-cols-1 md:grid-cols-2' : ''}
              >
                {section.fields.map((field, i) => {
                  const isComputed = !!field.computed;
                  const displayValue = isComputed
                    ? String(Math.round(Number(field.computed!(local as Record<PriceKey, string>)) || 0))
                    : (local[field.key] ?? '0');

                  return (
                    <div
                      key={`${field.key}-${i}`}
                      className={[
                        'flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 last:border-b-0',
                        longSection
                          ? 'md:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:border-gray-100 md:[&:nth-last-child(-n+2)]:border-b-0'
                          : '',
                        isComputed ? 'bg-purple-50/35' : '',
                      ].join(' ')}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-sm text-gray-800 leading-snug">{field.label}</span>
                        {field.note && (
                          <span className="text-xs text-gray-500"> ({field.note})</span>
                        )}
                      </div>
                      <PriceInput
                        value={displayValue}
                        onChange={isComputed ? undefined : (v) => handleChange(field.key, v)}
                        readOnly={isComputed}
                        highlight={isComputed}
                        suffix={field.inputSuffix}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-gray-50/70 border-t border-gray-100">
            <button
              onClick={handleDiscard}
              disabled={!dirty || saving}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Сбросить
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8eba1e] hover:bg-[#7aa31a] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-md transition-all duration-150 disabled:shadow-none"
            >
              {saving
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />}
              {saving ? '…' : 'Сохранить'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
