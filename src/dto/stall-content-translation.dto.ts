export type LanguageCode = "vi" | "en" | "zh" | "ja" | string;

export type StallContentTranslationBase = {
  stall_content_id: string;
  language_code: LanguageCode;
  audio_url: string;
  tts_script?: string | null;
};

export type StallContentTranslationCreateRequest = StallContentTranslationBase;

export type StallContentTranslationUpdateRequest =
  Partial<StallContentTranslationCreateRequest>;

export type StallContentTranslationResponse = StallContentTranslationBase & {
  id: string;
  created_at?: number;
  updated_at?: number;
};

// Layer aliases: use *Item in UI layer and *Res in service/API layer.
export type StallContentTranslationCreateReq =
  StallContentTranslationCreateRequest;
export type StallContentTranslationUpdateReq =
  StallContentTranslationUpdateRequest;
export type StallContentTranslationRes = StallContentTranslationResponse;
export type StallContentTranslationItem = StallContentTranslationResponse;
