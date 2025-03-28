import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { Context } from "hono";
import { reviewService } from "./service";
import {
  authCookieMiddleware,
  AppVariables,
  authJWTMiddleware,
} from "@/middleware/auth-middleware";
import { CreateReviewSchema, UpdateReviewSchema } from "./schema";
import { ReviewSchema } from "@prisma/generated/zod";
import { HTTPException } from "hono/http-exception";

const reviewsRoute = new OpenAPIHono<{ Variables: { user: AppVariables } }>();

const handleErrorResponse = (c: any, message: string, status: number) => {
  return c.json({ message, success: false }, status);
};

reviewsRoute.openapi(
  {
    method: "get",
    path: "/",
    summary: "Get all reviews",
    description: "Return all movie review list",
    tags: API_TAGS.REVIEWS,
    responses: {
      200: {
        description: "Successfully get all reviews",
        content: {
          "application/json": { schema: z.object({}) },
        },
      },
      500: {
        description:
          "Internal server error. Failed to retrieve the list of reviews.",
      },
    },
  },
  async (c: Context) => {
    try {
      const reviews = await reviewService.getAllReviews();
      return c.json(
        {
          message: "Successfully retrieved all video reviews",
          content: reviews,
        },
        200
      );
    } catch (error) {
      return handleErrorResponse(
        c,
        `Failed to retrieve reviews: ${error}`,
        500
      );
    }
  }
);

reviewsRoute.openapi(
  {
    method: "get",
    path: "/{identifier}",
    summary: "Get review details",
    description: "Return the review details by review ID",
    tags: API_TAGS.REVIEWS,
    request: {
      params: z.object({ identifier: z.string() }),
    },
    responses: {
      200: {
        description: "Review details retrieved sucessfully",
        content: { "application/json": { schema: z.object({}) } },
      },
      404: { description: "Review not found. " },
      500: {
        description:
          "Internal server error. Failed to retrieve the list of reviews.",
      },
    },
  },

  async (c) => {
    try {
      const { identifier } = c.req.valid("param");
      const review = await reviewService.getReviewByIdentifier(identifier);
      if (!review) {
        return handleErrorResponse(c, "Review not found", 404);
      }
      return c.json(
        { message: "Review details retrieved sucessfully", content: review },
        200
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json({ message: error.message }, error.status);
      }
      return handleErrorResponse(
        c,
        `Failed to retrieve reviews: ${error}`,
        500
      );
    }
  }
);

reviewsRoute.openapi(
  {
    method: "post",
    path: "/",
    summary: "New review entry",
    description: "Create a new review entry",
    tags: API_TAGS.REVIEWS,
    security: [{ AuthorizationBearer: [] }],
    middleware: authJWTMiddleware,
    request: {
      body: { content: { "application/json": { schema: CreateReviewSchema } } },
    },
    responses: {
      201: {
        description: "Successfully create video review",
        content: { "application/json": { schema: ReviewSchema } },
      },
      400: { description: "Validation error" },
      404: { description: "Video not found" },
      500: {
        description: "Internal server error. Failed to create video review.",
      },
    },
  },

  async (c) => {
    try {
      const user = c.get("user") as AppVariables;
      const body = c.req.valid("json");
      const reviews = await reviewService.createReview(body, user.id);
      return c.json(
        { message: "Successfully create new video review", content: reviews },
        201
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json({ message: error.message }, error.status);
      }
      return handleErrorResponse(
        c,
        `Failed to retrieve reviews: ${error}`,
        500
      );
    }
  }
);

reviewsRoute.openapi(
  {
    method: "patch",
    path: "/{identifier}",
    summary: "Updates an existing review by ID.",
    tags: API_TAGS.REVIEWS,
    security: [{ AuthorizationBearer: [] }],
    middleware: authJWTMiddleware,
    request: {
      params: z.object({ identifier: z.string() }),
      body: { content: { "application/json": { schema: UpdateReviewSchema } } },
    },
    responses: {
      200: {
        description: "Review updated successfully",
        content: { "application/json": { schema: ReviewSchema } },
      },
      400: { description: "Validation error." },
      404: { description: "Review not found." },
      500: { description: "Internal server error. Failed to update a review." },
    },
  },

  async (c: Context) => {
    try {
      const identifier = c.req.param("identifier");
      if (!identifier) {
        return handleErrorResponse(c, "Identifier is required", 400);
      }

      const reviewData = await c.req.json<z.infer<typeof UpdateReviewSchema>>();
      const updatedReview = await reviewService.updateReview(
        identifier,
        reviewData
      );

      return c.json(
        { message: "Review updated sucessfully", content: updatedReview },
        200
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json({ message: error.message }, error.status);
      }
      return handleErrorResponse(c, `Failed to update review: ${error}`, 500);
    }
  }
);

reviewsRoute.openapi(
  {
    method: "delete",
    path: "/{identifier}",
    summary: "Delete a video review",
    description: "Delete a video review by ID.",
    tags: API_TAGS.REVIEWS,
    security: [{ AuthorizationBearer: [] }],
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
              message: z.string().default("Review deleted successfully"),
            }),
          },
        },
      },
      404: { description: "Review not found." },
      500: {
        description: "Internal server error. Failed to delete a video review.",
      },
    },
  },

  async (c: Context) => {
    try {
      const identifier = c.req.param("identifier");
      if (!identifier) {
        return handleErrorResponse(c, "Identifier is required", 400);
      }

      await reviewService.deleteReview(identifier);
      return c.json(
        { message: "Review deleted sucessfully", success: true },
        200
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json({ message: error.message }, error.status);
      }
      return handleErrorResponse(
        c,
        `Failed to delete a video review: ${error}`,
        500
      );
    }
  }
);

export default reviewsRoute;
