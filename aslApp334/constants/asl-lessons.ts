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

export type GrammarTeachStep = {
  id: string;
  content: string;
  label?: string;
};

export type GrammarExercise = {
  prompt: string;
  acceptedAnswers: string[];
  hint?: string;
  conjugationHint?: string;
};

export type GrammarLesson = {
  id: string;
  title: string;
  subtitle: string;
  teachSteps: GrammarTeachStep[];
  exercises: GrammarExercise[];
};

export type Lesson = LetterLesson | WordLesson | GrammarLesson;

/**
 * Looping letter videos (teach + practice use the same clip per letter).
 * Files: assets/images/aslLetterVideos/letter-a.mp4 … letter-z.mp4
 */
export const LETTER_VIDEO_SOURCES: Record<string, number> = {
  A: require('@/assets/images/aslLetterVideos/letter-a.mp4'),
  B: require('@/assets/images/aslLetterVideos/letter-b.mp4'),
  C: require('@/assets/images/aslLetterVideos/letter-c.mp4'),
  D: require('@/assets/images/aslLetterVideos/letter-d.mp4'),
  E: require('@/assets/images/aslLetterVideos/letter-e.mp4'),
  F: require('@/assets/images/aslLetterVideos/letter-f.mp4'),
  G: require('@/assets/images/aslLetterVideos/letter-g.mp4'),
  H: require('@/assets/images/aslLetterVideos/letter-h.mp4'),
  I: require('@/assets/images/aslLetterVideos/letter-i.mp4'),
  J: require('@/assets/images/aslLetterVideos/letter-j.mp4'),
  K: require('@/assets/images/aslLetterVideos/letter-k.mp4'),
  L: require('@/assets/images/aslLetterVideos/letter-l.mp4'),
  M: require('@/assets/images/aslLetterVideos/letter-m.mp4'),
  N: require('@/assets/images/aslLetterVideos/letter-n.mp4'),
  O: require('@/assets/images/aslLetterVideos/letter-o.mp4'),
  P: require('@/assets/images/aslLetterVideos/letter-p.mp4'),
  Q: require('@/assets/images/aslLetterVideos/letter-q.mp4'),
  R: require('@/assets/images/aslLetterVideos/letter-r.mp4'),
  S: require('@/assets/images/aslLetterVideos/letter-s.mp4'),
  T: require('@/assets/images/aslLetterVideos/letter-t.mp4'),
  U: require('@/assets/images/aslLetterVideos/letter-u.mp4'),
  V: require('@/assets/images/aslLetterVideos/letter-v.mp4'),
  W: require('@/assets/images/aslLetterVideos/letter-w.mp4'),
  X: require('@/assets/images/aslLetterVideos/letter-x.mp4'),
  Y: require('@/assets/images/aslLetterVideos/letter-y.mp4'),
  Z: require('@/assets/images/aslLetterVideos/letter-z.mp4'),
};

