import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Группа расчётов',
};

export default function CalcGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
