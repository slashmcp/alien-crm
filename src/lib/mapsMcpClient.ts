import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export async function createMapsMCPClient() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set in environment variables");
  }

  const transport = new SSEClientTransport(
    new URL("https://mapstools.googleapis.com/mcp/sse"),
    {
      headers: {
        "X-Goog-Api-Key": apiKey
      }
    }
  );

  const client = new Client(
    {
      name: "alien-crm-prospector",
      version: "1.0.0"
    },
    {
      capabilities: {}
    }
  );

  await client.connect(transport);
  return client;
}
