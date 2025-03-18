import { youtube } from "@googleapis/youtube";

const youtubeClient = youtube({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY,
});

export async function getVideoInfo(videoId: string) {
  const result = await youtubeClient.videos.list({
    id: [videoId],
    part: ["id", "snippet"],
  });

  if (!result.data.items || result.data.items.length === 0) {
    return null;
  }

  return result.data.items[0].snippet;
}
