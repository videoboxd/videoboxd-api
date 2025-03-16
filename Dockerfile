# Use the official Bun image with Debian Linux
# Oven is the company name, the creator of Bun
FROM oven/bun:1.1

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy app files
COPY . .

# Install app dependencies
RUN bun install
RUN bun db:gen

# Download yt-dlp binary manually and ensure it's available globally
RUN bunx yt-dlp-wrap download --path /usr/local/bin/yt-dlp

# Set executable permission (just in case)
RUN chmod +x /usr/local/bin/yt-dlp

# Run the application
CMD ["bun", "start"]


