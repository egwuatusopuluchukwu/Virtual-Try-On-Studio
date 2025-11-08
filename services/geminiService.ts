
import { GoogleGenAI, Modality } from "@google/genai";

// Fix: Add userImageMimeType parameter for dynamic mime type handling.
export const virtualTryOn = async (userImageBase64: string, userImageMimeType: string, garmentImageBase64: string, garmentMimeType: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userImagePart = {
    inlineData: {
      data: userImageBase64,
      // Fix: Use the passed userImageMimeType instead of a hardcoded value.
      mimeType: userImageMimeType,
    },
  };

  const garmentImagePart = {
    inlineData: {
      data: garmentImageBase64,
      mimeType: garmentMimeType,
    },
  };

  const textPart = {
    text: "You are an expert in fashion and photo editing. Realistically place the garment from the second image onto the person in the first image. Ensure the fit, drape, and lighting look natural. The background of the person's image should be preserved. The output should be only the final image.",
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [userImagePart, garmentImagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  // Fix: Iterate through response parts to robustly find and return the image data.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Could not extract image from Gemini response.");
};
