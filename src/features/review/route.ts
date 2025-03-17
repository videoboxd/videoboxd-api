import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { Context } from "hono";
import { reviewService } from "./service";

const reviewsRoute = new OpenAPIHono();

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

export default reviewsRoute;