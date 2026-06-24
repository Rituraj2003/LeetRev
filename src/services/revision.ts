import prisma from "../db.js";
export async function getDueReviews() {
  const now = new Date();
  const totalDue = await prisma.review.count({
    where: {
      nextReviewAt: {
        lte: now,
      },
      status: {
        not: "MASTERED",
      },
    },
  });
  const reviews = await prisma.review.findMany({
    include: {
      problem: true,
    },
    where: {
      nextReviewAt: {
        lte: now,
      },
      status: {
        not: "MASTERED",
      },
    },
    take: 5,
    orderBy: {
      nextReviewAt: "asc",
    },
  });
  return { totalDue, reviews };
}

export async function rateReview(reviewId: string, rating: number) {
  const intervals: Record<number, number> = {
    1: 2,
    2: 3,
    3: 7,
    4: 15,
  };
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
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
