import { PrismaClient } from "@prisma/client";

import { platforms } from "./data/platforms";
import { categories } from "./data/categories";

const prisma = new PrismaClient();

async function main() {
  console.info("🏁 Start seeding...");

  for (const platform of platforms) {
    const upsertedPlatform = await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: platform,
      create: platform,
    });
    console.info(`📺 Platform: ${upsertedPlatform.name}`);
  }

  for (const category of categories) {
    const upsertedCategory = await prisma.category.upsert({
      where: { slug: category.name },
      update: category,
      create: category,
    });
    console.info(`📚 Category: ${upsertedCategory.name}`);
  }

  // TODO: Into separate file
  const users = [
    {
      username: "Dery",
      email: "dery@example.com",
      password: "password123",
      fullName: "Dery",
      avatarUrl: "https://api.dicebear.com/9.x/open-peeps/svg?seed=UserOne",
    },
    {
      username: "Rifki",
      email: "rifki@example.com",
      password: "password123",
      fullName: "Rifki",
      avatarUrl: "https://api.dicebear.com/9.x/open-peeps/svg?seed=UserTwo",
    },
  ];

  const [user1, user2] = await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      })
    )
  );

  const youtube = await prisma.platform.findUnique({
    where: { slug: "youtube" },
  });
  if (!youtube) {
    console.error("YouTube platform not found");
    return null;
  }

  const videoData = {
    userId: user1.id,
    platformId: youtube.id,
    platformVideoId: "KjE2gZeWMic",
    originalUrl: "https://youtube.com/watch?v=KjE2gZeWMic",
    title: "Himzi Ngeledek Saya!",
    description: "Obrolan Dengan Seonggok Himzi",
    thumbnail: "https://i3.ytimg.com/vi/KjE2gZeWMic/maxresdefault.jpg",
    uploadedAt: new Date(),
  };

  const video1 = await prisma.video.upsert({
    where: { platformVideoId: "KjE2gZeWMic" },
    update: videoData,
    create: videoData,
  });

  const existingReview = await prisma.review.findFirst({
    where: { userId: user2.id, videoId: video1.id },
  });

  const review1 = existingReview
    ? await prisma.review.update({ where: { id: existingReview.id }, data: {} })
    : await prisma.review.create({
        data: {
          videoId: video1.id,
          userId: user2.id,
          rating: 5,
          text: "Kocaak banget!",
        },
      });

  const existingComment = await prisma.reviewComment.findFirst({
    where: { userId: user1.id, reviewId: review1.id },
  });

  if (!existingComment) {
    await prisma.reviewComment.create({
      data: {
        reviewId: review1.id,
        userId: user1.id,
        text: "HAHAHAHAHHA",
      },
    });
  }

  const existingPlaylist = await prisma.playlist.findFirst({
    where: { userId: user1.id, title: "Himzi" },
  });

  if (!existingPlaylist) {
    await prisma.playlist.create({
      data: {
        userId: user1.id,
        title: "Himzi",
        videos: { connect: { id: video1.id } },
      },
    });
  }

  const existingLike = await prisma.like.findFirst({
    where: { userId: user1.id, reviewId: review1.id },
  });

  if (!existingLike) {
    await prisma.like.create({
      data: {
        userId: user1.id,
        reviewId: review1.id,
      },
    });
  }

  const existingFollow = await prisma.follow.findFirst({
    where: { followerId: user1.id, followingId: user2.id },
  });

  if (!existingFollow) {
    await prisma.follow.create({
      data: {
        followerId: user1.id,
        followingId: user2.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
