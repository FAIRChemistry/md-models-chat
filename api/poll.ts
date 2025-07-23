import createCorsHeaders from "../lib/cors";
import { pollResponse } from "../lib/llm";
import { verifyToken } from "../lib/token";
import { getOpenAIApiKey } from "../lib/utils";

export const config = {
  runtime: "edge",
};

/**
 * Handles POST requests to poll response status.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A response containing the poll result or an error message.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await verifyToken(request);

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Safely parse and validate JSON body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // Validate required fields
    const { responseId } = body;

    if (!responseId || typeof responseId !== 'string') {
      return new Response(
        JSON.stringify({ error: "responseId is required and must be a string" }),
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // Get API key from environment
    const apiKey = getOpenAIApiKey();
    const response = await pollResponse(apiKey, responseId);

    return new Response(JSON.stringify(response), {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Poll failed: ${error}` }),
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
