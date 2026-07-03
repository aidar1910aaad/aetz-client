export type SettingsDebugScope = 'rusn' | 'runn';

export type SettingsDebugEvent = {
  id: string;
  scope: SettingsDebugScope;
  timestamp: string;
  reason: string;
  details?: string;
  requestId?: number;
  stateBeforeCount?: number;
  stateAfterCount?: number;
  fetchedCount?: number;
};

const STORAGE_KEY = 'settings-debug-journal';
const MAX_EVENTS = 200;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readAllEvents(): SettingsDebugEvent[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllEvents(events: SettingsDebugEvent[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch {
    // Игнорируем переполнение/ограничения storage: журнал диагностический.
  }
}

export function appendSettingsDebugEvent(
  scope: SettingsDebugScope,
  event: Omit<SettingsDebugEvent, 'id' | 'scope' | 'timestamp'>
) {
  const nextEvent: SettingsDebugEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scope,
    timestamp: new Date().toISOString(),
    ...event,
  };

  const nextEvents = [nextEvent, ...readAllEvents()].slice(0, MAX_EVENTS);
  writeAllEvents(nextEvents);

  return nextEvent;
}

export function getSettingsDebugEvents(scope: SettingsDebugScope) {
  return readAllEvents().filter((event) => event.scope === scope);
}

export function clearSettingsDebugEvents(scope?: SettingsDebugScope) {
  if (!scope) {
    writeAllEvents([]);
    return;
  }

  const filtered = readAllEvents().filter((event) => event.scope !== scope);
  writeAllEvents(filtered);
}
