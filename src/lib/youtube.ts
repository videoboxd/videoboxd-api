import youtubedl from "youtube-dl-exec";

async function getVideoInfo(videoUrl: string) {
  return await youtubedl(videoUrl, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ["referer:youtube.com", "user-agent:googlebot"],
  });
}

getVideoInfo("https://www.youtube.com/watch?v=VChRPFUzJGA").then((result) =>
  console.log(result)
);
