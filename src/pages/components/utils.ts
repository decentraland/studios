export function toSnakeCase(str: string) {
  return str.toLowerCase().replaceAll(/\s+/g, '_')
}
