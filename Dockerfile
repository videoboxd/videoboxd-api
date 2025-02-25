FROM oven/bun:1.1 

WORKDIR /app

COPY package.json /app

RUN bun install

COPY . /app

RUN bun prisma generate

EXPOSE 3000

CMD [ "bun", "start" ]
