import prisma from "../db.js";
export async function getDueReviews(userId:string) {
  const now = new Date();
  const totalDue = await prisma.review.count({
    where: {
      nextReviewAt: {
        lte: now,
      },
      status: {
        not: "MASTERED",
      },
      solution:{
        userId: userId
      }
    },
  });
  const reviews = await prisma.review.findMany({
    include: {
      solution:{
        include:{
          problem: true,
        }
      }
    },
    where: {
      nextReviewAt: {
        lte: now,
      },
      status: {
        not: "MASTERED",
      },
      solution:{
        userId:userId
      }
    },
    take: 5,
    orderBy: {
      nextReviewAt: "asc",
    },
  });
  return {
    totalDue,
    reviews: reviews.map(({ solution, ...review }) => ({
      ...review,
      problem: solution.problem,
    })),
  };
}

export async function startReviewSession(userId: string) {
  const now = new Date();
  const reviewsToStart = await prisma.review.findMany({
    where: {
      status: "NEW",
      nextReviewAt: { gt: now },
      solution: { userId },
    },
    select: { id: true },
    orderBy: { nextReviewAt: "asc" },
    take: 5,
  });

  if (reviewsToStart.length === 0) {
    return getDueReviews(userId);
  }

  await prisma.review.updateMany({
    where: { id: { in: reviewsToStart.map((review) => review.id) } },
    data: { nextReviewAt: now, status: "LEARNING" },
  });

  return getDueReviews(userId);
}

export async function rateReview(reviewId: string, rating: number,userId:string) {
  const intervals: Record<number, number> = {
    1: 2,
    2: 3,
    3: 7,
    4: 15,
  };
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      solution:{
        userId:userId
      }
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }
  if (rating < 1 || rating > 5) {
    throw new Error("Rating outside limit");
  } else {
    if (rating == 5) {
      await prisma.review.update({
        where: {
          id: reviewId,
        },
        data: {
          status: "MASTERED",
        },
      });
    } else {
      const nextDue = new Date();
      const days = intervals[rating];
      nextDue.setDate(nextDue.getDate() + days);
      await prisma.review.update({
        where: {
          id: reviewId,
        },
        data: {
          nextReviewAt: nextDue,
        },
      });
    }
  }
}
