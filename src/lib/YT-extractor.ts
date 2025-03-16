import YTDlpWrap from 'yt-dlp-wrap'
import { HTTPException } from 'hono/http-exception'

interface VideoInfo {
  title: string
  thumbnail: string
  uploadDate: Date | null
  description: string
}


const ytDlp = new YTDlpWrap('/usr/bin/yt-dlp'); // Set the correct system path
 

async function extractVideoInfo(videoUrl: string): Promise<VideoInfo | null> {
  try {
    const output = await ytDlp.execPromise([
      videoUrl,
      '--dump-json', // Get all video metadata as JSON
    ])

    const videoData = JSON.parse(output)

    // Parse the upload date safely
    let uploadDate: Date | null = null
    if (videoData.upload_date) {
      const dateString = videoData.upload_date.toString()
      if (dateString.length === 8) {
        const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`
        uploadDate = new Date(formattedDate)
      }
    }

    return {
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      uploadDate,
      description: videoData.description,
    }
  } catch (error) {
    console.error('Error extracting video info:', error)
    throw new HTTPException(500, { message: 'Failed to extract video info.' })
  }
}

export default extractVideoInfo
