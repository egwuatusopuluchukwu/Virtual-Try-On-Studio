
import { GoogleGenAI, Modality } from "@google/genai";

const getGenAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API_KEY is not configured. Please set up your API key in the deployment environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const virtualTryOn = async (userImageBase64: string, userImageMimeType: string, garmentImageBase64: string, garmentMimeType: string): Promise<string> => {
  const ai = getGenAi();
  
  const userImagePart = {
    inlineData: {
      data: userImageBase64,
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
    text: "You are an expert in fashion and photo editing. Your task is to perform a virtual try-on. First, identify and digitally remove the clothing worn by the person in the first image. Then, realistically place the garment from the second image onto the person. Ensure the fit, drape, shadows, and lighting look natural and consistent with the original photo. The background of the person's image must be preserved. The final output should be only the edited image of the person wearing the new garment.",
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{
      parts: [userImagePart, garmentImagePart, textPart],
    }],
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Could not extract image from Gemini response.");
};

export const editImage = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const ai = getGenAi();

  const imagePart = {
    inlineData: { data: imageBase64, mimeType },
  };

  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [imagePart, textPart] }],
    config: { responseModalities: [Modality.IMAGE] },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Could not extract edited image from Gemini response.");
};
