import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { PreferencesProvider } from '@/contexts/preferences-context';
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
      <View style={styles.welcomeSafe}>
        <View style={styles.welcomeCard}>
          {checking ? (
            <ActivityIndicator size="large" color="#08BF6A" />
          ) : (
            <>
              <Text style={styles.welcomeTitle}>Welcome to ASLTutor!</Text>
              <Text style={styles.welcomeText}>
                ASLTutor helps you learn American Sign Language at your own pace starting with the alphabet, building up
                to full words, and exploring ASL grammar and sentence structure.
              </Text>
              <Text style={styles.welcomeText}>
                ASL is a complete, living language used by millions of Deaf and hard-of-hearing people across the United
                States and Canada. Learning it is a meaningful step toward real communication and connection.
              </Text>
              <Text style={styles.welcomeText}>
                Before you get started, head to Preferences to set your dominant hand and adjust any accessibility
                options to fit your needs.
              </Text>
              <Text style={styles.welcomeText}>{"Tap Get Started when you're ready."}</Text>
              <Pressable accessibilityRole="button" style={styles.welcomeButton} onPress={dismiss}>
                <Text style={styles.welcomeButtonText}>Get Started</Text>
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
  welcomeCard: {
    backgroundColor: '#F4FFF2',
    borderColor: '#A9E9A5',
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    gap: 12,
  },
  welcomeTitle: {
    color: '#056136',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  welcomeText: {
    color: '#1F6D43',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  welcomeButton: {
    alignItems: 'center',
    backgroundColor: '#08BF6A',
    borderRadius: 999,
    marginTop: 4,
    paddingVertical: 12,
  },
  welcomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
