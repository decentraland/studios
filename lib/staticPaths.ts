// A `fallback: false` route without any path is built as a Node.js function, which next-on-pages
// rejects, failing the whole build. When a CMS collection is empty, a placeholder path (whose
// getStaticProps returns `notFound`) keeps the route static.
export const EMPTY_PATH_PLACEHOLDER = '__empty__'

export function withPlaceholderIfEmpty<T extends { params: Record<string, string> }>(paths: T[], param: string) {
  return paths.length ? paths : [{ params: { [param]: EMPTY_PATH_PLACEHOLDER } }]
}
