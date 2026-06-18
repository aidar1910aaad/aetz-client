type IconProps = { className?: string };

/** Схема БКТП — блок с шинами и ячейками */
export function BktpCalcIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18M8 10v9M16 10v9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="7.5" r="1" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      <circle cx="16" cy="7.5" r="1" fill="currentColor" />
      <path d="M10.5 14h3M10.5 16.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
    </svg>
  );
}

/** КП — документ со штампом */
export function CommercialOfferIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3h8l4 4v14H7V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      <path d="M15 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      <path d="M9.5 11h7M9.5 14h7M9.5 17h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
      <rect x="14.5" y="15.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M15.5 17.5l1 1 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </svg>
  );
}

/** Заявки — цепочка этапов */
export function RequestsFlowIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="6" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="6" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="17" y="6" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8.5h2.5M14.5 8.5H17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 13v2M12 13v4M19.5 13v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
      <path d="M2 17h5M9.5 17h5M17 17h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
    </svg>
  );
}

/** Доступ — корпоративный бейдж */
export function SecureAccessIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4h12a1 1 0 011 1v14l-7-3.5L5 19V5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      <circle cx="12" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M9.25 13.5c0-1.5 1.25-2.25 2.75-2.25s2.75.75 2.75 2.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
      <rect x="10.5" y="15.5" width="3" height="2" fill="currentColor" />
    </svg>
  );
}
