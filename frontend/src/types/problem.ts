import type { AIAnalysis } from "./ai"

export interface Problem{
    id: string,
    difficulty: string,
    title:string,
    url: string,
    topics: string[]
}

export interface Review{
    id: string,
    problemId: string,
    status: string,
    nextReviewAt: string
}

export interface Solution{
    id: string,
    problemId: string,
    code: string,
    language: string,
    solvedAt: string,
    timeMs: number,
    spaceMb: number,
    createdAt: string
    aiAnalysis: AIAnalysis | null
}

export interface ProblemDetailResponse{
    problem: Problem,
    solution: Solution | null,
    review: Review | null
}
