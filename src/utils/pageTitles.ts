const SITE_NAME = 'АЭТЗ';

const EXACT_PAGE_TITLES: Record<string, string> = {
  '/': 'Вход',
  '/dashboard': 'Главная',
  '/dashboard/bktp': 'Заявка БКТП',
  '/dashboard/bktp/bmz': 'Здание подстанции',
  '/dashboard/bktp/transformers': 'Трансформатор',
  '/dashboard/bktp/rusn': 'РУСН',
  '/dashboard/bktp/runn': 'РУНН',
  '/dashboard/bktp/additional-equipment': 'Доп. оборудование',
  '/dashboard/bktp/work': 'Работы',
  '/dashboard/final': 'Текущая заявка',
  '/dashboard/current-request': 'Текущая заявка',
  '/dashboard/bktp/settings': 'Настройки БКТП',
  '/dashboard/bktp/settings/rusn': 'Настройки РУСН',
  '/dashboard/bktp/settings/runn': 'Настройки РУНН',
  '/dashboard/bktp/settings/busbar': 'Сборные шины',
  '/dashboard/bktp/settings/runn-busbar': 'Сборные шины РУНН',
  '/dashboard/users': 'Пользователи',
  '/dashboard/materials': 'Материалы',
  '/dashboard/materials/categories': 'Категории',
  '/dashboard/materials/price-import': 'Импорт цен',
  '/dashboard/requests': 'История заявок',
  '/dashboard/calc': 'Расчёты стоимости',
  '/dashboard/currency': 'Курсы валют',
  '/dashboard/history': 'Единый журнал',
  '/dashboard/settings': 'Настройки',
  '/dashboard/settings/bmz': 'Настройки БМЗ',
  '/dashboard/settings/transformer': 'Настройки трансформатора',
  '/dashboard/settings/rusn': 'Настройки РУСН',
  '/dashboard/settings/runn-busbar': 'Сборные шины РУНН',
  '/dashboard/settings/works': 'Настройки работ',
  '/dashboard/bmz': 'БМЗ',
  '/dashboard/ktp/settings': 'Настройки КТП',
  '/dashboard/profile': 'Профиль',
  '/dashboard/token-debug': 'Отладка токена',
};

const DYNAMIC_PAGE_TITLE_RULES: Array<{ test: (pathname: string) => boolean; title: string }> = [
  {
    test: (pathname) => /^\/dashboard\/materials\/\d+\/history$/.test(pathname),
    title: 'История материала',
  },
  {
    test: (pathname) => /^\/dashboard\/calc\/[^/]+\/new$/.test(pathname),
    title: 'Новый расчёт',
  },
  {
    test: (pathname) => /^\/dashboard\/calc\/[^/]+\/[^/]+$/.test(pathname),
    title: 'Расчёт',
  },
  {
    test: (pathname) => /^\/dashboard\/calc\/[^/]+$/.test(pathname),
    title: 'Группа расчётов',
  },
  {
    test: (pathname) => /^\/dashboard\/requests\/[^/]+$/.test(pathname),
    title: 'Заявка',
  },
  {
    test: (pathname) => /^\/dashboard\/users\/[^/]+$/.test(pathname),
    title: 'Пользователь',
  },
];

export function getPageTitle(pathname: string): string {
  const normalizedPath = pathname.split('?')[0].replace(/\/$/, '') || '/';

  if (EXACT_PAGE_TITLES[normalizedPath]) {
    return EXACT_PAGE_TITLES[normalizedPath];
  }

  for (const rule of DYNAMIC_PAGE_TITLE_RULES) {
    if (rule.test(normalizedPath)) {
      return rule.title;
    }
  }

  return SITE_NAME;
}

export function formatDocumentTitle(pageTitle: string): string {
  if (pageTitle === SITE_NAME) {
    return SITE_NAME;
  }

  return `${pageTitle} | ${SITE_NAME}`;
}
