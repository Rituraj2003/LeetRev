import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateReview(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          algorithm: {
            type: Type.STRING,
          },

          pattern: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              why: { type: Type.STRING },
            },
            required: ["name", "why"],
          },

          keyObservation: {
            type: Type.STRING,
          },

          approach: {
            type: Type.STRING,
          },

          timeComplexity: {
            type: Type.OBJECT,
            properties: {
              yourSolution: { type: Type.STRING },
              optimal: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["yourSolution", "optimal", "explanation"],
          },

          spaceComplexity: {
            type: Type.OBJECT,
            properties: {
              yourSolution: { type: Type.STRING },
              optimal: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["yourSolution", "optimal", "explanation"],
          },

          improvements: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },

          interviewFeedback: {
            type: Type.STRING,
          },

          keyLearning: {
            type: Type.STRING,
          },
        },
        required: [
          "algorithm",
          "pattern",
          "keyObservation",
          "approach",
          "timeComplexity",
          "spaceComplexity",
          "improvements",
          "interviewFeedback",
          "keyLearning",
        ],
      },
    },
  });

  return response.text;
}