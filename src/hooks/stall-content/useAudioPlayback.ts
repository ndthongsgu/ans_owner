import { useCallback, useRef } from "react";
import { API_ROUTES } from "@/services/api-route";

type ToastType = "success" | "error" | "info" | "warning";

type ShowToastFn = (options: {
  type: ToastType;
  title: string;
  message: string;
}) => void;

export const useAudioPlayback = (showToast: ShowToastFn) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // =============================
  // STOP
  // =============================
  const stopPlayback = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  // =============================
  // LANGUAGE
  // =============================
  const resolveSpeechLocale = useCallback((languageCode: string) => {
    const normalized = languageCode.trim().toLowerCase();
    if (normalized.startsWith("vi")) return "vi-VN";
    if (normalized.startsWith("en")) return "en-US";
    if (normalized.startsWith("zh")) return "zh-CN";
    if (normalized.startsWith("ja")) return "ja-JP";
    return normalized;
  }, []);

  // =============================
  // TEXT TO SPEECH
  // =============================
  const playScript = useCallback(
    (script: string, languageCode: string) => {
      const trimmed = script.trim();

      if (!trimmed) {
        showToast({
          type: "warning",
          title: "Không có script",
          message: "Nội dung script trống",
        });
        return;
      }

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        showToast({
          type: "warning",
          title: "Không hỗ trợ",
          message: "Trình duyệt không hỗ trợ TTS",
        });
        return;
      }

      stopPlayback();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = resolveSpeechLocale(languageCode);

      window.speechSynthesis.speak(utterance);
    },
    [resolveSpeechLocale, showToast, stopPlayback],
  );

  // =============================
  // FIX URL AUDIO (QUAN TRỌNG)
  // =============================
  const resolveAudioUrl = useCallback((audioUrl: string) => {
    if (!audioUrl) return "";

    const trimmed = audioUrl.trim();

    // full url
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    // BE trả "/audios/xxx.mp3"
    return `${API_ROUTES.BASE_URL}/${trimmed.replace(/^\/+/, "")}`;
  }, []);

  // =============================
  // PLAY AUDIO
  // =============================
  const playAudioUrl = useCallback(
    async (audioUrl: string) => {
      stopPlayback();

      const requestUrl = resolveAudioUrl(audioUrl);

      if (!requestUrl) {
        showToast({
          type: "warning",
          title: "URL sai",
          message: "Audio URL không hợp lệ",
        });
        return;
      }

      const audio = new Audio(requestUrl);
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
      };

      audio.onerror = () => {
        showToast({
          type: "error",
          title: "Audio lỗi",
          message: "Không thể phát file audio từ URL backend",
        });
      };

      try {
        await audio.play();
      } catch (error) {
        showToast({
          type: "error",
          title: "Phát audio thất bại",
          message:
            error instanceof Error ? error.message : "Không gọi được API",
        });
      }
    },
    [resolveAudioUrl, showToast, stopPlayback],
  );

  return {
    stopPlayback,
    playScript,
    playAudioUrl,
    resolveAudioUrl,
  };
};
