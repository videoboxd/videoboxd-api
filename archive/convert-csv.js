const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Konfigurasi
const csvFilePath = path.join(__dirname, "videos.csv");
const outputFilePath = path.join(__dirname, "data", "videos.js");

const results = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    const videos = results.map((row) => ({
      id: row.id,
      userId: row.userId,
      platformId: row.platformId,
      platformVideoId: row.platformVideoId,
      originalUrl: row.originalUrl,
      title: row.title,
      description: row.description,
      thumbnailUrl: row.thumbnail,
      uploadedAt: row.uploadedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      platformSlug: row.platformSlug,
      userUsername: row.userUsername,
      categorySlug: row.categorySlug, // Ubah menjadi categorySlug (tunggal)
    }));

    // Generate output string directly
    const outputString = `export const videos = ${JSON.stringify(
      videos,
      null,
      2
    ).replace(/"([^(")"]+)":/g, "$1:")};`;

    fs.writeFileSync(outputFilePath, outputString);
    console.info(`Conversion complete! Data written to ${outputFilePath}`);
  });
