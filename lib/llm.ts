import OpenAI from "openai";
import zodToJsonSchema from "zod-to-json-schema";
import { KnowledgeGraphSchema } from "./schemes";
import { EVALUATION_PROMPT, KNOWLEDGE_GRAPH_PROMPT } from "./prompts";
import { FilePurpose } from "openai/resources/files";
import { ResponseInputFile, ResponseInputImage, ResponseInputText } from "openai/resources/responses/responses";
import { getOpenAIApiKey } from "./utils";

// Type declaration for FormData in edge runtime
declare global {
  interface FormData {
    entries(): IterableIterator<[string, FormDataEntryValue]>;
  }
}

export interface ExtractionEvaluation {
  fits: boolean;
  reason: string;
}

export enum FileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE'
}

export enum InputType {
  TEXT = 'input_text',
  FILE = 'input_file',
  IMAGE = 'input_image'
}

export interface OpenAIFileReference {
  openaiFileId: string;
  inputType: "input_file" | "input_image";
}

export interface UploadedFileInfo {
  id: string;
  openaiFileId: string;
  inputType: "input_file" | "input_image";
  name: string;
  type: string;
  size: number;
}

const DEFAULT_LLM_MODEL = process.env.LLM_MODEL ?? "gpt-4o";
const DEFAULT_EXTRACT_PROMPT = `You are tasked to extract data from a given text, PDF or image. If something is not supplied directly, leave it empty. Work precisely and do not hallucinate. The following are instructitions that have to be followed strictly: `;

/**
 * Extracts data from a given text based on a specified schema and knowledge graph.
 *
 * @param {string} schema - The JSON schema to validate against.
 * @param {string} text - The text to extract data from.
 * @param {string} apiKey - The API key for authentication.
 * @param {boolean} multipleOutputs - Flag indicating if multiple outputs are expected.
 * @param {string} _systemPrompt - System prompt (currently unused).
 * @param {OpenAIFileReference[]} fileReferences - Array of file references.
 * @param {string} model - The model to use for extraction.
 * @returns {Promise<any>} - The extracted data that fits the schema.
 * @throws {Error} - Throws an error if the extraction fails.
 */
export default async function extractToSchema(
  schema: string,
  text: string,
  apiKey: string,
  multipleOutputs: boolean,
  _systemPrompt: string,
  fileReferences: OpenAIFileReference[] = [],
  model?: string
): Promise<string> {
  const client = setupClient(apiKey);
  const modelToUse = model || DEFAULT_LLM_MODEL;
  let schema_obj = JSON.parse(schema);

  if (multipleOutputs) {
    let parsedSchema = JSON.parse(schema);

    // Extract definitions from the schema
    let definitions = parsedSchema["$defs"];

    // Remove definitions from the schema
    delete parsedSchema["$defs"];

    schema_obj = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: parsedSchema,
        },
      },
      "$defs": definitions,
      additionalProperties: false,
      required: ["items"],
    };
  }

  let content: (ResponseInputFile | ResponseInputImage | ResponseInputText)[];

  content = assembleContentFromFileIds(text, fileReferences);

  let inputs = {
    input: [
      {
        role: "user",
        content: content,
      }
    ],
    instructions: `${DEFAULT_EXTRACT_PROMPT}\n\n${text}`,
    tools: modelToUse.startsWith("o") ? [] : [{ type: "web_search_preview" }],
    temperature: modelToUse.startsWith("o") ? undefined : 0.0,
    model: modelToUse,
    background: true,
    text: {
      format: {
        name: "response",
        strict: true,
        type: "json_schema",
        schema: schema_obj,
      },
    },
  };

  //@ts-ignore
  const chatCompletion = await client.responses.parse(inputs);

  return chatCompletion.id;
}

/**
 * Evaluates a text against a specified schema to determine if it fits.
 *
 * @param {string} text - The text to evaluate.
 * @param {string} schema - The JSON schema to validate against.
 * @param {string} apiKey - The API key for authentication.
 * @param {string} systemPrompt - The system prompt for evaluation.
 * @param {OpenAIFileReference[]} fileReferences - Array of file references.
 * @param {string} model - The model to use for evaluation.
 * @returns {Promise<ExtractionEvaluation>} - An object indicating if the text fits the schema and the reason.
 */
