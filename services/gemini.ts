
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIResponse } from "../types";

export const analyzeSketch = async (imageDataBase64: string): Promise<AIResponse> => {
  // Fix: Initialize GoogleGenAI strictly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this design sketch. Provide a detailed summary of what you see and 3 actionable creative suggestions to improve or expand this design. 
  Focus on layout, balance, and creative direction.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageDataBase64.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["analysis", "suggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {
      analysis: response.text || "I couldn't analyze the sketch properly.",
      suggestions: ["Try adding more detail", "Experiment with bolder colors", "Consider the negative space"]
    };
  }
};

export const generateBackgroundImage = async (prompt: string): Promise<string | null> => {
  // Fix: Initialize GoogleGenAI strictly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A clean, professional background for a design project: ${prompt}. Artistic, high-quality, minimalistic.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
