import { clearAuthCookies, setAuthCookies } from "@/lib/cookie";
import { AppVariables, authMiddleware } from "@/middleware/auth-middleware";
import * as authSchema from "@auth/schema";
import * as authService from "@auth/service";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { User } from "@prisma/client";
import { getSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { API_TAGS } from "src/config";

const authRoute = new OpenAPIHono<{ Variables: AppVariables }>();

// Register User
authRoute.openapi(
  {
    method: "post",
    path: "/register",
    summary: "Register User",
    description:
      "Register a new user by providing required details such as username, email, and password. Returns the newly created user's information upon successful registration.",
    tags: API_TAGS.AUTH,
    request: {
      body: {
        content: {
          "application/json": {
            schema: authSchema.RegisterUser,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z
                .string()
                .default("Your account has been successfully created!"),
              data: z.object({
                id: z.number().default(1),
                username: z.string().default("Fathur"),
                fullName: z.string().default("Fathur"),
                email: z.string().default("fathur@mail.com"),
                avatarUrl: z
                  .string()
                  .default(
                    `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Fathur&size=64`
                  ),
              }),
            }),
          },
        },
      },
      400: {
        description:
          "Invalid input. Please check the provided data and try again.",
      },
      500: {
        description:
          "Internal server error. Failed to register user due to a server issue.",
      },
    },
  },
  async (c) => {
    const response = await authService.registerUser(c.req.valid("json"));

    return c.json(
      {
        success: true,
        message: "Your account has been successfully created!",
        data: response,
      },
      201
    );
  }
);

// Login User
authRoute.openapi(
  {
    method: "post",
    path: "/login",
    summary: "Login User",
    description:
      "Authenticates a user by validating their credentials (username and password). If successful, generates an access token and a refresh token. The access token is short-lived (1 day) and is used for authenticated requests, while the refresh token is long-lived (7 days) and can be used to obtain a new access token. Both tokens are returned as secure HTTP-only cookies.",
    tags: API_TAGS.AUTH,
    request: {
      body: {
        content: {
          "application/json": {
            schema: authSchema.LoginUser,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "User logged in successfully. The response includes user details such as ID, full name, email, and avatar URL.",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z.string().default("User logged in successfully"),
              data: z.object({
                id: z.number().default(1),
                fullName: z.string().default("Fathur"),
                email: z.string().default("fathur@mail.com"),
                avatarUrl: z
                  .string()
                  .default(
                    `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Fathur&size=64`
                  ),
              }),
            }),
          },
        },
      },
      401: {
        description:
          "Unauthorized. The request lacks valid authentication credentials or the provided credentials are invalid.",
      },
      500: {
        description:
          "Internal server error. Failed to register user due to a server issue.",
      },
    },
  },
  async (c) => {
    const { accessTokenPayload, refreshTokenPayload } =
      await authService.loginUser(c.req.valid("json"));

    const accessToken = await sign(
      accessTokenPayload,
      Bun.env.ACCESS_TOKEN_SECRET!
    );
    const refreshToken = await sign(
      refreshTokenPayload,
      Bun.env.REFRESH_TOKEN_SECRET!
    );

    await setAuthCookies(c, accessToken, refreshToken, Bun.env.COOKIE_SECRET!);

    return c.json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: accessTokenPayload.id,
        fullName: accessTokenPayload.fullName,
        email: accessTokenPayload.email,
        avatarUrl: accessTokenPayload.avatarUrl,
      },
    });
  }
);

// Get Current User
authRoute.openapi(
  {
    method: "get",
    path: "/me",
    summary: "Get current User",
    description:
      "Returns the authenticated user's data, including their ID, full name, email, and avatar URL. This endpoint requires a valid auth token cookie for authentication.",
    middleware: [authMiddleware],
    security: [{ authTokenCookie: [] }, { refreshTokenCookie: [] }],
    tags: API_TAGS.AUTH,
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z.string().default("Successfully fetched user data"),
              data: z.object({
                id: z.number().default(1),
                fullName: z.string().default("Fathur"),
                email: z.string().default("fathur@mail.com"),
                avatarUrl: z
                  .string()
                  .default(
                    "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=fathur&size=64"
                  ),
              }),
            }),
          },
        },
        description: "Successfully retrieved the authenticated user's data.",
      },
      401: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(false),
              message: z.string().default("Unauthorized"),
            }),
          },
        },
        description: "Unauthorized",
      },
      500: {
        description:
          "Internal server error. Failed to register user due to a server issue.",
      },
    },
  },
  async (c) => {
    const user = c.get("user") as User;
    return c.json({
      success: true,
      message: "Successfully fetched user data",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  }
);

// Refresh Token
authRoute.openapi(
  {
    method: "get",
    path: "/refresh",
    summary: "Refresh access token",
    description:
      "Generates a new access token using a valid refresh token. This endpoint is used to maintain user sessions without requiring re-authentication. It requires a valid refresh token cookie.",
    security: [{ authTokenCookie: [] }, { refreshTokenCookie: [] }],
    tags: API_TAGS.AUTH,
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z
                .string()
                .default("Access token refreshed successfully"),
              data: z.boolean().default(true),
            }),
          },
        },
        description:
          "Access token refreshed successfully. New access and refresh tokens have been set in cookies.",
      },
      401: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(false),
              message: z.string().default("Unauthorized"),
            }),
          },
        },
        description: "Unauthorized",
      },
      500: {
        description:
          "Internal server error. Failed to register user due to a server issue.",
      },
    },
  },
  async (c) => {
    // Get ref_token from cookie
    const refreshToken = await getSignedCookie(
      c,
      Bun.env.COOKIE_SECRET!,
      "refresh_token"
    );

    if (!refreshToken) {
      throw new HTTPException(401, {
        message: "No refresh token",
      });
    }

    const { newAccessToken, newRefreshToken } =
      await authService.generateNewTokens(refreshToken);

    await setAuthCookies(
      c,
      newAccessToken,
      newRefreshToken,
      Bun.env.COOKIE_SECRET!
    );

    return c.json({
      success: true,
      message: "Access token refreshed successfully",
      data: true,
    });
  }
);

// Logout User
authRoute.openapi(
  {
    method: "delete",
    path: "/me",
    summary: "Log out the current user",
    description:
      "Logs out the current user by clearing the access token and refresh token cookies. This effectively invalidates the user's session, and they will need to log in again to access protected routes.",
    middleware: [authMiddleware],
    security: [{ authTokenCookie: [] }, { refreshTokenCookie: [] }],
    tags: API_TAGS.AUTH,
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              message: z.string().default("User logged out successfully"),
              data: z.boolean().default(true),
            }),
          },
        },
        description:
          "User logged out successfully. Access and refresh token cookies have been cleared.",
      },
      401: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(false),
              message: z.string().default("Unauthorized"),
            }),
          },
        },
        description: "Unauthorized",
      },
      500: {
        description:
          "Internal server error. Failed to register user due to a server issue.",
      },
    },
  },
  async (c) => {
    const authToken = await getSignedCookie(
      c,
      Bun.env.COOKIE_SECRET!,
      "auth_token"
    );
    const refreshToken = await getSignedCookie(
      c,
      Bun.env.COOKIE_SECRET!,
      "refresh_token"
    );

    if (!authToken || !refreshToken) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    clearAuthCookies(c);

    return c.json({
      success: true,
      message: "User logged out succesfully",
      data: true,
    });
  }
);

export default authRoute;
