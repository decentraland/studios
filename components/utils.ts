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

export function openIntercom() {
  (globalThis as any).Intercom && (globalThis as any).Intercom('show');
}

export function hideIntercom(){
  (globalThis as any).Intercom && (globalThis as any).Intercom("update", { "hide_default_launcher": true });
}

export function timeSince(stringDate: string) {
  const date = (new Date(stringDate)).getTime()
  
  const seconds = Math.floor((Date.now() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}