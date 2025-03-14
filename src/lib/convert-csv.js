// const fs = require("fs");
// const csv = require("csv-parser");

// const results = [];

// fs.createReadStream("./videos.csv")
//   .pipe(csv())
//   .on("data", (data) => results.push(data))
//   .on("end", () => {
//     const videos = results.map((row) => ({
//       platformVideoId: row.platformVideoId,
//       originalUrl: row.originalUrl,
//       title: row.title,
//       description: row.description,
//       thumbnail: row.thumbnail,
//       uploadedAt: row.uploadedAt ? new Date(row.uploadedAt) : null,
//       createdAt: new Date(row.createdAt),
//       updatedAt: new Date(row.updatedAt),
//       platformSlug: row.platformSlug,
//       userUsername: row.userUsername,
//     }));

//     fs.writeFileSync("./data/videos.ts", `export const videos = ${JSON.stringify(videos, null, 2)};`);
//     console.log("Conversion complete!");
//   });

const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Konfigurasi
const csvFilePath = path.join(__dirname, "videos.csv"); // Path file CSV (relatif terhadap skrip)
const outputFilePath = path.join(__dirname, "data", "videos.js"); // Path file output (data/videos.js)

const results = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    const videos = results.map((row) => {
      const video = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          if (key === "uploadedAt" || key === "createdAt" || key === "updatedAt") {
            video[key] = row[key] ? new Date(row[key]) : null;
          } else {
            video[key] = row[key];
          }
        }
      }
      return video;
    });

    fs.writeFileSync(outputFilePath, `export const videos = ${JSON.stringify(videos, null, 2)};`);
    console.log(`Conversion complete! Data written to ${outputFilePath}`);
  });