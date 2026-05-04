import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AslLetterSign } from '@/components/asl-letter-sign';
import { hasLetterSignAsset } from '@/constants/asl-lessons';

type Props = {
  setId: string;
  title: string;
  words: string[];
};

/**
 * Inline signing reference: word tabs + carousel of hand images only (no A–Z labels under signs).
 * Intended for the upper pane of Practice so the camera stays visible below.
 */
export function FollowAlongSignsPanel({ setId, title, words }: Props) {
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);

  const safeWords = useMemo(() => words.filter((w) => w.length > 0), [words]);
  const word = safeWords[wordIndex] ?? '';
  const letters = useMemo(() => word.split('').filter((ch) => hasLetterSignAsset(ch)), [word]);

  useEffect(() => {
    setWordIndex(0);
    setLetterIndex(0);
  }, [setId]);

  useEffect(() => {
    setLetterIndex(0);
  }, [wordIndex]);

  useEffect(() => {
    if (letterIndex >= letters.length && letters.length > 0) {
      setLetterIndex(letters.length - 1);
    }
  }, [letters.length, letterIndex]);

  const safeLetterIndex = letters.length > 0 ? Math.min(letterIndex, letters.length - 1) : 0;
  const letterKey = letters[safeLetterIndex] ?? '';
  const letterUpper = letterKey.toUpperCase();

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.panelHint}>Tap a word, then use arrows for each sign (shapes only—no letter labels).</Text>

      {safeWords.length === 0 ? (
        <Text style={styles.empty}>No words in this set.</Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wordTabs}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            {safeWords.map((w, i) => {
              const active = i === wordIndex;
              return (
                <Pressable
                  key={`${w}-${i}`}
                  onPress={() => setWordIndex(i)}
                  style={[styles.wordTab, active && styles.wordTabActive]}>
                  <Text style={[styles.wordTabText, active && styles.wordTabTextActive]}>{w}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.carouselCard}>
            <Text style={styles.carouselHint}>
              Sign {letters.length === 0 ? 0 : safeLetterIndex + 1} of {letters.length}
            </Text>
            <View style={styles.carouselRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous sign"
                onPress={() => setLetterIndex((i) => Math.max(0, i - 1))}
                disabled={safeLetterIndex <= 0}
                style={[styles.arrow, safeLetterIndex <= 0 && styles.arrowDisabled]}>
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>
              <View style={styles.signWrap}>
                {letterUpper && hasLetterSignAsset(letterUpper) ? (
                  <AslLetterSign letter={letterUpper} variant="teach" style={styles.signImage} />
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
                  styles.arrow,
                  (safeLetterIndex >= letters.length - 1 || letters.length === 0) && styles.arrowDisabled,
                ]}>
                <Text style={styles.arrowText}>›</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#A9E9A5',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#094C2D',
  },
  panelHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#4D8D67',
    lineHeight: 16,
  },
  wordTabs: {
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#B6EFAE',
  },
  wordTabActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#DBFBE4',
  },
  wordTabText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#117344',
  },
  wordTabTextActive: {
    color: '#056136',
  },
  carouselCard: {
    marginTop: 4,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#A9E9A5',
    alignItems: 'center',
  },
  carouselHint: {
    color: '#266E48',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  arrow: {
    width: 44,
    height: 44,
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
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 30,
  },
  signWrap: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signImage: {
    width: 130,
    height: 130,
  },
  noSign: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    padding: 12,
  },
  empty: {
    marginTop: 8,
    fontSize: 14,
    color: '#266E48',
  },
});
