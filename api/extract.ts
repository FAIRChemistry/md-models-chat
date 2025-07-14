import createCorsHeaders from "../lib/cors";
import extractToSchema, { OpenAIFileReference } from "../lib/llm";
import { verifyToken } from "../lib/token";
import { getOpenAIApiKey } from "../lib/utils";

export const config = {
  runtime: "edge",
};

interface ExtractRequest {
  text: string;
  schema: string;
  multiple_outputs: boolean;
  system_prompt?: string;
  file_references?: OpenAIFileReference[];
  model?: string;
}

/**
 * Handles POST requests to extract data to a specified schema.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A response containing the extraction result or an error message.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await verifyToken(request);

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    let { text, schema, multiple_outputs, system_prompt, file_references, model }: ExtractRequest = await request.json();

    // Validate the required fields
    if (!text || !schema) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text and schema" }),
        { status: 400, headers: createCorsHeaders() }
      );
    }

    const apiKey = getOpenAIApiKey();
    const systemPromptValue = system_prompt || "";
    const fileRefs = file_references || [];

    const res = await extractToSchema(
      schema,
      text,
      apiKey,
      multiple_outputs,
      systemPromptValue,
      fileRefs,
      model
    );

    if (res.error) {
      return new Response(JSON.stringify(res), {
        status: 400,
        headers: createCorsHeaders(),
      });
    }

    return new Response(JSON.stringify(res), {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: `Extraction failed: ${message}` }),
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
