import { create } from 'youtube-dl-exec'
import { HTTPException } from 'hono/http-exception'

interface VideoInfo {
  title: string
  thumbnail: string
  uploadDate: Date | null // Bisa null jika parsing gagal
  description: string
}

const ytDlpPath = './yt-dlp.exe' // Pastikan path benar
const ytdlExec = create(ytDlpPath)

async function extractVideoInfo(videoUrl: string): Promise<VideoInfo | null> {
  try {
    console.log('Current working directory:', process.cwd()) // Debugging log

    const output = await ytdlExec(videoUrl, {
      dumpJson: true,
    })

    if (typeof output !== 'object') {
      throw new Error('Unexpected response format')
    }

    // Parsing tanggal dengan benar
    let uploadDate: Date | null = null
    if (output.upload_date) {
      const dateString = output.upload_date.toString() // Misalnya: '20240312'
      if (dateString.length === 8) {
        const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`
        uploadDate = new Date(formattedDate) // Format menjadi 'YYYY-MM-DD'
      }
    }

    return {
      title: output.title,
      thumbnail: output.thumbnail,
      uploadDate: uploadDate, // Pastikan ini adalah Date atau null
      description: output.description,
    }
  } catch (error: any) {
    console.error('Error extracting video info:', error)
    throw new HTTPException(500, { message: 'Failed to extract video info.' })
  }
}

export default extractVideoInfo
