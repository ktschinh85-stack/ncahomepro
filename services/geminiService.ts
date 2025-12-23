
import { GoogleGenAI } from "@google/genai";
import { RenderConfig, ImageData } from "../types";

export const generateArchitectureRender = async (
  originalImage: ImageData,
  referenceImage: ImageData | null,
  config: RenderConfig
): Promise<string[]> => {
  // Always create a new instance before making an API call to ensure the latest API key is used.
  // Initializing with process.env.API_KEY as per coding guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Construct the prompt strictly following the user's template
  const basePrompt = `
Tạo một bản render kiến trúc chân thực dựa trên Ảnh Gốc (Ảnh 1). 
LƯU Ý QUAN TRỌNG: Hình ảnh đầu ra PHẢI có kích thước pixel và tỉ lệ khung hình GIỐNG Y HỆT so với Ảnh Gốc (Ảnh 1), chi tiết bám theo ảnh 1. 
KHÔNG được lấy kích thước hoặc tỉ lệ khung hình của Ảnh Tham Chiếu (Ảnh 2).

Hướng dẫn sáng tạo chính là: một bản render chân thực của tòa nhà theo phong cách ${config.style}, 
nằm trong bối cảnh ${config.location}, với ánh sáng ${config.lighting}, và thời tiết ${config.weather}.
${config.customPrompt ? `Yêu cầu bổ sung: ${config.customPrompt}` : ''}

Hãy tránh các yếu tố sau: chữ, dầu mờ, mờ, chất lượng thấp.
  `.trim();

  // For multiple images, we run concurrent requests as generateContent usually produces one candidate response
  const tasks = Array.from({ length: config.imageCount }).map(async () => {
    const parts: any[] = [
      {
        inlineData: {
          data: originalImage.base64,
          mimeType: originalImage.mimeType
        }
      }
    ];

    if (referenceImage) {
      parts.push({
        inlineData: {
          data: referenceImage.base64,
          mimeType: referenceImage.mimeType
        }
      });
    }

    parts.push({ text: basePrompt });

    // Build imageConfig dynamically to avoid sending imageSize to models that don't support it
    const imageConfig: any = {
      aspectRatio: config.aspectRatio,
    };

    if (config.model === 'gemini-3-pro-image-preview') {
      imageConfig.imageSize = config.resolution;
    }

    const response = await ai.models.generateContent({
      model: config.model,
      contents: { parts },
      config: {
        imageConfig,
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      // Iterate through all parts to find the image part as per guidelines
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  });

  const rawResults = await Promise.all(tasks);
  return rawResults.filter((r): r is string => r !== null);
};

export const checkProAuth = async (): Promise<boolean> => {
  // Use the pre-configured window.aistudio helper for API key selection verification
  if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true;
};

export const requestProAuth = async (): Promise<void> => {
  // Trigger the API key selection dialog as required for Pro models
  if (typeof (window as any).aistudio?.openSelectKey === 'function') {
    await (window as any).aistudio.openSelectKey();
  }
};
