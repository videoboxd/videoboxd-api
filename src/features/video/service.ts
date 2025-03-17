import { prisma } from "@/lib/prisma";
import { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import extractVideoInfo from "@/lib/yt-dlp-wrap/YT-extractor";

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
      const { originalUrl, categorySlug } = body;
  
      // Ekstrak informasi video dari link YouTube
      const videoInfo = await extractVideoInfo(originalUrl);
  
      // if (videoInfo) {
      //   // Buat data video lengkap dengan informasi yang diekstrak
      //   const videoData = {
      //     platformVideoId: originalUrl.split("v=")[1], // Ambil ID video dari URL
      //     originalUrl,
      //     title: videoInfo.title,
      //     description: videoInfo.description,
      //     thumbnail: videoInfo.thumbnail,
      //     // uploadedAt: videoInfo.uploadDate,
      //     userId,
      //     // categories: body.categorySlug
      //     //   ? { connect: body.categorySlug.map((id) => ({ id })) }
      //     //   : undefined,
      //     // tags: body.tags,
      //   };
  
        // Cari platform berdasarkan slug atau ID
        // const platform = await prisma.platform.findFirst({
        //   where: {
        //     OR: [{ slug: 'youtube' }], // Karena kita hanya menangani YouTube
        //   },
        // });
  
        // if (!platform) {
        //   throw new HTTPException(404, { message: "Platform not found" });
        // }

     // Cari kategori berdasarkan slug
      // const categories = await prisma.category.findUnique({
      // where: { slug: categorySlug },
    // });

    // if (!categories) {
    //   throw new HTTPException(404, { message: `Category with slug '${categorySlug}' not found` });
    // }

        // Simpan video ke database
        // const video = await prisma.video.create({
        //   data: {
        //     ...videoData,
        //     platformId: platform.id,
        //     categories: {
        //       connect: { id: categories.id },
        //     },
        //   },
        //   include: {
        //     platform: true,
        //     categories: true,
        //   },
        // });
  
        return videoInfo;
      // } else {
      //   // Jika gagal mengekstrak informasi video, kembalikan error
      //   throw new HTTPException(500, { message: "Failed to extract video info" });
      // }
    }  catch (error) {
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