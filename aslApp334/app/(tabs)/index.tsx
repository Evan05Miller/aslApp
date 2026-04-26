import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
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

type LearnMode = 'letters' | 'words' | 'grammar';

type LetterLesson = {
  id: string;
  title: string;
  letters: string[];
  goal: string;
};

type WordLesson = {
  id: string;
  title: string;
  words: string[];
  goal: string;
};

type GrammarLesson = {
  id: string;
  title: string;
  rule: string;
  examples: string[];
  exercises: { prompt: string; answer: string }[];
};

const letterImages: Record<string, number> = {
  A: require('@/assets/images/aslLetters/A.png'),
  B: require('@/assets/images/aslLetters/B.png'),
  C: require('@/assets/images/aslLetters/C.png'),
  D: require('@/assets/images/aslLetters/D.png'),
  E: require('@/assets/images/aslLetters/E.png'),
  F: require('@/assets/images/aslLetters/F.png'),
  G: require('@/assets/images/aslLetters/G.png'),
  H: require('@/assets/images/aslLetters/H.png'),
  I: require('@/assets/images/aslLetters/I.png'),
  J: require('@/assets/images/aslLetters/J.png'),
  K: require('@/assets/images/aslLetters/K.png'),
  L: require('@/assets/images/aslLetters/L.png'),
  M: require('@/assets/images/aslLetters/M.png'),
  N: require('@/assets/images/aslLetters/N.png'),
  O: require('@/assets/images/aslLetters/O.png'),
  P: require('@/assets/images/aslLetters/P.png'),
  Q: require('@/assets/images/aslLetters/Q.png'),
  R: require('@/assets/images/aslLetters/R.png'),
  S: require('@/assets/images/aslLetters/S.png'),
  T: require('@/assets/images/aslLetters/T.png'),
  U: require('@/assets/images/aslLetters/U.png'),
  V: require('@/assets/images/aslLetters/V.png'),
  W: require('@/assets/images/aslLetters/W.png'),
  X: require('@/assets/images/aslLetters/X.png'),
  Y: require('@/assets/images/aslLetters/Y.png'),
  Z: require('@/assets/images/aslLetters/Z.png'),
};

const practiceLetterImages: Record<string, number> = {
  A: require('@/assets/images/asl Letters Practice/A Practice.png'),
  B: require('@/assets/images/asl Letters Practice/B Practice.png'),
  C: require('@/assets/images/asl Letters Practice/C Practice.png'),
  D: require('@/assets/images/asl Letters Practice/D Practice.png'),
  E: require('@/assets/images/asl Letters Practice/E Practice.png'),
  F: require('@/assets/images/asl Letters Practice/F Practice.png'),
  G: require('@/assets/images/asl Letters Practice/G Practice.png'),
  H: require('@/assets/images/asl Letters Practice/H Practice.png'),
  I: require('@/assets/images/asl Letters Practice/I Practice.png'),
  J: require('@/assets/images/asl Letters Practice/J Practice.png'),
  K: require('@/assets/images/asl Letters Practice/K Practice.png'),
  L: require('@/assets/images/asl Letters Practice/L Practice.png'),
  M: require('@/assets/images/asl Letters Practice/M Practice.png'),
  N: require('@/assets/images/asl Letters Practice/N Practice.png'),
  O: require('@/assets/images/asl Letters Practice/O Practice.png'),
  P: require('@/assets/images/asl Letters Practice/P Practice.png'),
  Q: require('@/assets/images/asl Letters Practice/Q Practice.png'),
  R: require('@/assets/images/asl Letters Practice/R Practice.png'),
  S: require('@/assets/images/asl Letters Practice/S Practice.png'),
  T: require('@/assets/images/asl Letters Practice/T Practice.png'),
  U: require('@/assets/images/asl Letters Practice/U Practice.png'),
  V: require('@/assets/images/asl Letters Practice/V Practice.png'),
  W: require('@/assets/images/asl Letters Practice/W Practice.png'),
  X: require('@/assets/images/asl Letters Practice/X Practice.png'),
  Y: require('@/assets/images/asl Letters Practice/Y Practice.png'),
  Z: require('@/assets/images/asl Letters Practice/Z Practice.png'),
};

const letterLessons: LetterLesson[] = [
  { id: 'letters-1', title: 'Basics 1: A - I', letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], goal: 'Learn the first 9 handshapes and their labels.' },
  { id: 'letters-2', title: 'Basics 2: J - R', letters: ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'], goal: 'Recognize curved and directional hand movements.' },
  { id: 'letters-3', title: 'Basics 3: S - Z', letters: ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], goal: 'Finish the alphabet and practice quick recall.' },
];

