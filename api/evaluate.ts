import createCorsHeaders from "../lib/cors";
import { evaluateSchemaPrompt, OpenAIFileReference } from "../lib/llm";
import { verifyToken } from "../lib/token";
import { getOpenAIApiKey } from "../lib/utils";

export const config = {
  runtime: "edge",
};

interface EvaluationRequest {
  text: string;
  schema: string;
  system_prompt?: string;
  file_references?: OpenAIFileReference[];
  model?: string;
}

/**
 * Handles POST requests to evaluate a schema prompt with optional file references.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A response containing the evaluation result or an error message.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await verifyToken(request);

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { text, schema, system_prompt, file_references, model }: EvaluationRequest =
      await request.json();

    // Validate required fields
    if (!text || !schema) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text and schema" }),
        { status: 400, headers: createCorsHeaders() }
      );
    }

    const apiKey = getOpenAIApiKey();
    const systemPromptValue = system_prompt || "";

    // Use file references if provided
    const fileRefs = file_references || [];

    const res = await evaluateSchemaPrompt(
      text,
      schema,
      apiKey,
      systemPromptValue,
      fileRefs,
      model
    );

    return new Response(JSON.stringify(res), {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Evaluation failed: ${error}` }),
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
