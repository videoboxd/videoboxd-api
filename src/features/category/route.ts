import { API_TAGS } from "@/config";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { CategoryCompleteSchema } from "./schema";
import { categoryService } from "./service";

const categoriesRoute = new OpenAPIHono();

const handleErrorResponse = (c: any, message: string, status: number) => {
  return c.json({ message, success: false }, status);
};

// Get All Categories
categoriesRoute.openapi(
  {
    method: "get",
    path: "/",
    summary: "Get all categories",
    description: "Returns a list of all categories in the system.",
    tags: API_TAGS.Category,
    responses: {
      200: {
        description: "Successfully get all categories",
        content: {
          "application/json": { schema: z.array(CategoryCompleteSchema) },
        },
      },
      500: {
        description:
          "Internal server error. Failed to retrieve the list of categories.",
      },
    },
  },
  async (c) => {
    try {
      const categories = await categoryService.getAllCategories();
      return c.json(categories, 200);
    } catch (error) {
      return handleErrorResponse(c, `Failed to retrieve categories: ${error}`, 500);
    }
  }
);

// Get Single Category
categoriesRoute.openapi(
  {
    method: "get",
    path: "/{identifier}",
    summary: "Get category details",
    description: "Returns the details of a category by ID or slug.",
    tags: API_TAGS.Category,
    request: {
      params: z.object({ identifier: z.string() }),
    },
    responses: {
      200: {
        description: "Category details retrieved successfully",
        content: { "application/json": { schema: CategoryCompleteSchema } },
      },
      404: {
        description: "Category not found.",
      },
      500: {
        description: "Internal server error. Failed to retrieve category details.",
      },
    },
  },
  async (c) => {
    try {
      const { identifier } = c.req.valid("param");
      const category = await categoryService.getCategoryByIdentifier(identifier);
      if (!category) {
        return handleErrorResponse(c, "Category not found", 404);
      }
      return c.json(category, 200);
    } catch (error) {
      return handleErrorResponse(c, `Failed to retrieve category: ${error}`, 500);
    }
  }
);

export { categoriesRoute };