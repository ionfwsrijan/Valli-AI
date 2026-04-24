import { useEffect, useRef, useState } from "react";

import {
  createSession,
  fetchReport,
  fetchSession,
  fetchSessions,
  fetchSpeechAudio,
  submitAnswer,
  submitVisionAirwayCapture,
  updateSessionLanguage,
  warmBackend,
} from "./api";
import { AirwayVisionCard } from "./components/AirwayVisionCard";
import { ConversationView } from "./components/ConversationView";
import { DashboardView } from "./components/DashboardView";
import { ReportView } from "./components/ReportView";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import {
  type AppLanguage,
  localizeQuestion,
  normalizeAnswerForSubmission,
  speechLocale,
  translateText,
  uiText,
} from "./localization";
import type {
  AssessmentView,
  DashboardItem,
  SessionReport,
  SessionSnapshot,
} from "./types";

const GREETING_MESSAGE =
  "Hello! I am the doctor guiding this assessment. You may use text or voice for taking the assessment.";
const DEFAULT_SPEECH_RATE = 0.95;
const MIN_SPEECH_RATE = 0.95;
const SLOW_SPEECH_STEP = 0;
const SPEECH_PITCH = 1.02;
const OPENAI_TTS_TIMEOUT_MS = 1600;
const SILENT_AUDIO_DATA_URL =
  "data:audio/wav;base64,UklGRigGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const LANGUAGE_STORAGE_KEY = "doctor-language";
const LEGACY_LANGUAGE_STORAGE_KEY = "valli-language";
const ACTIVE_SESSION_STORAGE_KEY = "doctor-active-session-id";
const LEGACY_ACTIVE_SESSION_STORAGE_KEY = "valli-active-session-id";
const DRAFT_STORAGE_PREFIX = "doctor-draft";
const LEGACY_DRAFT_STORAGE_PREFIX = "valli-draft";
const FEMININE_VOICE_HINTS = [
  "heera",
  "zira",
  "aria",
  "samantha",
  "serena",
  "female",
  "woman",
  "girl",
];

function isEnglishVoice(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().startsWith("en");
}

function isTamilVoice(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().startsWith("ta");
}

function isHindiVoice(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().startsWith("hi");
}

function isTeluguVoice(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().startsWith("te");
}

function isMalayalamVoice(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().startsWith("ml");
}

function isKannadaVoice(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().startsWith("kn");
}

function isIndianEnglishVoice(voice: SpeechSynthesisVoice) {
  return (
    voice.lang.toLowerCase().startsWith("en-in") ||
    voice.name.toLowerCase().includes("india")
  );
}

function isTamilIndianVoice(voice: SpeechSynthesisVoice) {
  return (
    voice.lang.toLowerCase().startsWith("ta-in") ||
    voice.name.toLowerCase().includes("tamil")
  );
}

function isHindiIndianVoice(voice: SpeechSynthesisVoice) {
  return (
    voice.lang.toLowerCase().startsWith("hi-in") ||
    voice.name.toLowerCase().includes("hindi")
  );
}

function isTeluguIndianVoice(voice: SpeechSynthesisVoice) {
  return (
    voice.lang.toLowerCase().startsWith("te-in") ||
    voice.name.toLowerCase().includes("telugu")
  );
}

function isMalayalamIndianVoice(voice: SpeechSynthesisVoice) {
  return (
    voice.lang.toLowerCase().startsWith("ml-in") ||
    voice.name.toLowerCase().includes("malayalam")
  );
}

function isKannadaIndianVoice(voice: SpeechSynthesisVoice) {
  return (
    voice.lang.toLowerCase().startsWith("kn-in") ||
    voice.name.toLowerCase().includes("kannada")
  );
}

function hasFeminineHint(voice: SpeechSynthesisVoice) {
  const haystack = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  return FEMININE_VOICE_HINTS.some((hint) => haystack.includes(hint));
}

