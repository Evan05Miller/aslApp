import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
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

import { isBuiltInWordSetId } from '@/constants/builtin-word-sets';
import { CUSTOM_WORD_LESSON_ID, setCustomWordSet } from '@/constants/custom-word-set';
import { usePreferences } from '@/contexts/preferences-context';
import { parseWordsFromInput } from '@/lib/parse-words-input';
import { deleteWordSet, loadAllSavedSets, saveNewWordSet, type SavedWordSet } from '@/lib/saved-word-sets';

function pushLesson(savedSetId?: string) {
  router.push({
    pathname: '/lesson',
    params: {
      mode: 'words',
      lessonId: CUSTOM_WORD_LESSON_ID,
      lessonIndex: '0',
      customSetVersion: String(Date.now()),
      ...(savedSetId ? { savedSetId } : {}),
    },
  });
}

export default function MySetsScreen() {
  const { preferences } = usePreferences();
  const highContrast = preferences.highContrast;
  const [titleInput, setTitleInput] = useState('');
  const [wordsInput, setWordsInput] = useState('');
  const [savedSets, setSavedSets] = useState<SavedWordSet[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedWordSet | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refreshList = useCallback(async () => {
    setListLoading(true);
    try {
      const list = await loadAllSavedSets();
      setSavedSets(list);
    } finally {
      setListLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshList();
    }, [refreshList]),
  );

  const getWordsOrAlert = (): string[] | null => {
    const words = parseWordsFromInput(wordsInput);
    if (words.length === 0) {
      Alert.alert('No words', 'Enter at least one word using letters A–Z (separate with commas or new lines).');
      return null;
    }
    return words;
  };

  const startWithoutSaving = () => {
    const words = getWordsOrAlert();
    if (!words) {
      return;
    }
    setCustomWordSet(words);
    pushLesson();
  };

  const saveAndStart = async () => {
    const words = getWordsOrAlert();
    if (!words) {
      return;
    }
    setSaving(true);
    try {
      const saved = await saveNewWordSet(titleInput, words);
      setTitleInput('');
      setWordsInput('');
      await refreshList();
      pushLesson(saved.id);
    } finally {
      setSaving(false);
    }
  };

  const studySaved = (id: string) => {
    pushLesson(id);
  };

  const runDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }
    setDeleteBusy(true);
    try {
      await deleteWordSet(deleteTarget.id);
      setDeleteTarget(null);
      await refreshList();
    } catch (e) {
      Alert.alert('Could not delete', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setDeleteBusy(false);
    }
  }, [deleteTarget, refreshList]);

  return (
    <SafeAreaView style={[styles.safe, highContrast && styles.safeHighContrast]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>
        <View style={[styles.headerCard, highContrast && styles.headerCardHighContrast]}>
          <Text style={[styles.headerTitle, highContrast && styles.titleHighContrast]}>Custom Learning Sets</Text>
          <Text style={[styles.headerSubtitle, highContrast && styles.textHighContrast]}>
            Build a word list to practice right away or save a set to restudy later.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, highContrast && styles.titleHighContrast]}>Create a set</Text>
        <View style={[styles.card, highContrast && styles.cardHighContrast]}>
          <Text style={[styles.fieldLabel, highContrast && styles.textHighContrast]}>Set name</Text>
          <TextInput
            value={titleInput}
            onChangeText={setTitleInput}
            placeholder="e.g. Week 3 vocabulary"
            placeholderTextColor={highContrast ? '#BDBDBD' : '#6EA487'}
            style={[styles.singleLineInput, highContrast && styles.inputHighContrast]}
            autoCapitalize="sentences"
          />
          <Text style={[styles.fieldLabel, highContrast && styles.textHighContrast]}>Words</Text>
          <Text style={styles.fieldHint}>Commas or new lines. Only A–Z letters are kept.</Text>
          <TextInput
            value={wordsInput}
            onChangeText={setWordsInput}
            placeholder={'e.g. CAT, HELLO, ASL\nor one word per line'}
            placeholderTextColor={highContrast ? '#BDBDBD' : '#6EA487'}
            multiline
            style={[styles.wordsInput, highContrast && styles.inputHighContrast]}
            autoCapitalize="characters"
          />
          <View style={styles.createActions}>
            <Pressable style={[styles.secondaryButton, highContrast && styles.secondaryButtonHighContrast]} onPress={startWithoutSaving} disabled={saving}>
              <Text style={[styles.secondaryButtonText, highContrast && styles.secondaryButtonTextHighContrast]}>Start without saving</Text>
            </Pressable>
            <Pressable style={[styles.primaryButton, highContrast && styles.primaryButtonHighContrast]} onPress={() => void saveAndStart()} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={highContrast ? '#000000' : '#FFFFFF'} />
              ) : (
                <Text style={[styles.primaryButtonText, highContrast && styles.primaryButtonTextHighContrast]}>Save and practice</Text>
              )}
            </Pressable>
          </View>
        </View>

        <Text style={[styles.sectionLabel, highContrast && styles.titleHighContrast]}>Saved sets</Text>
        {listLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={highContrast ? '#FFD400' : '#0A7D47'} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : (
          <View style={styles.savedList}>
            {savedSets.map((set) => {
              const builtIn = isBuiltInWordSetId(set.id);
              return (
                <View key={set.id} style={[styles.savedRow, highContrast && styles.cardHighContrast]}>
                  <View style={styles.savedTextCol}>
                    <Text style={[styles.savedTitle, highContrast && styles.titleHighContrast]}>{set.title}</Text>
                    <Text style={[styles.savedMeta, highContrast && styles.textHighContrast]}>
                      {builtIn ? 'Built-in · ' : ''}
                      {set.words.length} word{set.words.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <View style={styles.savedActions}>
                    <Pressable style={[styles.studyBtn, highContrast && styles.primaryButtonHighContrast]} onPress={() => studySaved(set.id)}>
                      <Text style={[styles.studyBtnText, highContrast && styles.primaryButtonTextHighContrast]}>Study</Text>
                    </Pressable>
                    <Pressable style={styles.deleteBtn} onPress={() => setDeleteTarget(set)}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => !deleteBusy && setDeleteTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, highContrast && styles.cardHighContrast]}>
            <Text style={[styles.modalTitle, highContrast && styles.titleHighContrast]}>Delete set</Text>
            <Text style={[styles.modalBody, highContrast && styles.textHighContrast]}>
              {deleteTarget && isBuiltInWordSetId(deleteTarget.id)
                ? `Remove the default “${deleteTarget.title}” list from Practice and My sets? You can add your own set with the same words later.`
                : `Remove “${deleteTarget?.title ?? ''}”? This cannot be undone.`}
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancel, highContrast && styles.secondaryButtonHighContrast]}
                disabled={deleteBusy}
                onPress={() => setDeleteTarget(null)}>
                <Text style={[styles.modalCancelText, highContrast && styles.secondaryButtonTextHighContrast]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalDelete}
                disabled={deleteBusy}
                onPress={() => void runDelete()}>
                {deleteBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDeleteText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  titleHighContrast: {
    color: '#FFD400',
  },
  textHighContrast: {
    color: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#EAFEF1',
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C6E3E',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    padding: 14,
    gap: 8,
  },
  cardHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  inputHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    color: '#FFFFFF',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#117344',
    marginTop: 4,
  },
  fieldHint: {
    fontSize: 12,
    color: '#4D8D67',
    marginTop: -4,
  },
  singleLineInput: {
    borderWidth: 1,
    borderColor: '#A8DFB1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#094C2D',
    backgroundColor: '#F4FFF2',
  },
  wordsInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#A8DFB1',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#094C2D',
    backgroundColor: '#F4FFF2',
    textAlignVertical: 'top',
  },
  createActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#0A7D47',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFD400',
    borderWidth: 3,
  },
  secondaryButtonText: {
    color: '#0A7D47',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButtonTextHighContrast: {
    color: '#FFD400',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EC46D',
    minHeight: 46,
  },
  primaryButtonHighContrast: {
    backgroundColor: '#FFD400',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  primaryButtonTextHighContrast: {
    color: '#000000',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: '#266E48',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: '#F4FFF2',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#A9E9A5',
    padding: 16,
  },
  emptyText: {
    color: '#266E48',
    fontSize: 14,
    lineHeight: 20,
  },
  savedList: {
    gap: 10,
  },
  savedRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedTextCol: {
    flex: 1,
    minWidth: 0,
  },
  savedTitle: {
    color: '#117344',
    fontWeight: '700',
    fontSize: 16,
  },
  savedMeta: {
    marginTop: 4,
    color: '#4D8D67',
    fontSize: 13,
  },
  savedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  studyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#0EC46D',
  },
  studyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#C44D4D',
    backgroundColor: '#FFFFFF',
  },
  deleteBtnText: {
    color: '#B33A3A',
    fontWeight: '700',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    padding: 18,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#094C2D',
  },
  modalBody: {
    fontSize: 14,
    color: '#266E48',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A8DFB1',
    alignItems: 'center',
    backgroundColor: '#F4FFF2',
  },
  modalCancelText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#117344',
  },
  modalDelete: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C44D4D',
    minHeight: 46,
  },
  modalDeleteText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
