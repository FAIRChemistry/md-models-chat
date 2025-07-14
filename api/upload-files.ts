import createCorsHeaders from "../lib/cors";
import { uploadFilesToOpenAI, UploadedFileInfo } from "../lib/llm";
import { verifyToken } from "../lib/token";
import { getOpenAIApiKey } from "../lib/utils";

export const config = {
    runtime: "edge",
};

interface UploadResponse {
    files: UploadedFileInfo[];
}

/**
 * Handles POST requests to upload multiple files to OpenAI.
 *
 * @param {Request} request - The incoming request object containing files.
 * @returns {Promise<Response>} - A response containing the uploaded file IDs and metadata.
 */
export async function POST(request: Request): Promise<Response> {
    const token = await verifyToken(request);

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const contentType = request.headers.get('content-type');

        if (!contentType?.includes('multipart/form-data')) {
            return new Response(
                JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
                { status: 400, headers: createCorsHeaders() }
            );
        }

        const formData = await request.formData();

        // Add API key from environment to formData for the uploadFilesToOpenAI function
        const apiKey = getOpenAIApiKey();
        formData.append('api_key', apiKey);

        const uploadedFiles = await uploadFilesToOpenAI(formData);
        const response: UploadResponse = {
            files: uploadedFiles
        };

        return new Response(JSON.stringify(response), {
            headers: createCorsHeaders(),
        });

    } catch (error) {
        console.error("File upload error:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: `File upload failed: ${message}` }),
            { status: 500, headers: createCorsHeaders() }
        );
    }
} 