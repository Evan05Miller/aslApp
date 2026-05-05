import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { PreferencesProvider, usePreferences } from '@/contexts/preferences-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ONBOARDING_STORAGE_KEY = '@asl_tutor_onboarding_seen_v1';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PreferencesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="lesson" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <FirstRunWelcome />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PreferencesProvider>
  );
}

function FirstRunWelcome() {
  const { preferences } = usePreferences();
  const highContrast = preferences.highContrast;
  const [checking, setChecking] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(ONBOARDING_STORAGE_KEY)
      .then((value) => {
        if (!cancelled) {
          setVisible(value !== 'true');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    void AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  };

  return (
    <Modal visible={visible || checking} animationType="fade" transparent={false}>
      <View style={[styles.welcomeSafe, highContrast && styles.welcomeSafeHighContrast]}>
        <View style={[styles.welcomeCard, highContrast && styles.welcomeCardHighContrast]}>
          {checking ? (
            <ActivityIndicator size="large" color={highContrast ? '#FFD400' : '#08BF6A'} />
          ) : (
            <>
              <Text style={[styles.welcomeTitle, highContrast && styles.welcomeTitleHighContrast]}>Welcome to ASLTutor!</Text>
              <Text style={[styles.welcomeText, highContrast && styles.welcomeTextHighContrast]}>
                ASLTutor helps you learn American Sign Language at your own pace starting with the alphabet, building up
                to full words, and exploring ASL grammar and sentence structure.
              </Text>
              <Text style={[styles.welcomeText, highContrast && styles.welcomeTextHighContrast]}>
                ASL is a complete, living language used by millions of Deaf and hard-of-hearing people across the United
                States and Canada. Learning it is a meaningful step toward real communication and connection.
              </Text>
              <Text style={[styles.welcomeText, highContrast && styles.welcomeTextHighContrast]}>
                Before you get started, head to Preferences to set your dominant hand and adjust any accessibility
                options to fit your needs.
              </Text>
              <Text style={[styles.welcomeText, highContrast && styles.welcomeTextHighContrast]}>{"Tap Get Started when you're ready."}</Text>
              <Pressable accessibilityRole="button" style={[styles.welcomeButton, highContrast && styles.welcomeButtonHighContrast]} onPress={dismiss}>
                <Text style={[styles.welcomeButtonText, highContrast && styles.welcomeButtonTextHighContrast]}>Get Started</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  welcomeSafe: {
    flex: 1,
    backgroundColor: '#D7F58B',
    justifyContent: 'center',
    padding: 18,
  },
  welcomeSafeHighContrast: {
    backgroundColor: '#000000',
  },
  welcomeCard: {
    backgroundColor: '#F4FFF2',
    borderColor: '#A9E9A5',
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    gap: 12,
  },
  welcomeCardHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFD400',
    borderWidth: 3,
  },
  welcomeTitle: {
    color: '#056136',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  welcomeTitleHighContrast: {
    color: '#FFD400',
  },
  welcomeText: {
    color: '#1F6D43',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  welcomeTextHighContrast: {
    color: '#FFFFFF',
  },
  welcomeButton: {
    alignItems: 'center',
    backgroundColor: '#08BF6A',
    borderRadius: 999,
    marginTop: 4,
    paddingVertical: 12,
  },
  welcomeButtonHighContrast: {
    backgroundColor: '#FFD400',
  },
  welcomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  welcomeButtonTextHighContrast: {
    color: '#000000',
  },
});
