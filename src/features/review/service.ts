import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { CreateReviewSchema } from "./schema";
import { HTTPException } from "hono/http-exception";

export const reviewService = {
  getAllReviews: async () => {
    const result = await prisma.review.findMany();
    
    return result;
  },

  getReviewByIdentifier: async (identifier: string) => {
    const review = await prisma.review.findUnique({
      where: {
        id: identifier,
      },
    });

    return review;
  },

  createReview: async (body: z.infer<typeof CreateReviewSchema>, userId: string) => {
    const checkVideo = await prisma.video.findUnique({
      where: {
        id: body.videoId
      }
    });

    if (!checkVideo?.id) {
      throw new HTTPException(404, { message: "Video not found" });
    }

    const review = await prisma.review.create({
      data: {
        ...body,
        userId: userId,
      },
    });

    return review;
  },
};
