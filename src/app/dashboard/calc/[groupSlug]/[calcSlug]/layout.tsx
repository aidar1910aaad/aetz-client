import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Расчёт',
};

export default function CalculationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
