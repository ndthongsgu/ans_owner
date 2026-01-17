import rootApiService from "@/lib/axios-http";
import { API_ENDPOINTS } from "@/lib/api-route";
import type { ChatResponse } from "@/dto/chat.dto";

export default class ChatService {
    async sendPrompt(prompt: string) {
        const response = await rootApiService.post<ChatResponse>(API_ENDPOINTS.CHAT.PROMPT, { prompt });
        return response;
    }
}