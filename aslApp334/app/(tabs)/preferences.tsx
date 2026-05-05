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
  highContrast: boolean;
};

function ToggleRail({
  value,
  onValueChange,
  leftLabel,
  rightLabel,
  accessibilityLabel,
  highContrast,
}: ToggleRailProps) {
  return (
    <View style={[styles.toggleRail, highContrast && styles.toggleRailHighContrast]}>
      <Text
        style={[
          styles.toggleSide,
          highContrast && styles.toggleSideHighContrast,
          !value && styles.toggleSideOn,
          highContrast && !value && styles.toggleSideOnHighContrast,
        ]}
        numberOfLines={1}>
        {leftLabel}
      </Text>
      <Switch
        style={styles.toggleSwitch}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: highContrast ? '#4A4A4A' : '#A8DFB1', true: highContrast ? '#FFD400' : '#08BF6A' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={highContrast ? '#4A4A4A' : '#A8DFB1'}
        accessibilityLabel={accessibilityLabel}
      />
      <Text
        style={[
          styles.toggleSide,
          highContrast && styles.toggleSideHighContrast,
          value && styles.toggleSideOn,
          highContrast && value && styles.toggleSideOnHighContrast,
        ]}
        numberOfLines={1}>
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
    setHighContrast,
    setPracticeAutoAdvanceLetters,
  } = usePreferences();
  const highContrast = preferences.highContrast;

  return (
    <SafeAreaView style={[styles.safe, highContrast && styles.safeHighContrast]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerCard, highContrast && styles.headerCardHighContrast]}>
          <Text style={[styles.headerTitle, highContrast && styles.headerTitleHighContrast]}>Preferences</Text>
          <Text style={[styles.headerSubtitle, highContrast && styles.headerSubtitleHighContrast]}>
            Customize how letters look and how videos play.
          </Text>
        </View>

        <View style={[styles.card, highContrast && styles.cardHighContrast]}>
          <Text style={[styles.label, highContrast && styles.labelHighContrast]}>Dominant hand</Text>
          <ToggleRail
            value={preferences.handedness === 'righty'}
            onValueChange={(v) => setHandedness(v ? 'righty' : 'lefty')}
            leftLabel="Lefty"
            rightLabel="Righty"
            accessibilityLabel="Toggle dominant hand: lefty or righty mirror"
            highContrast={highContrast}
          />
        </View>

        <View style={[styles.card, highContrast && styles.cardHighContrast]}>
          <Text style={[styles.label, highContrast && styles.labelHighContrast]}>Letter display</Text>
          <ToggleRail
            value={preferences.letterDisplay === 'video'}
            onValueChange={(v) => setLetterDisplay(v ? 'video' : 'image')}
            leftLabel="Static"
            rightLabel="Video"
            accessibilityLabel="Toggle between static images and video for letters"
            highContrast={highContrast}
          />
        </View>

        <View style={[styles.card, highContrast && styles.cardHighContrast]}>
          <Text style={[styles.label, highContrast && styles.labelHighContrast]}>Practice: auto-advance letters</Text>
          <ToggleRail
            value={preferences.practiceAutoAdvanceLetters}
            onValueChange={setPracticeAutoAdvanceLetters}
            leftLabel="Manual"
            rightLabel="Auto"
            accessibilityLabel="Auto-advance letters in Practice follow-along"
            highContrast={highContrast}
          />
        </View>

        <View style={[styles.card, highContrast && styles.cardHighContrast]}>
          <Text style={[styles.label, highContrast && styles.labelHighContrast]}>High contrast mode</Text>
          <ToggleRail
            value={preferences.highContrast}
            onValueChange={setHighContrast}
            leftLabel="Off"
            rightLabel="On"
            accessibilityLabel="Toggle high contrast mode"
            highContrast={highContrast}
          />
        </View>

        <View style={[styles.card, highContrast && styles.cardHighContrast]}>
          <Text style={[styles.label, highContrast && styles.labelHighContrast]}>Video speed</Text>
          <Text style={[styles.speedValue, highContrast && styles.speedValueHighContrast]}>
            {preferences.videoSpeed.toFixed(2)}x
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={VIDEO_SPEED_MIN}
            maximumValue={VIDEO_SPEED_MAX}
            step={VIDEO_SPEED_STEP}
            value={preferences.videoSpeed}
            onValueChange={setVideoSpeed}
            minimumTrackTintColor={highContrast ? '#FFD400' : '#08BF6A'}
            maximumTrackTintColor={highContrast ? '#4A4A4A' : '#C7EFC0'}
            thumbTintColor={highContrast ? '#FFFFFF' : '#0A7D47'}
          />
          <View style={styles.sliderEnds}>
            <Text
              style={[
                styles.sliderEndLabel,
                highContrast && styles.sliderEndLabelHighContrast,
                preferences.videoSpeed < 1 && styles.sliderEndLabelActive,
                highContrast && preferences.videoSpeed < 1 && styles.sliderEndLabelActiveHighContrast,
              ]}>
              {`Slower <-\n${VIDEO_SPEED_MIN}x`}
            </Text>
            <Text
              style={[
                styles.sliderEndLabel,
                highContrast && styles.sliderEndLabelHighContrast,
                preferences.videoSpeed > 1 && styles.sliderEndLabelActive,
                highContrast && preferences.videoSpeed > 1 && styles.sliderEndLabelActiveHighContrast,
              ]}>
              {`Faster ->\n${VIDEO_SPEED_MAX}x`}
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
  safeHighContrast: {
    backgroundColor: '#000000',
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
    alignSelf: 'stretch',
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
    alignSelf: 'stretch',
  },
  headerSubtitleHighContrast: {
    color: '#FFFFFF',
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
  cardHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFD400',
    borderWidth: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#117344',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  labelHighContrast: {
    color: '#FFFFFF',
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
  toggleRailHighContrast: {
    backgroundColor: '#111111',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  toggleSide: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B9080',
    textAlign: 'center',
  },
  toggleSideHighContrast: {
    color: '#FFFFFF',
  },
  toggleSideOn: {
    color: '#056136',
    fontWeight: '800',
  },
  toggleSideOnHighContrast: {
    color: '#FFD400',
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
  speedValueHighContrast: {
    color: '#FFD400',
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
  sliderEndLabelHighContrast: {
    color: '#FFFFFF',
  },
  sliderEndLabelActive: {
    color: '#056136',
    fontWeight: '800',
  },
  sliderEndLabelActiveHighContrast: {
    color: '#FFD400',
  },
});
