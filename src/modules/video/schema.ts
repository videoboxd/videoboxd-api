import { z } from "zod";
import {
  CategorySchema,
  PlatformSchema,
  VideoSchema,
  ReviewSchema,
  LikeSchema
} from "../../../prisma/generated/zod";
import { text } from "stream/consumers";

export const VideoCompleteSchema = VideoSchema.extend({
  platform: PlatformSchema,
  categories: z.array(CategorySchema),
});

export const CreateVideo = VideoSchema.pick({
  userId: true,
  platformVideoId: true,
  platformId: true,
  originalUrl: true,
  title: true,
  description: true,
  thumbnail: true,
  uploadedAt: true,
}).extend({
  review: ReviewSchema.shape.text,
  rating: ReviewSchema.shape.rating,
  isLiked: z.boolean().default(false)
})