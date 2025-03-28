import { OpenAPIHono, z } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import authRoute from "./features/auth/route";
import usersRoute from "./features/user/route";
import videosRoute from "./features/video/route";
import reviewsRoute from "./features/review/route";
import searchRoute from "./features/search/route";

const app = new OpenAPIHono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: [Bun.env.FE_URL!, Bun.env.BE_URL!],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    credentials: true,
  })
);

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

app.route("/auth", authRoute);
app.route("/users", usersRoute);
app.route("/videos", videosRoute);
app.route("/reviews", reviewsRoute);
app.route("/search", searchRoute);

// Error Handling
app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      success: false,
      message: err.message,
    });
  } else if (err instanceof ZodError) {
    c.status(400);
    return c.json({
      success: false,
      message: err,
    });
  } else {
    c.status(500);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

export default app;
