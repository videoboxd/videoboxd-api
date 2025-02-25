# Mengambil image dari dockerhub
FROM oven/bun:debian 

# Set up workdirectory
WORKDIR /app

# check ada perubahan ga, kalo ga ada biar caching aja
COPY package.json /app

# Menjalankan perintah lokasi workdir
RUN bun install

# Copy semua file yang ada ke workdir
COPY . /app

RUN bunx prisma generate

# assign port yang digunakan di workdir
EXPOSE 3000


# Hanya menjalankan sebuah perintah di workdir ketika container dijalankan
CMD [ "bun", "start" ]
