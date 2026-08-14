import prisma from "../db.js";
import { buildReviewPrompt } from "./prompt.js";
import { generateReview } from "./aiClient.js";
import { AIAnalysisSchema, type AIAnalysis } from "../types/ai.js";

export async function generateAIReview(solutionId: string,userId:string) {
  const solution = await prisma.solution.findFirst({
    where: {
      id: solutionId,
      userId:userId
    },
    include: {
      problem: true,
    },
  });

  if (!solution) {
    throw new Error("solution not found");
  }
  if(solution.aiAnalysis){
    return solution.aiAnalysis as AIAnalysis;
  }

  const prompt = buildReviewPrompt({
    title: solution.problem.title,
    difficulty: solution.problem.difficulty,
    language: solution.language,
    code: solution.code,
  });

  const rawResponse = await generateReview(prompt);
  if (!rawResponse) {
    throw new Error("No response found");
  }
  let analysis:AIAnalysis;

  try {
    const parsed=JSON.parse(rawResponse);
    analysis=AIAnalysisSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse Gemini response:");
    console.log(rawResponse);
    throw new Error("Invalid JSON returned by Gemini");
  }

    await prisma.solution.update({
        where:{
            id: solutionId,
        },
        data:{
            aiAnalysis:analysis,
        },
    })
    return analysis;
}
