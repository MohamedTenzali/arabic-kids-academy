const createAudioPlayer = () => {
  const audioCache = new Map();
  const validationCache = new Map();
  let activeAudio = null;
  let activeButton = null;
  let activeSource = "";

  const defaultMessages = {
    idle: "Luister",
    loading: "Laden...",
    playing: "Speelt",
    missing: "Audio mist",
    blocked: "Tik nog een keer",
  };

  const setStatus = (button, message) => {
    const status = button?.querySelector("[data-audio-status]");

    if (status) {
      status.textContent = message;
    }
  };

  const setButtonState = (button, state, message) => {
    if (!button) {
      return;
    }

    button.classList.toggle("is-loading", state === "loading");
    button.classList.toggle("is-playing", state === "playing");
    button.classList.toggle("is-missing", state === "missing");
    button.setAttribute("aria-busy", state === "loading" ? "true" : "false");

    if (state !== "loading") {
      button.removeAttribute("aria-busy");
    }

    if (message) {
      setStatus(button, message);
    }
  };

  const normalizeAudioPath = (src) => {
    if (!src || typeof src !== "string") {
      return "";
    }

    return src.trim();
  };

  const validateAudioPath = (src) => {
    const normalizedSrc = normalizeAudioPath(src);

    if (validationCache.has(normalizedSrc)) {
      return validationCache.get(normalizedSrc);
    }

    let result = {
      ok: true,
      src: normalizedSrc,
      message: "",
    };

    if (!normalizedSrc) {
      result = {
        ok: false,
        src: "",
        message: defaultMessages.missing,
      };
    } else {
      try {
        const url = new URL(normalizedSrc, window.location.href);
        const allowedProtocol = url.protocol === "http:" || url.protocol === "https:";

        if (!allowedProtocol) {
          result = {
            ok: false,
            src: normalizedSrc,
            message: defaultMessages.missing,
          };
        }
      } catch {
        result = {
          ok: false,
          src: normalizedSrc,
          message: defaultMessages.missing,
        };
      }
    }

    validationCache.set(normalizedSrc, result);
    return result;
  };

  const getAudio = (src) => {
    const validation = validateAudioPath(src);

    if (!validation.ok) {
      return null;
    }

    if (!audioCache.has(validation.src)) {
      const audio = new Audio(validation.src);
      audio.preload = "none";
      audioCache.set(validation.src, audio);
    }

    return audioCache.get(validation.src);
  };

  const stopAudio = () => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }

    if (activeButton) {
      setButtonState(activeButton, "idle", defaultMessages.idle);
    }

    activeAudio = null;
    activeButton = null;
    activeSource = "";
  };

  const markMissing = (button, message = defaultMessages.missing) => {
    setButtonState(button, "missing", message);
  };

  const wireAudioEvents = (audio, src, button) => {
    audio.onwaiting = () => {
      if (activeAudio === audio) {
        setButtonState(button, "loading", defaultMessages.loading);
      }
    };

    audio.onplaying = () => {
      if (activeAudio === audio) {
        setButtonState(button, "playing", defaultMessages.playing);
      }
    };

    audio.onended = () => {
      if (activeAudio === audio) {
        stopAudio();
      }
    };

    audio.onerror = () => {
      if (activeAudio === audio || activeSource === src) {
        stopAudio();
        markMissing(button);
      }
    };
  };

  const playAudio = (src, options = {}) => {
    const button = options.button || null;
    const validation = validateAudioPath(src);

    if (!validation.ok) {
      stopAudio();
      markMissing(button);
      return Promise.resolve(false);
    }

    if (activeAudio && activeSource === validation.src) {
      stopAudio();
      return Promise.resolve(false);
    }

    stopAudio();

    const audio = getAudio(validation.src);

    if (!audio) {
      markMissing(button);
      return Promise.resolve(false);
    }

    activeAudio = audio;
    activeButton = button;
    activeSource = validation.src;
    audio.currentTime = 0;
    wireAudioEvents(audio, validation.src, button);
    setButtonState(button, "loading", defaultMessages.loading);

    return audio.play().then(
      () => {
        if (activeAudio === audio) {
          setButtonState(button, "playing", defaultMessages.playing);
        }

        return true;
      },
      (error) => {
        if (activeAudio === audio) {
          stopAudio();
          markMissing(
            button,
            error?.name === "NotAllowedError" ? defaultMessages.blocked : defaultMessages.missing,
          );
        }

        return false;
      },
    );
  };

  const preloadAudio = (src) => {
    const audio = getAudio(src);

    if (!audio) {
      return false;
    }

    audio.preload = "metadata";
    audio.load();
    return true;
  };

  return {
    play: (src, button) => playAudio(src, { button }),
    stop: stopAudio,
    playAudio,
    stopAudio,
    preloadAudio,
    validateAudioPath,
  };
};

window.audioPlayer = window.audioPlayer || createAudioPlayer();
window.playAudio = window.audioPlayer.playAudio;
window.stopAudio = window.audioPlayer.stopAudio;
window.preloadAudio = window.audioPlayer.preloadAudio;
window.validateAudioPath = window.audioPlayer.validateAudioPath;
