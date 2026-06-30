import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Трансформатор',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
