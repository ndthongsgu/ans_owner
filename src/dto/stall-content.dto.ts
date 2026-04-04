export type LanguageCode = "vi" | "en" | "zh" | "ja" | string;

export type StallContentCreateRequest = {
  stall_id: string;
  language_code?: LanguageCode;
  tts_script: string;
};

export type StallContentUpdateRequest = {
  language_code?: LanguageCode | null;
  tts_script?: string | null;
};

export type StallContentResponse = {
  id: string;
  stall_id: string;
  stall_name?: string | null;
  language_code: LanguageCode;
  audio_url: string;
  audio_duration?: number | null;
  audio_file_size?: number | null;
  tts_script?: string | null;
  is_deleted: boolean;
  created_at: number;
  updated_at?: number | null;
};

export type StallContentListResponse = {
  data: StallContentResponse[];
  total: number;
};

export type StallWithoutContentResponse = {
  stall_id: string;
  stall_name: string;
};

export type StallWithoutContentListResponse = {
  data: StallWithoutContentResponse[];
  total: number;
};
