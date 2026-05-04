import Slider from '@react-native-community/slider';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { usePreferences } from '@/contexts/preferences-context';
import { VIDEO_SPEED_MAX, VIDEO_SPEED_MIN, VIDEO_SPEED_STEP } from '@/lib/user-preferences';

type ToggleRailProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  leftLabel: string;
  rightLabel: string;
  accessibilityLabel: string;
};

function ToggleRail({ value, onValueChange, leftLabel, rightLabel, accessibilityLabel }: ToggleRailProps) {
  return (
    <View style={styles.toggleRail}>
      <Text style={[styles.toggleSide, !value && styles.toggleSideOn]} numberOfLines={1}>
        {leftLabel}
      </Text>
      <Switch
        style={styles.toggleSwitch}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#A8DFB1', true: '#08BF6A' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#A8DFB1"
        accessibilityLabel={accessibilityLabel}
      />
      <Text style={[styles.toggleSide, value && styles.toggleSideOn]} numberOfLines={1}>
        {rightLabel}
      </Text>
    </View>
  );
}

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
          <Text style={styles.label}>Dominant hand</Text>
          <ToggleRail
            value={preferences.handedness === 'righty'}
            onValueChange={(v) => setHandedness(v ? 'righty' : 'lefty')}
            leftLabel="Lefty"
            rightLabel="Righty"
            accessibilityLabel="Toggle dominant hand: lefty or righty mirror"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Letter display</Text>
          <ToggleRail
            value={preferences.letterDisplay === 'video'}
            onValueChange={(v) => setLetterDisplay(v ? 'video' : 'image')}
            leftLabel="Static"
            rightLabel="Video"
            accessibilityLabel="Toggle between static images and video for letters"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Practice: auto-advance letters</Text>
          <ToggleRail
            value={preferences.practiceAutoAdvanceLetters}
            onValueChange={setPracticeAutoAdvanceLetters}
            leftLabel="Manual"
            rightLabel="Auto"
            accessibilityLabel="Auto-advance letters in Practice follow-along"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Video speed</Text>
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
            <Text
              style={[
                styles.sliderEndLabel,
                preferences.videoSpeed < 1 && styles.sliderEndLabelActive,
              ]}>
              {`Slower ←\n${VIDEO_SPEED_MIN}×`}
            </Text>
            <Text
              style={[
                styles.sliderEndLabel,
                preferences.videoSpeed > 1 && styles.sliderEndLabelActive,
              ]}>
              {`→ Faster\n${VIDEO_SPEED_MAX}×`}
            </Text>
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
    alignItems: 'stretch',
  },
  headerCard: {
    backgroundColor: '#08BF6A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  headerSubtitle: {
    color: '#EAFEF1',
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#117344',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  hint: {
    marginTop: 4,
    fontSize: 13,
    color: '#4D8D67',
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  toggleRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F4FFF2',
    borderWidth: 1,
    borderColor: '#C7EFC0',
    alignSelf: 'stretch',
    width: '100%',
  },
  toggleSide: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B9080',
    textAlign: 'center',
  },
  toggleSideOn: {
    color: '#056136',
    fontWeight: '800',
  },
  toggleSwitch: {
    flexShrink: 0,
  },
  speedValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#094C2D',
    textAlign: 'center',
    marginTop: 4,
    alignSelf: 'stretch',
  },
  slider: {
    width: '100%',
    height: 44,
    marginTop: 4,
    alignSelf: 'stretch',
  },
  sliderEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
    alignSelf: 'stretch',
    width: '100%',
  },
  sliderEndLabel: {
    flex: 1,
    fontSize: 12,
    color: '#6B9080',
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
  sliderEndLabelActive: {
    color: '#056136',
    fontWeight: '800',
  },
});
