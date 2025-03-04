import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prisma } from "./lib/prisma";

const app = new OpenAPIHono();

app.use(logger());
app.use(cors({ origin: "*" }));

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    version: "0.0.1",
    title: "Videoboxd API",
    description: "API for videoboxd.com",
  },
});

app.get(
  "/",
  apiReference({
    pageTitle: "Videoboxd API",
    theme: "alternate",
    spec: {
      url: "/openapi.json",
    },
  })
);

app.get("/videos", async (c) => {
  try {
    const videos = await prisma.video.findMany({
      include: {
        platform: true,
        categories: true,
      },
    });
    return c.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return c.json({ error: "Failed to fetch videos" }, 500);
  }
});

export default app;
