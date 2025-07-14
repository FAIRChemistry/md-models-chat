import { UploadedFile } from "@/components/ui/file-chip";

/**
 * Represents the response from evaluating a schema prompt.
 */
export interface EvaluateSchemaPromptResponse {
  fits: boolean; // Indicates if the schema fits the provided text.
  reason: string; // Reason for the evaluation result.
}

/**
 * Represents a knowledge graph consisting of triplets.
 */
export interface KnowledgeGraph {
  triplets: {
    subject: string; // The subject of the triplet.
    predicate: string; // The predicate of the triplet.
    object: string; // The object of the triplet.
  }[];
}

/**
 * Represents an uploaded file with OpenAI file ID.
 */
export interface UploadedFileInfo {
  id: string;
  openaiFileId: string;
  inputType: "input_file" | "input_image";
  name: string;
  type: string;
  size: number;
}

/**
 * Represents OpenAI file reference for API calls.
 */
export interface OpenAIFileReference {
  openaiFileId: string;
  inputType: "input_file" | "input_image";
}

/**
 * Represents a model from the OpenAI API.
 */
export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * Uploads files to OpenAI and returns file references.
 *
 * @param files - Array of uploaded files to upload to OpenAI.
 * @returns A promise that resolves to an array of OpenAI file references.
 * @throws An error if the upload fails.
 */
export async function uploadFilesToOpenAI(
  files: UploadedFile[]
): Promise<OpenAIFileReference[]> {
  if (!files || files.length === 0) {
    return [];
  }

  const formData = new FormData();

  // Append files with unique keys
  files.forEach((uploadedFile, index) => {
    formData.append(`file_${index}`, uploadedFile.file);
  });

  const response = await fetch(`/api/upload-files`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    alert(text);
    throw new Error("Failed to upload files " + text);
  }

  const uploadResponse = await response.json();

  // Convert to OpenAI file references
  return uploadResponse.files.map((file: UploadedFileInfo): OpenAIFileReference => ({
    openaiFileId: file.openaiFileId,
    inputType: file.inputType
  }));
}

/**
 * Evaluates a schema prompt against a given text.
 *
 * @param text - The text to evaluate.
 * @param schema - The schema to evaluate against.
 * @param systemPrompt - Optional system prompt for the evaluation.
 * @param fileReferences - Optional array of OpenAI file references to include in the evaluation.
 * @param model - Optional model to use for evaluation.
 * @returns A promise that resolves to an EvaluateSchemaPromptResponse.
 * @throws An error if the evaluation fails.
 */
export async function evaluateSchemaPrompt(
  text: string,
  schema: string,
  systemPrompt?: string,
  fileReferences?: OpenAIFileReference[],
  model?: string
): Promise<EvaluateSchemaPromptResponse> {
  const response = await fetch(`/api/evaluate`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      text,
      schema,
      system_prompt: systemPrompt,
      file_references: fileReferences || [],
      model,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    alert(text);
    throw new Error("Failed to evaluate schema prompt " + text);
  }

  return await response.json();
}

/**
 * Creates a knowledge graph based on a given prompt and pre-prompt.
 *
 * @param prompt - The main prompt for generating the knowledge graph.
 * @param prePrompt - Additional context for the prompt.
 * @param fileReferences - Optional array of OpenAI file references to include.
 * @param model - Optional model to use for knowledge graph generation.
 * @returns A promise that resolves to a KnowledgeGraph.
 * @throws An error if the graph creation fails.
 */
export async function createKnowledgeGraph(
  prompt: string,
  prePrompt: string,
  fileReferences?: OpenAIFileReference[],
  model?: string
): Promise<KnowledgeGraph> {
  const response = await fetch(`/api/graph`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      prompt,
      pre_prompt: prePrompt,
      file_references: fileReferences || [],
      model,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    alert(text);
    throw new Error("Failed to create knowledge graph " + text);
  }

  return await response.json();
}

/**
 * Extracts data to a schema from a knowledge graph.
 *
 * @param text - The text to extract data from.
 * @param schema - The schema to extract data to.
 * @param multipleOutputs - Indicates if multiple outputs are allowed.
 * @param systemPrompt - Optional system prompt for the extraction.
 * @param fileReferences - Optional array of OpenAI file references to include.
 * @param model - Optional model to use for extraction.
 * @returns A promise that resolves to a record of extracted data.
 * @throws An error if the extraction fails.
 */
export async function extractToSchema(
  text: string,
  schema: string,
  multipleOutputs: boolean = false,
  systemPrompt?: string,
  fileReferences?: OpenAIFileReference[],
  model?: string
): Promise<Record<string, unknown>> {
  const response = await fetch(`/api/extract`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      text,
      schema,
      multiple_outputs: multipleOutputs,
      system_prompt: systemPrompt,
      file_references: fileReferences || [],
      model,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    alert(text);
    throw new Error("Failed to extract to schema " + text);
  }

  return await response.json();
}

/**
 * Checks if the provided password is valid.
 *
 * @param password - The password to check.
 * @returns A promise that resolves to a boolean indicating validity.
 */
export async function checkPassword(password: string): Promise<boolean> {
  // const baseUrl = getRemoteBaseUrl();
  const response = await fetch(`/api/login?secret=${password}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.ok;
}

/**
 * Sets the JWT cookie for authentication.
 *
 * @throws An error if setting the JWT cookie fails.
 */
export async function setJWTCookie() {
  // const baseUrl = getRemoteBaseUrl();
  const response = await fetch(`/api/auth`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to set JWT cookie " + response.statusText);
  }
}

/**
 * Fetches available models from the OpenAI API.
 *
 * @returns A promise that resolves to an array of available models.
 * @throws An error if the fetch fails.
 */
export async function fetchAvailableModels(): Promise<Model[]> {
  const response = await fetch(`/api/models`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    alert(text);
    throw new Error("Failed to fetch available models " + text);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Retrieves the base URL for API requests.
 *
 * @returns The base URL as a string.
 * @throws An error if retrieving the base URL fails.
 */
// function getRemoteBaseUrl() {
//   try {
//     if (import.meta.env.VITE_VERCEL_PROJECT_PRODUCTION_URL) {
//       return import.meta.env.VITE_VERCEL_PROJECT_PRODUCTION_URL;
//     }

//     // First try to get VITE_VERCEL_URL
//     if (import.meta.env.VITE_VERCEL_URL) {
//       return import.meta.env.VITE_VERCEL_URL;
//     }

//     // Then try to get VITE_PUBLIC_BASE_URL
//     if (import.meta.env.VITE_PUBLIC_BASE_URL) {
//       return import.meta.env.VITE_PUBLIC_BASE_URL;
//     }
//   } catch (error) {
//     console.error("Failed to get base URL", error);
//     throw error;
//   }
// }
