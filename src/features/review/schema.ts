import { VideoSchema, ReviewSchema } from "@prisma/generated/zod";

export const CreateReviewParamSchema = VideoSchema.pick({
  platformVideoId: true
});

export const CreateReviewBodySchema = ReviewSchema.pick({
  rating: true,
  text: true
});

export const UpdateReviewSchema = ReviewSchema.partial();
