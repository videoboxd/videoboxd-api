# Use the official Bun image with Debian Linux
FROM oven/bun:1.1

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy app files
COPY . .

# Install app dependencies
RUN bun run build

# Run the application
CMD ["bun", "start"]
