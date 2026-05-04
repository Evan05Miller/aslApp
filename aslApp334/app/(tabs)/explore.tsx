import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FollowAlongSignsPanel } from '@/components/follow-along-signs';
import { loadAllSavedSets, type SavedWordSet } from '@/lib/saved-word-sets';

type UpperPage = 'sets' | 'words';

export default function CameraPracticeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [savedSets, setSavedSets] = useState<SavedWordSet[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [upperPage, setUpperPage] = useState<UpperPage>('sets');
  const [wordLessonOpen, setWordLessonOpen] = useState(false);

  const refreshList = useCallback(async () => {
    setListLoading(true);
    try {
      const list = await loadAllSavedSets();
      setSavedSets(list);
      setSelectedId((current) => {
        if (current && list.some((s) => s.id === current)) {
          return current;
        }
        return list[0]?.id ?? null;
      });
    } finally {
      setListLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setUpperPage('sets');
      setWordLessonOpen(false);
      void refreshList();
    }, [refreshList]),
  );

  const selectedSet = useMemo(
    () => savedSets.find((s) => s.id === selectedId) ?? null,
    [savedSets, selectedId],
  );

  useEffect(() => {
    if (!selectedSet && upperPage === 'words') {
      setUpperPage('sets');
    }
  }, [selectedSet, upperPage]);

  useEffect(() => {
    setWordLessonOpen(false);
  }, [selectedSet?.id]);

  useEffect(() => {
    if (upperPage === 'sets') {
      setWordLessonOpen(false);
    }
  }, [upperPage]);

  const canUseCamera = permission?.granted === true;

  const lessonUiCompact = wordLessonOpen && upperPage === 'words';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.split}>
        <View style={[styles.topHalf, lessonUiCompact && styles.topHalfLessonTight]}>
          {listLoading ? (
            <>
              <Text style={styles.screenTitle}>Camera practice</Text>
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#0A7D47" />
                <Text style={styles.loadingText}>Loading sets…</Text>
              </View>
            </>
          ) : savedSets.length === 0 ? (
            <>
              <Text style={styles.screenTitle}>Camera practice</Text>
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText} numberOfLines={3}>
                  No saved sets yet. Save a set from My sets, then return here.
                </Text>
              </View>
            </>
          ) : (
            <>
              {!(wordLessonOpen && upperPage === 'words') ? (
                <>
                  <Text style={styles.screenTitle}>Camera practice</Text>
                  <Text style={styles.screenSubtitle} numberOfLines={2}>
                    Choose a list to practice with and use the camera to get real time feedback.
                  </Text>

                  <View style={styles.pageTabsRow}>
                    <Pressable
                      accessibilityRole="tab"
                      accessibilityState={{ selected: upperPage === 'sets' }}
                      onPress={() => setUpperPage('sets')}
                      style={[styles.pageTabPill, upperPage === 'sets' && styles.pageTabPillActive]}>
                      <Text style={[styles.pageTabPillText, upperPage === 'sets' && styles.pageTabPillTextActive]}>
                        Sets
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="tab"
                      accessibilityState={{ selected: upperPage === 'words' }}
                      onPress={() => selectedSet && setUpperPage('words')}
                      disabled={!selectedSet}
                      style={[
                        styles.pageTabPill,
                        upperPage === 'words' && styles.pageTabPillActive,
                        !selectedSet && styles.pageTabPillDisabled,
                      ]}>
                      <Text
                        style={[
                          styles.pageTabPillText,
                          upperPage === 'words' && styles.pageTabPillTextActive,
                          !selectedSet && styles.pageTabPillTextDisabled,
                        ]}>
                        Words
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View style={styles.lessonHeader}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back to word list"
                    onPress={() => setWordLessonOpen(false)}
                    style={styles.lessonBack}
                    hitSlop={8}>
                    <Text style={styles.lessonBackText}>‹ Back</Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.pageBody}>
                {upperPage === 'sets' ? (
                  <>
                    <Text style={styles.sectionLabel}>Your saved sets</Text>
                    <View style={styles.setSelectorCard}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.setChipsScroll}
                        {...(Platform.OS === 'ios' ? { indicatorStyle: 'default' as const } : {})}>
                        {savedSets.map((set) => {
                          const active = set.id === selectedId;
                          return (
                            <TouchableOpacity
                              key={set.id}
                              activeOpacity={0.75}
                              onPress={() => {
                                setSelectedId(set.id);
                                setUpperPage('words');
                              }}
                              style={[styles.setChip, active && styles.setChipActive]}>
                              <Text
                                style={[styles.setChipTitle, active && styles.setChipTitleActive]}
                                numberOfLines={1}>
                                {set.title}
                              </Text>
                              <Text style={[styles.setChipMeta, active && styles.setChipMetaActive]}>
                                {set.words.length} word{set.words.length === 1 ? '' : 's'}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                      <View style={styles.scrollRail} accessibilityLabel="Scroll for more sets" />
                    </View>
                  </>
                ) : selectedSet ? (
                  <View style={styles.followAlongHost}>
                    <FollowAlongSignsPanel
                      setId={selectedSet.id}
                      title={selectedSet.title}
                      words={selectedSet.words}
                      lessonMode={wordLessonOpen}
                      onBeginLesson={() => setWordLessonOpen(true)}
                    />
                  </View>
                ) : null}
              </View>
            </>
          )}
        </View>

        <View style={styles.bottomHalf}>
          {!permission ? (
            <View style={styles.cameraFallback}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : !canUseCamera ? (
            <View style={styles.cameraFallback}>
              <Text style={styles.fallbackTitle}>Camera access</Text>
              <Text style={styles.fallbackBody}>
                Allow camera access to see yourself while you practice alongside your word list.
              </Text>
              <Pressable style={styles.permissionButton} onPress={() => void requestPermission()}>
                <Text style={styles.permissionButtonText}>Allow camera</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.cameraWrap}>
              <CameraView style={styles.camera} facing="front" mirror mode="picture" active />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D7F58B',
  },
  split: {
    flex: 1,
    overflow: 'hidden',
  },
  topHalf: {
    flex: 10,
    minHeight: 0,
    zIndex: 2,
    elevation: 4,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#A9E9A5',
    backgroundColor: '#D7F58B',
    overflow: 'hidden',
  },
  /** Slightly tighter padding during lesson so the sign can use the fixed top strip only (camera split unchanged). */
  topHalfLessonTight: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  bottomHalf: {
    flex: 12,
    minHeight: 0,
    zIndex: 1,
    elevation: 2,
    backgroundColor: '#0A1F14',
    overflow: 'hidden',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C6E3E',
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: '#266E48',
    lineHeight: 14,
  },
  pageTabsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  pageTabPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    backgroundColor: '#FFFFFF',
  },
  pageTabPillActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#08BF6A',
  },
  pageTabPillDisabled: {
    opacity: 0.45,
  },
  pageTabPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#117344',
  },
  pageTabPillTextActive: {
    color: '#FFFFFF',
  },
  pageTabPillTextDisabled: {
    color: '#6B9080',
  },
  pageBody: {
    flex: 1,
    minHeight: 0,
    marginTop: 8,
  },
  sectionLabel: {
    marginTop: 2,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#117344',
  },
  setSelectorCard: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#A9E9A5',
    backgroundColor: '#F4FFF2',
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  scrollRail: {
    alignSelf: 'stretch',
    height: 5,
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: '#C4E8BC',
  },
  loadingRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#266E48',
    fontSize: 14,
  },
  emptyBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F4FFF2',
    borderWidth: 2,
    borderColor: '#A9E9A5',
  },
  emptyText: {
    color: '#266E48',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  setChipsScroll: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    paddingBottom: 2,
    paddingRight: 8,
  },
  setChip: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#B6EFAE',
    maxWidth: 168,
  },
  setChipActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#DBFBE4',
  },
  setChipTitle: {
    fontWeight: '700',
    fontSize: 13,
    color: '#117344',
  },
  setChipTitleActive: {
    color: '#056136',
  },
  setChipMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#4D8D67',
  },
  setChipMetaActive: {
    color: '#1F6D43',
  },
  followAlongHost: {
    flex: 1,
    minHeight: 0,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  lessonBack: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  lessonBackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#056136',
  },
  cameraWrap: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackBody: {
    color: '#B8D4C8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#0EC46D',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