export async function evaluateSchemaPrompt(
  text: string,
  schema: string,
  apiKey: string,
  systemPrompt: string,
  fileReferences: OpenAIFileReference[] = [],
  model?: string
): Promise<string> {
  const client = setupClient(apiKey);
  const modelToUse = model || DEFAULT_LLM_MODEL;

  let content: (ResponseInputFile | ResponseInputImage | ResponseInputText)[];

  content = assembleContentFromFileIds(text, fileReferences);

  const response = await client.responses.create({
    input: [
      {
        role: "user",
        content: content,
      }
    ],
    instructions: `${systemPrompt}\n\n${EVALUATION_PROMPT}\n\nSchema:\n${schema}`,
    tools: modelToUse.startsWith("o") ? [] : [{ type: "web_search_preview" }],
    temperature: modelToUse.startsWith("o") ? undefined : 0.0,
    model: modelToUse,
    background: true,
  });

  return response.id;
}

/**
 * Creates a knowledge graph based on a prompt and pre-prompt.
 *
 * @param {string} prompt - The main prompt for generating the knowledge graph.
 * @param {string} apiKey - The API key for authentication.
 * @param {OpenAIFileReference[]} fileReferences - Array of file references.
 * @param {string} model - The model to use for knowledge graph generation.
 * @returns {Promise<typeof KnowledgeGraphSchema>} - The generated knowledge graph.
 */
