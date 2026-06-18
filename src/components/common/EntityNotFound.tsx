import Link from 'next/link';

interface EntityNotFoundProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function EntityNotFound({
  title,
  description,
  backHref,
  backLabel,
  secondaryHref = '/dashboard',
  secondaryLabel = 'На главную',
}: EntityNotFoundProps) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-6xl font-semibold tabular-nums text-[#8eba1e]/30">404</p>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-lg bg-[#8eba1e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7aa31a]"
          >
            {backLabel}
          </Link>
          {secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#8eba1e] hover:text-[#8eba1e]"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
