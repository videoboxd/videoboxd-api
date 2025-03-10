import { OpenAPIHono, z } from "@hono/zod-openapi";
import { API_TAGS } from "@/config";
import * as videoSchema from "../../modules/video/schema";
import { submitVideoReview } from "./service";

const videoRoute = new OpenAPIHono();

videoRoute.openapi(
    {
        method: "post",
        path: "/",
        summary: "Create New Video",
        description: "Create new video from various platform",
        tags: API_TAGS.VIDEOS,
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: videoSchema.CreateVideo,
                    },
                },
            },
        },
        responses: {
            401: {
                description: "Unauthorized. The request lacks valid authentication credentials or the provided credentials are invalid.",
            },
            500: {
                description: "Internal server error. Failed to register user due to a server issue.",
            },
        }
    },
    async (c) => {
        const body = c.req.valid("json");
        const response = await submitVideoReview(body);

        // example:
        // {
        //     "userId": "01JNVW6V1T9EN4V4E4X07B4DYC",
        //     "platformVideoId": "5_827rcK28E",
        //     "platformId": "01JNVW6TVP5XT4R93DEW01015J",
        //     "originalUrl": "https://www.youtube.com/watch?v=5_827rcK28E",
        //     "title": "Relaxing Jazz Playlist with Snoopy 🎧 Music so that you're not eating alone",
        //     "description": "A relaxing music with Snoopy animation",
        //     "thumbnail": "https://img.youtube.com/vi/5_827rcK28E/0.jpg",
        //     "uploadedAt": "2025-03-09T18:28:00.123Z",
        //     "review": "Music is soo goood, I felt so alive",
        //     "rating": 5,
        //     "isLiked": true
        // }

        return c.json(
            {
                success: true,
                message: "Successfully created new video",
                data: response
            },
            201
        );
    }
)

export default videoRoute;