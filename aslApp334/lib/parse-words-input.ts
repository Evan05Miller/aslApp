/** Parse user text into uppercase A–Z words (commas, semicolons, newlines). */
export function parseWordsFromInput(text: string): string[] {
  const parts = text
    .split(/[\n,;]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return parts
    .map((w) => w.replace(/[^A-Z]/g, ''))
    .filter((w) => w.length > 0);
}
