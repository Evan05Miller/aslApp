import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AslLetterSign } from '@/components/asl-letter-sign';
import { hasLetterSignAsset } from '@/constants/asl-lessons';
import { usePreferences } from '@/contexts/preferences-context';
import { practiceStaticImageAdvanceMs } from '@/lib/user-preferences';

type Props = {
  setId: string;
  title: string;
  words: string[];
  /** True: only the sign lesson (no word picker). False: pick a word first. */
  lessonMode: boolean;
  /** Called when the user chooses a word from the picker; parent should set lessonMode true. */
  onBeginLesson: () => void;
};

/**
 * Inline signing reference: word tabs + carousel of hand images only (no A–Z labels under signs).
 * Intended for the upper pane of Practice so the camera stays visible below.
 */
export function FollowAlongSignsPanel({ setId, title, words, lessonMode, onBeginLesson }: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { preferences } = usePreferences();
  /**
   * Lesson sign size: large vs word picker, but capped by height so it fits the fixed top strip
   * without needing extra space from the camera (Practice keeps a 10/12 top/bottom split).
   */
  const lessonSignSize = useMemo(() => {
    const byWidth = Math.round(windowWidth * 0.5);
    const byHeight = Math.round(windowHeight * 0.24);
    return Math.min(210, Math.max(132, Math.min(byWidth, byHeight)));
  }, [windowWidth, windowHeight]);
  /** -1 while browsing words; ≥0 once a word is chosen for the lesson. */
  const [wordIndex, setWordIndex] = useState(-1);
  const [letterIndex, setLetterIndex] = useState(0);
  /** Bumped when the user restarts the current word so the first letter’s video remounts from the start. */
  const [wordRestartKey, setWordRestartKey] = useState(0);

  const safeWords = useMemo(() => words.filter((w) => w.length > 0), [words]);
  const word = wordIndex >= 0 ? (safeWords[wordIndex] ?? '') : '';
  const letters = useMemo(() => word.split('').filter((ch) => hasLetterSignAsset(ch)), [word]);

  useEffect(() => {
    setWordIndex(-1);
    setLetterIndex(0);
    setWordRestartKey(0);
  }, [setId]);

  useEffect(() => {
    if (!lessonMode) {
      setWordIndex(-1);
      setLetterIndex(0);
      setWordRestartKey(0);
    }
  }, [lessonMode]);

  useEffect(() => {
    setLetterIndex(0);
    setWordRestartKey(0);
  }, [wordIndex]);

  useEffect(() => {
    if (letterIndex >= letters.length && letters.length > 0) {
      setLetterIndex(letters.length - 1);
    }
  }, [letters.length, letterIndex]);

  const safeLetterIndex = letters.length > 0 ? Math.min(letterIndex, letters.length - 1) : 0;
  const letterKey = letters[safeLetterIndex] ?? '';
  const letterUpper = letterKey.toUpperCase();

  const autoAdvance = preferences.practiceAutoAdvanceLetters;
  const videoAutoAdvance = autoAdvance && preferences.letterDisplay === 'video';
  const imageAutoAdvance = autoAdvance && preferences.letterDisplay === 'image';

  const goNextLetter = useCallback(() => {
    setLetterIndex((i) => Math.min(letters.length - 1, i + 1));
  }, [letters.length]);

  const restartCurrentWord = useCallback(() => {
    setLetterIndex(0);
    setWordRestartKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!lessonMode || !imageAutoAdvance || letters.length === 0) {
      return;
    }
    if (safeLetterIndex >= letters.length - 1) {
      return;
    }
    const dwellMs = practiceStaticImageAdvanceMs(preferences.videoSpeed);
    const id = setTimeout(goNextLetter, dwellMs);
    return () => clearTimeout(id);
  }, [
    lessonMode,
    imageAutoAdvance,
    letters.length,
    safeLetterIndex,
    letterUpper,
    goNextLetter,
    wordIndex,
    preferences.videoSpeed,
  ]);

  const showLesson = lessonMode && wordIndex >= 0;

  return (
    <View style={[styles.panel, lessonMode && styles.panelLessonOnly]}>
      {!lessonMode ? (
        <>
          <Text style={styles.panelContext} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.panelHint} numberOfLines={2}>
            Tap a word to open the sign lesson. Use Back after to pick another word.
          </Text>
        </>
      ) : null}

      {safeWords.length === 0 ? (
        <Text style={styles.empty}>No words in this set.</Text>
      ) : !lessonMode ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wordTabs}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled>
          {safeWords.map((w, i) => {
            const active = i === wordIndex && wordIndex >= 0;
            return (
              <Pressable
                key={`${w}-${i}`}
                onPress={() => {
                  setWordIndex(i);
                  onBeginLesson();
                }}
                style={[styles.wordTab, active && styles.wordTabActive]}>
                <Text style={[styles.wordTabText, active && styles.wordTabTextActive]} numberOfLines={1}>
                  {w}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : showLesson ? (
        <View style={[styles.carouselCard, styles.carouselCardLesson]}>
          <Text style={styles.lessonWordLabel} numberOfLines={1}>
            {word}
          </Text>
          <View style={styles.carouselMetaRowLesson}>
            <Text style={styles.carouselHintLesson}>
              Sign {letters.length === 0 ? 0 : safeLetterIndex + 1} of {letters.length}
            </Text>
            {letters.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Restart word from first sign"
                onPress={restartCurrentWord}
                style={styles.restartLinkLesson}
                hitSlop={8}>
                <Text style={styles.restartLinkTextLesson}>Restart</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.carouselRowLesson}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous sign"
              onPress={() => setLetterIndex((i) => Math.max(0, i - 1))}
              disabled={safeLetterIndex <= 0}
              style={[
                styles.arrowLesson,
                safeLetterIndex <= 0 && styles.arrowDisabled,
              ]}>
              <Text style={styles.arrowTextLesson}>‹</Text>
            </Pressable>
            <View style={[styles.signWrap, { width: lessonSignSize, height: lessonSignSize }]}>
              {letterUpper && hasLetterSignAsset(letterUpper) ? (
                <AslLetterSign
                  key={`${wordIndex}-${safeLetterIndex}-${wordRestartKey}`}
                  letter={letterUpper}
                  variant="teach"
                  style={{ width: lessonSignSize, height: lessonSignSize }}
                  loopVideo={!videoAutoAdvance}
                  onVideoPlayToEnd={videoAutoAdvance ? goNextLetter : undefined}
                />
              ) : (
                <Text style={styles.noSign}>No sign for this step.</Text>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next sign"
              onPress={() => setLetterIndex((i) => Math.min(letters.length - 1, i + 1))}
              disabled={safeLetterIndex >= letters.length - 1 || letters.length === 0}
              style={[
                styles.arrowLesson,
                (safeLetterIndex >= letters.length - 1 || letters.length === 0) && styles.arrowDisabled,
              ]}>
              <Text style={styles.arrowTextLesson}>›</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    minHeight: 0,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#A9E9A5',
    overflow: 'hidden',
  },
  panelLessonOnly: {
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  lessonWordLabel: {
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#094C2D',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  panelContext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#094C2D',
  },
  panelHint: {
    marginTop: 2,
    fontSize: 10,
    color: '#4D8D67',
    lineHeight: 13,
  },
  wordTabs: {
    paddingVertical: 4,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  wordTab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#B6EFAE',
    maxWidth: 140,
  },
  wordTabActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#DBFBE4',
  },
  wordTabText: {
    fontWeight: '700',
    fontSize: 12,
    color: '#117344',
  },
  wordTabTextActive: {
    color: '#056136',
  },
  carouselCard: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#A9E9A5',
    alignItems: 'center',
    flexShrink: 1,
  },
  carouselCardLesson: {
    flex: 1,
    minHeight: 0,
    marginTop: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  carouselMetaRowLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  carouselHintLesson: {
    color: '#266E48',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  restartLinkLesson: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#08BF6A',
    backgroundColor: '#F4FFF2',
  },
  restartLinkTextLesson: {
    fontSize: 12,
    fontWeight: '700',
    color: '#056136',
  },
  carouselRowLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    minHeight: 0,
  },
  arrowLesson: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#0EC46D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowTextLesson: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  carouselMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  carouselHint: {
    color: '#266E48',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  restartLink: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#08BF6A',
    backgroundColor: '#F4FFF2',
  },
  restartLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#056136',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#0EC46D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    backgroundColor: '#9BC9A8',
    opacity: 0.65,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  signWrap: {
    width: 92,
    height: 92,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signImage: {
    width: 88,
    height: 88,
  },
  noSign: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    padding: 6,
  },
  empty: {
    marginTop: 4,
    fontSize: 12,
    color: '#266E48',
  },
});
