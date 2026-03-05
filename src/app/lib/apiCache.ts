const apiCache = new Map<string, Promise<any>>();

export function fetchWithCache<T = any>(url: string): Promise<T> {
  if (apiCache.has(url)) {
    return apiCache.get(url)!;
  }

  const promise = fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      apiCache.delete(url);
      throw err;
    });

  apiCache.set(url, promise);
  return promise;
}

export function clearCache(url: string) {
  apiCache.delete(url);
}
