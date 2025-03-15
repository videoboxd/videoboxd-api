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
    console.info(`📺 Platform: ${upsertedPlatform.name}`);
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

  // User
  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { ...user, password: hashedPassword },
      create: { ...user, password: hashedPassword },
    });
    console.info(`👤 User: ${upsertedUser.username}`);
  }

  // Video
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

    // Buat objek baru tanpa platformSlug dan userUsername
    const { platformSlug, userUsername, ...videoDataWithoutSlugAndUsername } =
      videoData;

    const video = await prisma.video.upsert({
      where: { platformVideoId: videoData.platformVideoId },
      update: {
        ...videoDataWithoutSlugAndUsername,
        platformId: platform.id,
        userId: user.id,
      },
      create: {
        ...videoDataWithoutSlugAndUsername,
        platformId: platform.id,
        userId: user.id,
      },
    });
    console.info(` Video: ${video.title}`);
  }

  // Seeding Reviews
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

    // Buat objek baru tanpa videoPlatformId dan userUsername
    const { videoPlatformId, userUsername, ...reviewDataWithoutIds } =
      reviewData;

    const review = await prisma.review.create({
      data: {
        ...reviewDataWithoutIds,
        videoId: video.id,
        userId: user.id,
      },
    });
    console.info(` Review: ${review.id}`);
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

    const comment = await prisma.reviewComment.create({
      data: {
        text: commentData.text,
        reviewId: review.id,
        userId: user.id,
      },
    });
    console.info(` Review Comment: ${comment.id}`);
  }

  // Playlist
  for (const playlistData of playlists) {
    const user = await prisma.user.findUnique({
      where: { username: playlistData.userUsername },
    });

    if (!user) {
      console.log(`User tidak ditemukan untuk playlist ${playlistData.title}`);
      continue;
    }

    const playlist = await prisma.playlist.create({
      data: {
        title: playlistData.title,
        userId: user.id,
        videos: {
          connect: await Promise.all(
            playlistData.videoPlatformIds.map(async (platformVideoId) => {
              const video = await prisma.video.findUnique({
                where: { platformVideoId },
              });
              return { id: video?.id };
            })
          ),
        },
      },
    });
    console.info(` Playlist: ${playlist.title}`);
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

    const like = await prisma.like.create({
      data: {
        reviewId: review.id,
        userId: user.id,
      },
    });
    console.info(` Like: ${like.id}`);
  }

  // Follow
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

    const follow = await prisma.follow.create({
      data: {
        followerId: follower.id,
        followingId: following.id,
      },
    });
    console.info(` Follow: ${follow.id}`);
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
