import { ReviewSchema } from "@prisma/generated/zod";

export const CreateReviewSchema = ReviewSchema.pick({
  videoId: true,
  rating: true,
  text: true
});

export const UpdateReviewSchema = ReviewSchema.partial();
