import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LearnMode, getLessonsForMode, modes } from '@/constants/asl-lessons';
import { CUSTOM_WORD_LESSON_ID, setCustomWordSet } from '@/constants/custom-word-set';

function parseWordsFromInput(text: string): string[] {
  const parts = text
    .split(/[\n,;]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return parts
    .map((w) => w.replace(/[^A-Z]/g, ''))
    .filter((w) => w.length > 0);
}

export default function LearnScreen() {
  const [mode, setMode] = useState<LearnMode>('letters');
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customWordsInput, setCustomWordsInput] = useState('');
  const lessonsForMode = useMemo(() => getLessonsForMode(mode), [mode]);

  const openCustomLesson = () => {
    const words = parseWordsFromInput(customWordsInput);
    if (words.length === 0) {
      Alert.alert('No words', 'Enter at least one word using letters A–Z (separate with commas or new lines).');
      return;
    }
    setCustomWordSet(words);
    setCustomModalOpen(false);
    setCustomWordsInput('');
    router.push({
      pathname: '/lesson',
      params: {
        mode: 'words',
        lessonId: CUSTOM_WORD_LESSON_ID,
        lessonIndex: '0',
        customSetVersion: String(Date.now()),
      },
    });
  };

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

        {mode === 'words' && (
          <Pressable style={styles.customSetButton} onPress={() => setCustomModalOpen(true)}>
            <Text style={styles.customSetButtonText}>Create Custom Learning Set</Text>
            <Text style={styles.customSetHint}>Enter your own words to practice fingerspelling</Text>
          </Pressable>
        )}

        <Modal
          visible={customModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setCustomModalOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Custom word list</Text>
              <Text style={styles.modalSubtitle}>
                Type any number of words. Use commas or new lines between words. Only A–Z letters are kept.
              </Text>
              <TextInput
                value={customWordsInput}
                onChangeText={setCustomWordsInput}
                placeholder={'e.g. CAT, HELLO, ASL\nor one word per line'}
                placeholderTextColor="#6EA487"
                multiline
                style={styles.modalInput}
                autoCapitalize="characters"
              />
              <View style={styles.modalActions}>
                <Pressable style={styles.modalCancel} onPress={() => setCustomModalOpen(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalCreate} onPress={openCustomLesson}>
                  <Text style={styles.modalCreateText}>Start lesson</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  customSetButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#08BF6A',
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  customSetButtonText: {
    color: '#0A7D47',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  customSetHint: {
    marginTop: 6,
    color: '#4D8D67',
    fontSize: 13,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#F4FFF2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#A9E9A5',
    gap: 10,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A7A45',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#266E48',
    lineHeight: 20,
  },
  modalInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#A8DFB1',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#094C2D',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#0A7D47',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: {
    color: '#0A7D47',
    fontWeight: '700',
  },
  modalCreate: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#0EC46D',
  },
  modalCreateText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
