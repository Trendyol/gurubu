export function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}