function pickPreferredDoctorVoice(
  voices: SpeechSynthesisVoice[],
  language: AppLanguage,
) {
  if (language === "ta") {
    return (
      voices.find(
        (voice) => hasFeminineHint(voice) && isTamilIndianVoice(voice),
      ) ??
      voices.find((voice) => hasFeminineHint(voice) && isTamilVoice(voice)) ??
      voices.find((voice) => isTamilIndianVoice(voice)) ??
      voices.find((voice) => isTamilVoice(voice)) ??
      voices.find(
        (voice) => hasFeminineHint(voice) && isIndianEnglishVoice(voice),
      ) ??
      voices.find((voice) => isIndianEnglishVoice(voice)) ??
      null
    );
  }

  if (language === "hi") {
    return (
      voices.find(
        (voice) => hasFeminineHint(voice) && isHindiIndianVoice(voice),
      ) ??
      voices.find((voice) => hasFeminineHint(voice) && isHindiVoice(voice)) ??
      voices.find((voice) => isHindiIndianVoice(voice)) ??
      voices.find((voice) => isHindiVoice(voice)) ??
      voices.find(
        (voice) => hasFeminineHint(voice) && isIndianEnglishVoice(voice),
      ) ??
      voices.find((voice) => isIndianEnglishVoice(voice)) ??
      null
    );
  }

  if (language === "te") {
    return (
      voices.find(
        (voice) => hasFeminineHint(voice) && isTeluguIndianVoice(voice),
      ) ??
      voices.find((voice) => hasFeminineHint(voice) && isTeluguVoice(voice)) ??
      voices.find((voice) => isTeluguIndianVoice(voice)) ??
      voices.find((voice) => isTeluguVoice(voice)) ??
      voices.find(
        (voice) => hasFeminineHint(voice) && isIndianEnglishVoice(voice),
      ) ??
      voices.find((voice) => isIndianEnglishVoice(voice)) ??
      null
    );
  }

  if (language === "ml") {
    return (
      voices.find(
        (voice) => hasFeminineHint(voice) && isMalayalamIndianVoice(voice),
      ) ??
      voices.find((voice) => hasFeminineHint(voice) && isMalayalamVoice(voice)) ??
      voices.find((voice) => isMalayalamIndianVoice(voice)) ??
      voices.find((voice) => isMalayalamVoice(voice)) ??
      voices.find(
        (voice) => hasFeminineHint(voice) && isIndianEnglishVoice(voice),
      ) ??
      voices.find((voice) => isIndianEnglishVoice(voice)) ??
      null
    );
  }

  if (language === "kn") {
    return (
      voices.find(
        (voice) => hasFeminineHint(voice) && isKannadaIndianVoice(voice),
      ) ??
      voices.find((voice) => hasFeminineHint(voice) && isKannadaVoice(voice)) ??
      voices.find((voice) => isKannadaIndianVoice(voice)) ??
      voices.find((voice) => isKannadaVoice(voice)) ??
      voices.find(
        (voice) => hasFeminineHint(voice) && isIndianEnglishVoice(voice),
      ) ??
      voices.find((voice) => isIndianEnglishVoice(voice)) ??
      null
    );
  }

  return (
    voices.find(
      (voice) => hasFeminineHint(voice) && isIndianEnglishVoice(voice),
    ) ??
    voices.find((voice) => hasFeminineHint(voice) && isEnglishVoice(voice)) ??
    voices.find((voice) => hasFeminineHint(voice)) ??
    voices.find((voice) => isIndianEnglishVoice(voice)) ??
    voices.find((voice) => isEnglishVoice(voice)) ??
    null
  );
}

