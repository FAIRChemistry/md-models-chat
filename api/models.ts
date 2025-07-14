import createCorsHeaders from "../lib/cors";
import { listAvailableModels } from "../lib/llm";
import { verifyToken } from "../lib/token";
import { getOpenAIApiKey } from "../lib/utils";

export const config = {
  runtime: "edge",
};

/**
 * Handles POST requests to list available models.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A response containing the list of available models or an error message.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await verifyToken(request);

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Get API key from environment
    const apiKey = getOpenAIApiKey();
    const models = await listAvailableModels(apiKey);

    return new Response(JSON.stringify(models), {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Models failed: ${error}` }),
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
