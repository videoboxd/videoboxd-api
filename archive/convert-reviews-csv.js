const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Konfigurasi
const csvFilePath = path.join(__dirname, "reviews.csv"); // Path file CSV (relatif terhadap skrip)
const outputFilePath = path.join(__dirname, "data", "reviews.js"); // Path file output (data/reviews.js)

const results = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    const reviews = results.map((row) => ({
      videoPlatformId: row.platformVideoId,
      userUsername: row.userUsername,
      rating: parseInt(row.rating), // Konversi rating ke integer
      text: row.text,
    }));

    // Generate output string directly
    const outputString = `export const reviews = ${JSON.stringify(reviews, null, 2).replace(/"([^(")"]+)":/g, '$1:')};`;

    fs.writeFileSync(outputFilePath, outputString);
    console.log(`Conversion complete! Data written to ${outputFilePath}`);
  });