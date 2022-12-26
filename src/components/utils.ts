export function toSnakeCase(str: string) {
  return str ? str.toLowerCase().replace(/\s+/g, '_') : ''
}

export function trackLink(event: string, url: string) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(event, {
      url: url,
    })
  }
}
