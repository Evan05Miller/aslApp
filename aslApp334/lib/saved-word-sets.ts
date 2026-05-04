import AsyncStorage from '@react-native-async-storage/async-storage';

import { getBuiltInWordSets, isBuiltInWordSetId } from '@/constants/builtin-word-sets';

const STORAGE_KEY = '@asl_saved_word_sets_v1';
const DISMISSED_BUILTINS_KEY = '@asl_dismissed_builtin_word_sets_v1';

export type SavedWordSet = {
  id: string;
  title: string;
  words: string[];
  createdAt: number;
  updatedAt: number;
};

function sortSets(sets: SavedWordSet[]): SavedWordSet[] {
  return [...sets].sort((a, b) => b.updatedAt - a.updatedAt);
}

async function readDismissedBuiltinIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_BUILTINS_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

async function dismissBuiltinId(id: string): Promise<void> {
  const dismissed = await readDismissedBuiltinIds();
  dismissed.add(id);
  await AsyncStorage.setItem(DISMISSED_BUILTINS_KEY, JSON.stringify([...dismissed]));
}

async function readAll(): Promise<SavedWordSet[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is SavedWordSet =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as SavedWordSet).id === 'string' &&
        typeof (item as SavedWordSet).title === 'string' &&
        Array.isArray((item as SavedWordSet).words) &&
        (item as SavedWordSet).words.every((w) => typeof w === 'string'),
    );
  } catch {
    return [];
  }
}

async function writeAll(sets: SavedWordSet[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch (e) {
    throw e instanceof Error ? e : new Error('Failed to save word sets');
  }
}

export async function loadAllSavedSets(): Promise<SavedWordSet[]> {
  const dismissed = await readDismissedBuiltinIds();
  const builtIn = (getBuiltInWordSets() as SavedWordSet[]).filter((s) => !dismissed.has(s.id));
  const user = sortSets(await readAll()).filter((s) => !isBuiltInWordSetId(s.id));
  return [...builtIn, ...user];
}

export async function getWordSetById(id: string): Promise<SavedWordSet | null> {
  if (isBuiltInWordSetId(id)) {
    const dismissed = await readDismissedBuiltinIds();
    if (dismissed.has(id)) {
      return null;
    }
    const found = getBuiltInWordSets().find((s) => s.id === id);
    return (found as SavedWordSet | undefined) ?? null;
  }
  const sets = await readAll();
  return sets.find((s) => s.id === id) ?? null;
}

export async function saveNewWordSet(title: string, words: string[]): Promise<SavedWordSet> {
  const trimmedTitle = title.trim() || 'Untitled set';
  const now = Date.now();
  const entry: SavedWordSet = {
    id: `${now}-${Math.random().toString(36).slice(2, 10)}`,
    title: trimmedTitle,
    words: [...words],
    createdAt: now,
    updatedAt: now,
  };
  const sets = (await readAll()).filter((s) => !isBuiltInWordSetId(s.id));
  sets.push(entry);
  await writeAll(sets);
  return entry;
}

export async function deleteWordSet(id: string): Promise<void> {
  const target = String(id).trim();
  if (isBuiltInWordSetId(target)) {
    await dismissBuiltinId(target);
    return;
  }
  const sets = (await readAll()).filter((s) => String(s.id).trim() !== target);
  await writeAll(sets);
}
