
import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardItem, ModelName } from "../types";

export const analyzeVideo = async (
  videoBase64: string,
  mimeType: string
): Promise<StoryboardItem[]> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const prompt = `
    Analyze this video and provide a comprehensive storyboard breakdown.
    Crucial Instructions:
    1. Divide the video into logical sections based on spoken phrases and visual shifts.
    2. For each section, provide:
       - 'startTime': Start timestamp in seconds.
       - 'endTime': End timestamp in seconds.
       - 'script': The EXACT verbatim spoken words from the audio. Do NOT summarize the dialogue. If there is no talking, mark as "[Music/No Audio]".
       - 'description': A concise but descriptive summary of the visual action or scene occurring during this segment.
    
    Ensure segments cover the entire video duration.
    Return the result as a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: ModelName.FLASH,
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: videoBase64,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
              script: { type: Type.STRING, description: "Verbatim transcription of dialogue" },
              description: { type: Type.STRING, description: "Visual action summary" }
            },
            required: ["startTime", "endTime", "script", "description"]
          }
        }
      }
    });

    const resultText = response.text || "[]";
    const data = JSON.parse(resultText);
    
    return data.map((item: any, index: number) => ({
      ...item,
      id: `item-${Date.now()}-${index}`
    })) as StoryboardItem[];
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze video. Ensure the file is valid and accessible.");
  }
};