/** Static letter images — `asl Letters Practice` for teach and practice (Preferences → static images). */
export const letterImages: Record<string, number> = {
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

/** Whether we can show this letter (video and/or static asset exists). */
export function hasLetterSignAsset(letter: string): boolean {
  const u = letter.toUpperCase();
  return LETTER_VIDEO_SOURCES[u] !== undefined || letterImages[u] !== undefined;
}

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
    subtitle: 'ASL often uses topic-comment order. Start with the topic, then add what you want to say about it.',
    teachSteps: [
      {
        id: 't1',
        content: 'ASL is NOT signed English. One of the most common misconceptions about American Sign Language is that it\'s just English spoken with your hands. In reality, ASL is a fully independent language with its own grammar, vocabulary, and structure.'
      },
      {
        id: 't2',
        content: 'ASL has its own grammar rules - including how signs are built, what they mean, the order they appear in (called syntax), and how context changes meaning.'
      },
      {
        id: 't3',
        content: 'Syntax refers to how signs are arranged in a sentence. ASL doesn\'t use just one fixed order - it uses multiple sign orders depending on context.'
      },
      {
        id: 't4',
        content: 'Topicalization is one of ASL\'s most important structures. It means placing the topic of the sentence at the beginning, followed by a comment about it.'
      },
      {
        id: 't5',
        label: 'Example',
        content: 'WEATHER, HOT TODAY\n\nIn English: "The weather is hot today."\nWEATHER is the topic. HOT TODAY is the comment.'
      },
      {
        id: 't6',
        label: 'Example',
        content: 'CAT, ORANGE, BIG, I SEE\n\nIn English: "I see a big orange cat."\nThe topic (CAT) and its descriptors come first, then the comment.'
      },
      {
        id: 't7',
        label: 'Example',
        content: 'MY SISTER, TEACHER\n\nIn English: "My sister is a teacher."\nEstablish the topic first, then state what is true about it.'
      },
    ],
    exercises: [
      {
        prompt: 'Reorder in ASL style: I READ BOOK',
        acceptedAnswers: ['BOOK I READ', 'BOOK, I READ', 'BOOK READ I'],
        hint: 'Think about what the topic is - the thing being acted on.'
      },
      {
        prompt: 'How would you sign "The weather is hot today" in ASL?',
        acceptedAnswers: ['WEATHER HOT TODAY', 'WEATHER, HOT TODAY', 'WEATHER TODAY HOT'],
        hint: 'Place the topic (WEATHER) first.'
      },
      {
        prompt: 'Reorder in ASL style: SHE HAS A RED CAR',
        acceptedAnswers: ['CAR RED SHE HAVE', 'CAR, RED, SHE HAVE', 'CAR RED HAVE SHE'],
        hint: 'Start with the object (CAR), then describe it, then state who has it.',
        conjugationHint: 'ASL doesn\'t conjugate verbs - use HAVE instead of HAS regardless of the subject.',
      },
      {
        prompt: 'What term describes placing the topic first in an ASL sentence?',
        acceptedAnswers: ['topicalization', 'TOPICALIZATION', 'topic first', 'topic-comment'],
        hint: 'It starts with "topic..."'
      },
      {
        prompt: 'Reorder in ASL style: I WANT NEW SHOES',
        acceptedAnswers: ['SHOES NEW I WANT', 'SHOES, NEW, I WANT', 'SHOES NEW WANT I'],
        hint: 'The item being wanted is the topic.'
      },
    ],
  },
  {
    id: 'grammar-2',
    title: 'Grammar Basics 2',
    subtitle: 'Use facial expression with yes/no questions and keep sentence structure simple.',
    teachSteps: [
      { id: 't1', content: 'Yes/no questions in ASL are marked by facial expression - raise your eyebrows while signing the question.' },
      { id: 't2', label: 'Example', content: 'YOU LIKE COFFEE?\n\nRaise eyebrows on the whole phrase to signal a yes/no question.' },
      { id: 't3', label: 'Example', content: 'YOU READY?\n\nNo need for "are" - just sign YOU READY with raised eyebrows.' },
    ],
    exercises: [
      { prompt: 'Turn into ASL-style question: DO YOU LIKE COFFEE', acceptedAnswers: ['YOU LIKE COFFEE?', 'YOU LIKE COFFEE', 'COFFEE YOU LIKE', 'COFFEE YOU LIKE?'] },
      { prompt: 'Turn into ASL-style question: ARE YOU READY', acceptedAnswers: ['YOU READY?', 'YOU READY'] },
    ],
  },
  {
    id: 'grammar-3',
    title: 'Grammar Basics 3',
    subtitle: 'Time signs usually come first so the listener knows when the action happens.',
    teachSteps: [
      { id: 't1', content: 'In ASL, time signs (YESTERDAY, TOMORROW, NOW, LATER) are placed at the beginning of a sentence to establish a time frame before the action.' },
      { id: 't2', label: 'Example', content: 'YESTERDAY I PRACTICE\n\nIn English: "I practiced yesterday."' },
      { id: 't3', label: 'Example', content: 'TOMORROW WE STUDY ASL\n\nIn English: "We will study ASL tomorrow."' },
    ],
    exercises: [
      { prompt: 'Put time first: I PRACTICE YESTERDAY', acceptedAnswers: ['YESTERDAY I PRACTICE'] },
      { prompt: 'Put time first: WE STUDY ASL TOMORROW', acceptedAnswers: ['TOMORROW WE STUDY ASL', 'TOMORROW WE ASL STUDY'] },
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