function spokenText(message: string) {
  return message
    .replace(/^Hospital policy guidance:\s*/i, "")
    .replace(/\s*Source:\s*[^.]+\.?$/i, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function draftStorageKey(sessionId: string, questionId: string) {
  return `${DRAFT_STORAGE_PREFIX}:${sessionId}:${questionId}`;
}

function legacyDraftStorageKey(sessionId: string, questionId: string) {
  return `${LEGACY_DRAFT_STORAGE_PREFIX}:${sessionId}:${questionId}`;
}

function joinOptionsForSpeech(options: string[], language: AppLanguage) {
  if (!options.length) {
    return "";
  }

  if (options.length === 1) {
    return options[0];
  }

  const conjunction =
    language === "ta"
      ? "அல்லது"
      : language === "hi"
        ? "या"
        : language === "te"
          ? "లేదా"
          : language === "ml"
            ? "അല്ലെങ്കിൽ"
            : language === "kn"
              ? "ಅಥವಾ"
              : "or";

  if (options.length === 2) {
    return `${options[0]} ${conjunction} ${options[1]}`;
  }

  return `${options.slice(0, -1).join(", ")}, ${conjunction} ${options.at(-1)}`;
}

function buildRephrasedPrompt(
  question: ReturnType<typeof localizeQuestion>,
  inputType: string | undefined,
  language: AppLanguage,
) {
  if (!question) {
    return "";
  }

  const basePrompt = [question.text, question.helperText]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!question.options.length) {
    return basePrompt;
  }

  if (inputType === "boolean") {
    return `${basePrompt} ${translateText(
      "Please answer yes or no.",
      language,
    )}`.trim();
  }

  const optionsSummary = joinOptionsForSpeech(
    question.options.map((option) => option.label),
    language,
  );

  return `${basePrompt} ${translateText(
    "Please choose the option that fits best.",
    language,
  )} ${translateText("Your options are:", language)} ${optionsSummary}.`.trim();
}

export default function App() {
  const [view, setView] = useState<AssessmentView>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    const savedLanguage =
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY);
    return savedLanguage === "ta" ||
      savedLanguage === "hi" ||
      savedLanguage === "te" ||
      savedLanguage === "ml" ||
      savedLanguage === "kn"
      ? savedLanguage
      : "en";
  });
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [dashboard, setDashboard] = useState<DashboardItem[]>([]);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [visionBusy, setVisionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechRate, setSpeechRate] = useState(DEFAULT_SPEECH_RATE);
  const [resumableSession, setResumableSession] = useState<SessionSnapshot | null>(
    null,
  );
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const speechRequestIdRef = useRef(0);

  const speech = useSpeechRecognition(speechLocale(language));
  const labels = uiText(language);
  const t = (text: string) => translateText(text, language);

  const getQuestionPrompt = (question: SessionSnapshot["current_question"]) =>
    question?.prompt_text ?? question?.text ?? "";
  const currentQuestionId = session?.current_question?.id ?? null;
  const localizedCurrentQuestion = localizeQuestion(
    session?.current_question ?? null,
    language,
  );
  const currentPromptForSpeech =
    localizedCurrentQuestion?.promptText ||
    translateText(getQuestionPrompt(session?.current_question ?? null), language);
  const localizedResumableQuestion = localizeQuestion(
    resumableSession?.current_question ?? null,
    language,
  );
  const resumablePrompt =
    localizedResumableQuestion?.text ||
    (resumableSession?.status === "awaiting_exam"
      ? labels.resumeCameraExam
      : null);
  const resumableHeading = resumableSession
    ? resumableSession.status === "awaiting_exam"
      ? labels.resumeCameraExam
      : labels.nextQuestion
    : null;

  useEffect(() => {
    void refreshDashboard();
    void hydrateResumableSession();
    void warmBackend().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    window.localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY);
  }, [language]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    const syncVoices = () => {
      const nextVoices = synth.getVoices();
      if (nextVoices.length) {
        setAvailableVoices(nextVoices);
      }
    };

    syncVoices();
    synth.addEventListener("voiceschanged", syncVoices);

    return () => {
      synth.removeEventListener("voiceschanged", syncVoices);
    };
  }, []);

  useEffect(() => {
    if (!speech.transcript) {
      return;
    }
    setDraftAnswer(speech.transcript);
  }, [speech.transcript]);

  useEffect(() => {
    speech.resetTranscript();
    speech.stopListening();
    if (
      typeof window === "undefined" ||
      !session?.session_id ||
      !currentQuestionId
    ) {
      setDraftAnswer("");
      return;
    }

    setDraftAnswer(
      window.localStorage.getItem(
        draftStorageKey(session.session_id, currentQuestionId),
      ) ??
        window.localStorage.getItem(
          legacyDraftStorageKey(session.session_id, currentQuestionId),
        ) ??
        "",
    );
  }, [currentQuestionId, session?.session_id]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !session?.session_id ||
      !currentQuestionId
    ) {
      return;
    }

    const key = draftStorageKey(session.session_id, currentQuestionId);
    if (draftAnswer.trim()) {
      window.localStorage.setItem(key, draftAnswer);
      window.localStorage.removeItem(
        legacyDraftStorageKey(session.session_id, currentQuestionId),
      );
      return;
    }

    window.localStorage.removeItem(key);
    window.localStorage.removeItem(
      legacyDraftStorageKey(session.session_id, currentQuestionId),
    );
  }, [currentQuestionId, draftAnswer, session?.session_id]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedSessionId = window.localStorage.getItem(
      ACTIVE_SESSION_STORAGE_KEY,
    ) ?? window.localStorage.getItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);

    if (session && session.status !== "completed") {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.session_id);
      window.localStorage.removeItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);
      setResumableSession(session);
      return;
    }

    if (
      session?.status === "completed" &&
      storedSessionId === session.session_id
    ) {
      window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);
      setResumableSession((current) =>
        current?.session_id === session.session_id ? null : current,
      );
    }
  }, [session]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;

    if (mobileMenuOpen) {
      body.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    return () => {
      speechRequestIdRef.current += 1;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const refreshDashboard = async () => {
    try {
      const items = await fetchSessions();
      setDashboard(items);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load dashboard",
      );
    }
  };

  const hydrateResumableSession = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const storedSessionId = window.localStorage.getItem(
      ACTIVE_SESSION_STORAGE_KEY,
    ) ?? window.localStorage.getItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);
    if (!storedSessionId) {
      return;
    }

    try {
      const savedSession = await fetchSession(storedSessionId);
      if (savedSession.status === "completed") {
        window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);
        setResumableSession(null);
        return;
      }

      setResumableSession(savedSession);
    } catch {
      window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);
      setResumableSession(null);
    }
  };

  const questionnaireComplete = Boolean(session && !session.current_question);
  const needsCameraExam = session?.status === "awaiting_exam";
  const navOptions: { id: AssessmentView; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "assessment", label: "Assessment" },
    ...(report ? [{ id: "report" as AssessmentView, label: "Report" }] : []),
    { id: "records", label: "Records" },
  ];

  const clearAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const primeAudioPlayback = async () => {
    try {
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.setAttribute("playsinline", "true");
      audio.preload = "auto";
      audio.muted = true;
      audio.src = SILENT_AUDIO_DATA_URL;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audio.src = "";
    } catch {
      // Ignore priming failures; the normal audio/fallback path still runs.
    }
  };

  const stopAssistantSpeech = () => {
    speechRequestIdRef.current += 1;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    clearAudioPlayback();
  };

  const speakEntriesWithBrowser = (
    lines: string[],
    rate: number,
    languageOverride: AppLanguage = language,
  ) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    const selectedVoice = pickPreferredDoctorVoice(
      availableVoices.length ? availableVoices : synth.getVoices(),
      languageOverride,
    );

    synth.cancel();
    lines.forEach((message) => {
      const utterance = new SpeechSynthesisUtterance(message);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = speechLocale(languageOverride);
      }
      utterance.rate = rate;
      utterance.pitch = SPEECH_PITCH;
      synth.speak(utterance);
    });
  };

  const speakEntries = async (
    messages: string[],
    options: { force?: boolean; rate?: number; languageOverride?: AppLanguage } = {},
  ) => {
    const { force = false, rate = speechRate, languageOverride = language } = options;
    if (!autoSpeak && !force) {
      return;
    }

    const lines = messages
      .map((message) => translateText(spokenText(message), languageOverride))
      .filter(Boolean);
    if (!lines.length) {
      return;
    }

    const requestId = speechRequestIdRef.current + 1;
    speechRequestIdRef.current = requestId;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    clearAudioPlayback();

    try {
      const audioBlob = await Promise.race([
        fetchSpeechAudio(lines.join("\n\n"), languageOverride),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("tts_timeout")), OPENAI_TTS_TIMEOUT_MS);
        }),
      ]);
      if (speechRequestIdRef.current !== requestId) {
        return;
      }

      const objectUrl = URL.createObjectURL(audioBlob);
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.setAttribute("playsinline", "true");
      audio.preload = "auto";
      audioUrlRef.current = objectUrl;
      audio.src = objectUrl;
      audio.onended = () => {
        if (audioUrlRef.current === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          audioUrlRef.current = null;
        }
      };
      audio.onerror = () => {
        if (audioUrlRef.current === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          audioUrlRef.current = null;
        }
      };
      await audio.play();
      return;
    } catch {
      if (speechRequestIdRef.current !== requestId) {
        return;
      }
      clearAudioPlayback();
      speakEntriesWithBrowser(lines, rate, languageOverride);
    }
  };

  const handleRepeatPrompt = () => {
    if (!currentPromptForSpeech) {
      return;
    }

    void (async () => {
      await primeAudioPlayback();
      await speakEntries(["I'll say that again.", currentPromptForSpeech], {
        force: true,
      });
    })();
  };

  const handleLanguageChange = async (nextLanguage: AppLanguage) => {
    if (nextLanguage === language) {
      return;
    }

    const previousLanguage = language;
    setLanguage(nextLanguage);
    speech.stopListening();
    speech.resetTranscript();
    stopAssistantSpeech();
    setError(null);

    if (!session || session.status === "completed") {
      return;
    }

    try {
      const updated = await updateSessionLanguage(session.session_id, nextLanguage);
      setSession(updated);
      setResumableSession((current) =>
        current?.session_id === updated.session_id ? updated : current,
      );

      const localizedPrompt = localizeQuestion(
        updated.current_question,
        nextLanguage,
      )?.promptText;
      if (localizedPrompt) {
        await primeAudioPlayback();
        void speakEntries([localizedPrompt], {
          force: true,
          languageOverride: nextLanguage,
        });
      }
    } catch (requestError) {
      setLanguage(previousLanguage);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update the assessment language",
      );
    }
  };

  const handleRephrasePrompt = () => {
    const rephrasedPrompt = buildRephrasedPrompt(
      localizedCurrentQuestion,
      session?.current_question?.input_type,
      language,
    );

    if (!rephrasedPrompt) {
      return;
    }

    void (async () => {
      await primeAudioPlayback();
      await speakEntries(["Let me say that more simply.", rephrasedPrompt], {
        force: true,
      });
    })();
  };

  const handleSlowDownPrompt = () => {
    if (!currentPromptForSpeech) {
      return;
    }

    const nextRate = Math.max(
      MIN_SPEECH_RATE,
      Number((speechRate - SLOW_SPEECH_STEP).toFixed(2)),
    );

    setSpeechRate(nextRate);
    void (async () => {
      await primeAudioPlayback();
      await speakEntries(["Sure, I'll slow down.", currentPromptForSpeech], {
        force: true,
        rate: nextRate,
      });
    })();
  };

  const startAssessment = async () => {
    setMobileMenuOpen(false);
    setBusy(true);
    setError(null);
    setVisionError(null);
    setDraftAnswer("");
    setReport(null);
    setSession(null);
    setView("assessment");
    stopAssistantSpeech();
    await primeAudioPlayback();
    void speakEntries([GREETING_MESSAGE], {
      force: true,
      languageOverride: language,
    });

    try {
      await warmBackend().catch(() => undefined);
      const created = await createSession(language);
      setSession(created);
      void speakEntries([getQuestionPrompt(created.current_question)], {
        force: true,
        languageOverride: language,
      });
      await refreshDashboard();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to start assessment",
      );
    } finally {
      setBusy(false);
    }
  };

  const resumeAssessment = async () => {
    const resumableSessionId = resumableSession?.session_id;
    if (!resumableSessionId) {
      return;
    }

    setMobileMenuOpen(false);
    setBusy(true);
    setError(null);
    setVisionError(null);
    setReport(null);
    stopAssistantSpeech();
    await primeAudioPlayback();

    try {
      const resumed = await fetchSession(resumableSessionId);
      if (resumed.status === "completed") {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
          window.localStorage.removeItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);
        }
        setResumableSession(null);
        return;
      }

      setSession(resumed);
      setView(resumed.status === "awaiting_exam" ? "camera" : "assessment");

      if (resumed.current_question) {
        void speakEntries([getQuestionPrompt(resumed.current_question)], {
          force: true,
        });
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to resume assessment",
      );
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_ACTIVE_SESSION_STORAGE_KEY);
      }
      setResumableSession(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (overrideAnswer?: string) => {
    const answerText = normalizeAnswerForSubmission(
      session?.current_question ?? null,
      overrideAnswer ?? draftAnswer,
      language,
    ).trim();
    if (!session || !answerText) {
      return;
    }

    const priorTranscriptLength = session.transcript.length;
    speech.stopListening();
    stopAssistantSpeech();
    setBusy(true);
    setError(null);

    try {
      const updated = await submitAnswer(
        session.session_id,
        answerText,
      );
      setSession(updated);
      setDraftAnswer("");
      speech.resetTranscript();
      await refreshDashboard();

      const nextAiMessages = updated.transcript
        .slice(priorTranscriptLength)
        .filter((entry) => entry.speaker === "ai")
        .map((entry) => entry.message);

      if (updated.status === "awaiting_exam") {
        setView("camera");
      } else if (updated.status === "completed") {
        const reportData = await fetchReport(updated.session_id);
        setReport(reportData);
        setView("report");
      }

      if (nextAiMessages.length) {
        void speakEntries(nextAiMessages);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save response",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVisionCapture = async (
    captureType: "frontal" | "profile",
    imageDataUrl: string,
  ) => {
    if (!session) {
      return;
    }

    setVisionBusy(true);
    setVisionError(null);

    try {
      const updated = await submitVisionAirwayCapture(
        session.session_id,
        captureType,
        imageDataUrl,
      );
      setSession(updated);
      await refreshDashboard();

      if (updated.status === "completed") {
        const reportData = await fetchReport(updated.session_id);
        setReport(reportData);
        setView("report");
      }
    } catch (requestError) {
      setVisionError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze airway image",
      );
    } finally {
      setVisionBusy(false);
    }
  };

  const openReportForSession = async (sessionId: string) => {
    setMobileMenuOpen(false);
    setBusy(true);
    setError(null);

    try {
      const [reportData, sessionData] = await Promise.all([
        fetchReport(sessionId),
        fetchSession(sessionId),
      ]);
      setReport(reportData);
      setSession(sessionData);
      if (sessionData.status === "completed") {
        setView("report");
      } else if (!sessionData.current_question) {
        setView("camera");
      } else {
        setView("assessment");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to open report",
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleListening = () => {
    if (speech.isListening) {
      speech.stopListening();
      return;
    }
    stopAssistantSpeech();
    speech.startListening();
  };

  const handleToggleAutoSpeak = () => {
    setAutoSpeak((current) => {
      const next = !current;
      if (!next) {
        stopAssistantSpeech();
      }
      const prompt = getQuestionPrompt(session?.current_question ?? null);
      if (next && prompt) {
        void speakEntries([prompt], { force: true });
      }
      return next;
    });
  };

  const printWithMode = (mode: "report" | "transcript") => {
    document.body.dataset.printMode = mode;
    const reset = () => {
      delete document.body.dataset.printMode;
      window.removeEventListener("afterprint", reset);
    };

    window.addEventListener("afterprint", reset);
    window.print();
    window.setTimeout(reset, 500);
  };

  return (
    <main className="app-shell">
      <section className="toolbar">
        <div className="mobile-toolbar">
          <div aria-hidden="true" className="mobile-brand-spacer" />
          <button
            aria-expanded={mobileMenuOpen}
            aria-label="Open navigation menu"
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className="nav-pills">
          {navOptions.map((option) => (
            <button
              className={
                view === option.id ||
                (view === "camera" && option.id === "assessment")
                  ? "nav-pill active"
                  : "nav-pill"
              }
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
            >
              {option.id === "home"
                ? labels.home
                : option.id === "assessment"
                  ? labels.assessment
                  : option.id === "report"
                    ? labels.report
                    : labels.records}
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <label className="language-toggle" htmlFor="language-select">
            <span className="language-label">{labels.language}</span>
            <select
              className="language-select"
              id="language-select"
              value={language}
              onChange={(event) =>
                void handleLanguageChange(event.target.value as AppLanguage)
              }
            >
              <option value="en">{labels.english}</option>
              <option value="ta">{labels.tamil}</option>
              <option value="hi">{labels.hindi}</option>
              <option value="te">{labels.telugu}</option>
              <option value="ml">{labels.malayalam}</option>
              <option value="kn">{labels.kannada}</option>
            </select>
          </label>
          <button
            className="primary-button"
            type="button"
            onClick={startAssessment}
            disabled={busy}
          >
            {labels.newAssessment}
          </button>
        </div>
      </section>

      {mobileMenuOpen ? (
        <div
          className="mobile-drawer-backdrop"
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            aria-label="Mobile navigation"
            className="mobile-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-drawer-head">
              <h2>Navigation</h2>
              <button
                aria-label="Close navigation menu"
                className="mobile-drawer-close"
                type="button"
                onClick={() => setMobileMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mobile-drawer-section mobile-drawer-nav">
              {navOptions.map((option) => (
                <button
                  className={
                    view === option.id ||
                    (view === "camera" && option.id === "assessment")
                      ? "nav-pill active"
                      : "nav-pill"
                  }
                  key={`mobile-${option.id}`}
                  type="button"
                  onClick={() => {
                    setView(option.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {option.id === "home"
                    ? labels.home
                    : option.id === "assessment"
                      ? labels.assessment
                      : option.id === "report"
                        ? labels.report
                        : labels.records}
                </button>
              ))}
            </div>

            <div className="mobile-drawer-section">
              <label className="language-toggle" htmlFor="mobile-language-select">
                <span className="language-label">{labels.language}</span>
                <select
                  className="language-select"
                  id="mobile-language-select"
                  value={language}
                  onChange={(event) =>
                    void handleLanguageChange(event.target.value as AppLanguage)
                  }
                >
                  <option value="en">{labels.english}</option>
                  <option value="ta">{labels.tamil}</option>
                  <option value="hi">{labels.hindi}</option>
                  <option value="te">{labels.telugu}</option>
                  <option value="ml">{labels.malayalam}</option>
                  <option value="kn">{labels.kannada}</option>
                </select>
              </label>
            </div>

            <div className="mobile-drawer-section">
              <button
                className="primary-button mobile-drawer-button"
                type="button"
                onClick={startAssessment}
                disabled={busy}
              >
                {labels.newAssessment}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {view === "home" ? (
        <section className="hero-shell">
          <div className="hero-copy">
            <div className="hero-kicker-row">
              <span className="eyebrow">{t("Doctor")}</span>
              <span className="hero-chip">{t("Pre-Anesthetic Assessment")}</span>
            </div>
            <h1>{t("AI assisted pre operative assessment.")}</h1>
            <p>{t("Conduct the patient interview, complete the camera-based airway examination, and generate the final assessment report from one streamlined workflow.")}</p>
            <div className="hero-actions">
              {resumablePrompt ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={resumeAssessment}
                  disabled={busy}
                >
                  {labels.resumeAssessment}
                </button>
              ) : null}
              <button
                className="primary-button hero-primary"
                type="button"
                onClick={startAssessment}
                disabled={busy}
              >
                {labels.launchNewAssessment}
              </button>
              <button
                className="ghost-button hero-ghost"
                type="button"
                onClick={() => setView("records")}
              >
                {labels.openRecords}
              </button>
            </div>
            <div className="hero-metrics">
              <article className="hero-metric-card">
                <span>{t("Interview")}</span>
                <strong>{t("Guided patient intake")}</strong>
                <p>{t("Collect the full pre-anesthetic history with text or voice input.")}</p>
              </article>
              <article className="hero-metric-card">
                <span>{t("Camera")}</span>
                <strong>{t("Airway examination")}</strong>
                <p>{t("Capture the frontal and side-profile views after the questionnaire is complete.")}</p>
              </article>
              <article className="hero-metric-card">
                <span>{t("Report")}</span>
                <strong>{t("Printable final summary")}</strong>
                <p>{t("Review the transcript, camera findings, and final report in one place.")}</p>
              </article>
            </div>
          </div>

          <div className="hero-summary">
            <div className="hero-summary-header">
              <p className="eyebrow">{t("Workflow")}</p>
              <h2>{t("Move from intake to camera examination to final report.")}</h2>
            </div>

            <div className="hero-summary-grid">
              <div className="summary-card">
                <span>{t("Assessment")}</span>
                <strong>{t("Patient questionnaire")}</strong>
                <p>{t("Answer the interview questions in sequence and capture the full transcript.")}</p>
              </div>
              <div className="summary-card">
                <span>{t("Camera")}</span>
                <strong>{t("Dedicated airway page")}</strong>
                <p>{t("Switch to the camera page after the questionnaire for the image-based examination.")}</p>
              </div>
              <div className="summary-card">
                <span>{t("Report")}</span>
                <strong>{t("Separated findings")}</strong>
                <p>{t("Review the transcript and camera findings separately in the final report.")}</p>
              </div>
              <div className="summary-card">
                <span>{t("Records")}</span>
                <strong>{t("Completed assessments only")}</strong>
                <p>{t("Open previously completed reports from the records page.")}</p>
              </div>
            </div>

            <div className="hero-rail">
              <article className="hero-rail-item">
                <span className="hero-rail-index">01</span>
                <div>
                  <strong>{t("Assessment")}</strong>
                  <p>{t("Start the interview and complete the patient questionnaire.")}</p>
                </div>
              </article>
              <article className="hero-rail-item">
                <span className="hero-rail-index">02</span>
                <div>
                  <strong>{t("Camera")}</strong>
                  <p>{t("Move to the separate camera page for the airway examination.")}</p>
                </div>
              </article>
              <article className="hero-rail-item">
                <span className="hero-rail-index">03</span>
                <div>
                  <strong>{t("Report")}</strong>
                  <p>{t("Generate and print the final transcript and report after completion.")}</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      ) : null}

      {view === "assessment" ? (
        <section className="workspace-stack">
          <section className="panel page-intro">
            <div>
              <p className="eyebrow">Assessment</p>
              <h2>Patient questionnaire</h2>
              <p className="page-copy">
                Complete the patient interview here. After the questionnaire is
                finished, you will move to the camera page for the airway
                examination.
              </p>
              <p className="helper-text">
                {t("The doctor's spoken voice is AI-generated.")}
              </p>
            </div>
          </section>

          <section
            className={
              questionnaireComplete ? "workspace-single" : "workspace-grid"
            }
          >
            <ConversationView
              autoSpeak={autoSpeak}
              busy={busy}
              draftAnswer={draftAnswer}
              error={error || speech.error}
              isListening={speech.isListening}
              isSpeechSupported={speech.isSupported}
              labels={labels}
              localizedQuestion={localizedCurrentQuestion}
              needsCameraExam={needsCameraExam}
              resumablePrompt={resumablePrompt}
              resumableHeading={resumableHeading}
              session={session}
              onDraftChange={setDraftAnswer}
              onQuickAnswer={handleSubmit}
              onStart={startAssessment}
              onResume={resumeAssessment}
              onSubmit={handleSubmit}
              onRepeatPrompt={handleRepeatPrompt}
              onRephrasePrompt={handleRephrasePrompt}
              onSlowDownPrompt={handleSlowDownPrompt}
              onToggleAutoSpeak={handleToggleAutoSpeak}
              onToggleListening={toggleListening}
              translateAiMessage={(message) => translateText(message, language)}
            />
          </section>
        </section>
      ) : null}

      {view === "camera" ? (
        <section className="workspace-stack">
          <section className="panel page-intro">
            <div>
              <p className="eyebrow">Camera</p>
              <h2>Camera airway examination</h2>
              <p className="page-copy">
                Capture the frontal and side-profile images here. Each view is
                assessed separately and included separately in the transcript
                and the final report.
              </p>
            </div>
          </section>
          <AirwayVisionCard
            busy={busy}
            session={session}
            visionBusy={visionBusy}
            visionError={visionError}
            onAnalyzeCapture={handleVisionCapture}
          />
        </section>
      ) : null}

      {view === "report" ? (
        <ReportView
          report={report}
          onPrintReport={() => printWithMode("report")}
          onPrintTranscript={() => printWithMode("transcript")}
        />
      ) : null}

      {view === "records" ? (
        <DashboardView
          items={dashboard}
          onOpenReport={openReportForSession}
          onRefresh={refreshDashboard}
        />
      ) : null}
    </main>
  );
}
