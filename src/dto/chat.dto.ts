export interface ChatPrompt {
    prompt: string;
}

export interface ChatResponse {
    success: boolean;
    answer: string;
    timestamp: string;
    error?: string;
}