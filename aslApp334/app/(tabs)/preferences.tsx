import Slider from '@react-native-community/slider';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { usePreferences } from '@/contexts/preferences-context';
import {
  PRACTICE_IMAGE_AUTO_ADVANCE_MS,
  VIDEO_SPEED_MAX,
  VIDEO_SPEED_MIN,
  VIDEO_SPEED_STEP,
} from '@/lib/user-preferences';

export default function PreferencesScreen() {
  const {
    preferences,
    setLetterDisplay,
    setVideoSpeed,
    setHandedness,
    setPracticeAutoAdvanceLetters,
  } = usePreferences();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Preferences</Text>
          <Text style={styles.headerSubtitle}>Customize how letters look and how videos play.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Letter display</Text>
              <Text style={styles.hint}>
                {preferences.letterDisplay === 'video'
                  ? 'Showing looping videos for each letter.'
                  : 'Showing still images (teach vs practice style in lessons).'}
              </Text>
            </View>
            <View style={styles.switchCol}>
              <Text style={styles.switchCaption}>Static</Text>
              <Switch
                value={preferences.letterDisplay === 'video'}
                onValueChange={(v) => setLetterDisplay(v ? 'video' : 'image')}
                trackColor={{ false: '#A8DFB1', true: '#08BF6A' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#A8DFB1"
                accessibilityLabel="Toggle between video and static images"
              />
              <Text style={styles.switchCaption}>Video</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Video speed</Text>
          <Text style={styles.hint}>
            Controls letter clip playback. With static images, it also sets how long each letter stays on screen during
            Practice auto-advance (baseline {PRACTICE_IMAGE_AUTO_ADVANCE_MS / 1000} s at 1×; slower = longer).
          </Text>
          <Text style={styles.speedValue}>{preferences.videoSpeed.toFixed(2)}×</Text>
          <Slider
            style={styles.slider}
            minimumValue={VIDEO_SPEED_MIN}
            maximumValue={VIDEO_SPEED_MAX}
            step={VIDEO_SPEED_STEP}
            value={preferences.videoSpeed}
            onValueChange={setVideoSpeed}
            minimumTrackTintColor="#08BF6A"
            maximumTrackTintColor="#C7EFC0"
            thumbTintColor="#0A7D47"
          />
          <View style={styles.sliderEnds}>
            <Text style={styles.sliderEndLabel}>{VIDEO_SPEED_MIN}×</Text>
            <Text style={styles.sliderEndLabel}>{VIDEO_SPEED_MAX}×</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Practice: auto-advance letters</Text>
              <Text style={styles.hint}>
                Only affects the Practice tab follow-along (word signs above the camera). When on, each letter video
                plays once and then moves to the next sign; with static images, dwell time follows the Video speed
                setting (see above). Turn off to step through only with the arrow buttons.
              </Text>
            </View>
            <View style={styles.switchCol}>
              <Text style={styles.switchCaption}>Manual</Text>
              <Switch
                value={preferences.practiceAutoAdvanceLetters}
                onValueChange={setPracticeAutoAdvanceLetters}
                trackColor={{ false: '#A8DFB1', true: '#08BF6A' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#A8DFB1"
                accessibilityLabel="Auto-advance letters in Practice follow-along"
              />
              <Text style={styles.switchCaption}>Auto</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Dominant hand</Text>
              <Text style={styles.hint}>
                Right-handed flips signs horizontally so they match a right-handed signer (mirror of default lefty
                assets).
              </Text>
            </View>
            <View style={styles.switchCol}>
              <Text style={styles.switchCaption}>Lefty</Text>
              <Switch
                value={preferences.handedness === 'righty'}
                onValueChange={(v) => setHandedness(v ? 'righty' : 'lefty')}
                trackColor={{ false: '#A8DFB1', true: '#08BF6A' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#A8DFB1"
                accessibilityLabel="Toggle right-handed mirror"
              />
              <Text style={styles.switchCaption}>Righty</Text>
            </View>
          </View>
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
    paddingBottom: 32,
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
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#117344',
  },
  hint: {
    marginTop: 4,
    fontSize: 13,
    color: '#4D8D67',
    lineHeight: 18,
  },
  switchCol: {
    alignItems: 'center',
    gap: 4,
  },
  switchCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: '#266E48',
  },
  speedValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#094C2D',
    textAlign: 'center',
    marginTop: 4,
  },
  slider: {
    width: '100%',
    height: 44,
    marginTop: 4,
  },
  sliderEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderEndLabel: {
    fontSize: 12,
    color: '#4D8D67',
  },
});
