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

# Install yt-dlp
RUN apt-get update && apt-get install -y yt-dlp

# Run the application
CMD ["bun", "start"]