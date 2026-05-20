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
        id: "short-vowels",
        title: "Korte klinkers",
        description: "Oefen fatha, kasra en damma per letter.",
        href: "vowels.html?type=short",
      },
      {
        id: "long-vowels",
        title: "Lange klinkers",
        description: "Oefen aa, ie en oe per letter.",
        href: "vowels.html?type=long",
      },
      {
        id: "mixed-quiz",
        title: "Mixed quiz",
        description: "Mix letters en klinkers tot je 20 punten haalt.",
        href: "quiz.html?mode=mixed",
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

    if (stepIndex === 0) {
      return true;
    }

    const previousStep = level.steps[stepIndex - 1];
    return this.isStepComplete(level.id, previousStep.id);
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
