'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { formatDocumentTitle, getPageTitle } from '@/utils/pageTitles';

export default function DocumentTitle() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    document.title = formatDocumentTitle(getPageTitle(pathname));
  }, [pathname]);

  return null;
}
