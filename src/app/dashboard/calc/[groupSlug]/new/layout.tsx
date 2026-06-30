import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Новый расчёт',
};

export default function NewCalculationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
