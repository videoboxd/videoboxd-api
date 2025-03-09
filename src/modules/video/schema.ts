import { z } from "zod";
import {
  CategorySchema,
  PlatformSchema,
  VideoSchema,
  ReviewSchema,
  LikeSchema
} from "../../../prisma/generated/zod";
import { text } from "stream/consumers";
import { platform } from "os";

export const VideoCompleteSchema = VideoSchema.extend({
  platform: PlatformSchema,
  categories: z.array(CategorySchema),
});

export const CreateVideo = VideoSchema.pick({
  userId: true,
  platformVideoId: true,
  originalUrl: true,
  title: true,
  description: true,
  thumbnail: true,
  uploadedAt: true,
}).extend({
  review: ReviewSchema.shape.text,
  rating: ReviewSchema.shape.rating,
  platform: z.string(),
  isLiked: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})