const wordLessons: WordLesson[] = [
  { id: 'words-1', title: 'Word Set 1', words: ['CAT', 'DOG', 'SUN', 'BOOK'], goal: 'Spell short, common words with steady pacing.' },
  { id: 'words-2', title: 'Word Set 2', words: ['FAMILY', 'SCHOOL', 'FRIEND'], goal: 'Practice medium-length words and transitions.' },
  { id: 'words-3', title: 'Word Set 3', words: ['LEARN', 'PRACTICE', 'SUCCESS'], goal: 'Build confidence with longer words.' },
];

const grammarLessons: GrammarLesson[] = [
  {
    id: 'grammar-1',
    title: 'Grammar Basics 1',
    rule: 'ASL often uses topic-comment order. Start with the topic, then add what you want to say about it.',
    examples: ['TOPIC: BOOK, COMMENT: I READ', 'TOPIC: WEATHER, COMMENT: HOT TODAY'],
    exercises: [
      { prompt: 'Reorder in ASL style: I READ BOOK', answer: 'BOOK I READ' },
      { prompt: 'Reorder in ASL style: TODAY HOT WEATHER', answer: 'WEATHER HOT TODAY' },
    ],
  },
  {
    id: 'grammar-2',
    title: 'Grammar Basics 2',
    rule: 'Use facial expression with yes/no questions and keep sentence structure simple.',
    examples: ['YOU LIKE COFFEE?', 'YOU READY?'],
    exercises: [
      { prompt: 'Turn into ASL-style question: DO YOU LIKE COFFEE', answer: 'YOU LIKE COFFEE?' },
      { prompt: 'Turn into ASL-style question: ARE YOU READY', answer: 'YOU READY?' },
    ],
  },
  {
    id: 'grammar-3',
    title: 'Grammar Basics 3',
    rule: 'Time signs usually come first so the listener knows when the action happens.',
    examples: ['YESTERDAY I PRACTICE', 'TOMORROW WE STUDY ASL'],
    exercises: [
      { prompt: 'Put time first: I PRACTICE YESTERDAY', answer: 'YESTERDAY I PRACTICE' },
      { prompt: 'Put time first: WE STUDY ASL TOMORROW', answer: 'TOMORROW WE STUDY ASL' },
    ],
  },
];

const modes: { id: LearnMode; label: string; subtitle: string }[] = [
  { id: 'letters', label: 'Basic Letters', subtitle: 'Alphabet lessons' },
  { id: 'words', label: 'Full Words', subtitle: 'Spell complete words' },
  { id: 'grammar', label: 'Grammar', subtitle: 'Simple ASL sentence flow' },
];

const lessonSubtabs: { id: 'teach' | 'practice' | 'quiz' | 'complete'; label: string }[] = [
  { id: 'teach', label: 'Teach' },
  { id: 'practice', label: 'Practice' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'complete', label: 'Complete' },
];

