import OpenAI from "openai";
import zodToJsonSchema from "zod-to-json-schema";
import { KnowledgeGraphSchema } from "./schemes";
import { EVALUATION_PROMPT, KNOWLEDGE_GRAPH_PROMPT } from "./prompts";

export interface ExtractionEvaluation {
  fits: boolean;
  reason: string;
}

const LLM_MODEL = process.env.LLM_MODEL ?? "gpt-4o";
const DEFAULT_PRE_PROMPT = `You are a helpful assistant that understands JSON schemas. 
  If you think the given text does not fit the schema, set the 'fits' 
  property to false and leave the 'data' or 'items' property empty. Otherwise, 
  set it to true and fill in the 'data' or 'items' property with the data that fits the schema.
  
  You are tasked to extract data from a given text. If something is not supplied directly, leave it empty.`;

/**
 * Extracts data from a given text based on a specified schema and knowledge graph.
 *
 * @param {string} schema - The JSON schema to validate against.
 * @param {z.infer<typeof KnowledgeGraphSchema>} graph - The knowledge graph containing triplets.
 * @param {string} apiKey - The API key for authentication.
 * @param {boolean} multipleOutputs - Flag indicating if multiple outputs are expected.
 * @returns {Promise<any>} - The extracted data that fits the schema.
 * @throws {Error} - Throws an error if the graph structure is invalid.
 */
export default async function extractToSchema(
  schema: string,
  text: string,
  apiKey: string,
  multipleOutputs: boolean,
  systemPrompt: string
) {
  const client = setupClient(apiKey);
  let schema_obj = JSON.parse(schema);

  if (multipleOutputs) {
    schema_obj = {
      type: "object",
      properties: {
        fits: {
          type: "boolean",
          description: "Whether the given text fits the schema.",
        },
        items: {
          type: "array",
          items: schema_obj,
        },
      },
      additionalProperties: false,
      required: [],
    };
  }

  // const prompt = convertKnowledgeGraphToTriplets(graph);
  const prompt = text;
  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: "user", content: systemPrompt },
      { role: "user", content: DEFAULT_PRE_PROMPT },
      { role: "user", content: prompt },
    ],
    model: LLM_MODEL,
    temperature: 0.0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "response",
        strict: true,
        schema: schema_obj,
      },
    },
  });

  return JSON.parse(chatCompletion.choices[0].message.content ?? "");
}

/**
 * Evaluates a text against a specified schema to determine if it fits.
 *
 * @param {string} text - The text to evaluate.
 * @param {string} schema - The JSON schema to validate against.
 * @param {string} apiKey - The API key for authentication.
 * @returns {Promise<ExtractionEvaluation>} - An object indicating if the text fits the schema and the reason.
 */
export async function evaluateSchemaPrompt(
  text: string,
  schema: string,
  apiKey: string,
  systemPrompt: string
): Promise<ExtractionEvaluation> {
  const client = setupClient(apiKey);

  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: "user", content: systemPrompt },
      {
        role: "user",
        content: EVALUATION_PROMPT,
      },
      { role: "user", content: "Schema: \n" + schema },
      { role: "user", content: "Text: \n" + text },
    ],
    model: LLM_MODEL,
    temperature: 0.0,
  });

  let message = chatCompletion.choices[0].message.content ?? "";
  message = message.replace(/`/g, "");
  const fitMatch = message.match(/<\s*FIT\s*>/);
  let response = {
    fits: !!fitMatch,
    reason: message.replace(/<\s*(?:FIT|UNFIT)\s*>/g, "").trim(),
  };

  return response;
}

/**
 * Creates a knowledge graph based on a prompt and pre-prompt.
 *
 * @param {string} prompt - The main prompt for generating the knowledge graph.
 * @param {string} pre_prompt - Additional context for the generation.
 * @param {string} apiKey - The API key for authentication.
 * @returns {Promise<typeof KnowledgeGraphSchema>} - The generated knowledge graph.
 */
export async function createKnowledgeGraph(
  prompt: string,
  pre_prompt: string,
  apiKey: string
): Promise<typeof KnowledgeGraphSchema> {
  const client = setupClient(apiKey);
  const schema = zodToJsonSchema(KnowledgeGraphSchema, { target: "openAi" });

  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: "user", content: pre_prompt },
      { role: "user", content: KNOWLEDGE_GRAPH_PROMPT },
      { role: "user", content: prompt },
    ],
    model: LLM_MODEL,
    temperature: 0.0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "response",
        strict: true,
        schema: schema,
      },
    },
  });

  return JSON.parse(chatCompletion.choices[0].message.content ?? "");
}

/**
 * Sets up the OpenAI client with the provided API key.
 *
 * @param {string} apiKey - The API key for authentication.
 * @returns {OpenAI} - The configured OpenAI client.
 */
function setupClient(apiKey: string) {
  if (process.env.OLLAMA_URL) {
    return new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.OLLAMA_URL,
    });
  }

  return new OpenAI({
    apiKey: apiKey,
  });
}
