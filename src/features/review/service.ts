import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { CreateReviewSchema } from "./schema";

export const reviewService = {
  createReview: async (body: z.infer<typeof CreateReviewSchema>) => {
    return await prisma.review.create({
      data: {
        videoId: body.videoId,
        userId: body.userId,
        text: body.text,
        rating: body.rating,
      },
    });
  },
};
