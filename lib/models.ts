export type ModelCategory = 'text' | 'vision' | 'imageGen';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: ModelCategory;
}

export const availableModels: AIModel[] = [
  // Vision / Multimodal
  {
    id: '@cf/moonshotai/kimi-k2.7-code',
    name: 'Kimi K2.7 Code',
    description: 'Moonshot AI 1T parameter frontier model with vision & agentic coding.',
    provider: 'Moonshot AI',
    category: 'vision',
  },
  {
    id: '@cf/meta/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    description: 'Meta Llama 4 natively multimodal text & image understanding.',
    provider: 'Meta',
    category: 'vision',
  },
  {
    id: '@cf/meta/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision',
    description: 'Instruction-tuned model for image analysis & visual reasoning.',
    provider: 'Meta',
    category: 'vision',
  },
  {
    id: '@cf/mistralai/mistral-small-3.1-24b-instruct',
    name: 'Mistral Small 3.1 24B',
    description: 'State-of-the-art vision understanding with 128k context window.',
    provider: 'Mistral AI',
    category: 'vision',
  },
  // Text / Reasoning
  {
    id: '@cf/meta/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    description: 'Meta flagship open model. Reasoning & coding excellence.',
    provider: 'Meta',
    category: 'text',
  },
  {
    id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    name: 'DeepSeek R1 32B',
    description: 'Advanced step-by-step chain-of-thought reasoning.',
    provider: 'DeepSeek',
    category: 'text',
  },
  {
    id: '@cf/qwen/qwq-32b',
    name: 'QwQ 32B Reasoning',
    description: 'Qwen reasoning model designed for complex problem solving.',
    provider: 'Qwen',
    category: 'text',
  },
  {
    id: '@cf/qwen/qwen2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B',
    description: 'Specialized code generation & instruction following.',
    provider: 'Qwen',
    category: 'text',
  },
  {
    id: '@cf/zhipuai/glm-4.7-flash',
    name: 'GLM 4.7 Flash',
    description: 'Fast multilingual dialogue & tool calling model.',
    provider: 'ZhipuAI',
    category: 'text',
  },
  {
    id: '@cf/meta/llama-3.1-8b-instruct-fp8',
    name: 'Llama 3.1 8B FP8',
    description: 'Fast, high-efficiency lightweight model.',
    provider: 'Meta',
    category: 'text',
  },
  // Image Generation Models
  {
    id: '@cf/black-forest-labs/flux-2-klein-9b',
    name: 'FLUX.2 Klein 9B',
    description: 'Ultra-fast 9B distilled image model for interactive workflows and latency-critical generation.',
    provider: 'Black Forest Labs',
    category: 'imageGen',
  },
  {
    id: '@cf/black-forest-labs/flux-2-klein-4b',
    name: 'FLUX.2 Klein 4B',
    description: 'Ultra-fast 4B distilled image model unifying generation and editing.',
    provider: 'Black Forest Labs',
    category: 'imageGen',
  },
  {
    id: '@cf/black-forest-labs/flux-2-dev',
    name: 'FLUX.2 Dev',
    description: 'Generate highly realistic and detailed images with multi-reference support.',
    provider: 'Black Forest Labs',
    category: 'imageGen',
  },
  {
    id: '@cf/leonardo/lucid-origin',
    name: 'Lucid Origin',
    description: 'Leonardo.Ai adaptable model with prompt responsiveness and sharp graphic design.',
    provider: 'Leonardo',
    category: 'imageGen',
  },
  {
    id: '@cf/leonardo/phoenix-1.0',
    name: 'Phoenix 1.0',
    description: 'Leonardo.Ai model with exceptional prompt adherence and coherent text rendering.',
    provider: 'Leonardo',
    category: 'imageGen',
  },
  {
    id: '@cf/blackforestlabs/flux-1-schnell',
    name: 'FLUX.1 Schnell',
    description: '12 Billion parameter rectified flow transformer for text-to-image generation.',
    provider: 'Black Forest Labs',
    category: 'imageGen',
  },
  {
    id: '@cf/bytedance/stable-diffusion-xl-lightning',
    name: 'SDXL Lightning',
    description: 'ByteDance lightning-fast 1024px text-to-image generator in few steps.',
    provider: 'ByteDance',
    category: 'imageGen',
  },
  {
    id: '@cf/lykon/dreamshaper-8-lcm',
    name: 'DreamShaper 8 LCM',
    description: 'Fine-tuned Stable Diffusion LCM model for photorealism without range loss.',
    provider: 'Lykon',
    category: 'imageGen',
  },
  {
    id: '@cf/runwayml/stable-diffusion-v1-5-img2img',
    name: 'SD v1.5 Img2Img',
    description: 'RunwayML latent text-to-image model generating new images from reference inputs.',
    provider: 'RunwayML',
    category: 'imageGen',
  },
  {
    id: '@cf/runwayml/stable-diffusion-v1-5-inpainting',
    name: 'SD v1.5 Inpainting',
    description: 'RunwayML text-to-image model specialized in mask inpainting and editing.',
    provider: 'RunwayML',
    category: 'imageGen',
  },
  {
    id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    name: 'SDXL Base 1.0',
    description: 'Stability AI flagship diffusion-based text-to-image generative model.',
    provider: 'Stability.ai',
    category: 'imageGen',
  },
];

export const visionModels = availableModels.filter((m) => m.category === 'vision');
export const textModels = availableModels.filter((m) => m.category === 'text');
export const imageGenModels = availableModels.filter((m) => m.category === 'imageGen');

export function isImageGenModel(modelId: string): boolean {
  return availableModels.find((m) => m.id === modelId)?.category === 'imageGen';
}

export function isVisionModel(modelId: string): boolean {
  return availableModels.find((m) => m.id === modelId)?.category === 'vision';
}

export function getModelById(modelId: string): AIModel | undefined {
  return availableModels.find((m) => m.id === modelId);
}
