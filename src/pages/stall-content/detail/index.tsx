import { SoundOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import type { StallContentResponse } from "@/dto/stall-content.dto";
import { useToast } from "@/hooks/layout/useToast";
import { useAudioPlayback } from "@/hooks/stall-content/useAudioPlayback";
import { useListenStallContentByLanguage } from "@/hooks/stall-content";

const { Text } = Typography;

const extractPlayableStallContent = (payload: unknown) => {
  const parseObject = (
    source: unknown,
  ): { script: string | null; audioUrl: string | null } => {
    if (Array.isArray(source)) {
      for (const item of source) {
        const parsed = parseObject(item);
        if (parsed.script || parsed.audioUrl) {
          return parsed;
        }
      }

      return { script: null, audioUrl: null };
    }

    if (!source || typeof source !== "object") {
      return { script: null, audioUrl: null };
    }

    const sourceObj = source as Record<string, unknown>;
    const directScript = [
      sourceObj.tts_script,
      sourceObj.script,
      sourceObj.text,
      sourceObj.content,
      sourceObj.ttsScript,
    ].find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    const directAudio = [
      sourceObj.audio_url,
      sourceObj.audioUrl,
      sourceObj.url,
      sourceObj.audio,
    ].find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );

    if (directScript || directAudio) {
      return {
        script: directScript || null,
        audioUrl: directAudio || null,
      };
    }

    const nestedCandidates = [
      sourceObj.data,
      sourceObj.items,
      sourceObj.result,
      sourceObj.stall_content,
      sourceObj.payload,
      sourceObj.content,
    ];

    for (const candidate of nestedCandidates) {
      const parsed = parseObject(candidate);
      if (parsed.script || parsed.audioUrl) {
        return parsed;
      }
    }

    return { script: null, audioUrl: null };
  };

  if (typeof payload === "string") {
    const value = payload.trim();
    return { script: value.length ? value : null, audioUrl: null };
  }

  return parseObject(payload);
};

type StallContentDetailProps = {
  item: StallContentResponse;
  selectedLanguage?: string;
  languageOptions: Array<{ label: string; value: string }>;
  onChangeLanguage: (value: string) => void;
};

export default function StallContentDetail({
  item,
  selectedLanguage,
  languageOptions,
  onChangeLanguage,
}: StallContentDetailProps) {
  const showToast = useToast();
  const [isListening, setIsListening] = useState(false);

  const { stopPlayback, playScript, playAudioUrl } =
    useAudioPlayback(showToast);

  const listenByLanguageMutation = useListenStallContentByLanguage();

  const previewScript = item.tts_script || "";

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  const handleListenByLanguage = async () => {
    const targetLanguage =
      selectedLanguage?.trim() || item.language_code?.trim() || "vi";

    if (!item.stall_id) {
      showToast({
        type: "warning",
        title: "Chưa có quán",
        message: "Dữ liệu stall_id bị thiếu",
      });
      return;
    }

    const currentLanguage = item.language_code?.toLowerCase();

    // =============================
    // CASE 1: Có audio sẵn
    // =============================
    if (currentLanguage === targetLanguage.toLowerCase() && item.audio_url) {
      setIsListening(true);
      try {
        await playAudioUrl(item.audio_url);
      } catch {
        showToast({
          type: "error",
          title: "Không phát được audio",
          message: "File audio lỗi hoặc không tồn tại",
        });
      } finally {
        setIsListening(false);
      }
      return;
    }

    // =============================
    // CASE 2: fallback script
    // =============================
    if (currentLanguage === targetLanguage.toLowerCase() && previewScript) {
      playScript(previewScript, targetLanguage);
      return;
    }

    // =============================
    // CASE 3: call API
    // =============================
    setIsListening(true);
    try {
      const payload = await listenByLanguageMutation.mutateAsync({
        stallId: item.stall_id,
        languageCode: targetLanguage,
      });

      const playable = extractPlayableStallContent(payload);

      if (playable.audioUrl) {
        await playAudioUrl(playable.audioUrl);
        return;
      }

      if (playable.script) {
        playScript(playable.script, targetLanguage);
        return;
      }

      if (previewScript) {
        playScript(previewScript, targetLanguage);
        return;
      }

      showToast({
        type: "warning",
        title: "Không có dữ liệu",
        message: "BE chưa trả audio hoặc script",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Lỗi API",
        message: error instanceof Error ? error.message : "Không gọi được API",
      });
    } finally {
      setIsListening(false);
    }
  };

  return (
    <Space direction="vertical" size="middle">
      <Card size="small" title="Nghe nội dung theo ngôn ngữ">
        <Space wrap>
          <Select
            style={{ minWidth: 220 }}
            value={selectedLanguage}
            options={languageOptions}
            placeholder="Chọn ngôn ngữ"
            onChange={onChangeLanguage}
          />

          <Button
            type="primary"
            icon={<SoundOutlined />}
            onClick={handleListenByLanguage}
            loading={isListening}
          >
            Nghe nội dung
          </Button>

          <Button onClick={stopPlayback}>Dừng</Button>
        </Space>
      </Card>

      <Card size="small" title="Nội dung thuyết minh">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Script">
            <Text>{previewScript || "(Không có nội dung script)"}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}
