import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { VideoCompleteSchema } from "./schema";
import { searchService } from "./service";

const searchRoute = new OpenAPIHono();

const handleErrorResponse = (c: any, message: string, status: number) => {
    return c.json({ message, success: false }, status);
};

const SearchQuerySchema = z.object({
    q: z.string().min(1).describe("Search video desc / title with type string"),
});

searchRoute.openapi(
    {
        method: "get",
        path: "/",
        summary: "Search videos",
        description: "Search for videos by title or description",
        tags: API_TAGS.SEARCH,
        parameters: [
            {
                name: "q",
                in: "query",
                required: true,
                schema: { type: "string" },
                description: "Search query string",
            }
        ],
        responses: {
            200: {
                description: "Successful search results",
                content: {
                    "application/json": {
                        schema: { schema: z.array(VideoCompleteSchema) },
                    },
                },
            },
            400: {
                description: "Invalid search parameters",
            },
            404: {
                description: "No search results found",
            },
            500: {
                description: "Internal server error",
            },
        },
    },
    async (c) => {
        try {
            const query = SearchQuerySchema.parse(c.req.query());
            const results = await searchService(query.q);

            return c.json({
                data: results,
            }, 200);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return handleErrorResponse(c, "Invalid search parameters", 400);
            }
            if (error instanceof HTTPException) {
                return handleErrorResponse(c, error.message, error.status);
            }
            return handleErrorResponse(c, `Search failed: ${error}`, 500);
        }
    }
);

export default searchRoute;