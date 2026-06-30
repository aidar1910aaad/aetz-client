import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Заявка',
};

export default function RequestDetailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
