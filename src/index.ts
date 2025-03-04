import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Videoboxd API");
});

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
