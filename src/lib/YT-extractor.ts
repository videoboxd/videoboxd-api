import ytdl from 'ytdl-core';

interface VideoInfo {
  title: string;
  thumbnail: string;
  uploadDate: Date;
  description: string;
}

async function extractVideoInfo(videoUrl: string): Promise<VideoInfo | null> {
  try {
    const info = await ytdl.getBasicInfo(videoUrl);
    // console.log('Data yang dihasilkan oleh youtubeExtractor:', info.videoDetails);

    return {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      uploadDate: new Date(info.videoDetails.uploadDate),
      description: info.videoDetails.description!,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default extractVideoInfo;