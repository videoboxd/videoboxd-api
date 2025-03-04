import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

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

app.get("/videos", (c) => {
  return c.json([
    {
      id: "abc",
      title: "Video 1",
      description: "This is a video",
      url: "https://www.youtube.com/watch?v=abc",
    },
    {
      id: "xyz",
      title: "Video 2",
      description: "This is a video",
      url: "https://www.youtube.com/watch?v=xyz",
    },
  ]);
});

export default app;
