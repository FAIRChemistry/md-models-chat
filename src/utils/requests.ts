import { UploadedFile } from "@/components/ui/file-chip";
import { backOff } from "exponential-backoff";

/**
 * Represents the response from evaluating a schema prompt.
 */
export interface EvaluateSchemaPromptResponse {
  fits: boolean; // Indicates if the schema fits the provided text.
  reason: string; // Reason for the evaluation result.
}

/**
 * Represents a triplet in a knowledge graph.
 */
export interface Triplet {
  subject: string;
  predicate: string;
  object: string;
}

/**
 * Represents a knowledge graph.
 */
export interface KnowledgeGraph {
  triplets: Triplet[];
}

/**
 * Represents information about an uploaded file.
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
 * Represents an available model.
 */
export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * Polls a response until completion using exponential backoff.
 *
 * @param responseId - The ID of the response to poll.
 * @param jsonModel - Whether to parse the response as JSON.
 * @returns A promise that resolves to the completed response.
 * @throws An error if polling fails.
 */
async function pollForCompletion(responseId: string, jsonModel: boolean = false): Promise<any> {
  const pollAttempt = async (): Promise<any> => {
    const response = await fetch(`/api/poll`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        responseId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Poll request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // If data is not null, the response is complete
    if (data.completed) {
      let responseText;
      try {
        // First try to find assistant role response
        const assistantMessage = data.output?.find((msg: any) => msg.type === "message");
        responseText = assistantMessage?.content?.[0]?.text;

        // Fallback to first message if no assistant role found
        if (!responseText) {
          responseText = data.output?.[0]?.content?.[0]?.text;
        }
      } catch (error) {
        // Fallback for any parsing errors
        responseText = data.output?.[0]?.content?.[0]?.text;
      }

      if (responseText) {
        console.log("responseText", jsonModel ? JSON.parse(responseText) : responseText);
        return jsonModel ? JSON.parse(responseText) : responseText;
      }

      return jsonModel ? {} : "";
    }

    // If not completed, throw an error to trigger retry
    throw new Error("Response not ready yet");
  };

  try {
    return await backOff(pollAttempt, {
      startingDelay: 500,
      maxDelay: 10000,
      numOfAttempts: 50,
      retry: (error: Error) => {
        return error.message === "Response not ready yet";
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Response not ready yet") {
      throw new Error("Polling timeout: Response took too long to complete");
    }
    throw new Error(`Polling failed: ${error}`);
  }
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

  const { responseId } = await response.json();

  // Poll for completion and return as EvaluateSchemaPromptResponse
  const res = await pollForCompletion(responseId, false) as string;

  const message = res.replace(/`/g, "");
  const fitMatch = message.match(/<\s*FIT\s*>/);

  return {
    fits: !!fitMatch,
    reason: message.replace(/<\s*(?:FIT|UNFIT)\s*>/g, "").trim(),
  }
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

  const { responseId } = await response.json();

  // Poll for completion and return as KnowledgeGraph
  return await pollForCompletion(responseId, true) as KnowledgeGraph;
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

  const { responseId } = await response.json();

  // Poll for completion and return as extracted data
  return await pollForCompletion(responseId, true) as Record<string, unknown>;
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
