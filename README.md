# ASL Fingerspelling Learning App

A cross-platform app for learning and practicing American Sign Language (ASL) fingerspelling. You can follow structured lessons (letters, words, grammar), build custom word lists, and practice alongside your front camera.

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | [Expo](https://expo.dev/) SDK **54** |
| UI | [React](https://react.dev/) **19**, [React Native](https://reactnative.dev/) **0.81** |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) **6** (file-based routes) |
| Language | **TypeScript** |
| Media | [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) (live preview), [expo-video](https://docs.expo.dev/versions/latest/sdk/video/) (letter clips), [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) (static signs) |
| Storage | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) (saved word sets, preferences) |
| Other | React Navigation tabs, Reanimated, Gesture Handler, Safe Area |

The project runs on **iOS**, **Android**, and **web** (`react-native-web`). Camera-dependent features work best on a physical device or simulator with camera support; browser behavior may vary.

## Prerequisites

- **Node.js 20** (recommended for Expo SDK 54)
- npm (ships with Node)

## Setup and run

From this directory (`aslApp334`):

```bash
npm install
npm start
```

Then choose a target in the Expo CLI (Expo Go, iOS Simulator, Android emulator, or web). Shortcuts:

```bash
npm run ios
npm run android
npm run web
```

Lint:

```bash
npm run lint
```

---

## How to use the app

The main experience is organized into **four bottom tabs**.

### Learn

- Choose a **mode**: **Basic Letters**, **Full Words**, or **Grammar**.
- Under **Lesson Modules**, tap a lesson to open the full **lesson screen**.
- In a lesson, use the subtabs **Teach**, **Practice**, **Quiz**, and **Complete** to move through instruction, drills, and wrap-up.
- **Teach** shows each letter or word unit with sign images or videos (depending on **Preferences**).
- **Practice** lets you type answers and get feedback; **Quiz** tests recall; **Complete** summarizes progress.

### My sets

- **Create a set**: Enter a name and a list of words (commas or line breaks; only **A–Z** letters are kept).
- **Start without saving** opens the lesson flow once with those words (not stored).
- **Save and practice** stores the set and opens it in the lesson viewer.
- **Saved sets** lists everything on device, including the default **Months of the year** list.
- Tap **Study** to open that list in the lesson screen. Tap **Delete** to remove a set (the default months list can be removed; it is hidden via app storage, not mixed with your custom JSON).

### Practice (camera)

- Intended for **practicing next to a live camera** (front camera when permission is granted).
- **Sets**: horizontally scroll your saved sets (and the built-in months list if you have not removed it). Tap a set card to select it and switch toward the **Words** flow.
- **Words**: pick a word, then follow the **sign lesson** (letters of that word) in the top area while the **camera** stays in the lower area.
- Grant **camera** access when prompted so you can see yourself while practicing.

### Preferences

- **Dominant hand**: **Lefty** / **Righty** (mirrors sign preview so it matches your signing hand).
- **Letter display**: **Static** images vs **Video** clips for each letter.
- **Video speed**: slider when using video (also affects some timed image steps in practice).
- **Practice: auto-advance letters**: in the camera practice follow-along, advances letters automatically when appropriate.
- **High contrast**: stronger colors for readability.

Preferences are stored on the device and persist between launches.

---

## Project layout (high level)

- `app/(tabs)/` — tab screens: Learn (`index`), My sets, Practice (`explore`), Preferences
- `app/lesson.tsx` — full-screen lesson (Teach / Practice / Quiz / Complete)
- `components/` — UI pieces (e.g. letter sign, follow-along panel)
- `constants/` — lesson data, built-in word sets, ASL assets mapping
- `lib/` — word-set persistence, parsing, preference helpers
- `contexts/` — global preference state

---
