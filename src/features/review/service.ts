import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { CreateReviewParamSchema, CreateReviewBodySchema, UpdateReviewSchema } from "./schema";
import { HTTPException } from "hono/http-exception";

export const reviewService = {
  getAllReviews: async (videoId?: string) => {
    const result = await prisma.review.findMany({
      where: videoId ? { videoId: { contains: videoId } } : undefined,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    
    return result;
  },

  getReviewByIdentifier: async (identifier: string) => {
    const review = await prisma.review.findFirst({
      where: {
        OR: [
          { id: identifier },
          { videoId: identifier },
        ],
      },
    });

    if (!review) {
      throw new HTTPException(404, { message: "Review not found" });
    }

    return review;
  },

  createReview: async (platformVideoId: string, body: z.infer<typeof CreateReviewBodySchema>, userId: string) => {
    CreateReviewParamSchema.parse({ platformVideoId })
    const checkVideo = await prisma.video.findUnique({
      where: {
        id: platformVideoId
      }
    });

    if (!checkVideo?.id) {
      throw new HTTPException(404, { message: "Video not found" });
    }

    const review = await prisma.review.create({
      data: {
        ...body,
        userId,
        videoId: platformVideoId,
      },
    });

    return review;
  },

  updateReview: async (identifier: string, data: z.infer<typeof UpdateReviewSchema>) => {
    const checkReview = await prisma.review.findUnique({
      where: {
        id: identifier
      }
    });

    if (!checkReview) {
      throw new HTTPException(404, { message: "Review not found" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: checkReview.id },
      data,
    });

    return updatedReview
  },

  deleteReview: async (identifier: string) => {
    const checkReview = await prisma.review.findUnique({
      where: {
        id: identifier
      }
    });

    if (!checkReview) {
      throw new HTTPException(404, { message: "Review not found" });
    }

    await prisma.review.delete({
      where: { id: checkReview.id },
    });
  }
};
