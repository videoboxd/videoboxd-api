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
  reviews: z.array(ReviewSchema),
});

export const VideosCompleteSchema = z.array(VideoCompleteSchema);

export const CreateVideoSchema = z.object({
  originalUrl: z.string(),
  categorySlug: z.string(),
  // tags: z.array(z.string()).optional(),
});

export const UpdateVideoSchema = VideoSchema.partial();

export const YouTubeVideoInfoSchema = z.object({
  title: z.string(),
  description: z.string(),
  channelTitle: z.string(),
  thumbnails: z.object({
    maxres: z.object({ url: z.string() }),
  }),
  publishedAt: z.string(),
});
