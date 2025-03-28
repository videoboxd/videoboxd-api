import { prisma } from "@/lib/prisma";
import { VideoCompleteSchema } from "./schema";
import { HTTPException } from "hono/http-exception";

export const searchService = async (query: string) => {
    const result = await prisma.video.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        },
        include: {
            platform: true,
            categories: true,
        },
    });

    if (!result) {
        throw new HTTPException(404, { message: "Video not found" });
    }

    const parsedResult = VideoCompleteSchema.array().parse(result);

    return parsedResult;
}