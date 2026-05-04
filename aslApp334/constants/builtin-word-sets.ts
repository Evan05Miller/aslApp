/** Same shape as `SavedWordSet` in `@/lib/saved-word-sets` (kept here to avoid circular imports). */
export type BuiltInWordSet = {
  id: string;
  title: string;
  words: string[];
  createdAt: number;
  updatedAt: number;
};

export const BUILTIN_WORD_SET_IDS = {
  MONTHS: 'builtin-months',
} as const;

export function isBuiltInWordSetId(id: string): boolean {
  return id === BUILTIN_WORD_SET_IDS.MONTHS;
}

/** Stable timestamps only for type / ordering; not stored in the main word-sets key. */
const T = 1704067200000;

/**
 * Default practice set (camera + My sets). User can remove it; see `dismissBuiltInWordSet` in saved-word-sets.
 */
export function getBuiltInWordSets(): BuiltInWordSet[] {
  return [
    {
      id: BUILTIN_WORD_SET_IDS.MONTHS,
      title: 'Months of the year',
      words: [
        'JANUARY',
        'FEBRUARY',
        'MARCH',
        'APRIL',
        'MAY',
        'JUNE',
        'JULY',
        'AUGUST',
        'SEPTEMBER',
        'OCTOBER',
        'NOVEMBER',
        'DECEMBER',
      ],
      createdAt: T,
      updatedAt: T + 1,
    },
  ];
}
