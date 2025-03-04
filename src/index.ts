import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const app = new Hono();

app.get("/", (c) => {
  return c.text("Videoboxd API");
});

app.get('/videos', async (c) => {
  try {
    const videos = await prisma.video.findMany();
    return c.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return c.json({ error: 'Failed to fetch videos' }, 500);
  }
});

export default app;
