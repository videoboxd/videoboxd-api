import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

import { CreateVideoSchema, UpdateVideoSchema } from "@/features/video/schema";

export const videoService = {
  getAllVideos: async () => {
    return await prisma.video.findMany({
      include: {
        platform: true,
        categories: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  getVideoByIdentifier: async (identifier: string) => {
    const video = await prisma.video.findFirst({
      where: {
        OR: [{ id: identifier }, { platformVideoId: identifier }],
      },
      include: {
        platform: true,
        categories: true,
      },
    });

    return video;
  },

  createVideo: async (
    body: z.infer<typeof CreateVideoSchema>,
    userId: string
  ) => {
    try {
      const { categoryIds, platformSlug, ...videoBody } = body;

      const platform = await prisma.platform.findFirst({
        where: {
          OR: [{ id: videoBody.platformId }, { slug: platformSlug }],
        },
      });

      console.log({ platform });

      if (!platform) {
        throw new HTTPException(404, { message: "Platform not found" });
      }

      const video = await prisma.video.create({
        data: {
          ...videoBody,
          platformId: platform.id,
          uploadedAt: new Date(videoBody.uploadedAt),
          userId,
          categories: categoryIds
            ? { connect: categoryIds.map((id) => ({ id })) }
            : undefined,
        },
        include: {
          platform: true,
          categories: true,
        },
      });

      return video;
    } catch (error) {
      console.error(error);
      throw new HTTPException(404, { message: "Failed to create video" });
    }
  },

  deleteVideo: async (identifier: string) => {
    const video = await prisma.video.findFirst({
      where: {
        OR: [{ id: identifier }, { platformVideoId: identifier }],
      },
    });

    if (!video) {
      throw new HTTPException(404, { message: "Video not found" });
    }

    await prisma.video.delete({
      where: { id: video.id },
    });
  },

  updateVideo: async (
    identifier: string,
    data: z.infer<typeof UpdateVideoSchema>
  ) => {
    const video = await prisma.video.findFirst({
      where: {
        OR: [{ id: identifier }, { platformVideoId: identifier }],
      },
    });

    if (!video) {
      throw new HTTPException(404, { message: "Video not found" });
    }

    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data,
    });

    return updatedVideo;
  },
};
