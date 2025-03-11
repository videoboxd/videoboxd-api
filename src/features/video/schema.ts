import { ReviewSchema, VideoSchema } from "prisma/generated/zod";
import { z } from "zod";

export const VideoCompleteSchema = VideoSchema.extend({
  platform: z
    .object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
    })
    .optional(),
  categories: z
    .array(
      z.object({
        id: z.string(),
        slug: z.string(),
        name: z.string(),
      })
    )
    .optional(),
});

export const CreateVideoSchema = z.object({
  originalUrl: z.string(),
  categorySlug: z.string().optional(),
  // tags: z.array(z.string()).optional(),
});

export const UpdateVideoSchema = VideoSchema.partial();
