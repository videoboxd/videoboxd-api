import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { ulid } from "ulid";
import { CreateVideo } from "@/modules/video/schema";

export const submitVideoReview = async (body: z.infer<typeof CreateVideo> ) => {

    return await prisma.$transaction(async (tx) => {
        const categories = body.tags
            ? await tx.category.findMany({
                where: { slug: { in: body.tags }},
                select: { id: true },
            })
            : [];

        const platform = await tx.platform.findUnique({
            where: { slug: body.platform },
            select: { id: true },
        });
        if (!platform) {
            throw new Error(`Platform with name '${body.platform}' not found.`);
        }
        const platformId = platform.id;

        const categoryIds = categories.map((c) => ({ id: c.id }));

        const video = await tx.video.upsert({
            where: {
                platformVideoId: body.platformVideoId,
            },
            update: {
                categories: categoryIds.length > 0 ? { set: [], connect: categoryIds } : undefined,
            },
            create: {
                userId: body.userId,
                platformVideoId: body.platformVideoId,
                platformId: platformId,
                originalUrl: body.originalUrl,
                title: body.title,
                description: body.description,
                thumbnail: body.thumbnail,
                uploadedAt: body.uploadedAt,
                categories: categoryIds.length > 0 ? { connect: categoryIds } : undefined,
            },
        })

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