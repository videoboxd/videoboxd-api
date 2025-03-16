# Use Bun's official image
FROM oven/bun:1.1

# Set working directory
WORKDIR /usr/src/app

# Install yt-dlp standalone (no Python needed)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Verify installation
RUN yt-dlp --version

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN bun prisma generate

# Expose the correct port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]
