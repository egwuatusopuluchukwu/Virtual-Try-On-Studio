
import { GoogleGenAI, Modality } from "@google/genai";

export const virtualTryOn = async (userImageBase64: string, garmentImageBase64: string, garmentMimeType: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userImagePart = {
    inlineData: {
      data: userImageBase64,
      mimeType: "image/jpeg", // Assume user image is jpeg, can be made dynamic
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
  
  const firstPart = response.candidates?.[0]?.content?.parts?.[0];

  if (firstPart && firstPart.inlineData) {
    return firstPart.inlineData.data;
  }

  throw new Error("Could not extract image from Gemini response.");
};
