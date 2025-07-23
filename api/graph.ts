import createCorsHeaders from "../lib/cors";
import { createKnowledgeGraph, OpenAIFileReference } from "../lib/llm";
import { verifyToken } from "../lib/token";
import { getOpenAIApiKey } from "../lib/utils";

export const config = {
  runtime: "edge",
};

interface GraphRequest {
  prompt: string;
  pre_prompt: string;
  file_references?: OpenAIFileReference[];
  model?: string;
}

/**
 * Handles POST requests to generate a knowledge graph.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await verifyToken(request);

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    let { prompt, file_references, model }: GraphRequest = await request.json();

    const apiKey = getOpenAIApiKey();
    const fileRefs = file_references || [];

    const res = await createKnowledgeGraph(
      prompt,
      apiKey,
      fileRefs,
      model
    );

    return new Response(JSON.stringify({ responseId: res }), {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    return new Response(`Error generating response: ${error}`, {
      status: 500,
      headers: createCorsHeaders(),
    });
  }
}
