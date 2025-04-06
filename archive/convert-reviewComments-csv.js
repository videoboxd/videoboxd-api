const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Konfigurasi
const csvFilePath = path.join(__dirname, "reviewComments.csv");
const outputFilePath = path.join(__dirname, "data", "reviewComments.js");

const results = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    const reviewComments = results.map((row) => ({
      reviewVideoPlatformId: row.reviewVideoPlatformId,
      reviewUserUsername: row.reviewUserUsername,
      userUsername: row.userUsername,
      text: row.text,
    }));

    // Generate output string directly
    const outputString = `export const reviewComments = ${JSON.stringify(
      reviewComments,
      null,
      2
    ).replace(/"([^(")"]+)":/g, "$1:")};`;

    fs.writeFileSync(outputFilePath, outputString);
    console.info(`Conversion complete! Data written to ${outputFilePath}`);
  });
