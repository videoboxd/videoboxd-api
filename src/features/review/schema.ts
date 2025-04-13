import { VideoSchema, ReviewSchema, UserSchema } from "@prisma/generated/zod";

export const CreateReviewParamSchema = VideoSchema.pick({
  platformVideoId: true,
});

export const CreateReviewBodySchema = ReviewSchema.pick({
  rating: true,
  text: true,
});

export const GetReviewSchema = ReviewSchema.extend({
  user: UserSchema.omit({ password: true }),
});

export const UpdateReviewSchema = ReviewSchema.partial();
