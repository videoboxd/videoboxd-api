import { VideoSchema } from "prisma/generated/zod";
import { z } from "zod";

export const VideoCompleteSchema = VideoSchema.extend({
  platform: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
  }).optional(),
  categories: z.array(z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
  })).optional(),
});

export const CreateVideoSchema = VideoSchema.pick({
  platformId: true,
  platformVideoId: true,
  originalUrl: true,
  title: true,
  description: true,
  thumbnail: true,
  uploadedAt: true,
}).extend({
  categoryIds: z.array(z.string()).optional(),
});