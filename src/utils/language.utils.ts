import type { LanguageCode } from "@/dto/stall-content.dto";

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
  ja: "日本語",
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
    default:
      return "vi-VN";
  }
};
