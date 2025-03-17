import fs from 'fs';
import YTDlpWrap from 'yt-dlp-wrap'
import { HTTPException } from 'hono/http-exception'

interface VideoInfo {
  title: string
  thumbnail: string
  uploadDate: string | null
  description: string
}

async function initializaYtWrap() {
  const DIR_PATH = './lib/yt-dlp-wrap';
  const FILE_PATH = `${DIR_PATH}/yt-dlp`;
  
  if (!fs.existsSync(DIR_PATH)) {
      fs.mkdirSync(DIR_PATH, { recursive: true });
  }
  
  if (!fs.existsSync(FILE_PATH)) {
      console.log('yt-dlp not found. Downloading latest version...');
  
      const latestVersion = (await YTDlpWrap.getGithubReleases(1, 1))[0].tag_name;
      
      await YTDlpWrap.downloadFromGithub(
          FILE_PATH,
          latestVersion,
          'darwin'
      );
  }

  const ytDlpWrap = new YTDlpWrap(FILE_PATH);

  return ytDlpWrap
}


async function extractVideoInfo(videoUrl: string): Promise<VideoInfo | null> {
  try {
    const ytDlpWrap = await initializaYtWrap();

    let metadata = await ytDlpWrap.getVideoInfo(
      videoUrl
    );

    const result = {
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      uploadDate: metadata.upload_date,
      description: metadata.description
    }

    return result
  } catch (error) {
    console.error('Error extracting video info:', error)
    throw new HTTPException(500, { message: 'Failed to extract video info.' })
  }
}

export default extractVideoInfo
