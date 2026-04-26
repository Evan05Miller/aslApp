import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  LearnMode,
  getLessonsForMode,
  lessonSubtabs,
  letterImages,
  practiceLetterImages,
} from '@/constants/asl-lessons';

type LessonPhase = 'teach' | 'practice' | 'quiz' | 'complete';

export default function LessonScreen() {
  const params = useLocalSearchParams<{ mode?: string; lessonId?: string; lessonIndex?: string }>();
  const mode: LearnMode =
    params.mode === 'letters' || params.mode === 'words' || params.mode === 'grammar'
      ? params.mode
      : 'letters';

  const lessons = useMemo(() => getLessonsForMode(mode), [mode]);
  const lessonFromId = lessons.find((lesson) => lesson.id === params.lessonId);
  const lessonFromIndex =
    Number.isFinite(Number(params.lessonIndex)) && Number(params.lessonIndex) >= 0
      ? lessons[Number(params.lessonIndex)]
      : undefined;
  const activeLesson = lessonFromId ?? lessonFromIndex ?? lessons[0];

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

  const lessonLetters = mode === 'letters' && 'letters' in activeLesson ? activeLesson.letters : [];
  const lessonWords = mode === 'words' && 'words' in activeLesson ? activeLesson.words : [];
  const lessonExamples = mode === 'grammar' && 'examples' in activeLesson ? activeLesson.examples : [];
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
      : lessonExamples;
  const practiceUnits =
    mode === 'grammar' ? lessonExercises.map((exercise) => exercise.answer) : practiceSequence;
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
    const letters = mode === 'letters' && 'letters' in activeLesson ? activeLesson.letters : [];
    const words = mode === 'words' && 'words' in activeLesson ? activeLesson.words : [];
    const exercises = mode === 'grammar' && 'exercises' in activeLesson ? activeLesson.exercises : [];
    const shuffledPractice =
      mode === 'letters'
        ? shuffleArray(letters)
        : mode === 'words'
        ? shuffleArray(words)
        : exercises.map((exercise) => exercise.answer);
    const shuffledQuiz = mode === 'words' ? shuffleArray(words) : [];
    setPracticeSequence(shuffledPractice);
    setQuizSequence(shuffledQuiz);
  }, [mode, activeLesson]);

  useEffect(() => {
    setPracticeAnswerRevealed(false);
  }, [practiceIndex, phase]);

  useEffect(() => {
    setQuizAnswerRevealed(false);
  }, [quizIndex, phase]);

  const progress = useMemo(() => {
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
  }, [mode, phase, teachIndex, teachUnits.length, practiceTotal, practiceCorrect, quizTotal, quizCorrect]);

  const restartLesson = () => {
    const shuffledPractice =
      mode === 'letters'
        ? shuffleArray(lessonLetters)
        : mode === 'words'
        ? shuffleArray(lessonWords)
        : lessonExercises.map((exercise) => exercise.answer);
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
    setFeedback('Teaching started. Tap next to continue through the lesson.');
  };

  const restartTeachMode = () => {
    setPhase('teach');
    setTeachIndex(0);
    setPracticeAnswerRevealed(false);
    setQuizAnswerRevealed(false);
    setFeedback('Teaching from the start. Tap Next when you are ready.');
  };

  const nextTeachStep = () => {
    if (teachIndex < teachUnits.length - 1) {
      setTeachIndex((current) => current + 1);
      return;
    }
    setPhase('practice');
    setFeedback('Practice time! Enter your answer and check feedback.');
  };

  const normalize = (value: string) => value.trim().toUpperCase();

  const checkPracticeAnswer = () => {
    const expected = normalize(practiceUnits[practiceIndex] ?? '');
    const actual = normalize(practiceInput);
    if (!actual) {
      setFeedback('Enter an answer first.');
      return;
    }

    if (actual === expected) {
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

    setFeedback(`Not quite. Try again. Hint: ${expected.length} characters.`);
  };

  const revealPracticeAnswer = () => {
    const answer = practiceUnits[practiceIndex] ?? '';
    setPracticeAnswerRevealed(true);
    setFeedback(`Answer: ${answer}`);
  };

  const checkQuizAnswer = () => {
    if (mode !== 'words') {
      return;
    }
    const expected = normalize(quizWord);
    const actual = normalize(quizInput);
    if (!actual) {
      setFeedback('Type your spelling first.');
      return;
    }

    if (actual === expected) {
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

  const isSubtabEnabled = (tabId: LessonPhase) => {
    if (tabId === 'teach') {
      return true;
    }
    if (tabId === 'practice') {
      return phase !== 'teach';
    }
    if (tabId === 'quiz') {
      return mode === 'words' && (phase === 'quiz' || phase === 'complete');
    }
    return phase === 'complete';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.topTextWrap}>
            <Text style={styles.topTitle}>{activeLesson.title}</Text>
            <Text style={styles.topSubtitle}>{'goal' in activeLesson ? activeLesson.goal : activeLesson.rule}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}% complete</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subtabRow}>
          {lessonSubtabs
            .filter((tab) => mode === 'words' || (tab.id !== 'quiz' && tab.id !== 'complete') || phase === 'complete')
            .map((tab) => {
              const active = phase === tab.id;
              const enabled = isSubtabEnabled(tab.id);
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => {
                    if (enabled) {
                      setPhase(tab.id);
                    }
                  }}
                  style={[
                    styles.subtabButton,
                    active && styles.subtabButtonActive,
                    !enabled && styles.subtabButtonDisabled,
                  ]}>
                  <Text
                    style={[
                      styles.subtabButtonText,
                      active && styles.subtabButtonTextActive,
                      !enabled && styles.subtabButtonTextDisabled,
                    ]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
        </ScrollView>

        <Pressable style={styles.secondaryButton} onPress={restartTeachMode}>
          <Text style={styles.secondaryButtonText}>Restart teach (from first step)</Text>
        </Pressable>

        {phase === 'teach' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Teach</Text>
            {mode === 'letters' && (
              <View style={styles.teachSignCard}>
                <Image source={letterImages[teachLetter]} style={styles.teachSignImage} contentFit="contain" />
                <Text style={styles.teachSignLabel}>Letter {teachLetter}</Text>
              </View>
            )}
            {mode === 'words' && (
              <View style={styles.wordCard}>
                <Text style={styles.wordText}>{lessonWords[teachIndex]}</Text>
                <View style={styles.wordLettersRow}>
                  {(lessonWords[teachIndex] ?? '').split('').map((letter, idx) => (
                    <View key={`${lessonWords[teachIndex]}-${letter}-${idx}`} style={styles.wordLetterCard}>
                      <Image source={letterImages[letter]} style={styles.wordLetterImage} contentFit="contain" />
                      <Text style={styles.wordLetterText}>{letter}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {mode === 'grammar' && (
              <View style={styles.grammarCard}>
                <Text style={styles.grammarText}>{lessonExamples[teachIndex]}</Text>
              </View>
            )}

            <Pressable style={styles.actionButton} onPress={nextTeachStep}>
              <Text style={styles.actionButtonText}>
                {teachIndex < teachUnits.length - 1 ? 'Next Unit' : 'Start Practice'}
              </Text>
            </Pressable>
          </View>
        )}

        {phase === 'practice' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Practice</Text>
            {mode === 'letters' && (
              <View style={styles.teachSignCard}>
                <Image source={practiceLetterImages[practiceLetter]} style={styles.teachSignImage} contentFit="contain" />
                <Text style={styles.goalText}>Type the letter shown by the sign.</Text>
              </View>
            )}
            {mode === 'words' && (
              <View style={styles.wordCard}>
                <Text style={styles.goalText}>Spell this word from signs:</Text>
                <View style={styles.wordLettersRow}>
                  {practiceWord.split('').map((letter, idx) => (
                    <View key={`${practiceWord}-practice-${letter}-${idx}`} style={styles.wordLetterCard}>
                      <Image source={practiceLetterImages[letter]} style={styles.wordLetterImage} contentFit="contain" />
                      <Text style={styles.wordLetterText}>{letter}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {mode === 'grammar' && (
              <View style={styles.grammarCard}>
                <Text style={styles.goalText}>{lessonExercises[practiceIndex]?.prompt ?? ''}</Text>
              </View>
            )}

            <TextInput
              value={practiceInput}
              onChangeText={setPracticeInput}
              placeholder="Type your answer"
              autoCapitalize="characters"
              style={styles.answerInput}
              placeholderTextColor="#6EA487"
            />
            {practiceAnswerRevealed && (
              <Text style={styles.revealedAnswerText}>
                Revealed: {practiceUnits[practiceIndex] ?? ''}
              </Text>
            )}
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButtonFlex} onPress={revealPracticeAnswer}>
                <Text style={styles.secondaryButtonText}>Reveal answer</Text>
              </Pressable>
              <Pressable style={styles.actionButtonFlex} onPress={checkPracticeAnswer}>
                <Text style={styles.actionButtonText}>Check answer</Text>
              </Pressable>
            </View>
          </View>
        )}

        {phase === 'quiz' && mode === 'words' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Word Spelling Quiz</Text>
            <Text style={styles.goalText}>Look at the sign sequence and spell the word.</Text>
            <View style={styles.wordLettersRow}>
              {quizWord.split('').map((letter, idx) => (
                <View key={`${quizWord}-quiz-${letter}-${idx}`} style={styles.wordLetterCard}>
                  <Image source={practiceLetterImages[letter]} style={styles.wordLetterImage} contentFit="contain" />
                </View>
              ))}
            </View>
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
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Lesson Complete</Text>
            <Text style={styles.goalText}>Practice score: {practiceCorrect}/{practiceTotal}</Text>
            {mode === 'words' && <Text style={styles.goalText}>Quiz score: {quizCorrect}/{quizTotal}</Text>}
            <Pressable style={styles.actionButton} onPress={restartLesson}>
              <Text style={styles.actionButtonText}>Restart Lesson</Text>
            </Pressable>
          </View>
        )}
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
    backgroundColor: '#0EC46D',
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
});
