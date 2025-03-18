import fs from "fs";
import YTDlpWrap from "yt-dlp-wrap";
import { HTTPException } from "hono/http-exception";

interface VideoInfo {
  title: string;
  thumbnail: string;
  uploadDate: string | null;
  description: string;
}

async function initializaYtWrap() {
  const DIR_PATH = "./lib/yt-dlp-wrap";
  const FILE_PATH = `${DIR_PATH}/yt-dlp`;

  if (!fs.existsSync(DIR_PATH)) {
    fs.mkdirSync(DIR_PATH, { recursive: true });
  }

  if (!fs.existsSync(FILE_PATH)) {
    console.log("yt-dlp not found. Downloading latest version...");

    const latestVersion = (await YTDlpWrap.getGithubReleases(1, 1))[0].tag_name;

    await YTDlpWrap.downloadFromGithub(FILE_PATH, latestVersion, "darwin");
  }

  return new YTDlpWrap(FILE_PATH);
}

async function extractVideoInfo(videoUrl: string): Promise<VideoInfo | null> {
  try {
    const ytDlpWrap = await initializaYtWrap();

    // Introduce a delay (2-5 seconds)
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    // Execute yt-dlp with custom arguments
    const result = await ytDlpWrap.execPromise([
      videoUrl,
      "--dump-json", // Extract full metadata in JSON format
      "--user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "-f",
      "b", // Use 'b' instead of 'best'
    ]);

    const metadata = JSON.parse(result);

    return {
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      uploadDate: metadata.upload_date,
      description: metadata.description,
    };
  } catch (error) {
    console.error("Error extracting video info:", error);
    throw new HTTPException(500, { message: "Failed to extract video info." });
  }
}

export default extractVideoInfo;
