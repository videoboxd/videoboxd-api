const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("./videos.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    const videos = results.map((row) => ({
      platformVideoId: row.platformVideoId,
      originalUrl: row.originalUrl,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail,
      uploadedAt: row.uploadedAt ? new Date(row.uploadedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      platformSlug: row.platformSlug,
      userUsername: row.userUsername,
    }));

    fs.writeFileSync("./data/videos.ts", `export const videos = ${JSON.stringify(videos, null, 2)};`);
    console.log("Conversion complete!");
  });