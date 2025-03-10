import { prisma } from "@/lib/prisma";
// import { Video } from "@prisma/generated/zod";
import { HTTPException } from "hono/http-exception";
import { CreateVideoSchema } from "./schema";
import { z } from "zod";

export const getAllVideos = async () => {
  return await prisma.video.findMany({
    include: {
      platform: true,
      categories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getVideoByIdentifier = async (identifier: string) => {
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
};

export const createVideo = async (videoData: z.infer<typeof CreateVideoSchema>, userId: string) => {
  const { categoryIds, ...videoInput } = videoData;

  const platform = await prisma.platform.findUnique({
    where: {
      id: videoInput.platformId,
    },
  });

  if (!platform) {
    throw new HTTPException(404, {message: "Platform not found"});
  }

  const video = await prisma.video.create({
    data: {
      ...videoInput,
      userId,
      categories: categoryIds ? {
        connect: categoryIds.map((id) => ({ id })),
      } : undefined,
    },
    include: {
      platform: true,
      categories: true,
    },
  });

  return video;
};