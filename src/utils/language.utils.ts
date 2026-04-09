import type { LanguageCode } from "@/dto/stall-content.dto";

export const LANGUAGE_CODE_MAP = {
  vi: "vi",
  en: "en",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
} as const;

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
};

export const resolveApiLanguageCode = (code: LanguageCode): string => {
  return LANGUAGE_CODE_MAP[code as keyof typeof LANGUAGE_CODE_MAP] || code;
};

export const resolveSpeechLocale = (code: LanguageCode) => {
  switch (code) {
    case "vi":
      return "vi-VN";
    case "en":
      return "en-US";
    case "zh":
      return "zh-CN";
    case "ja":
      return "ja-JP";
    case "ko":
      return "ko-KR";
    default:
      return "vi-VN";
  }
};
