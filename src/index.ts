import { Hono } from "hono";

// TODO:
// Setup openapi.json and scalar-hono-api-reference
// import { OpenAPIHono } from "@hono/zod-openapi";
// import { apiReference as scalarHonoApiReference } from "@scalar/hono-api-reference";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Videoboxd API");
});

// TODO:
// /videos endpoint

export default app;
