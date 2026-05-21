const quizModeConfig = {
  letters: {
    label: "Letters",
    prompt: "Welke letter hoor je?",
    vowelTypes: [],
  },
  short: {
    label: "Korte klinkers",
    prompt: "Welke korte klank hoor je?",
    vowelTypes: ["fatha", "kasra", "damma"],
  },
  long: {
    label: "Lange klinkers",
    prompt: "Welke lange klank hoor je?",
    vowelTypes: ["aa", "ii", "uu"],
  },
  mixed: {
    label: "Mix",
    prompt: "Welke letter of klank hoor je?",
    vowelTypes: ["fatha", "kasra", "damma", "aa", "ii", "uu"],
    includeLetters: true,
  },
};

const quizDifficultyChoices = {
  easy: 2,
  medium: 3,
  hard: 4,
};

const quizVowelMeta = {
  fatha: { mark: "َ", label: "korte a" },
  kasra: { mark: "ِ", label: "korte i" },
  damma: { mark: "ُ", label: "korte oe" },
  aa: { mark: "َا", label: "lange aa" },
  ii: { mark: "ِي", label: "lange ie" },
  uu: { mark: "ُو", label: "lange oe" },
};

const createLetterQuiz = (letters, options = {}) => {
  const settings = {
    mode: quizModeConfig[options.mode] ? options.mode : "letters",
    difficulty: quizDifficultyChoices[options.difficulty] ? options.difficulty : "medium",
    finishScore: options.finishScore || 20,
  };
  let question = null;
  let questionCount = 0;
  let score = 0;
  let answered = false;

  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const getLetterName = (letter) => letter.nameDutch || letter.nameNl || letter.id;

  const createLetterItem = (letter) => ({
    id: `letter:${letter.id}`,
    letterId: letter.id,
    audioSrc: letter.baseAudio,
    arabic: letter.arabic,
    title: getLetterName(letter),
    subtitle: letter.transliteration,
    type: "letter",
  });

  const createVowelItem = (letter, vowelType) => {
    const meta = quizVowelMeta[vowelType];

    return {
      id: `${vowelType}:${letter.id}`,
      letterId: letter.id,
      audioSrc: letter.vowelAudio?.[vowelType],
      arabic: `${letter.arabic}${meta.mark}`,
      title: getLetterName(letter),
      subtitle: meta.label,
      type: vowelType,
    };
  };

  const buildQuestionPool = () => {
    const mode = quizModeConfig[settings.mode] || quizModeConfig.letters;
    const sortedLetters = [...letters].sort((a, b) => a.order - b.order);
    const items = [];

    if (settings.mode === "letters" || mode.includeLetters) {
      sortedLetters
        .filter((letter) => letter.baseAudio)
        .forEach((letter) => items.push(createLetterItem(letter)));
    }

    mode.vowelTypes.forEach((vowelType) => {
      sortedLetters
        .filter((letter) => letter.vowelAudio?.[vowelType])
        .forEach((letter) => items.push(createVowelItem(letter, vowelType)));
    });

    return items;
  };

  let pool = buildQuestionPool();

  const setMode = (mode) => {
    settings.mode = quizModeConfig[mode] ? mode : "letters";
    reset();
  };

  const setDifficulty = (difficulty) => {
    settings.difficulty = quizDifficultyChoices[difficulty] ? difficulty : "medium";
    reset();
  };

  const createQuestion = () => {
    pool = buildQuestionPool();

    if (!pool.length || score >= settings.finishScore) {
      question = null;
      return null;
    }

    const answer = pool[Math.floor(Math.random() * pool.length)];
    const choiceCount = Math.min(quizDifficultyChoices[settings.difficulty], pool.length);
    const distractors = shuffle(pool.filter((item) => item.id !== answer.id)).slice(0, choiceCount - 1);

    questionCount += 1;
    answered = false;
    question = {
      answer,
      choices: shuffle([answer, ...distractors]),
      mode: settings.mode,
      prompt: quizModeConfig[settings.mode].prompt,
      number: questionCount,
    };

    return question;
  };

  const answerQuestion = (choiceId) => {
    if (!question || answered) {
      return null;
    }

    const isCorrect = question.answer.id === choiceId;

    if (isCorrect) {
      answered = true;
      score += 1;
    }

    return {
      isCorrect,
      answer: question.answer,
      score,
      isFinished: score >= settings.finishScore,
    };
  };

  function reset() {
    pool = buildQuestionPool();
    question = null;
    questionCount = 0;
    score = 0;
    answered = false;
  }

  return {
    answerQuestion,
    createQuestion,
    reset,
    setDifficulty,
    setMode,
    get currentQuestion() {
      return question;
    },
    get state() {
      return {
        answered,
        difficulty: settings.difficulty,
        finishScore: settings.finishScore,
        isFinished: score >= settings.finishScore,
        mode: settings.mode,
        modeLabel: quizModeConfig[settings.mode].label,
        questionCount,
        score,
        choiceCount: Math.min(quizDifficultyChoices[settings.difficulty], pool.length),
      };
    },
  };
};

window.createLetterQuiz = createLetterQuiz;
window.quizModeConfig = quizModeConfig;
window.quizDifficultyChoices = quizDifficultyChoices;