export default function LearnScreen() {
  const [mode, setMode] = useState<LearnMode>('letters');
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [phase, setPhase] = useState<'teach' | 'practice' | 'quiz' | 'complete'>('teach');
  const [teachIndex, setTeachIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [practiceInput, setPracticeInput] = useState('');
  const [quizInput, setQuizInput] = useState('');
  const [feedback, setFeedback] = useState('Open a lesson to begin.');
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [practiceSequence, setPracticeSequence] = useState<string[]>([]);
  const [quizSequence, setQuizSequence] = useState<string[]>([]);

  const lessonsForMode = useMemo(() => {
    if (mode === 'letters') {
      return letterLessons;
    }
    if (mode === 'words') {
      return wordLessons;
    }
    return grammarLessons;
  }, [mode]);

  const activeLesson = lessonsForMode[selectedLesson];
  const lessonLetters = mode === 'letters' && 'letters' in activeLesson ? activeLesson.letters : [];
  const lessonWords = mode === 'words' && 'words' in activeLesson ? activeLesson.words : [];
  const lessonExamples = mode === 'grammar' && 'examples' in activeLesson ? activeLesson.examples : [];
  const lessonExercises = mode === 'grammar' && 'exercises' in activeLesson ? activeLesson.exercises : [];
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

  const shuffleArray = (items: string[]) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const progress = useMemo(() => {
    if (!lessonOpen) {
      return 0;
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
    lessonOpen,
    mode,
    phase,
    teachIndex,
    teachUnits.length,
    practiceTotal,
    practiceCorrect,
    quizTotal,
    quizCorrect,
  ]);

  const resetFlow = () => {
    setLessonOpen(false);
    setPhase('teach');
    setTeachIndex(0);
    setPracticeIndex(0);
    setQuizIndex(0);
    setPracticeInput('');
    setQuizInput('');
    setPracticeCorrect(0);
    setQuizCorrect(0);
    setPracticeSequence([]);
    setQuizSequence([]);
    setFeedback('Open a lesson to begin.');
  };

  const openLesson = () => {
    const shuffledPractice =
      mode === 'letters'
        ? shuffleArray(lessonLetters)
        : mode === 'words'
        ? shuffleArray(lessonWords)
        : lessonExercises.map((exercise) => exercise.answer);
    const shuffledQuiz = mode === 'words' ? shuffleArray(lessonWords) : [];
    setLessonOpen(true);
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
    setFeedback('Teaching started. Tap next to continue through the lesson.');
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

  const isSubtabEnabled = (tabId: 'teach' | 'practice' | 'quiz' | 'complete') => {
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
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>ASL Learning Tool</Text>
          <Text style={styles.headerSubtitle}>Choose a mode, then select a lesson module.</Text>
        </View>

        <View style={styles.modeRow}>
          {modes.map((item) => {
            const isActive = mode === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setMode(item.id);
                  setSelectedLesson(0);
                  resetFlow();
                }}
                style={[styles.modeButton, isActive && styles.modeButtonActive]}>
                <Text style={[styles.modeTitle, isActive && styles.modeTitleActive]}>{item.label}</Text>
                <Text style={[styles.modeSubtitle, isActive && styles.modeSubtitleActive]}>{item.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Lesson Modules</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonRow}>
          {lessonsForMode.map((lesson, index) => {
            const isSelected = selectedLesson === index;
            return (
              <Pressable
                key={lesson.id}
                onPress={() => {
                  setSelectedLesson(index);
                  resetFlow();
                }}
                style={[styles.lessonButton, isSelected && styles.lessonButtonActive]}>
                <Text style={[styles.lessonButtonTitle, isSelected && styles.lessonButtonTitleActive]}>
                  {lesson.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.contentCard}>
          {'goal' in activeLesson ? (
            <>
              <Text style={styles.contentTitle}>{activeLesson.title}</Text>
              <Text style={styles.goalText}>{activeLesson.goal}</Text>
            </>
          ) : (
            <>
              <Text style={styles.contentTitle}>{activeLesson.title}</Text>
              <Text style={styles.goalText}>{activeLesson.rule}</Text>
            </>
          )}

          <View style={styles.progressCard}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}% complete</Text>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>

          {!lessonOpen && (
            <Pressable style={styles.actionButton} onPress={openLesson}>
              <Text style={styles.actionButtonText}>Open Lesson</Text>
            </Pressable>
          )}

          {lessonOpen && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subtabRow}>
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
          )}

          {lessonOpen && phase === 'teach' && (
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
                  {teachIndex < teachUnits.length - 1 ? 'Next Teaching Step' : 'Start Practice'}
                </Text>
              </Pressable>
            </View>
          )}

          {lessonOpen && phase === 'practice' && (
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
              <Pressable style={styles.actionButton} onPress={checkPracticeAnswer}>
                <Text style={styles.actionButtonText}>Check Practice Answer</Text>
              </Pressable>
            </View>
          )}

          {lessonOpen && phase === 'quiz' && mode === 'words' && (
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
              <Pressable style={styles.actionButton} onPress={checkQuizAnswer}>
                <Text style={styles.actionButtonText}>Submit Quiz Answer</Text>
              </Pressable>
            </View>
          )}

          {lessonOpen && phase === 'complete' && (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Lesson Complete</Text>
              <Text style={styles.goalText}>
                Practice score: {practiceCorrect}/{practiceTotal}
              </Text>
              {mode === 'words' && (
                <Text style={styles.goalText}>
                  Quiz score: {quizCorrect}/{quizTotal}
                </Text>
              )}
              <Pressable style={styles.actionButton} onPress={openLesson}>
                <Text style={styles.actionButtonText}>Restart Lesson</Text>
              </Pressable>
            </View>
          )}
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
    paddingBottom: 36,
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
  },
  modeRow: {
    gap: 10,
  },
  modeButton: {
    backgroundColor: '#F4FFF2',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#A9E9A5',
    padding: 12,
  },
  modeButtonActive: {
    borderColor: '#08BF6A',
    backgroundColor: '#DBFBE4',
  },
  modeTitle: {
    color: '#0A7D47',
    fontWeight: '700',
    fontSize: 16,
  },
  modeTitleActive: {
    color: '#056136',
  },
  modeSubtitle: {
    color: '#3B8A5B',
    marginTop: 2,
    fontSize: 13,
  },
  modeSubtitleActive: {
    color: '#1F6D43',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C6E3E',
    marginTop: 4,
  },
  lessonRow: {
    gap: 10,
    paddingRight: 12,
  },
  lessonButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#B6EFAE',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lessonButtonActive: {
    backgroundColor: '#0EC46D',
    borderColor: '#0EC46D',
  },
  lessonButtonTitle: {
    color: '#117344',
    fontWeight: '600',
  },
  lessonButtonTitleActive: {
    color: '#FFFFFF',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: '#AEECA9',
    gap: 10,
  },
  contentTitle: {
    color: '#0A7A45',
    fontSize: 20,
    fontWeight: '700',
  },
  goalText: {
    color: '#266E48',
    fontSize: 14,
    lineHeight: 20,
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
  panel: {
    backgroundColor: '#ECFAEE',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C7EFC0',
    gap: 8,
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
