import prisma from "../db.js";

export async function getYesterdayReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const startOfYesterday = new Date(yesterday);
  const endOfYesterday = new Date(yesterday);

  startOfYesterday.setHours(0, 0, 0, 0);
  endOfYesterday.setHours(23, 59, 59, 999);

  const solutions = await prisma.solution.findMany({
    where: {
      solvedAt: {
        gte: startOfYesterday,
        lte: endOfYesterday,
      },
    },
    include: {
      problem: true,
    },
    orderBy: {
      solvedAt: "desc",
    },
  });

  const seen = new Set<string>();
  const uniqueSolutions = [];

  for (const solution of solutions) {
    if (seen.has(solution.problemId)) {
      continue;
    }
    seen.add(solution.problemId);
    uniqueSolutions.push(solution);
  }
  const problems = uniqueSolutions.map((solution) => ({
    slug: solution.problem.slug,
    title: solution.problem.title,
    difficulty: solution.problem.difficulty,
    language: solution.language,
    solvedAt: solution.solvedAt,
  }));
  console.log(uniqueSolutions.map((s) => s.problem.title));

  const reportDate = `${startOfYesterday.getFullYear()}-${String(
    startOfYesterday.getMonth() + 1,
  ).padStart(2, "0")}-${String(startOfYesterday.getDate()).padStart(2, "0")}`;

  return {
    date: reportDate,
    totalSolved: problems.length,
    problems,
  };
}
