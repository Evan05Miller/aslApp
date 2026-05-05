import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LearnMode, getLessonsForMode, modes } from '@/constants/asl-lessons';
import { usePreferences } from '@/contexts/preferences-context';

export default function LearnScreen() {
  const [mode, setMode] = useState<LearnMode>('letters');
  const lessonsForMode = useMemo(() => getLessonsForMode(mode), [mode]);
  const { preferences } = usePreferences();
  const highContrast = preferences.highContrast;

  return (
    <SafeAreaView style={[styles.safe, highContrast && styles.safeHighContrast]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerCard, highContrast && styles.headerCardHighContrast]}>
          <Text style={[styles.headerTitle, highContrast && styles.headerTitleHighContrast]}>Your ASL journey starts here.</Text>
          <Text style={[styles.headerSubtitle, highContrast && styles.headerSubtitleHighContrast]}>
            Choose a mode below to begin
          </Text>
        </View>

        <View style={styles.modeRow}>
          {modes.map((item) => {
            const isActive = mode === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setMode(item.id)}
                style={[
                  styles.modeButton,
                  highContrast && styles.modeButtonHighContrast,
                  isActive && styles.modeButtonActive,
                  highContrast && isActive && styles.modeButtonActiveHighContrast,
                ]}>
                <Text
                  style={[
                    styles.modeTitle,
                    highContrast && styles.modeTitleHighContrast,
                    isActive && styles.modeTitleActive,
                    highContrast && isActive && styles.modeTitleActiveHighContrast,
                  ]}>
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.modeSubtitle,
                    highContrast && styles.modeSubtitleHighContrast,
                    isActive && styles.modeSubtitleActive,
                    highContrast && isActive && styles.modeSubtitleActiveHighContrast,
                  ]}>
                  {item.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, highContrast && styles.sectionLabelHighContrast]}>Lesson Modules</Text>
        <View style={styles.lessonList}>
          {lessonsForMode.map((lesson, index) => (
            <Pressable
              key={lesson.id}
              onPress={() =>
                router.push({
                  pathname: '/lesson',
                  params: {
                    mode,
                    lessonId: lesson.id,
                    lessonIndex: String(index),
                  },
                })
              }
              style={[styles.lessonCard, highContrast && styles.lessonCardHighContrast]}>
              <Text style={[styles.lessonTitle, highContrast && styles.lessonTitleHighContrast]}>{lesson.title}</Text>
              <Text style={[styles.lessonMeta, highContrast && styles.lessonMetaHighContrast]}>Tap to open lesson view</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D7F58B',
  },
  safeHighContrast: {
    backgroundColor: '#000000',
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#08BF6A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  headerCardHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFD400',
    borderWidth: 3,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerTitleHighContrast: {
    color: '#FFD400',
  },
  headerSubtitle: {
    color: '#EAFEF1',
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  headerSubtitleHighContrast: {
    color: '#FFFFFF',
  },
  modeRow: {
    gap: 10,
  },
  modeButton: {
    backgroundColor: '#F4FFF2',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#A9E9A5',
    padding: 12,
  },
  modeButtonHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  modeButtonActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#DBFBE4',
  },
  modeButtonActiveHighContrast: {
    borderColor: '#FFD400',
    backgroundColor: '#111111',
  },
  modeTitle: {
    color: '#0A7D47',
    fontWeight: '700',
    fontSize: 16,
  },
  modeTitleHighContrast: {
    color: '#FFFFFF',
  },
  modeTitleActive: {
    color: '#056136',
  },
  modeTitleActiveHighContrast: {
    color: '#FFD400',
  },
  modeSubtitle: {
    color: '#3B8A5B',
    marginTop: 2,
    fontSize: 13,
  },
  modeSubtitleHighContrast: {
    color: '#FFFFFF',
  },
  modeSubtitleActive: {
    color: '#1F6D43',
  },
  modeSubtitleActiveHighContrast: {
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C6E3E',
    marginTop: 4,
  },
  sectionLabelHighContrast: {
    color: '#FFD400',
  },
  lessonList: {
    gap: 10,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  lessonCardHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  lessonTitle: {
    color: '#117344',
    fontWeight: '700',
    fontSize: 16,
  },
  lessonTitleHighContrast: {
    color: '#FFD400',
  },
  lessonMeta: {
    marginTop: 4,
    color: '#4D8D67',
    fontSize: 13,
  },
  lessonMetaHighContrast: {
    color: '#FFFFFF',
  },
});
