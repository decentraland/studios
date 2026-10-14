import { useState, useEffect } from 'react';

export function toSnakeCase(str: string) {
  return str ? str.toLowerCase().replace(/\s+/g, '_') : ''
}

export function showIntercomIcon() {
  (globalThis as any).Intercom && (globalThis as any).Intercom("update", { "hide_default_launcher": false });
}

export function openIntercom() {
  (globalThis as any).Intercom && (globalThis as any).Intercom('show');
}

export function hideIntercomIcon() {
  (globalThis as any).Intercom && (globalThis as any).Intercom("update", { "hide_default_launcher": true });
}

export function updateIntercom(userData: object) {
  (globalThis as any).Intercom && (globalThis as any).Intercom('update', userData)
}

export function trackLink(event: string, source: string, url: string) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(event, {
      source,
      url,
    })
  }
}

export function linkedinTrackLead(conversion_id?: string) {
  (globalThis as any).lintrk && (globalThis as any).lintrk('track', { conversion_id: conversion_id })
}

export function googleAdsTrack() {
  (globalThis as any).gtag && (globalThis as any).gtag('event', 'conversion', {'send_to': 'AW-11226587097/zpgmCOefkK4YENm_oOkp'})
}

export function plausibleTrackEvent(eventName: string, props?: object) {
  (globalThis as any).plausible && (globalThis as any).plausible(eventName, props ? { props: props } : undefined )
}

export function fbq (...params: string[]) {
  (globalThis as any).fbq && (globalThis as any).fbq(...params)
} 

export function formatTimeToNow(stringDate: string) {
  const date = (new Date(stringDate)).getTime()

  let seconds = Math.floor((Date.now() - date) / 1000);

  if (seconds < 0) seconds = seconds * -1

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

export function budgetToRanges(budget: string) {
  const ranges = [
    {
      value: [0, 1000],
      displayValue: 'Up to $1000'
    },
    {
      value: [1000, 5000],
      displayValue: '$1000 to $5000'
    },
    {
      value: [5000, 20000],
      displayValue: '$5000 to $20000'
    },
    {
      value: [20000, 50000],
      displayValue: '$20000 to $50000'
    },
    {
      value: [50000, Infinity],
      displayValue: 'More than $50000'
    }
  ]

  for (const range of ranges) {
    if (range.value[0] <= parseInt(budget) && range.value[1] > parseInt(budget)){
      return range.displayValue
    }
  }
}


function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = globalThis;
  return {
    width,
    height
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export function isUUID (str: string) {
  const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  return regex.test(str)
}

export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Returns the url only when it uses http(s), so CMS or user supplied links can't run `javascript:` code.
 */
export function safeUrl(url?: string | null) {
  if (!url) return undefined
  try {
    const { protocol } = new URL(url, 'https://studios.decentraland.org')
    return protocol === 'http:' || protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}

interface HastNode {
  type: string
  value?: string
  tagName?: string
  properties?: object
  children?: HastNode[]
}

/**
 * Rehype plugin that wraps the text matching `query` in <mark> elements without parsing raw HTML.
 */
export function rehypeHighlight(query: string) {
  const tokens = query.split(' ').filter(Boolean).map(escapeRegExp)
  const regex = tokens.length ? new RegExp(`(${tokens.join('|')})`, 'gi') : undefined

  const highlight = (node: HastNode) => {
    if (!regex || !node.children) return
    node.children = node.children.flatMap((child) => {
      if (child.type !== 'text' || !child.value) {
        highlight(child)
        return [child]
      }
      // split() with a capturing group puts the matched text at odd indexes
      return child.value.split(regex)
        .map((part, index): HastNode => index % 2
          ? { type: 'element', tagName: 'mark', properties: {}, children: [{ type: 'text', value: part }] }
          : { type: 'text', value: part })
        .filter(part => part.type === 'element' || part.value)
    })
  }

  return () => (tree: HastNode) => highlight(tree)
}
