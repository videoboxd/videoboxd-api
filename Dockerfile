# Use the official Bun image with Debian Linux
FROM oven/bun:1.1

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy app files
COPY . .

# Install app dependencies
RUN bun install
RUN bun db:gen

# Ensure yt-dlp binary is downloaded for deployment
# RUN bunx yt-dlp-wrap download

# Run the application
CMD ["bun", "start"]
