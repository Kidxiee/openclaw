import type { OpenClawPluginApi } from "openclaw/plugin-sdk/matrix";
import { allBlenderTools } from "./src/tools.js";

const plugin = {
  id: "blender-mcp",
  name: "Blender MCP",
  description: "Connect to local Blender via MCP socket (port 9876)",
  register(api: OpenClawPluginApi) {
    for (const tool of allBlenderTools) {
      api.registerTool(tool);
    }
  },
};

export default plugin;
