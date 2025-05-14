import type { Metadata } from 'next';
import './globals.css';
import { Montserrat, Climate_Crisis } from 'next/font/google';
import ToastProvider from '@/shared/modals/ToastProvider';
import ConfirmModalContainer from '@/shared/modals/ConfirmModal';
import EditModalContainer from '@/shared/modals/EditModalContainer';
import LoaderOverlay from '@/shared/loader/PageLoader';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'cyrillic'], // обязательно для русского
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const climate = Climate_Crisis({
  variable: '--font-climate',
  subsets: ['latin'], // кириллицы нет
  weight: ['400'], // у Climate Crisis только 1 вес
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${climate.variable}`}>
      <body className="antialiased">
        <ConfirmModalContainer />
        <EditModalContainer />
        <ToastProvider />

        {children}
      </body>
    </html>
  );
}
