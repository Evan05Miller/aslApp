import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  DEFAULT_USER_PREFERENCES,
  type Handedness,
  type LetterDisplayMode,
  type UserPreferences,
  clampSpeed,
  loadUserPreferences,
  saveUserPreferences,
} from '@/lib/user-preferences';

type PreferencesContextValue = {
  preferences: UserPreferences;
  hydrated: boolean;
  setLetterDisplay: (mode: LetterDisplayMode) => void;
  setVideoSpeed: (speed: number) => void;
  setHandedness: (h: Handedness) => void;
  setPracticeAutoAdvanceLetters: (on: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadUserPreferences().then((loaded) => {
      if (!cancelled) {
        setPreferences(loaded);
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: UserPreferences) => {
    void saveUserPreferences(next);
  }, []);

  const setLetterDisplay = useCallback(
    (letterDisplay: LetterDisplayMode) => {
      setPreferences((p) => {
        const next = { ...p, letterDisplay };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setVideoSpeed = useCallback(
    (videoSpeed: number) => {
      const clamped = clampSpeed(videoSpeed);
      setPreferences((p) => {
        const next = { ...p, videoSpeed: clamped };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setHandedness = useCallback(
    (handedness: Handedness) => {
      setPreferences((p) => {
        const next = { ...p, handedness };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setPracticeAutoAdvanceLetters = useCallback(
    (practiceAutoAdvanceLetters: boolean) => {
      setPreferences((p) => {
        const next = { ...p, practiceAutoAdvanceLetters };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      preferences,
      hydrated,
      setLetterDisplay,
      setVideoSpeed,
      setHandedness,
      setPracticeAutoAdvanceLetters,
    }),
    [
      preferences,
      hydrated,
      setLetterDisplay,
      setVideoSpeed,
      setHandedness,
      setPracticeAutoAdvanceLetters,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}
