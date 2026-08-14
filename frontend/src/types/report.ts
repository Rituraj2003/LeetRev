export interface ProblemSummary {
  id:string
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: string;
  solvedAt: string;
}

export interface yesterdayReport{
    date:string;
    totalSolved:number;
    problems:ProblemSummary[];
}
