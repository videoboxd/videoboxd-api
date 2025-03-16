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

# Install yt-dlp separately
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install --break-system-packages yt-dlp

# Run the application
CMD ["bun", "start"]


