import { CategorySchema } from "prisma/generated/zod";
import { z } from "zod";

export const CategoryCompleteSchema = CategorySchema.extend({
  videos: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        thumbnailUrl: z.string().optional(),
      })
    )
    .optional(),
});