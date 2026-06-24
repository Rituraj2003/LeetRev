export interface DueReview{
    id: string
    status:string
    nextReviewAt: string
    problem:ReviewProblem
}

export interface ReviewProblem{
    id:string
    title:string
    difficulty:string
    url:string
}

export interface DueReviewsResponse {
  totalDue: number;
  reviews: DueReview[];
}