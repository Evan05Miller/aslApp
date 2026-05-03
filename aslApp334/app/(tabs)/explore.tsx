import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
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

export default function CameraPracticeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [savedSets, setSavedSets] = useState<SavedWordSet[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      void refreshList();
    }, [refreshList]),
  );

  const selectedSet = useMemo(
    () => savedSets.find((s) => s.id === selectedId) ?? null,
    [savedSets, selectedId],
  );

  const canUseCamera = permission?.granted === true;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.split}>
        <View style={styles.topHalf}>
          <ScrollView
            style={styles.topScroll}
            contentContainerStyle={styles.topScrollContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.screenTitle}>Camera practice</Text>
            <Text style={styles.screenSubtitle}>
              Tap a saved set, then scroll this top section if needed. The signing guide stays up here so the live camera
              below stays visible the whole time.
            </Text>

            {listLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#0A7D47" />
                <Text style={styles.loadingText}>Loading sets…</Text>
              </View>
            ) : savedSets.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No saved sets yet. Add words and save a set from the My sets tab, then come back here.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>Your sets</Text>
                <View style={styles.setChipsWrap}>
                  {savedSets.map((set) => {
                    const active = set.id === selectedId;
                    return (
                      <TouchableOpacity
                        key={set.id}
                        activeOpacity={0.75}
                        onPress={() => setSelectedId(set.id)}
                        style={[styles.setChip, active && styles.setChipActive]}>
                        <Text style={[styles.setChipTitle, active && styles.setChipTitleActive]} numberOfLines={1}>
                          {set.title}
                        </Text>
                        <Text style={[styles.setChipMeta, active && styles.setChipMetaActive]}>
                          {set.words.length} word{set.words.length === 1 ? '' : 's'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedSet ? (
                  <FollowAlongSignsPanel
                    setId={selectedSet.id}
                    title={selectedSet.title}
                    words={selectedSet.words}
                  />
                ) : null}
              </>
            )}
          </ScrollView>
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
    flex: 1,
    minHeight: 0,
    zIndex: 2,
    elevation: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#A9E9A5',
    backgroundColor: '#D7F58B',
    overflow: 'hidden',
  },
  topScroll: {
    flex: 1,
  },
  topScrollContent: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  bottomHalf: {
    flex: 1,
    minHeight: 0,
    zIndex: 1,
    elevation: 2,
    backgroundColor: '#0A1F14',
    overflow: 'hidden',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C6E3E',
  },
  screenSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#266E48',
    lineHeight: 18,
  },
  sectionLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#117344',
  },
  loadingRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#266E48',
    fontSize: 14,
  },
  emptyBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F4FFF2',
    borderWidth: 2,
    borderColor: '#A9E9A5',
  },
  emptyText: {
    color: '#266E48',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  setChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 10,
  },
  setChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#B6EFAE',
    maxWidth: 200,
  },
  setChipActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#DBFBE4',
  },
  setChipTitle: {
    fontWeight: '700',
    fontSize: 15,
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
