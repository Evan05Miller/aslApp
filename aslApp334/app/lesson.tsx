import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AslLetterSign } from '@/components/asl-letter-sign';
import { GrammarExercise, LearnMode, WordLesson, getLessonsForMode, lessonSubtabs } from '@/constants/asl-lessons';
import { CUSTOM_WORD_LESSON_ID, getCustomWordSet } from '@/constants/custom-word-set';
import { usePreferences } from '@/contexts/preferences-context';
import { getWordSetById } from '@/lib/saved-word-sets';

type LessonPhase = 'teach' | 'practice' | 'quiz' | 'complete';
type AnswerStatus = 'idle' | 'correct' | 'incorrect';

const ENGLISH_FILLER_WORDS = ['is', 'are', 'the', 'a', 'an', 'it', 'do', 'does', 'be', 'was', 'were', 'has', 'to'];

function checkAnswer(input: string, acceptedAnswers: string[]): boolean {
  const normalize = (s: string) =>
    s.trim().toUpperCase().replace(/,/g, '').replace(/\s+/g, ' ');
  return acceptedAnswers.some((a) => normalize(a) === normalize(input));
}

function getWrongAnswerFeedback(input: string, exercise?: GrammarExercise): string {
  const upperWords = input.toUpperCase().split(/\s+/);

  if (exercise?.conjugationHint && upperWords.includes('HAS')) {
    return exercise.conjugationHint;
  }

  const fillers = ENGLISH_FILLER_WORDS.filter((w) => upperWords.includes(w.toUpperCase()));
  if (fillers.length > 0) {
    return `ASL doesn't use words like "${fillers[0].toLowerCase()}" - drop English filler words and focus on the core signs.`;
  }
  return 'Not quite - check the order and try again.';
}

