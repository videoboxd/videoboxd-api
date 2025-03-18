import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import extractVideoInfo from "archive/yt-dlp-wrap/YT-extractor";

import { CreateVideoSchema, UpdateVideoSchema } from "@/features/video/schema";
import { Prisma } from "@prisma/client";

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
      const { originalUrl, categorySlug } = body;

      // Validate and extract video ID
      const videoIdMatch = originalUrl.match(/[?&]v=([^&]+)/);
      if (!videoIdMatch) {
        throw new HTTPException(400, { message: "Invalid YouTube URL" });
      }
      const platformVideoId = videoIdMatch[1];

      // TODO: Use simpler string parse to get the video ID
      const existingVideo = await prisma.video.findUnique({
        where: { platformVideoId },
      });

      if (existingVideo) {
        throw new HTTPException(409, { message: "Video already exists" });
      }

      // Ekstrak informasi video dari link YouTube
      const videoInfo = await extractVideoInfo(originalUrl);
      if (!videoInfo) {
        throw new HTTPException(500, {
          message: "Failed to extract video info",
        });
      }

      const formattedDate = videoInfo.uploadDate
        ? // TODO: Extract this into a function
          new Date(
            `${videoInfo.uploadDate.slice(0, 4)}-${videoInfo.uploadDate.slice(
              4,
              6
            )}-${videoInfo.uploadDate.slice(6, 8)}`
          )
        : null;

      const platform = await prisma.platform.findUnique({
        where: { slug: "youtube" },
      });

      if (!platform) {
        throw new HTTPException(500, { message: "Failed to find platform" });
      }

      const video = await prisma.video.create({
        data: {
          platformVideoId: originalUrl.split("v=")[1], // Ambil ID video dari URL
          originalUrl,
          title: videoInfo.title,
          description: videoInfo.description,
          thumbnailUrl: videoInfo.thumbnail,
          uploadedAt: formattedDate,
          userId,
          categories: { connect: [{ slug: categorySlug }] },
          platformId: platform.id,
        },
        include: {
          user: { select: { username: true } },
          platform: true,
          categories: true,
        },
      });

      return video;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        console.error(error);
        throw new HTTPException(400, {
          cause: "prisma",
          message: error.message,
        });
      }

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
