import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import {
  authCookieMiddleware,
  AppVariables,
  authJWTMiddleware,
} from "@/middleware/auth-middleware";
import { HTTPException } from "hono/http-exception";
import { CreateVideoSchema, UpdateVideoSchema } from "./schema";
import { VideoCompleteSchema } from "@/features/video/schema";
import { videoService } from "./service";

const videosRoute = new OpenAPIHono<{
  Variables: { user: AppVariables };
}>();

const handleErrorResponse = (c: any, message: string, status: number) => {
  return c.json({ message, success: false }, status);
};

// Get All Videos
videosRoute.openapi(
  {
    method: "get",
    path: "/",
    summary: "Get all videos",
    description: "Returns a list of all videos in the system.",
    tags: API_TAGS.VIDEOS,
    responses: {
      200: {
        description: "Successfully get all videos",
        content: {
          "application/json": { schema: z.array(VideoCompleteSchema) },
        },
      },
      500: {
        description:
          "Internal server error. Failed to retrieve the list of videos.",
      },
    },
  },
  async (c) => {
    try {
      const videos = await videoService.getAllVideos();
      return c.json(videos, 200);
    } catch (error) {
      return handleErrorResponse(c, `Failed to retrieve videos: ${error}`, 500);
    }
  }
);

// Get Single Video
videosRoute.openapi(
  {
    method: "get",
    path: "/{identifier}",
    summary: "Get video details",
    description: "Returns the details of a video by ID or platformVideoId.",
    tags: API_TAGS.VIDEOS,
    request: {
      params: z.object({ identifier: z.string() }),
    },
    responses: {
      200: {
        description: "Video details retrieved successfully",
        content: { "application/json": { schema: VideoCompleteSchema } },
      },
      404: {
        description: "Video not found.",
      },
      500: {
        description: "Internal server error. Failed to retrieve video details.",
      },
    },
  },
  async (c) => {
    try {
      const { identifier } = c.req.valid("param");
      const video = await videoService.getVideoByIdentifier(identifier);
      if (!video) {
        return handleErrorResponse(c, "Video not found", 404);
      }
      return c.json(video, 200);
    } catch (error) {
      return handleErrorResponse(c, `Failed to retrieve video: ${error}`, 500);
    }
  }
);

// Create Video
videosRoute.openapi(
  {
    method: "post",
    path: "/",
    summary: "New video entry",
    description: "Create a new video entry.",
    tags: API_TAGS.VIDEOS,
    security: [{ AuthorizationBearer: [] }],
    middleware: authJWTMiddleware,
    request: {
      body: { content: { "application/json": { schema: CreateVideoSchema } } },
    },
    responses: {
      201: {
        description: "Video created successfully",
        content: { "application/json": { schema: VideoCompleteSchema } },
      },
      400: { description: "Validation error" },
      404: { description: "Platform not found" },
      500: { description: "Failed to create video" },
    },
  },
  async (c) => {
    try {
      const user = c.get("user") as AppVariables;
      const body = c.req.valid("json");
      const video = await videoService.createVideo(body, user.id);
      return c.json(video, 201);
    } catch (error) {
      return handleErrorResponse(c, `Failed to create video: ${error}`, 500);
    }
  }
);

// Delete Video
videosRoute.openapi(
  {
    method: "delete",
    path: "/{identifier}",
    summary: "Delete a video",
    description: "Deletes a video by ID.",
    tags: API_TAGS.VIDEOS,
    security: [{ accessTokenCookie: [] }, { refreshTokenCookie: [] }],
    middleware: authJWTMiddleware,
    request: {
      params: z.object({ identifier: z.string() }),
    },
    responses: {
      200: {
        description: "Video deleted successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().default("Video deleted successfully"),
            }),
          },
        },
      },
      404: {
        description: "Video not found.",
      },
      500: {
        description: "Internal server error. Failed to delete video.",
      },
    },
  },
  async (c) => {
    try {
      const identifier = c.req.param("identifier");
      if (!identifier) {
        return handleErrorResponse(c, "Identifier is required", 400);
      }

      await videoService.deleteVideo(identifier);
      return c.json({
        message: "Video deleted successfully",
        success: true,
      });
    } catch (error) {
      if (error instanceof HTTPException && error.status === 404) {
        return handleErrorResponse(c, error.message, 404);
      }
      return handleErrorResponse(c, `Failed to delete video: ${error}`, 500);
    }
  }
);

// Edit Video data
videosRoute.openapi(
  {
    method: "patch",
    path: "/{identifier}",
    summary: "Update a video",
    description: "Updates an existing video by ID.",
    tags: API_TAGS.VIDEOS,
    security: [{ accessTokenCookie: [] }, { refreshTokenCookie: [] }],
    middleware: authJWTMiddleware,
    request: {
      params: z.object({ identifier: z.string() }),
      body: { content: { "application/json": { schema: UpdateVideoSchema } } },
    },
    responses: {
      200: {
        description: "Video updated successfully",
        content: {
          "application/json": { schema: VideoCompleteSchema },
        },
      },
      400: {
        description: "Validation error",
      },
      404: {
        description: "Video not found.",
      },
      500: {
        description: "Internal server error. Failed to update video.",
      },
    },
  },
  async (c) => {
    try {
      const identifier = c.req.param("identifier");
      if (!identifier) {
        return handleErrorResponse(c, "Identifier is required", 400);
      }

      const videoData = await c.req.json<z.infer<typeof UpdateVideoSchema>>();
      const updatedVideo = await videoService.updateVideo(
        identifier,
        videoData
      );
      return c.json(updatedVideo, 200);
    } catch (error) {
      if (error instanceof HTTPException && error.status === 404) {
        return handleErrorResponse(c, error.message, 404);
      }
      return handleErrorResponse(c, `Failed to update video: ${error}`, 500);
    }
  }
);

export default videosRoute;
