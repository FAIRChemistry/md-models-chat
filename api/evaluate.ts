import createCorsHeaders from "../lib/cors";
import { evaluateSchemaPrompt } from "../lib/llm";
import { verifyToken } from "../lib/token";
import { getOpenAIApiKey } from "../lib/utils";

export const config = {
  runtime: "edge",
};

interface EvaluationRequest {
  text: string;
  schema: string;
  api_key?: string;
}

/**
 * Handles POST requests to evaluate a schema prompt.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A response containing the evaluation result or an error message.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await verifyToken(request);

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let { text, schema, api_key }: EvaluationRequest = await request.json();
  const apiKey = getOpenAIApiKey(api_key);

  const res = await evaluateSchemaPrompt(text, schema, apiKey);

  return new Response(JSON.stringify(res), {
    headers: createCorsHeaders(),
  });
}