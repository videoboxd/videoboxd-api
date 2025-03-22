import { PrismaClient } from "@prisma/client";

import { platforms } from "./data/platforms";
import { categories } from "./data/categories";
import { hashPassword } from "../src/lib/hash";
import { users } from "./data/users";
import { videos } from "./data/videos";
import { reviews } from "./data/reviews";
import { reviewComments } from "./data/reviewComments";
import { playlists } from "./data/playlists";
import { likes } from "./data/likes";
import { follows } from "./data/Follows";

const prisma = new PrismaClient();

async function main() {
  console.info("🏁 Start seeding...");

  // Platform
  for (const platform of platforms) {
    const upsertedPlatform = await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: platform,
      create: platform,
    });
    console.info(`🏰 Platform: ${upsertedPlatform.name}`);
  }

  // Categories
  for (const category of categories) {
    const upsertedCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
    console.info(`📚 Category: ${upsertedCategory.name}`);
  }

  // Users
  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { ...user, password: hashedPassword },
      create: { ...user, password: hashedPassword },
    });
    console.info(`👤 User: ${upsertedUser.username}`);
  }

 // Videos
for (const videoData of videos) {
  const platform = await prisma.platform.findUnique({
    where: { slug: videoData.platformSlug },
  });
  const user = await prisma.user.findUnique({
    where: { username: videoData.userUsername },
  });

  if (!platform || !user) {
    console.log("platform atau user tidak ditemukan");
    continue;
  }

  const { platformSlug, userUsername, categorySlug, ...videoDataWithoutSlugAndUsername } =
    videoData;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  // Periksa keberadaan kategori
  if (!category) {
    console.log(`Kategori dengan slug ${categorySlug} tidak ditemukan.`);
    continue;
  }

  const video = await prisma.video.upsert({
    where: { platformVideoId: videoData.platformVideoId },
    update: {
      ...videoDataWithoutSlugAndUsername,
      platformId: platform.id,
      userId: user.id,
      categories: {
        connect: { id: category.id }, // Perbaiki objek connect
      },
    },
    create: {
      ...videoDataWithoutSlugAndUsername,
      platformId: platform.id,
      userId: user.id,
      categories: {
        connect: { id: category.id }, // Perbaiki objek connect
      },
    },
  });
  console.info(` Video: ${video.title}`);
}

  // Reviews
for (const reviewData of reviews) {
  const video = await prisma.video.findUnique({
    where: { platformVideoId: reviewData.videoPlatformId },
  });
  const user = await prisma.user.findUnique({
    where: { username: reviewData.userUsername },
  });

  if (!video || !user) {
    console.log(
      `Video atau user tidak ditemukan untuk review ${reviewData.videoPlatformId} ${reviewData.userUsername}`
    );
    continue;
  }

  const { videoPlatformId, userUsername, ...reviewDataWithoutIds } = reviewData;

  const existingReview = await prisma.review.findFirst({
    where: { videoId: video.id, userId: user.id },
  });

  if (existingReview) {
    // Update review yang sudah ada
    const updatedReview = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        ...reviewDataWithoutIds,
        videoId: video.id,
        userId: user.id,
      },
    });
    console.info(`⭐ Review Updated: (${updatedReview.rating}) ${updatedReview.text}`);
  } else {
    // Buat review baru
    const newReview = await prisma.review.create({
      data: {
        ...reviewDataWithoutIds,
        videoId: video.id,
        userId: user.id,
      },
    });
    console.info(`⭐ Review Created: (${newReview.rating}) ${newReview.text}`);
  }
}
  // Comments on Videos
for (const commentData of reviewComments) {
  const review = await prisma.review.findFirst({
    where: {
      video: { platformVideoId: commentData.reviewVideoPlatformId },
      user: { username: commentData.reviewUserUsername },
    },
  });
  const user = await prisma.user.findUnique({
    where: { username: commentData.userUsername },
  });

  if (!review || !user) {
    console.log(
      `Review atau user tidak ditemukan untuk komentar ${commentData.reviewVideoPlatformId} ${commentData.reviewUserUsername} ${commentData.userUsername}`
    );
    continue;
  }

  const existingComment = await prisma.reviewComment.findFirst({
    where: { reviewId: review.id, userId: user.id },
  });

  if (existingComment) {
    // Update komentar yang sudah ada
    const updatedComment = await prisma.reviewComment.update({
      where: { id: existingComment.id },
      data: {
        text: commentData.text,
        reviewId: review.id,
        userId: user.id,
      },
    });
    console.info(` Review Comment Updated: ${updatedComment.text}`);
  } else {
    // Buat komentar baru
    const newComment = await prisma.reviewComment.create({
      data: {
        text: commentData.text,
        reviewId: review.id,
        userId: user.id,
      },
    });
    console.info(` Review Comment Created: ${newComment.text}`);
  }
}

