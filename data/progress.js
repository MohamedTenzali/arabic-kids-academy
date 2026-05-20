const learningLevels = [
  {
    id: "beginner",
    name: "Beginner",
    locked: false,
    steps: [
      {
        id: "letters",
        title: "Letters",
        description: "Leer de Arabische letters rustig herkennen.",
        href: "letters.html",
      },
      {
        id: "letter-quiz",
        title: "Letter Quiz",
        description: "Luister goed en kies de juiste letter.",
        href: "quiz.html?mode=letters",
      },
      {
        id: "short-vowels",
        title: "Korte klanken",
        description: "Oefen fatha, kasra en damma per letter.",
        href: "vowels.html?type=short",
      },
      {
        id: "short-vowels-quiz",
        title: "Klanken Quiz",
        description: "Test fatha, kasra en damma met audio.",
        href: "quiz.html?mode=short",
      },
      {
        id: "long-vowels",
        title: "Lange klanken",
        description: "Oefen aa, ie en oe per letter.",
        href: "vowels.html?type=long",
      },
      {
        id: "long-vowels-quiz",
        title: "Lange klanken Quiz",
        description: "Test aa, ie en oe tot je genoeg punten hebt.",
        href: "quiz.html?mode=long",
      },
    ],
  },
  {
    id: "advanced",
    name: "Gevorderd",
    locked: true,
    steps: [],
  },
  {
    id: "expert",
    name: "Expert",
    locked: true,
    steps: [],
  },
];

const progressStorageKey = "arabicKidsAcademyProgress";
const defaultProgress = {
  selectedLevel: "",
  completedSteps: {},
};

const readProgress = () => {
  try {
    return {
      ...defaultProgress,
      ...JSON.parse(localStorage.getItem(progressStorageKey) || "{}"),
    };
  } catch {
    return { ...defaultProgress };
  }
};

const writeProgress = (progress) => {
  try {
    localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // Progress is helpful, but the app should still work if browser storage is blocked.
  }
};

const progressStore = {
  completeStep(levelId, stepId) {
    const progress = readProgress();
    const completed = new Set(progress.completedSteps[levelId] || []);

    completed.add(stepId);
    progress.completedSteps[levelId] = [...completed];
    progress.selectedLevel = progress.selectedLevel || levelId;
    writeProgress(progress);
  },

  getCompletedSteps(levelId) {
    return readProgress().completedSteps[levelId] || [];
  },

  getLevel(levelId) {
    return learningLevels.find((level) => level.id === levelId);
  },

  getSelectedLevel() {
    return readProgress().selectedLevel;
  },

  isStepComplete(levelId, stepId) {
    return this.getCompletedSteps(levelId).includes(stepId);
  },

  isStepUnlocked(level, stepIndex) {
    if (!level || level.locked) {
      return false;
    }

    const step = level.steps[stepIndex];

    if (!step) {
      return false;
    }

    if (["letters", "short-vowels", "long-vowels"].includes(step.id)) {
      return true;
    }

    const quizRequirements = {
      "letter-quiz": "letters",
      "short-vowels-quiz": "short-vowels",
      "long-vowels-quiz": "long-vowels",
    };
    const requiredStepId = quizRequirements[step.id];

    return requiredStepId ? this.isStepComplete(level.id, requiredStepId) : false;
  },

  getLevelProgress(levelId) {
    const level = this.getLevel(levelId);

    if (!level) {
      return {
        completed: 0,
        total: 0,
        percent: 0,
      };
    }

    const completed = level.steps.filter((step) => this.isStepComplete(level.id, step.id)).length;
    const total = level.steps.length;

    return {
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
    };
  },

  getStepStars(levelId, stepId) {
    return this.isStepComplete(levelId, stepId) ? 3 : 0;
  },

  getNextStep(levelId) {
    const level = this.getLevel(levelId);

    if (!level || level.locked) {
      return null;
    }

    return level.steps.find((step, index) => this.isStepUnlocked(level, index) && !this.isStepComplete(level.id, step.id)) || null;
  },

  selectLevel(levelId) {
    const level = this.getLevel(levelId);

    if (!level || level.locked) {
      return false;
    }

    const progress = readProgress();
    progress.selectedLevel = level.id;
    writeProgress(progress);
    return true;
  },
};

window.learningLevels = learningLevels;
window.progressStore = progressStore;
