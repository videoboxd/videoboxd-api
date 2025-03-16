# Use Bun's official image
FROM oven/bun:1.1

# Set working directory
WORKDIR /usr/src/app

# Install curl and download yt-dlp standalone binary
RUN apt-get update && apt-get install -y curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Verify installation
RUN /usr/local/bin/yt-dlp --version

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN bun prisma generate

# Expose the correct port (adjust if needed)
# EXPOSE 3000

# Start the app
CMD ["bun", "start"]
