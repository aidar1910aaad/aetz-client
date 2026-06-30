import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Пользователь',
};

export default function UserDetailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
