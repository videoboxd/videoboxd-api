import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { Context } from "hono";
import { reviewService } from "./service";
import { authMiddleware, AppVariables } from "@/middleware/auth-middleware";
import { CreateReviewSchema } from "./schema";
import { ReviewSchema } from "@prisma/generated/zod";
import { HTTPException } from "hono/http-exception";

const reviewsRoute = new OpenAPIHono<{Variables: { user: AppVariables };}>();

const handleErrorResponse = (c: any, message: string, status: number) => {
    return c.json({ message, success: false }, status);
}

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
            return c.json(reviews, 200);
        } catch(error) {
            return handleErrorResponse(c, `Failed to retrieve reviews: ${error}`, 500);
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
        middleware: authMiddleware,
        request: {
            body: { content: { "application/json": { schema: CreateReviewSchema } } },
        },
        responses: {
            201: {
                description: "Successfully create video review",
                content: { "application/json": { schema: ReviewSchema },},
            },
            400: { description: "Validation error" },
            404: { description: "Video not found" },
            500: { description: "Internal server error. Failed to create video review."},
        },
    },
    async (c: Context) => {
        try {
            const body = c.req.valid("json");
            const user = c.get("user") as AppVariables;
            const reviews = await reviewService.createReview( body, user.id );
            return c.json(reviews, 200);
        } catch(error) {
            if (error instanceof HTTPException) {
                return c.json({ message: error.message }, error.status);
            }
            return handleErrorResponse(c, `Failed to retrieve reviews: ${error}`, 500);
        }
    }
);

export default reviewsRoute;