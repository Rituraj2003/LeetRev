export interface Complexity {
    yourSolution: string;
    optimal: string;
    explanation: string;
}
export interface AIAnalysis {
  algorithm: string;

  pattern: {
    name: string;
    why: string;
  };

  keyObservation: string;

  approach: string;

  timeComplexity: Complexity;

  spaceComplexity: Complexity;

  improvements: string[];

  interviewFeedback: string;

  keyLearning: string;
}