export default function LessonScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    lessonId?: string;
    lessonIndex?: string;
    customSetVersion?: string;
    savedSetId?: string;
  }>();
  const mode: LearnMode =
    params.mode === 'letters' || params.mode === 'words' || params.mode === 'grammar'
      ? params.mode
      : 'letters';
  const { preferences } = usePreferences();
  const highContrast = preferences.highContrast;

  const rawLessonId = params.lessonId;
  const lessonIdParam = Array.isArray(rawLessonId) ? rawLessonId[0] : rawLessonId;
  const rawSavedSetId = params.savedSetId;
  const savedSetId =
    typeof rawSavedSetId === 'string' && rawSavedSetId.length > 0
      ? rawSavedSetId
      : Array.isArray(rawSavedSetId) && typeof rawSavedSetId[0] === 'string'
        ? rawSavedSetId[0]
        : undefined;

  const lessons = useMemo(() => getLessonsForMode(mode), [mode]);

  const [savedCustomState, setSavedCustomState] = useState<{
    loading: boolean;
    words: string[] | null;
    title: string | null;
  }>({ loading: false, words: null, title: null });

  useEffect(() => {
    if (mode !== 'words' || lessonIdParam !== CUSTOM_WORD_LESSON_ID || !savedSetId) {
      setSavedCustomState({ loading: false, words: null, title: null });
      return;
    }
    let cancelled = false;
    setSavedCustomState({ loading: true, words: null, title: null });
    void getWordSetById(savedSetId).then((set) => {
      if (cancelled) {
        return;
      }
      if (set && set.words.length > 0) {
        setSavedCustomState({ loading: false, words: set.words, title: set.title });
      } else {
        setSavedCustomState({ loading: false, words: null, title: null });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, lessonIdParam, savedSetId, params.customSetVersion]);

  const customWords = useMemo(() => {
    if (mode !== 'words' || lessonIdParam !== CUSTOM_WORD_LESSON_ID) {
      return undefined;
    }
    if (savedSetId) {
      if (savedCustomState.loading) {
        return undefined;
      }
      return savedCustomState.words && savedCustomState.words.length > 0
        ? [...savedCustomState.words]
        : null;
    }
    const memoryBump = params.customSetVersion;
    void memoryBump;
    const stored = getCustomWordSet();
    return stored && stored.length > 0 ? [...stored] : null;
  }, [mode, lessonIdParam, savedSetId, savedCustomState.loading, savedCustomState.words, params.customSetVersion]);

  const isLoadingSavedCustom =
    mode === 'words' &&
    lessonIdParam === CUSTOM_WORD_LESSON_ID &&
    Boolean(savedSetId) &&
    savedCustomState.loading;

  const invalidCustomLesson =
    mode === 'words' &&
    lessonIdParam === CUSTOM_WORD_LESSON_ID &&
    customWords !== undefined &&
    (customWords === null || customWords.length === 0);

  const activeLesson = useMemo(() => {
    if (invalidCustomLesson) {
      const fallback = lessons[0];
      return fallback;
    }
    if (mode === 'words' && lessonIdParam === CUSTOM_WORD_LESSON_ID && customWords && customWords.length > 0) {
      const wordLesson: WordLesson = {
        id: CUSTOM_WORD_LESSON_ID,
        title: savedSetId && savedCustomState.title ? savedCustomState.title : 'Custom learning set',
        words: customWords,
        goal: 'Practice fingerspelling the words you chose.',
      };
      return wordLesson;
    }
    const lessonFromId = lessonIdParam ? lessons.find((lesson) => lesson.id === lessonIdParam) : undefined;
    const lessonFromIndex =
      Number.isFinite(Number(params.lessonIndex)) && Number(params.lessonIndex) >= 0
        ? lessons[Number(params.lessonIndex)]
        : undefined;
    return lessonFromId ?? lessonFromIndex ?? lessons[0];
  }, [
    invalidCustomLesson,
    mode,
    lessonIdParam,
    params.lessonIndex,
    lessons,
    customWords,
    savedSetId,
    savedCustomState.title,
  ]);

  const [phase, setPhase] = useState<LessonPhase>('teach');
  const [teachIndex, setTeachIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [practiceInput, setPracticeInput] = useState('');
  const [quizInput, setQuizInput] = useState('');
  const [feedback, setFeedback] = useState('Teaching started. Tap next to continue through the lesson.');
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [practiceSequence, setPracticeSequence] = useState<string[]>([]);
  const [quizSequence, setQuizSequence] = useState<string[]>([]);
  const [practiceAnswerRevealed, setPracticeAnswerRevealed] = useState(false);
  const [quizAnswerRevealed, setQuizAnswerRevealed] = useState(false);
  const [wordLetterIndex, setWordLetterIndex] = useState(0);
  const [practiceAnswerStatus, setPracticeAnswerStatus] = useState<AnswerStatus>('idle');
  const [practiceFeedbackMessage, setPracticeFeedbackMessage] = useState('');
  const [maxGrammarPhaseReached, setMaxGrammarPhaseReached] = useState(0);

  const lessonLetters = mode === 'letters' && 'letters' in activeLesson ? activeLesson.letters : [];
  const lessonWords = mode === 'words' && 'words' in activeLesson ? activeLesson.words : [];
  const lessonTeachSteps = mode === 'grammar' && 'teachSteps' in activeLesson ? activeLesson.teachSteps : [];
  const lessonExercises = mode === 'grammar' && 'exercises' in activeLesson ? activeLesson.exercises : [];

  const shuffleArray = (items: string[]) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const teachUnits =
    mode === 'letters'
      ? lessonLetters
      : mode === 'words'
      ? lessonWords
      : lessonTeachSteps;
  const practiceUnits =
    mode === 'grammar' ? lessonExercises.map((exercise) => exercise.acceptedAnswers[0] ?? '') : practiceSequence;
  const currentGrammarTeachStep = lessonTeachSteps[teachIndex];
  const currentGrammarExercise = lessonExercises[practiceIndex];
  const teachLetter = lessonLetters[teachIndex] ?? lessonLetters[0] ?? 'A';
  const practiceLetter =
    mode === 'letters'
      ? practiceUnits[practiceIndex] ?? practiceUnits[0] ?? 'A'
      : lessonLetters[practiceIndex] ?? lessonLetters[0] ?? 'A';
  const practiceWord = mode === 'words' ? practiceUnits[practiceIndex] ?? '' : '';
  const quizWord = mode === 'words' ? quizSequence[quizIndex] ?? '' : '';
  const practiceTotal =
    mode === 'letters'
      ? lessonLetters.length
      : mode === 'words'
      ? lessonWords.length
      : lessonExercises.length;
  const quizTotal = mode === 'words' ? quizSequence.length : 0;

  useEffect(() => {
    if (isLoadingSavedCustom || invalidCustomLesson) {
      return;
    }
    const letters = mode === 'letters' && 'letters' in activeLesson ? activeLesson.letters : [];
    const words = mode === 'words' && 'words' in activeLesson ? activeLesson.words : [];
    const exercises = mode === 'grammar' && 'exercises' in activeLesson ? activeLesson.exercises : [];
    const shuffledPractice =
      mode === 'letters'
        ? shuffleArray(letters)
        : mode === 'words'
        ? shuffleArray(words)
        : exercises.map((exercise) => exercise.acceptedAnswers[0] ?? '');
    const shuffledQuiz = mode === 'words' ? shuffleArray(words) : [];
    setPracticeSequence(shuffledPractice);
    setQuizSequence(shuffledQuiz);
  }, [isLoadingSavedCustom, invalidCustomLesson, mode, activeLesson]);

  useEffect(() => {
    setPracticeAnswerRevealed(false);
    setPracticeAnswerStatus('idle');
    setPracticeFeedbackMessage('');
  }, [practiceIndex, phase]);

  useEffect(() => {
    setQuizAnswerRevealed(false);
  }, [quizIndex, phase]);

  useEffect(() => {
    if (mode === 'words') {
      setWordLetterIndex(0);
    }
  }, [mode, phase, teachIndex, practiceIndex, quizIndex]);

  const progress = useMemo(() => {
    if (mode === 'grammar') {
      const total = lessonTeachSteps.length + lessonExercises.length + 1;
      if (total <= 0) {
        return 1;
      }
      const viewedTeachSteps =
        phase === 'teach'
          ? Math.min(teachIndex + 1, lessonTeachSteps.length)
          : lessonTeachSteps.length;
      const completedScreen = phase === 'complete' ? 1 : 0;
      return Math.min((viewedTeachSteps + practiceCorrect + completedScreen) / total, 1);
    }

    const teachWeight = mode === 'words' ? 0.35 : 0.5;
    const practiceWeight = mode === 'words' ? 0.35 : 0.5;
    const quizWeight = mode === 'words' ? 0.3 : 0;

    const teachProgress =
      teachUnits.length > 0
        ? (phase === 'teach' ? teachIndex / teachUnits.length : 1) * teachWeight
        : teachWeight;
    const practiceProgress =
      practiceTotal > 0
        ? (phase === 'teach'
            ? 0
            : phase === 'practice'
            ? practiceCorrect / practiceTotal
            : 1) * practiceWeight
        : practiceWeight;
    const quizProgress =
      mode === 'words' && quizTotal > 0
        ? (phase === 'quiz' || phase === 'complete'
            ? quizCorrect / quizTotal
            : 0) * quizWeight
        : 0;

    if (phase === 'complete') {
      return 1;
    }
    return Math.min(teachProgress + practiceProgress + quizProgress, 1);
  }, [
    mode,
    phase,
    teachIndex,
    teachUnits.length,
    lessonTeachSteps.length,
    lessonExercises.length,
    practiceTotal,
    practiceCorrect,
    quizTotal,
    quizCorrect,
  ]);

  const restartLesson = () => {
    const shuffledPractice =
      mode === 'letters'
        ? shuffleArray(lessonLetters)
        : mode === 'words'
        ? shuffleArray(lessonWords)
        : lessonExercises.map((exercise) => exercise.acceptedAnswers[0] ?? '');
    const shuffledQuiz = mode === 'words' ? shuffleArray(lessonWords) : [];

    setPhase('teach');
    setTeachIndex(0);
    setPracticeIndex(0);
    setQuizIndex(0);
    setPracticeInput('');
    setQuizInput('');
    setPracticeCorrect(0);
    setQuizCorrect(0);
    setPracticeSequence(shuffledPractice);
    setQuizSequence(shuffledQuiz);
    setPracticeAnswerRevealed(false);
    setQuizAnswerRevealed(false);
    setWordLetterIndex(0);
    setPracticeAnswerStatus('idle');
    setPracticeFeedbackMessage('');
    setMaxGrammarPhaseReached(0);
    setFeedback('Teaching started. Tap next to continue through the lesson.');
  };

  const restartTeachMode = () => {
    setPhase('teach');
    setTeachIndex(0);
    setPracticeAnswerRevealed(false);
    setQuizAnswerRevealed(false);
    setWordLetterIndex(0);
    setPracticeAnswerStatus('idle');
    setPracticeFeedbackMessage('');
    setFeedback('Teaching from the start. Tap Next when you are ready.');
  };

  const nextTeachStep = () => {
    if (teachIndex < teachUnits.length - 1) {
      setTeachIndex((current) => current + 1);
      return;
    }
    if (mode === 'grammar') {
      setMaxGrammarPhaseReached((current) => Math.max(current, 1));
    }
    setPhase('practice');
    setFeedback('Practice time! Enter your answer and check feedback.');
  };

  const normalize = (value: string) => value.trim().toUpperCase();

  const checkPracticeAnswer = () => {
    const expectedAnswer =
      mode === 'grammar'
        ? currentGrammarExercise?.acceptedAnswers[0] ?? ''
        : practiceUnits[practiceIndex] ?? '';
    const expected = normalize(expectedAnswer);
    const actual = normalize(practiceInput);
    if (!actual) {
      setFeedback('Enter an answer first.');
      setPracticeAnswerStatus('idle');
      setPracticeFeedbackMessage('');
      return;
    }

    const isCorrect =
      mode === 'grammar'
        ? checkAnswer(practiceInput, currentGrammarExercise?.acceptedAnswers ?? [])
        : checkAnswer(practiceInput, [expectedAnswer]);

    if (isCorrect) {
      if (mode === 'grammar') {
        if (practiceAnswerStatus !== 'correct') {
          setPracticeCorrect((current) => current + 1);
        }
        setPracticeAnswerStatus('correct');
        setPracticeFeedbackMessage('Correct answer.');
        setFeedback('Correct! Nice work.');
        return;
      }

      const nextCorrect = practiceCorrect + 1;
      setPracticeCorrect(nextCorrect);
      setFeedback('Nice work! That is correct.');
      setPracticeInput('');

      const isLast = practiceIndex >= practiceUnits.length - 1;
      if (isLast) {
        if (mode === 'words') {
          setPhase('quiz');
          setFeedback('Great practice. Quiz time: spell the signed word.');
        } else {
          setPhase('complete');
          setFeedback('Lesson complete. Great job!');
        }
      } else {
        setPracticeIndex((current) => current + 1);
      }
      return;
    }

    setPracticeAnswerStatus('incorrect');
    if (mode === 'grammar') {
      const wrongAnswerFeedback = getWrongAnswerFeedback(practiceInput, currentGrammarExercise);
      setPracticeFeedbackMessage(wrongAnswerFeedback);
      setFeedback(wrongAnswerFeedback);
    } else {
      setFeedback(`Not quite. Try again. Hint: ${expected.length} characters.`);
    }
  };

  const revealPracticeAnswer = () => {
    const answer =
      mode === 'grammar'
        ? currentGrammarExercise?.acceptedAnswers[0] ?? ''
        : practiceUnits[practiceIndex] ?? '';
    setPracticeAnswerRevealed(true);
    setFeedback(`Answer: ${answer}`);
  };

  const nextPracticeStep = () => {
    if (practiceAnswerStatus !== 'correct') {
      return;
    }
    setPracticeInput('');
    setPracticeAnswerRevealed(false);
    setPracticeAnswerStatus('idle');
    setPracticeFeedbackMessage('');

    const isLast = practiceIndex >= practiceTotal - 1;
    if (isLast) {
      setMaxGrammarPhaseReached((current) => Math.max(current, 2));
      setPhase('complete');
      setFeedback('Lesson complete. Great job!');
      return;
    }
    setPracticeIndex((current) => current + 1);
    setFeedback('Good. Try the next one.');
  };

  const checkQuizAnswer = () => {
    if (mode !== 'words') {
      return;
    }
    const actual = normalize(quizInput);
    if (!actual) {
      setFeedback('Type your spelling first.');
      return;
    }

    if (checkAnswer(quizInput, [quizWord])) {
      const nextCorrect = quizCorrect + 1;
      setQuizCorrect(nextCorrect);
      setFeedback('Correct spelling! Keep going.');
      setQuizInput('');

      const isLast = quizIndex >= quizTotal - 1;
      if (isLast) {
        setPhase('complete');
        Alert.alert('Quiz Complete', `You spelled ${nextCorrect}/${quizTotal} words correctly.`);
      } else {
        setQuizIndex((current) => current + 1);
      }
      return;
    }

    setFeedback('Not correct yet. Look closely at each sign image.');
  };

  const revealQuizAnswer = () => {
    setQuizAnswerRevealed(true);
    setFeedback(`Answer: ${quizWord}`);
  };

  const visiblePhases = useMemo(
    () => lessonSubtabs.filter((tab) => (mode === 'grammar' ? tab.id !== 'quiz' : tab.id !== 'quiz' || mode === 'words')),
    [mode],
  );

  const isSubtabEnabled = (tabId: LessonPhase) => {
    if (mode === 'grammar') {
      const grammarPhaseOrder: LessonPhase[] = ['teach', 'practice', 'complete'];
      const index = grammarPhaseOrder.indexOf(tabId);
      return index >= 0 && index <= maxGrammarPhaseReached;
    }
    return tabId !== 'quiz' || mode === 'words';
  };

  const teachWord = mode === 'words' ? lessonWords[teachIndex] ?? '' : '';

  const renderWordLetterCarousel = (
    word: string,
    variant: 'teach' | 'practice',
    options?: { showLetterLabel?: boolean },
  ) => {
    const showLetterLabel = options?.showLetterLabel ?? true;
    const letters = word.split('');
    const len = letters.length;
    if (len === 0) {
      return null;
    }
    const safeIndex = Math.min(wordLetterIndex, len - 1);
    const letter = letters[safeIndex] ?? '';

    return (
      <View style={styles.wordCarousel}>
        <Text style={styles.carouselHint}>
          Letter {safeIndex + 1} of {len} — use arrows to move
        </Text>
        <View style={styles.carouselRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous letter"
            onPress={() => setWordLetterIndex((i) => Math.max(0, i - 1))}
            disabled={safeIndex <= 0}
            style={[styles.carouselArrow, safeIndex <= 0 && styles.carouselArrowDisabled]}>
            <Text style={styles.carouselArrowText}>‹</Text>
          </Pressable>
          <View style={styles.carouselSignWrap}>
            <AslLetterSign letter={letter} variant={variant} style={styles.teachSignImage} />
            {showLetterLabel ? <Text style={styles.teachSignLabel}>{letter}</Text> : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next letter"
            onPress={() => setWordLetterIndex((i) => Math.min(len - 1, i + 1))}
            disabled={safeIndex >= len - 1}
            style={[styles.carouselArrow, safeIndex >= len - 1 && styles.carouselArrowDisabled]}>
            <Text style={styles.carouselArrowText}>›</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (isLoadingSavedCustom) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </Pressable>
            <View style={styles.topTextWrap}>
              <Text style={styles.topTitle}>Loading set…</Text>
              <Text style={styles.topSubtitle}>Fetching your saved words.</Text>
            </View>
          </View>
          <ActivityIndicator size="large" color="#0A7D47" style={styles.loadingSpinner} />
        </View>
      </SafeAreaView>
    );
  }

  if (invalidCustomLesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </Pressable>
            <View style={styles.topTextWrap}>
              <Text style={styles.topTitle}>Custom set not available</Text>
              <Text style={styles.topSubtitle}>
                Open the My sets tab to start a custom list or choose a saved set, then try again.
              </Text>
            </View>
          </View>
          <Pressable style={styles.actionButton} onPress={() => router.back()}>
            <Text style={styles.actionButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, highContrast && styles.safeHighContrast]}>
      <LinearGradient colors={highContrast ? ['#000000', '#000000'] : ['#F1FFD1', '#D7F58B', '#B8E86F']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, highContrast && styles.primaryHighContrast]}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={[styles.topTextWrap, highContrast && styles.cardHighContrast]}>
            <Text style={[styles.topTitle, highContrast && styles.titleHighContrast]}>{activeLesson.title}</Text>
            <Text style={[styles.topSubtitle, highContrast && styles.textHighContrast]}>{'goal' in activeLesson ? activeLesson.goal : activeLesson.subtitle}</Text>
          </View>
        </View>

        <View style={[styles.progressCard, highContrast && styles.cardHighContrast]}>
          <View style={[styles.progressTrack, highContrast && styles.progressTrackHighContrast]}>
            <View style={[styles.progressFill, highContrast && styles.progressFillHighContrast, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={[styles.progressText, highContrast && styles.titleHighContrast]}>{Math.round(progress * 100)}% complete</Text>
          <Text style={[styles.feedbackText, highContrast && styles.textHighContrast]}>{feedback}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subtabRow}>
          {visiblePhases.map((tab) => {
            const active = phase === tab.id;
            const enabled = isSubtabEnabled(tab.id);
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  if (enabled) {
                    setPhase(tab.id);
                  }
                }}
                style={[
                  styles.subtabButton,
                  highContrast && styles.secondaryHighContrast,
                  active && styles.subtabButtonActive,
                  highContrast && active && styles.primaryHighContrast,
                  !enabled && styles.subtabButtonDisabled,
                ]}>
                <Text
                  style={[
                    styles.subtabButtonText,
                    highContrast && styles.secondaryTextHighContrast,
                    active && styles.subtabButtonTextActive,
                    highContrast && active && styles.primaryTextHighContrast,
                    !enabled && styles.subtabButtonTextDisabled,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable style={[styles.secondaryButton, highContrast && styles.secondaryHighContrast]} onPress={restartTeachMode}>
          <Text style={[styles.secondaryButtonText, highContrast && styles.secondaryTextHighContrast]}>Restart teach (from first step)</Text>
        </Pressable>

        {phase === 'teach' && (
          <View style={[styles.panel, highContrast && styles.cardHighContrast]}>
            <Text style={[styles.panelTitle, highContrast && styles.titleHighContrast]}>Teach</Text>
            {mode === 'letters' && (
              <View style={[styles.teachSignCard, highContrast && styles.cardHighContrast]}>
                <AslLetterSign letter={teachLetter} variant="teach" style={styles.teachSignImage} />
                <Text style={[styles.teachSignLabel, highContrast && styles.titleHighContrast]}>Letter {teachLetter}</Text>
              </View>
            )}
            {mode === 'words' && (
              <View style={[styles.wordCard, highContrast && styles.cardHighContrast]}>
                <Text style={[styles.wordText, highContrast && styles.titleHighContrast]}>Word: {teachWord}</Text>
                {renderWordLetterCarousel(teachWord, 'teach')}
              </View>
            )}
            {mode === 'grammar' && (
              <View style={[styles.grammarCard, highContrast && styles.cardHighContrast]}>
                {currentGrammarTeachStep?.label ? (
                  <Text style={[styles.grammarLabel, highContrast && styles.titleHighContrast]}>{currentGrammarTeachStep.label}:</Text>
                ) : null}
                <Text style={[styles.grammarText, highContrast && styles.textHighContrast]}>{currentGrammarTeachStep?.content ?? ''}</Text>
              </View>
            )}

            <Pressable style={[styles.actionButton, highContrast && styles.primaryHighContrast]} onPress={nextTeachStep}>
              <Text style={[styles.actionButtonText, highContrast && styles.primaryTextHighContrast]}>
                {teachIndex < teachUnits.length - 1 ? 'Next' : 'Start Practice'}
              </Text>
            </Pressable>
          </View>
        )}

        {phase === 'practice' && (
          <View style={[styles.panel, highContrast && styles.cardHighContrast]}>
            <Text style={[styles.panelTitle, highContrast && styles.titleHighContrast]}>Practice</Text>
            {mode === 'letters' && (
              <View style={[styles.teachSignCard, highContrast && styles.cardHighContrast]}>
                <AslLetterSign letter={practiceLetter} variant="practice" style={styles.teachSignImage} />
                <Text style={[styles.goalText, highContrast && styles.textHighContrast]}>Type the letter shown by the sign.</Text>
              </View>
            )}
            {mode === 'words' && (
              <View style={[styles.wordCard, highContrast && styles.cardHighContrast]}>
                <Text style={[styles.goalText, highContrast && styles.textHighContrast]}>Spell this word from signs (one letter at a time):</Text>
                {renderWordLetterCarousel(practiceWord, 'practice')}
              </View>
            )}
            {mode === 'grammar' && (
              <View style={[styles.grammarCard, highContrast && styles.cardHighContrast]}>
                <Text style={[styles.goalText, highContrast && styles.textHighContrast]}>{currentGrammarExercise?.prompt ?? ''}</Text>
              </View>
            )}

            <TextInput
              value={practiceInput}
              onChangeText={setPracticeInput}
              placeholder="Type your answer"
              autoCapitalize="characters"
              style={[styles.answerInput, highContrast && styles.inputHighContrast]}
              placeholderTextColor={highContrast ? '#BDBDBD' : '#6EA487'}
            />
            {mode === 'grammar' && currentGrammarExercise?.hint ? (
              <Text style={[styles.hintText, highContrast && styles.textHighContrast]}>Hint: {currentGrammarExercise.hint}</Text>
            ) : null}
            {practiceAnswerRevealed && (
              <Text style={[styles.revealedAnswerText, highContrast && styles.cardHighContrast, highContrast && styles.titleHighContrast]}>
                Revealed: {mode === 'grammar' ? currentGrammarExercise?.acceptedAnswers[0] ?? '' : practiceUnits[practiceIndex] ?? ''}
              </Text>
            )}
            {mode === 'grammar' && practiceAnswerStatus !== 'idle' ? (
              <Text
                style={[
                  styles.answerFeedbackText,
                  practiceAnswerStatus === 'correct' ? styles.answerFeedbackSuccess : styles.answerFeedbackError,
                ]}>
                {practiceFeedbackMessage}
              </Text>
            ) : null}
            {mode === 'grammar' ? (
              <>
                <Pressable style={[styles.secondaryButton, highContrast && styles.secondaryHighContrast]} onPress={revealPracticeAnswer}>
                  <Text style={[styles.secondaryButtonText, highContrast && styles.secondaryTextHighContrast]}>Reveal answer</Text>
                </Pressable>
                {practiceAnswerStatus === 'correct' ? (
                  <Pressable style={[styles.actionButton, highContrast && styles.primaryHighContrast]} onPress={nextPracticeStep}>
                    <Text style={[styles.actionButtonText, highContrast && styles.primaryTextHighContrast]}>Next</Text>
                  </Pressable>
                ) : (
                  <Pressable style={[styles.actionButton, highContrast && styles.primaryHighContrast]} onPress={checkPracticeAnswer}>
                    <Text style={[styles.actionButtonText, highContrast && styles.primaryTextHighContrast]}>Check answer</Text>
                  </Pressable>
                )}
              </>
            ) : (
              <View style={styles.buttonRow}>
                <Pressable style={styles.secondaryButtonFlex} onPress={revealPracticeAnswer}>
                  <Text style={styles.secondaryButtonText}>Reveal answer</Text>
                </Pressable>
                <Pressable style={styles.actionButtonFlex} onPress={checkPracticeAnswer}>
                  <Text style={styles.actionButtonText}>Check answer</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {phase === 'quiz' && mode === 'words' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Word Spelling Quiz</Text>
            <Text style={styles.goalText}>Look at each sign and spell the word (arrows to move between letters).</Text>
            {renderWordLetterCarousel(quizWord, 'practice', { showLetterLabel: false })}
            <TextInput
              value={quizInput}
              onChangeText={setQuizInput}
              placeholder="Spell the word"
              autoCapitalize="characters"
              style={styles.answerInput}
              placeholderTextColor="#6EA487"
            />
            {quizAnswerRevealed && <Text style={styles.revealedAnswerText}>Revealed: {quizWord}</Text>}
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButtonFlex} onPress={revealQuizAnswer}>
                <Text style={styles.secondaryButtonText}>Reveal answer</Text>
              </Pressable>
              <Pressable style={styles.actionButtonFlex} onPress={checkQuizAnswer}>
                <Text style={styles.actionButtonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        )}

        {phase === 'complete' && (
          <View style={[styles.panel, highContrast && styles.cardHighContrast]}>
            <Text style={[styles.panelTitle, highContrast && styles.titleHighContrast]}>Lesson Complete</Text>
            <Text style={[styles.goalText, highContrast && styles.textHighContrast]}>Practice score: {practiceCorrect}/{practiceTotal}</Text>
            {mode === 'words' && <Text style={[styles.goalText, highContrast && styles.textHighContrast]}>Quiz score: {quizCorrect}/{quizTotal}</Text>}
            {mode === 'grammar' ? (
              <>
                <Pressable style={[styles.secondaryButton, highContrast && styles.secondaryHighContrast]} onPress={restartTeachMode}>
                  <Text style={[styles.secondaryButtonText, highContrast && styles.secondaryTextHighContrast]}>Back to teach</Text>
                </Pressable>
                <Pressable style={[styles.actionButton, highContrast && styles.primaryHighContrast]} onPress={restartLesson}>
                  <Text style={[styles.actionButtonText, highContrast && styles.primaryTextHighContrast]}>Restart lesson</Text>
                </Pressable>
                <Pressable style={[styles.secondaryButton, highContrast && styles.secondaryHighContrast]} onPress={() => router.back()}>
                  <Text style={[styles.secondaryButtonText, highContrast && styles.secondaryTextHighContrast]}>Back to lessons</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.actionButton} onPress={restartLesson}>
                <Text style={styles.actionButtonText}>Restart Lesson</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
      </LinearGradient>
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
  gradient: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#08BF6A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 26,
  },
  topTextWrap: {
    flex: 1,
    backgroundColor: '#08BF6A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  topTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  topSubtitle: {
    color: '#EAFEF1',
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: '#ECFAEE',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C7EFC0',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#CDEED0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0A6D3E',
  },
  progressTrackHighContrast: {
    backgroundColor: '#333333',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  progressFillHighContrast: {
    backgroundColor: '#FFD400',
  },
  cardHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  titleHighContrast: {
    color: '#FFD400',
  },
  textHighContrast: {
    color: '#FFFFFF',
  },
  primaryHighContrast: {
    backgroundColor: '#FFD400',
    borderColor: '#FFD400',
  },
  primaryTextHighContrast: {
    color: '#000000',
  },
  secondaryHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFD400',
    borderWidth: 3,
  },
  secondaryTextHighContrast: {
    color: '#FFD400',
  },
  inputHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    color: '#FFFFFF',
  },
  progressText: {
    marginTop: 8,
    color: '#0A6D3E',
    fontWeight: '700',
  },
  feedbackText: {
    marginTop: 6,
    color: '#1F6D43',
    fontSize: 13,
  },
  subtabRow: {
    gap: 8,
    paddingRight: 8,
  },
  subtabButton: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#A8DFB1',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  subtabButtonActive: {
    borderColor: '#0EC46D',
    backgroundColor: '#0EC46D',
  },
  subtabButtonDisabled: {
    opacity: 0.45,
  },
  subtabButtonText: {
    color: '#126F43',
    fontWeight: '700',
    fontSize: 14,
  },
  subtabButtonTextActive: {
    color: '#FFFFFF',
  },
  subtabButtonTextDisabled: {
    color: '#5E8D72',
  },
  panel: {
    backgroundColor: '#ECFAEE',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C7EFC0',
    gap: 8,
  },
  panelTitle: {
    fontSize: 18,
    color: '#0B6B3E',
    fontWeight: '700',
  },
  loadingSpinner: {
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: '#0EC46D',
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  actionButtonFlex: {
    flex: 1,
    backgroundColor: '#0EC46D',
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#0A7D47',
    alignItems: 'center',
  },
  secondaryButtonFlex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#0A7D47',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#0A7D47',
    fontWeight: '700',
    fontSize: 14,
  },
  revealedAnswerText: {
    color: '#094C2D',
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: '#DFF5E4',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A8DFB1',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  teachSignCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7EFC0',
  },
  teachSignImage: {
    width: 190,
    height: 190,
  },
  teachSignLabel: {
    color: '#0B6037',
    fontWeight: '700',
    marginTop: 4,
    fontSize: 18,
  },
  goalText: {
    color: '#266E48',
    fontSize: 14,
    lineHeight: 20,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#A8DFB1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#094C2D',
    backgroundColor: '#FFFFFF',
  },
  wordLettersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wordCarousel: {
    gap: 8,
    marginTop: 4,
  },
  carouselHint: {
    color: '#266E48',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  carouselArrow: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#0EC46D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselArrowDisabled: {
    backgroundColor: '#9BC9A8',
    opacity: 0.7,
  },
  carouselArrowText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  carouselSignWrap: {
    flex: 1,
    maxWidth: 240,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#C7EFC0',
  },
  wordCard: {
    backgroundColor: '#ECFAEE',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C7EFC0',
  },
  wordText: {
    fontSize: 17,
    color: '#0A6D3E',
    fontWeight: '700',
    marginBottom: 8,
  },
  wordLetterCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: 78,
  },
  wordLetterImage: {
    width: 54,
    height: 54,
  },
  wordLetterText: {
    fontWeight: '700',
    color: '#0B6037',
    marginTop: 4,
  },
  grammarCard: {
    backgroundColor: '#ECFAEE',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7EFC0',
  },
  grammarText: {
    color: '#155F3A',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  grammarLabel: {
    color: '#0A6D3E',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  hintText: {
    color: '#4B835F',
    fontSize: 13,
    lineHeight: 18,
  },
  answerFeedbackText: {
    fontSize: 14,
    fontWeight: '700',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  answerFeedbackSuccess: {
    color: '#075E35',
    backgroundColor: '#DFF5E4',
    borderWidth: 1,
    borderColor: '#8AD59E',
  },
  answerFeedbackError: {
    color: '#9B1C1C',
    backgroundColor: '#FDE8E8',
    borderWidth: 1,
    borderColor: '#F5B5B5',
  },
});
