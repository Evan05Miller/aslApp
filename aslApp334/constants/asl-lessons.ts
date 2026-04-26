export type LearnMode = 'letters' | 'words' | 'grammar';

export type LetterLesson = {
  id: string;
  title: string;
  letters: string[];
  goal: string;
};

export type WordLesson = {
  id: string;
  title: string;
  words: string[];
  goal: string;
};

export type GrammarLesson = {
  id: string;
  title: string;
  rule: string;
  examples: string[];
  exercises: { prompt: string; answer: string }[];
};

export type Lesson = LetterLesson | WordLesson | GrammarLesson;

export const letterImages: Record<string, number> = {
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

export const practiceLetterImages: Record<string, number> = {
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

export const letterLessons: LetterLesson[] = [
  { id: 'letters-1', title: 'Basics 1: A - I', letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], goal: 'Learn the letters of the alphabet.' },
  { id: 'letters-2', title: 'Basics 2: J - R', letters: ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'], goal: 'Learn the letters of the alphabet.' },
  { id: 'letters-3', title: 'Basics 3: S - Z', letters: ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], goal: 'Learn the letters of the alphabet.' },
];

export const wordLessons: WordLesson[] = [
  { id: 'words-1', title: 'Word Set 1', words: ['CAT', 'DOG', 'SUN', 'BOOK', 'EVAN'], goal: 'Spell short, common words with steady pacing.' },
  { id: 'words-2', title: 'Word Set 2', words: ['FAMILY', 'SCHOOL', 'FRIEND'], goal: 'Practice medium-length words and transitions.' },
  { id: 'words-3', title: 'Word Set 3', words: ['LEARN', 'PRACTICE', 'SUCCESS'], goal: 'Build confidence with longer words.' },
];

export const grammarLessons: GrammarLesson[] = [
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

export const modes: { id: LearnMode; label: string; subtitle: string }[] = [
  { id: 'letters', label: 'Basic Letters', subtitle: 'Alphabet lessons' },
  { id: 'words', label: 'Full Words', subtitle: 'Spell complete words' },
  { id: 'grammar', label: 'Grammar', subtitle: 'Simple ASL sentence flow' },
];

export const lessonSubtabs: { id: 'teach' | 'practice' | 'quiz' | 'complete'; label: string }[] = [
  { id: 'teach', label: 'Teach' },
  { id: 'practice', label: 'Practice' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'complete', label: 'Complete' },
];

export const getLessonsForMode = (mode: LearnMode) => {
  if (mode === 'letters') {
    return letterLessons;
  }
  if (mode === 'words') {
    return wordLessons;
  }
  return grammarLessons;
};
