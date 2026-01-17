import ChatService from "@/services/chat.service";
import { useMutation } from "@tanstack/react-query";

export const useChatPrompt = () => {
  const chatService = new ChatService();

  const { mutateAsync: sendPrompt, isPending: isLoading } = useMutation({
    mutationFn: async (body: { prompt: string }) => {
      const res = await chatService.sendPrompt(body.prompt);
      return res; 
    },
    onError: (error: any) => console.error("Lỗi khi gửi chat:", error),
  });

  return { sendPrompt, isLoading };
};
