'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import {
  clearSettingsDebugEvents,
  getSettingsDebugEvents,
  type SettingsDebugEvent,
  type SettingsDebugScope,
} from '@/utils/settingsDebugLog';

const SCOPE_LABELS: Record<SettingsDebugScope, string> = {
  rusn: 'РУСН',
  runn: 'РУНН',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function EventMeta({ event }: { event: SettingsDebugEvent }) {
  const parts = [
    typeof event.requestId === 'number' ? `req #${event.requestId}` : null,
    typeof event.stateBeforeCount === 'number' ? `до: ${event.stateBeforeCount}` : null,
    typeof event.stateAfterCount === 'number' ? `после: ${event.stateAfterCount}` : null,
    typeof event.fetchedCount === 'number' ? `api: ${event.fetchedCount}` : null,
  ].filter(Boolean);

  if (parts.length === 0) return null;

  return <p className="mt-2 text-xs text-gray-500">{parts.join(' • ')}</p>;
}

export function SettingsDebugJournal({ scope }: { scope: SettingsDebugScope }) {
  const [events, setEvents] = useState<SettingsDebugEvent[]>([]);

  const loadEvents = useCallback(() => {
    setEvents(getSettingsDebugEvents(scope));
  }, [scope]);

  useEffect(() => {
    loadEvents();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'settings-debug-journal') {
        loadEvents();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [scope]);

  const lastResetEvent = useMemo(
    () =>
      events.find(
        (event) =>
          event.reason.includes('сброшены') ||
          event.reason.includes('пустое состояние') ||
          event.reason.includes('очистка')
      ) ?? null,
    [events]
  );

  return (
    <section className="rounded-xl border border-amber-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-amber-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Журнал диагностики {SCOPE_LABELS[scope]}
              </h2>
              <p className="text-sm text-gray-500">
                Показывает, когда настройки могли очиститься или не примениться, и почему это произошло.
              </p>
            </div>
          </div>
          {lastResetEvent && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Последний подозрительный сброс: {lastResetEvent.reason} ({formatDateTime(lastResetEvent.timestamp)})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadEvents}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Обновить
          </button>
          <button
            type="button"
            onClick={() => {
              clearSettingsDebugEvents(scope);
              loadEvents();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </button>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="px-5 py-8 text-sm text-gray-500">
            Событий пока нет. Откройте страницу заново или повторите сценарий, при котором настройки слетают.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <div key={event.id} className="px-5 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.reason}</p>
                  <span className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</span>
                </div>
                {event.details && <p className="mt-1 text-sm text-gray-600">{event.details}</p>}
                <EventMeta event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
