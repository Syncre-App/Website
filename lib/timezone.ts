const FALLBACK_ZONE = 'Europe/Budapest';

let cachedZone: string | null = null;

const detectTimezone = (): string => {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (resolved && resolved !== 'Etc/Unknown') {
      return resolved;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('TimezoneService: failed to read Intl timezone', error);
    }
  }
  return FALLBACK_ZONE;
};

export const TimezoneService = {
  getTimezone(forceRefresh = false): string {
    if (!cachedZone || forceRefresh) {
      cachedZone = detectTimezone();
    }
    return cachedZone;
  },
  setTimezone(timezone?: string | null): string {
    if (timezone && typeof timezone === 'string' && timezone.trim().length) {
      cachedZone = timezone.trim();
    }
    return this.getTimezone();
  },
  applyHeader<T extends Record<string, string>>(headers: T): T {
    const zone = this.getTimezone();
    if (zone) {
      headers['X-Client-Timezone'] = zone;
    }
    return headers;
  },
};
