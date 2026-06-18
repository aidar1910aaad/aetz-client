const TTL_MS = 5 * 60 * 1000;

type CacheSlot<T> = {
  key: string;
  data: T | null;
  promise: Promise<T> | null;
  updatedAt: number;
};

function isFresh(slot: CacheSlot<unknown>): boolean {
  return slot.data !== null && Date.now() - slot.updatedAt < TTL_MS;
}

export function fetchWithDedup<T>(
  slot: CacheSlot<T>,
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  if (slot.key === cacheKey && isFresh(slot)) {
    return Promise.resolve(slot.data as T);
  }

  if (slot.key === cacheKey && slot.promise) {
    return slot.promise;
  }

  slot.key = cacheKey;
  slot.data = null;

  const promise = fetcher()
    .then((data) => {
      slot.data = data;
      slot.updatedAt = Date.now();
      slot.promise = null;
      return data;
    })
    .catch((err) => {
      slot.promise = null;
      throw err;
    });

  slot.promise = promise;
  return promise;
}

export function invalidateCacheSlot<T>(slot: CacheSlot<T>): void {
  slot.key = '';
  slot.data = null;
  slot.promise = null;
  slot.updatedAt = 0;
}
