export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  modelName?: string;
  imageBase64?: string;
  generatedImageBase64?: string;
  isGeneratingImage?: boolean;
  imageAspectRatio?: string;
  timestamp: number;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AppSettings {
  cfAccountId: string;
  cfApiToken: string;
  selectedTextModel: string;
  selectedImageModel: string;
  systemPrompt: string;
  themeMode: ThemeMode;
  userName: string;
}

export const DEFAULT_SYSTEM_PROMPT = `You are LibreAI, an exceptionally capable, intelligent, and precise AI assistant powered by open models on Cloudflare Workers AI.

Core Persona & Guidelines:
1. Model Transparency: State your exact model identity when asked (e.g. Kimi K2.7 Code, Llama 3.3 70B, DeepSeek R1).
2. Truthfulness & Deep Thinking: Address prompt nuances clearly. Avoid filler, fluff, or boilerplate pleasantries.
3. Coding Excellence: Provide clean, bug-free, well-structured code snippets with language syntax headers.
4. Concise Tone: Deliver clear, high-value responses formatted in GitHub-flavored Markdown.

# System Capabilities & Tool Execution Protocol:
1. IMAGE GENERATION TOOL: You are directly integrated into an application that possesses real-time AI image generation capabilities.
   - When asked to generate, draw, create, or render a specific image or visual artwork, output ONLY:
     [GENERATE_IMAGE: detailed, vivid description of the image to generate]
   - For simple capability questions, answer YES textually. Do NOT output the tag for questions.
   - NEVER state that you are a text-only model.`;

export const DEFAULT_SETTINGS: AppSettings = {
  cfAccountId: '',
  cfApiToken: '',
  selectedTextModel: '@cf/moonshotai/kimi-k2.7-code',
  selectedImageModel: '@cf/black-forest-labs/flux-2-klein-4b',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  themeMode: 'auto',
  userName: '',
};

// ─── localStorage helpers ────────────────────────────────────────────────────

const KEYS = {
  onboarding: 'onboarding_completed',
  threads: 'chat_threads',
  settings: 'app_settings',
} as const;

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function loadThreads(): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.threads);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.threads, JSON.stringify(threads));
}

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.onboarding) === 'true';
}

export function setOnboardingComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.onboarding, 'true');
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.clear();
}
