import { z } from "zod";
import {
  CategorySchema,
  PlatformSchema,
  VideoSchema,
} from "../../../prisma/generated/zod";

export const VideoCompleteSchema = VideoSchema.extend({
  platform: PlatformSchema,
  categories: z.array(CategorySchema),
});
