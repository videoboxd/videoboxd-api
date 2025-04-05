import { prisma } from "@/lib/prisma";

export const categoryService = {
  getAllCategories: async () => {
    return await prisma.category.findMany({
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  getCategoryByIdentifier: async (identifier: string) => {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return category;
  },
};