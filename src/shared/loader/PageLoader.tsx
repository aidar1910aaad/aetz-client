'use client';

export type LoaderSize = 'page' | 'section' | 'compact';

interface PageLoaderProps {
  /** page — вся страница; section — блок контента; compact — таблица/оверлей */
  size?: LoaderSize;
  /** @deprecated используйте size="section" */
  inline?: boolean;
  className?: string;
  message?: string;
}

function resolveSize(inline?: boolean, size?: LoaderSize): LoaderSize {
  if (size) return size;
  return inline ? 'section' : 'page';
}

function Spinner({ ringClass }: { ringClass: string }) {
  return (
    <div className={`relative ${ringClass}`}>
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#8eba1e] border-r-[#7aa31a] animate-spin-pulse" />
      <div
        className="absolute inset-[3px] rounded-full border-2 border-transparent border-b-[#8eba1e]/70 border-l-[#7aa31a]/70 animate-spin-pulse-reverse"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#8eba1e] rounded-full" />
    </div>
  );
}

export default function PageLoader({
  inline = false,
  size,
  className = '',
  message,
}: PageLoaderProps) {
  const resolved = resolveSize(inline, size);

  if (resolved === 'compact') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 py-6 px-4 w-full ${className}`}
        role="status"
        aria-live="polite"
        aria-label={message ?? 'Загрузка'}
      >
        <Spinner ringClass="w-10 h-10" />
        <p className="text-sm font-medium text-gray-500">{message ?? 'Загрузка...'}</p>
      </div>
    );
  }

  if (resolved === 'section') {
    return (
      <div
        className={`relative flex flex-col justify-center items-center w-full overflow-hidden bg-white min-h-[220px] h-full ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#8eba1e]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#7aa31a]/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-5 px-4 py-8">
          <Spinner ringClass="w-16 h-16" />
          <p className="text-lg font-semibold text-gray-700">{message ?? 'Загружаем данные'}</p>
          <div className="flex gap-1.5">
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 bg-[#8eba1e] rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s`, animationDuration: '1.4s' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-center items-center w-full bg-white overflow-hidden min-h-screen ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8eba1e]/8 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '0s', animationDuration: '4s' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7aa31a]/8 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '1.5s', animationDuration: '4s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8eba1e]/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: '3s', animationDuration: '5s' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 px-4">
        <Spinner ringClass="w-32 h-32" />
        <div className="flex flex-col items-center gap-4">
          <h3
            className="text-3xl font-bold bg-gradient-to-r from-[#8eba1e] via-[#7aa31a] to-[#8eba1e] bg-clip-text text-transparent animate-gradient-shift"
            style={{
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {message ?? 'Загружаем данные'}
          </h3>
          <div className="flex gap-2 items-center">
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                className="w-2.5 h-2.5 bg-[#8eba1e] rounded-full animate-bounce shadow-lg shadow-[#8eba1e]/50"
                style={{ animationDelay: `${delay}s`, animationDuration: '1.4s' }}
              />
            ))}
          </div>
        </div>
        <div className="w-80 max-w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#8eba1e] via-[#7aa31a] to-[#8eba1e] rounded-full animate-progress-loading shadow-lg"
            style={{
              backgroundSize: '200% 100%',
              boxShadow: '0 0 10px rgba(142, 186, 30, 0.5)',
            }}
          />
        </div>
        <p className="text-sm text-gray-400 font-medium animate-pulse">Пожалуйста, подождите...</p>
      </div>
    </div>
  );
}
