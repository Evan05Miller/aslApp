export const CUSTOM_WORD_LESSON_ID = 'custom';

let customWords: string[] | null = null;

export function setCustomWordSet(words: string[]): void {
  customWords = words.length > 0 ? [...words] : null;
}

export function getCustomWordSet(): string[] | null {
  return customWords;
}
