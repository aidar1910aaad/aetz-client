import { PriceKey } from '@/store/useWorkPricesStore';

export interface FieldDef {
  key: PriceKey;
  label: string;
  note?: string;
  /** суффикс справа в инпуте (по умолчанию: "тг"), null/'' чтобы скрыть */
  inputSuffix?: string | null;
  /** авторасчёт — поле readonly, значение вычисляется из других полей секции */
  computed?: (local: Record<PriceKey, string>) => number;
}

/** Блоки тела секции: полная ширина или две колонки (например МТ | АД) */
export type SectionLayoutBlock =
  | { kind: 'full'; keys: PriceKey[] }
  | {
      kind: 'split';
      leftTitle?: string;
      left: PriceKey[];
      rightTitle?: string;
      right: PriceKey[];
    };

export interface SectionDef {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  /** tailwind-классы для иконки и бейджа */
  badge: string;
  fields: FieldDef[];
  /** Если задано — рендер тела по блокам; иначе — плоский список fields */
  layoutBlocks?: SectionLayoutBlock[];
}

// нужен React для типа ElementType
import React from 'react';
