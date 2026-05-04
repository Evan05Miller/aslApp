import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@asl_user_preferences_v1';

export type LetterDisplayMode = 'video' | 'image';
export type Handedness = 'lefty' | 'righty';

export type UserPreferences = {
  letterDisplay: LetterDisplayMode;
  /** Playback rate for letter videos (0.5 = half speed, 2 = double). */
  videoSpeed: number;
  handedness: Handedness;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  letterDisplay: 'video',
  videoSpeed: 1,
  handedness: 'lefty',
};

export const VIDEO_SPEED_MIN = 0.5;
export const VIDEO_SPEED_MAX = 2;
export const VIDEO_SPEED_STEP = 0.05;

export function clampSpeed(n: number): number {
  return Math.min(VIDEO_SPEED_MAX, Math.max(VIDEO_SPEED_MIN, n));
}

function normalize(raw: unknown): UserPreferences {
  const base = { ...DEFAULT_USER_PREFERENCES };
  if (raw === null || typeof raw !== 'object') {
    return base;
  }
  const o = raw as Record<string, unknown>;
  if (o.letterDisplay === 'video' || o.letterDisplay === 'image') {
    base.letterDisplay = o.letterDisplay;
  }
  if (typeof o.videoSpeed === 'number' && Number.isFinite(o.videoSpeed)) {
    base.videoSpeed = clampSpeed(o.videoSpeed);
  }
  if (o.handedness === 'lefty' || o.handedness === 'righty') {
    base.handedness = o.handedness;
  }
  return base;
}

export async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_USER_PREFERENCES };
    }
    return normalize(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
