export type LanguageCode = "vi" | "en" | "zh" | "ja" | "ko" | string;

export type StallContentCreateRequest = {
  stall_id: string;
  stall_name: string;
  tts_script: string;
};

export type StallContentUpdateRequest = {
  stall_id: string;
  stall_name: string;
  tts_script: string;
};

export type StallContentResponse = {
  id: string;
  stall_id: string;
  stall_name: string;
  language_code?: LanguageCode;
  audio_url: string;
  audio_duration?: number | null;
  audio_file_size?: number | null;
  tts_script: string;
  is_deleted: boolean;
  created_at: number;
  updated_at?: number | null;
};

export type StallContentListResponse = {
  data: StallContentResponse[];
  total: number;
};

export type StallWithoutContentResponse = {
  id: string;
  stall_name: string;
};
