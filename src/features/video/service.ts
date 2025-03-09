import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { ulid } from "ulid";
import { CreateVideo } from "@/modules/video/schema";

export const submitVideoReview = async (body: z.infer<typeof CreateVideo> ) => {
    
    return await prisma.$transaction(async (tx) => {
        const video = await tx.video.create({
            data: {
                userId: body.userId,
                platformVideoId: ulid(),
                platformId: body.platformId,
                originalUrl: body.originalUrl,
                title: body.title,
                description: body.description,
                thumbnail: body.thumbnail,
                uploadedAt: body.uploadedAt
            },
        });

        const review = await tx.review.create({
            data: {
                id: ulid(),
                videoId: video.id,
                userId: body.userId,
                text: body.review,
                rating: body.rating,
            },
        });

        let like = null;

        if (body.isLiked) {
            like = await tx.like.create({
                data: {
                    id: ulid(),
                    userId: body.userId,
                    reviewId: review.id,
                },
            });
        }
    })
}