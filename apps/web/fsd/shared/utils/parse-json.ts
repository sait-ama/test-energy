export function parseJson<T>(value: string, defaultValue: any = undefined): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}
