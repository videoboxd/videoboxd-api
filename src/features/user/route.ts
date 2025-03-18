import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import * as userSchema from "@user/schema";
import * as userService from "@user/service";

const usersRoute = new OpenAPIHono();

usersRoute.openapi(
  {
    method: "get",
    path: "/",
    summary: "Get all users",
    description:
      "Returns a list of all users in the system. This endpoint does not support pagination, so all users will be returned in a single response.",
    tags: API_TAGS.USER,
    responses: {
      200: {
        description: "Successfully get all users",
        content: { "application/json": { schema: userSchema.GetUsers } },
      },
      500: { description: "Failed to get all users" },
    },
  },
  async (c) => {
    const users = await userService.getAllUsers();
    return c.json(users);
  }
);

usersRoute.openapi(
  {
    method: "get",
    path: "/{identifier}",
    summary: "Get user details",
    description:
      "Returns the details of a user by searching with their ID, username, or email.",
    tags: API_TAGS.USER,
    request: {
      params: userSchema.UserSearchParam,
    },
    responses: {
      200: {
        description: "User details retrieved successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z
                .string()
                .default("User details retrieved successfully"),
              data: userSchema.GetUserDetail,
            }),
          },
        },
      },
      404: {
        description:
          "User not found. The provided ID, username, or email does not match any user.",
      },
      500: {
        description: "Internal server error. Failed to retrieve user details.",
      },
    },
  },
  async (c) => {
    const { identifier } = c.req.valid("param");

    const user = await userService.getUserByParam(identifier);

    return c.json(user);
  }
);

export default usersRoute;
