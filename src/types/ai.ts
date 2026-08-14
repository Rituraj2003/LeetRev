import { z } from "zod";

export const ComplexitySchema = z.object({
  yourSolution: z.string(),
  optimal: z.string(),
  explanation: z.string(),
});

export const AIAnalysisSchema = z.object({
  algorithm: z.string(),

  pattern: z.object({
    name: z.string(),
    why: z.string(),
  }),

  keyObservation: z.string(),

  approach: z.string(),

  timeComplexity: ComplexitySchema,

  spaceComplexity: ComplexitySchema,

  improvements: z.array(z.string()),

  interviewFeedback: z.string(),

  keyLearning: z.string(),
});

export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;

export interface ReviewPromptInput {
  title: string;
  difficulty: string;
  language: string;
  code: string;
}