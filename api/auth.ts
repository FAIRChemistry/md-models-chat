import { generateToken } from "../lib/token";
import createCorsHeaders from "../lib/cors";

export const config = {
  runtime: "edge",
};

/**
 * Handles GET requests to generate a token and set it in a cookie.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A response indicating the result of the token generation.
 */
export async function GET(_request: Request): Promise<Response> {
  try {
    const token = await generateToken();
    const headers = createCorsHeaders();
    headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=3600`
    );

    return new Response("Token created and set in cookie", {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response("Error generating token", {
      status: 500,
      headers: createCorsHeaders(),
    });
  }
}
