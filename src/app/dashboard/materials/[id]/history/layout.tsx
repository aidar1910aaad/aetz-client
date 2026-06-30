import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'История материала',
};

export default function MaterialHistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