// Playlists
for (const playlistData of playlists) {
  const user = await prisma.user.findUnique({
    where: { username: playlistData.userUsername },
  });

  if (!user) {
    console.log(`User tidak ditemukan untuk playlist ${playlistData.title}`);
    continue;
  }

  const existingPlaylist = await prisma.playlist.findFirst({
    where: { title: playlistData.title, userId: user.id },
  });

  const videoConnections = await Promise.all(
    playlistData.videoPlatformIds.map(async (platformVideoId) => {
      const video = await prisma.video.findUnique({
        where: { platformVideoId },
      });
      return { id: video?.id };
    })
  );

  if (existingPlaylist) {
    // Update playlist yang sudah ada
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: existingPlaylist.id },
      data: {
        title: playlistData.title,
        userId: user.id,
        videos: {
          connect: videoConnections,
        },
      },
    });
    console.info(`⏩ Playlist Updated: ${updatedPlaylist.title}`);
  } else {
    // Buat playlist baru
    const newPlaylist = await prisma.playlist.create({
      data: {
        title: playlistData.title,
        userId: user.id,
        videos: {
          connect: videoConnections,
        },
      },
    });
    console.info(`⏩ Playlist Created: ${newPlaylist.title}`);
  }
}

// Likes
for (const likeData of likes) {
  const review = await prisma.review.findFirst({
    where: {
      video: { platformVideoId: likeData.reviewVideoPlatformId },
      user: { username: likeData.reviewUserUsername },
    },
  });
  const user = await prisma.user.findUnique({
    where: { username: likeData.userUsername },
  });

  if (!review || !user) {
    console.log(
      `Review atau user tidak ditemukan untuk like ${likeData.reviewVideoPlatformId} ${likeData.reviewUserUsername} ${likeData.userUsername}`
    );
    continue;
  }

  const existingLike = await prisma.like.findFirst({
    where: { reviewId: review.id, userId: user.id },
  });

  if (existingLike) {
    // Update like yang sudah ada
    const updatedLike = await prisma.like.update({
      where: { id: existingLike.id },
      data: {
        reviewId: review.id,
        userId: user.id,
      },
      include: { user: { select: { username: true } } },
    });
    console.info(`👍 Like Updated: ${updatedLike.user.username}`);
  } else {
    // Buat like baru
    const newLike = await prisma.like.create({
      data: {
        reviewId: review.id,
        userId: user.id,
      },
      include: { user: { select: { username: true } } },
    });
    console.info(`👍 Like Created: ${newLike.user.username}`);
  }
}


// Follows
for (const followData of follows) {
  const follower = await prisma.user.findUnique({
    where: { username: followData.followerUsername },
  });
  const following = await prisma.user.findUnique({
    where: { username: followData.followingUsername },
  });

  if (!follower || !following) {
    console.log(
      `Follower atau following tidak ditemukan untuk follow ${followData.followerUsername} ${followData.followingUsername}`
    );
    continue;
  }

  const existingFollow = await prisma.follow.findFirst({
    where: { followerId: follower.id, followingId: following.id },
  });

  if (existingFollow) {
    // Update follow yang sudah ada
    const updatedFollow = await prisma.follow.update({
      where: { id: existingFollow.id },
      data: {
        followerId: follower.id,
        followingId: following.id,
      },
      include: {
        follower: { select: { username: true } },
        following: { select: { username: true } },
      },
    });
    console.info(
      `🪿 Follow Updated: ${updatedFollow.follower.username} -> ${updatedFollow.following.username}`
    );
  } else {
    // Buat follow baru
    const newFollow = await prisma.follow.create({
      data: {
        followerId: follower.id,
        followingId: following.id,
      },
      include: {
        follower: { select: { username: true } },
        following: { select: { username: true } },
      },
    });
    console.info(
      `🪿 Follow Created: ${newFollow.follower.username} -> ${newFollow.following.username}`
    );
  }
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
