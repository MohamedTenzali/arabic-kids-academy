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
        requires: "letters",
      },
      {
        id: "short-vowels",
        title: "Korte Klanken",
        description: "Oefen fatha, kasra en damma per letter.",
        href: "vowels.html?type=short",
      },
      {
        id: "short-vowels-quiz",
        title: "Klanken Quiz",
        description: "Test fatha, kasra en damma met audio.",
        href: "quiz.html?mode=short",
        requires: "short-vowels",
      },
      {
        id: "long-vowels",
        title: "Lange Klanken",
        description: "Oefen aa, ie en oe per letter.",
        href: "vowels.html?type=long",
      },
      {
        id: "long-vowels-quiz",
        title: "Lange Klanken Quiz",
        description: "Test aa, ie en oe tot je genoeg punten hebt.",
        href: "quiz.html?mode=long",
        requires: "long-vowels",
      },
    ],
  },
  {
    id: "advanced",
    name: "Gevorderd",
    locked: false,
    steps: [
      {
        id: "short-vowels",
        title: "Korte klanken",
        description: "Oefen fatha, kasra en damma als niveau 2.",
        href: "vowels.html?type=short&level=advanced",
      },
      {
        id: "short-vowels-quiz",
        title: "Korte klanken Quiz",
        description: "Luister goed en verbeter je korte klanken.",
        href: "quiz.html?mode=short&level=advanced",
        requires: "short-vowels",
      },
      {
        id: "long-vowels",
        title: "Lange klanken",
        description: "Oefen aa, ie en oe met elke letter.",
        href: "vowels.html?type=long&level=advanced",
        requires: "short-vowels-quiz",
      },
      {
        id: "long-vowels-quiz",
        title: "Lange klanken Quiz",
        description: "Test de lange klanken tot het soepel gaat.",
        href: "quiz.html?mode=long&level=advanced",
        requires: "long-vowels",
      },
      {
        id: "mixed-quiz",
        title: "Mix Quiz",
        description: "Mix letters, korte klanken en lange klanken.",
        href: "quiz.html?mode=mixed&level=advanced",
        requires: "long-vowels-quiz",
      },
    ],
  },
  {
    id: "expert",
    name: "Expert",
    locked: false,
    steps: [
      {
        id: "mixed-quiz",
        title: "Mix Quiz",
        description: "Ga direct naar level 5 en mix letters met alle klanken.",
        href: "quiz.html?mode=mixed&level=expert",
        levelNumber: 5,
      },
    ],
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
    const level = learningLevels.find((item) => item.id === levelId);

    return level ? { ...level, locked: this.isLevelLocked(level) } : undefined;
  },

  getSelectedLevel() {
    return readProgress().selectedLevel;
  },

  isLevelLocked(levelOrId) {
    const level = typeof levelOrId === "string"
      ? learningLevels.find((item) => item.id === levelOrId)
      : levelOrId;

    if (!level) {
      return true;
    }

    if (!level.locked) {
      return false;
    }

    const requirement = level.unlockRequirement;

    if (!requirement) {
      return true;
    }

    return !this.isStepComplete(requirement.levelId, requirement.stepId);
  },

  isStepComplete(levelId, stepId) {
    return this.getCompletedSteps(levelId).includes(stepId);
  },

  isStepUnlocked(level, stepIndex) {
    if (!level || this.isLevelLocked(level)) {
      return false;
    }

    const step = level.steps[stepIndex];

    if (!step) {
      return false;
    }

    const requirements = Array.isArray(step.requires)
      ? step.requires
      : step.requires
        ? [step.requires]
        : [];

    return requirements.length
      ? requirements.every((requiredStepId) => this.isStepComplete(level.id, requiredStepId))
      : true;
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
