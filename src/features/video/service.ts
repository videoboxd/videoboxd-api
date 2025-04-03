import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import extractVideoInfo from "archive/yt-dlp-wrap/YT-extractor";

import {
  CreateVideoSchema,
  UpdateVideoSchema,
  YouTubeVideoInfoSchema,
} from "@/features/video/schema";
import { Prisma } from "@prisma/client";
import { getVideoInfo } from "@/lib/youtube";

export const videoService = {
  getAllVideos: async (q?: string) => {
    return await prisma.video.findMany({
      where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
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

      // TODO: Use simpler string parse to get the video ID
      const videoIdMatch = originalUrl.match(/[?&]v=([^&]+)/);
      if (!videoIdMatch) {
        throw new HTTPException(400, { message: "Invalid YouTube URL" });
      }
      const platformVideoId = videoIdMatch[1];

      const existingVideo = await prisma.video.findUnique({
        where: { platformVideoId },
      });

      console.log({ existingVideo });

      if (existingVideo) {
        return existingVideo;
      }

      const youtubeVideoInfo = await getVideoInfo(platformVideoId);
      if (!youtubeVideoInfo) {
        throw new HTTPException(404, { message: "Video info not available" });
      }

      const videoInfo = YouTubeVideoInfoSchema.safeParse(youtubeVideoInfo).data;
      if (!videoInfo) {
        throw new HTTPException(400, { message: "Invalid video info" });
      }

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
          thumbnailUrl: videoInfo.thumbnails.maxres.url,
          uploadedAt: videoInfo.publishedAt,
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
