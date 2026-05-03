import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LearnMode, getLessonsForMode, modes } from '@/constants/asl-lessons';

export default function LearnScreen() {
  const [mode, setMode] = useState<LearnMode>('letters');
  const lessonsForMode = useMemo(() => getLessonsForMode(mode), [mode]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>ASL Learning Tool</Text>
          <Text style={styles.headerSubtitle}>Pick a mode and open any lesson to start.</Text>
        </View>

        <View style={styles.modeRow}>
          {modes.map((item) => {
            const isActive = mode === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setMode(item.id)}
                style={[styles.modeButton, isActive && styles.modeButtonActive]}>
                <Text style={[styles.modeTitle, isActive && styles.modeTitleActive]}>{item.label}</Text>
                <Text style={[styles.modeSubtitle, isActive && styles.modeSubtitleActive]}>{item.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Lesson Modules</Text>
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
              style={styles.lessonCard}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonMeta}>Tap to open lesson view</Text>
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#EAFEF1',
    marginTop: 4,
    fontSize: 14,
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
  modeButtonActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#DBFBE4',
  },
  modeTitle: {
    color: '#0A7D47',
    fontWeight: '700',
    fontSize: 16,
  },
  modeTitleActive: {
    color: '#056136',
  },
  modeSubtitle: {
    color: '#3B8A5B',
    marginTop: 2,
    fontSize: 13,
  },
  modeSubtitleActive: {
    color: '#1F6D43',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C6E3E',
    marginTop: 4,
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
  lessonTitle: {
    color: '#117344',
    fontWeight: '700',
    fontSize: 16,
  },
  lessonMeta: {
    marginTop: 4,
    color: '#4D8D67',
    fontSize: 13,
  },
});
