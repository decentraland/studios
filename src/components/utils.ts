export function toSnakeCase(str: string) {
  return str ? str.toLowerCase().replaceAll?.(/\s+/g, '_') : ''
}
