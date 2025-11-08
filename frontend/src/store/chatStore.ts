import { create } from "zustand";
import { ChatMessage, AnalysisResult } from "@/types/Textbook";

interface ChatStore {
  messages: ChatMessage[];
  currentAnalysis: AnalysisResult | null;
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentAnalysis: null,
  isLoading: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        },
      ],
    })),
  setAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [], currentAnalysis: null }),
}));
