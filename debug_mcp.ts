import { createMapsMCPClient } from "./src/lib/mapsMcpClient.js";

// Read from process.env directly since we will pass it inline
async function run() {
  try {
    const client = await createMapsMCPClient();
    const tools = await client.listTools();
    console.log("Available Maps Grounding Lite Tools:");
    console.dir(tools, { depth: null });
    
    // Call the search tool to test it out
    // According to docs, the tool is often 'google_maps_search_places' or similar
    // Let's just find the first tool that contains 'search' or 'places'
    const searchTool = tools.tools.find(t => t.name.includes('search') || t.name.includes('places') || t.name.includes('Places'));
    
    if (searchTool) {
       console.log(`\nTesting tool: ${searchTool.name}...`);
       // We'll just do a dry-run log to avoid complex args mapping without knowing the schema
       console.log("Tool schema:", JSON.stringify(searchTool.inputSchema, null, 2));
    } else {
       console.log("\nNo search tool found. Tools:", tools.tools.map(t => t.name));
    }

    process.exit(0);
  } catch (err) {
    console.error("Error connecting to Maps Grounding Lite:", err);
    process.exit(1);
  }
}

run();
