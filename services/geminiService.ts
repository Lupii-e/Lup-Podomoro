import { GoogleGenAI, Type } from "@google/genai";
import { AITaskResponse } from "../types";

// Helper to get client securely
const getGenAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSubtasks = async (goal: string): Promise<string[]> => {
  try {
    const ai = getGenAIClient();
    
    // We use gemini-2.5-flash for speed and efficiency in simple reasoning tasks
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down the following content creation or scripting goal into 3-5 concise, actionable subtasks suitable for a single Pomodoro work session (25 minutes). Goal: "${goal}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "A list of actionable subtasks"
            }
          }
        }
      }
    });

    const jsonResponse = response.text ? JSON.parse(response.text) as AITaskResponse : { tasks: [] };
    return jsonResponse.tasks || [];
  } catch (error) {
    console.error("Failed to generate subtasks:", error);
    // Fallback if AI fails or key is missing, return empty array so UI can handle gracefully
    return [];
  }
};