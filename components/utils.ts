export function toSnakeCase(str: string) {
  return str ? str.toLowerCase().replace(/\s+/g, '_') : ''
}

export function trackLink(event: string, source: string, url: string) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(event, {
      source,
      url,
    })
  }
}

export function showIntercom() {
  (globalThis as any).Intercom && (globalThis as any).Intercom("update", { "hide_default_launcher": false });
}

export function hideIntercom(){
  (globalThis as any).Intercom && (globalThis as any).Intercom("update", { "hide_default_launcher": true });
}