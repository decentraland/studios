import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import type { Options as SanitizeSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import type { Element, Root } from 'hast'

const CLOBBER_PREFIX = 'user-content-'

// Block elements that WYSIWYG editors align with an inline `style="text-align: ..."`. The style is reduced to that
// single declaration by rehypeRestrictStyles below.
const STYLED_TAG_NAMES = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const TEXT_ALIGN_VALUES = ['left', 'right', 'center', 'justify']

// The class names defined in public/landings.css, the only stylesheet written for landing content. Other classes are
// dropped, so CMS content can't borrow site or Semantic UI classes (`ui active dimmer`, `ui modal`...) to draw fake
// interface over the page. Add new landings.css classes here when CMS content needs them.
const LANDING_CLASS_NAMES = [
  'base-text', 'card', 'chat-link', 'container--success', 'cta', 'cta-inverted', 'cta--highlight', 'cta__customFields',
  'cta__form', 'cta__form--success__buttons', 'cta__image', 'faq--collapsed', 'footer', 'footer__container',
  'hero__container__cta', 'hero__container__pdf-cover', 'inline-link', 'options',
  'section--aboutdcl', 'section--aboutdcl__cards', 'section--aboutdcl__cards__card',
  'section--aboutdcl__cards__card__description', 'section--aboutdcl__cards__card__title',
  'section--aboutdcl__description', 'section--aboutdcl__image',
  'section--contact', 'section--contact__container', 'section--contact__container__message', 'section--contact__cta',
  'section--contact_envelope',
  'section--cta', 'section--cta__container', 'section--cta__container__content', 'section--cta__container--slider',
  'section--deepdive', 'section--deepdive__container', 'section--deepdive__container__cta',
  'section--deepdive__container__img',
  'section--faq', 'section--faq__container', 'section--faq__container__description', 'section--faq__container__faqlist',
  'section--faq__container__faqlist__faq', 'section--faq__container__faqlist__faq__answer',
  'section--faq__container__faqlist__faq__title', 'section--faq__container__faqlist__faq__title__chevron',
  'section--faq__container__faqlist__faq__title__number',
  'section--faq__container__faqlist__faq__title__question_title',
  'section--hero', 'section--hero__container', 'section--hero__container__logo',
  'section--journey', 'section--journey__cards__card__description', 'section--journey__container',
  'section--journey__container__cards', 'section--journey__container__cards__card',
  'section--journey__container__cards__card__number', 'section--journey__container__cards__card__title',
  'section--journey__container__cta', 'section--journey__container__cta__text',
  'section--reviews', 'section--reviews__container', 'section--reviews__container__review',
  'section--reviews__container__review__author', 'section--reviews__container__review__author__authorname',
  'section--reviews__container__review__author__image', 'section--reviews__container__review__author__name',
  'section--reviews__container__review__text',
  'section--whatsinside', 'section--whatsinside__cards', 'section--whatsinside__cards__card',
  'section--whatsinside__cards__card__text', 'section--whatsinside__cards__card__title', 'section--whatsinside__cta',
  'section--whatsinside__description', 'section--whatsinside__description__text',
]

// Class names can't run code, and landing content relies on them for styling, so the landings.css ones are kept.
// <u> is kept for underlined text from the editor. <script> and <style> are removed together with their contents, so
// CSS doesn't end up as page text. Ids and names are prefixed so they can't clobber globals such as `window.dataLayer` or `document.createElement`.
const schema: SanitizeSchema = {
  ...defaultSchema,
  strip: ['script', 'style'],
  clobberPrefix: CLOBBER_PREFIX,
  clobber: ['name', 'id'],
  tagNames: [...(defaultSchema.tagNames || []), 'u'],
  attributes: {
    ...defaultSchema.attributes,
    ...Object.fromEntries(
      STYLED_TAG_NAMES.map((tagName) => [tagName, [...(defaultSchema.attributes?.[tagName] || []), 'style']])
    ),
    '*': [...(defaultSchema.attributes?.['*'] || []), ['className', ...LANDING_CLASS_NAMES]]
  }
}

const walk = (node: Root | Element, visit: (element: Element) => void) => {
  for (const child of node.children) {
    if (child.type === 'element') {
      visit(child)
      walk(child, visit)
    }
  }
}

const decodeFragment = (fragment: string): string | undefined => {
  try {
    return decodeURIComponent(fragment)
  } catch {
    return undefined
  }
}

/**
 * Points `#anchor` links to the prefixed id or legacy `<a name>` they target, so in-page links keep working after
 * sanitizing. Fragments are matched both as written and percent-decoded (`#caf%C3%A9` targets `id="café"`), and the
 * prefix is prepended to the original fragment so its encoding is preserved. Hrefs that aren't fragment-only are left alone.
 */
const rehypePrefixFragmentLinks = () => (tree: Root) => {
  const targets = new Set<string>()
  walk(tree, (element) => {
    for (const key of ['id', 'name'] as const) {
      const value = element.properties?.[key]
      if (typeof value === 'string') targets.add(value)
    }
  })
  walk(tree, (element) => {
    const href = element.properties?.href
    if (element.tagName !== 'a' || typeof href !== 'string' || !href.startsWith('#')) return
    const fragment = href.slice(1)
    const decoded = decodeFragment(fragment)
    if (targets.has(CLOBBER_PREFIX + fragment) || (decoded !== undefined && targets.has(CLOBBER_PREFIX + decoded))) {
      element.properties!.href = `#${CLOBBER_PREFIX}${fragment}`
    }
  })
}

/**
 * Reduces the `style` attributes the schema lets through to a single `text-align: left|right|center|justify`
 * declaration, and drops the attribute when there's none. Every other declaration is discarded, as is anything that
 * isn't exactly that value (`url(...)`, comments, `!important`...).
 */
const rehypeRestrictStyles = () => (tree: Root) => {
  walk(tree, (element) => {
    const style = element.properties?.style
    if (style === undefined) return
    let textAlign: string | undefined
    if (typeof style === 'string') {
      for (const declaration of style.split(';')) {
        const separator = declaration.indexOf(':')
        if (separator < 0) continue
        const property = declaration.slice(0, separator).trim().toLowerCase()
        const value = declaration.slice(separator + 1).trim().toLowerCase()
        if (property === 'text-align' && TEXT_ALIGN_VALUES.includes(value)) textAlign = value
      }
    }
    if (textAlign) {
      element.properties!.style = `text-align:${textAlign}`
    } else {
      delete element.properties!.style
    }
  })
}

// Removes the `class=""` left behind when none of an element's classes are allowed
const rehypeRemoveEmptyClasses = () => (tree: Root) => {
  walk(tree, (element) => {
    const className = element.properties?.className
    if (Array.isArray(className) && className.length === 0) delete element.properties!.className
  })
}

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, schema)
  .use(rehypeRestrictStyles)
  .use(rehypeRemoveEmptyClasses)
  .use(rehypePrefixFragmentLinks)
  .use(rehypeStringify)

/**
 * Sanitizes HTML authored in the CMS before rendering it with dangerouslySetInnerHTML. Server only: call it from
 * getStaticProps or API routes and render the result, so the parser isn't shipped to the browser.
 * Uses the GitHub-like default schema: formatting tags and http(s)/mailto links are kept, while scripts, styles,
 * iframes, event handlers and `javascript:` URLs are removed. Class names from public/landings.css, <u> and `text-align` styles on block and
 * span elements are also kept. `id` and `name`
 * attributes are prefixed with `user-content-` (DOM clobbering protection) and `#anchor` links are rewritten to match.
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string' || !html) return ''
  return String(processor.processSync(html))
}