export async function createKnowledgeGraph(
  prompt: string,
  apiKey: string,
  fileReferences: OpenAIFileReference[] = [],
  model?: string
): Promise<string> {
  const client = setupClient(apiKey);
  const modelToUse = model || DEFAULT_LLM_MODEL;
  const schema = zodToJsonSchema(KnowledgeGraphSchema, { target: "openAi" });

  let content: (ResponseInputFile | ResponseInputImage | ResponseInputText)[];

  content = assembleContentFromFileIds(prompt, fileReferences);

  const chatCompletion = await client.responses.parse({
    input: [
      {
        role: "user",
        content: content,
      }
    ],
    instructions: `${KNOWLEDGE_GRAPH_PROMPT}\n\n${prompt}`,
    tools: modelToUse.startsWith("o") ? [] : [{ type: "web_search_preview" }],
    temperature: modelToUse.startsWith("o") ? undefined : 0.0,
    model: modelToUse,
    background: true,
    text: {
      format: {
        name: "response",
        strict: true,
        type: "json_schema",
        schema: schema,
      },
    },
  });

  return chatCompletion.id;
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

/**
 * Assembles the content for the LLM using pre-uploaded OpenAI file IDs.
 *
 * @param {string} text - The text to add to the content.
 * @param {OpenAIFileReference[]} fileReferences - The pre-uploaded OpenAI file references.
 * @returns {(ResponseInputFile | ResponseInputImage | ResponseInputText)[]} - The assembled content.
 */
function assembleContentFromFileIds(text: string, fileReferences: OpenAIFileReference[]): (ResponseInputFile | ResponseInputImage | ResponseInputText)[] {
  const content: (ResponseInputFile | ResponseInputImage | ResponseInputText)[] = [
    {
      type: "input_text",
      text: text,
    },
  ];

  // Add pre-uploaded files to content
  const fileContents = fileReferences.map((fileRef) => {
    if (fileRef.inputType === "input_file") {
      return {
        type: fileRef.inputType,
        file_id: fileRef.openaiFileId,
      } as ResponseInputFile;
    } else {
      return {
        type: fileRef.inputType,
        detail: "auto" as const,
        file_id: fileRef.openaiFileId,
      } as ResponseInputImage;
    }
  });

  // Add files to the beginning of content array
  content.unshift(...fileContents);

  return content;
}

/**
 * Checks if a value is a File object in a way that works across different runtime environments.
 * This is more robust than instanceof File in edge runtimes.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is a File object.
 */
function isFileObject(value: any): value is File {
  return value != null &&
    typeof value === 'object' &&
    (value.constructor.name === 'File' || value instanceof File) &&
    typeof value.name === 'string' &&
    typeof value.size === 'number' &&
    typeof value.type === 'string';
}

/**
 * Uploads multiple files to OpenAI and returns file information.
 * This version is designed for edge runtime compatibility.
 *
 * @param {FormData} formData - The form data containing files and API key.
 * @returns {Promise<UploadedFileInfo[]>} - Array of uploaded file information.
 * @throws {Error} - Throws an error if upload fails.
 */
export async function uploadFilesToOpenAI(formData: FormData): Promise<UploadedFileInfo[]> {
  const api_key = formData.get('api_key') as string;
  const apiKey = getOpenAIApiKey(api_key);

  const client = setupClient(apiKey);
  const uploadedFiles: UploadedFileInfo[] = [];

  // Process all files in parallel
  const fileUploads: Promise<UploadedFileInfo>[] = [];

  // Convert FormData entries to array for better edge runtime compatibility
  const entries = Array.from(formData.entries());

  for (const [key, value] of entries) {
    // Use a more robust file detection method that works in edge runtimes
    if (key.startsWith('file_') && isFileObject(value)) {
      const fileUploadPromise = processFileUpload(client, value, key);
      fileUploads.push(fileUploadPromise);
    }

  }

  const results = await Promise.all(fileUploads);
  uploadedFiles.push(...results);

  return uploadedFiles;
}

/**
 * Processes a single file upload to OpenAI.
 * Edge runtime compatible version.
 *
 * @param {OpenAI} client - The OpenAI client.
 * @param {File} file - The file to upload.
 * @param {string} originalKey - The original form key for the file.
 * @returns {Promise<UploadedFileInfo>} - The uploaded file information.
 */
async function processFileUpload(
  client: OpenAI,
  file: File,
  originalKey: string
): Promise<UploadedFileInfo> {
  // Determine file type
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  let fileType: FileType;
  if (isPdf) {
    fileType = FileType.PDF;
  } else if (isImage) {
    fileType = FileType.IMAGE;
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  // Upload to OpenAI - File objects work directly in edge runtime
  const { file: openaiFile, input_type } = await uploadFileToOpenAI(client, file, fileType);

  return {
    id: originalKey.replace('file_', ''), // Extract original ID from key
    openaiFileId: openaiFile.id,
    inputType: input_type,
    name: file.name,
    type: file.type,
    size: file.size
  };
}

/**
 * Uploads a file to the OpenAI API.
 * Edge runtime compatible version using File objects directly.
 *
 * @param {OpenAI} client - The OpenAI client.
 * @param {File} file - The file to upload.
 * @param {FileType} fileType - The type of file to upload.
 * @returns {Promise<{ file: OpenAI.Files.FileObject, input_type: "input_file" | "input_image" }>} - The uploaded file and input type.
 */
async function uploadFileToOpenAI(
  client: OpenAI,
  file: File,
  fileType: FileType,
): Promise<{ file: OpenAI.Files.FileObject, input_type: "input_file" | "input_image" }> {
  let purpose: FilePurpose = "user_data";
  let input_type: "input_file" | "input_image" = "input_file";

  if (fileType === FileType.IMAGE) {
    purpose = "vision";
    input_type = "input_image";
  }

  const openaiFile = await client.files.create({
    file: file, // File objects work directly in edge runtime
    purpose: purpose,
  });

  return { file: openaiFile, input_type };
}

/**
 * Lists all available models from the OpenAI API.
 *
 * @param {string} apiKey - The API key for authentication.
 * @returns {Promise<OpenAI.Models.Model[]>} - Array of available model objects.
 */
export async function listAvailableModels(apiKey: string) {
  const client = setupClient(apiKey);
  const models = await client.models.list();
  return models;
}

/**
 * Polls the status of an OpenAI response.
 *
 * @param {OpenAI} client - The OpenAI client.
 * @param {string} responseId - The ID of the response to poll.
 * @returns {Promise<OpenAI.Responses.ResponseObject | null>} - The response object if completed, null if not.
 */
export async function pollResponse(apiKey: string, responseId: string) {
  const client = setupClient(apiKey);
  const response = await client.responses.retrieve(responseId);

  if (response.status === "completed") {
    return {
      completed: true,
      output: response.output || {}
    };
  } else {
    return { completed: false };
  }
}