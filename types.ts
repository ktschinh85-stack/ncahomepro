
export interface Service {
  title: string;
  description: string;
  icon: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
}

export interface Testimonial {
  name: string;
  comment: string;
  avatar: string;
  stars: number;
}

// Added to resolve import errors in geminiService.ts
export interface ImageData {
  base64: string;
  mimeType: string;
}

// Added to resolve import errors in geminiService.ts
export interface RenderConfig {
  style: string;
  location: string;
  lighting: string;
  weather: string;
  customPrompt?: string;
  imageCount: number;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  model: string;
  resolution: "1K" | "2K" | "4K";
}
