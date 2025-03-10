import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import * as videoSchema from "./schema";
import * as videoService from "./service";
import { authMiddleware, AppVariables } from "@/middleware/auth-middleware";
import { HTTPException } from "hono/http-exception";


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
    tags: API_TAGS.VIDEO,
    responses: {
      200: {
        description: "Successfully get all videos",
        content: {
          "application/json": {
            schema: z.array(videoSchema.VideoCompleteSchema),
          },
        },
      },
      500: {
        description: "Internal server error. Failed to retrieve the list of videos.",
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
    tags: API_TAGS.VIDEO,
    request: {
      params: z.object({ identifier: z.string() }),
    },
    responses: {
      200: {
        description: "Video details retrieved successfully",
        content: {
          "application/json": {
            schema: videoSchema.VideoCompleteSchema,
          },
        },
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


// Add Video
videosRoute.openapi(
  {
    method: "post",
    path: "/",
    summary: "Create a new video",
    description: "Creates a new video.",
    tags: API_TAGS.VIDEO,
    security: [{ authTokenCookie: [] }, { refreshTokenCookie: [] }],
    middleware: authMiddleware,
    request: {
      body: {
        content: {
          "application/json": {
            schema: videoSchema.CreateVideoSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Video created successfully",
        content: {
          "application/json": { schema: videoSchema.VideoCompleteSchema },
        },
      },
      400: {
        description: "Validation error",
      },
      404: {
        description: "Platform not found",
      },
      500: {
        description: "Failed to create video",
      },
    },
  },
  async (c) => {
    try {
      const user = c.get("user") as AppVariables;
      const videoData = await c.req.json<z.infer<typeof videoSchema.CreateVideoSchema>>();
      const video = await videoService.createVideo(videoData, user.id);
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
    tags: API_TAGS.VIDEO,
    security: [{ authTokenCookie: [] }, { refreshTokenCookie: [] }],
    middleware: authMiddleware,
    request: {
      params: z.object({ identifier: z.string() }),
    },
    responses: {
      200: {
        description: "Video deleted successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
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



export default videosRoute;