import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "openclaw/plugin-sdk/matrix";
import { callBlender } from "./client.js";

export const getSceneInfoTool: AnyAgentTool = {
  name: "blender_get_scene_info",
  label: "Blender: Get Scene Info",
  description: "获取当前 Blender 场景的详细信息，包括所有对象、材质、灯光等。",
  parameters: Type.Object({}),
  execute: async (_id, _params, signal) => {
    const data = await callBlender("get_scene_info", {}, signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  },
};

export const getObjectInfoTool: AnyAgentTool = {
  name: "blender_get_object_info",
  label: "Blender: Get Object Info",
  description: "获取 Blender 场景中指定对象的详细信息。",
  parameters: Type.Object({
    object_name: Type.String({ description: "对象名称" }),
  }),
  execute: async (_id, params, signal) => {
    const data = await callBlender("get_object_info", params, signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  },
};

export const executeBlenderCodeTool: AnyAgentTool = {
  name: "blender_execute_code",
  label: "Blender: Execute Python Code",
  description: "在 Blender 环境中执行 Python 代码，可以创建/修改对象、材质、动画等。",
  parameters: Type.Object({
    code: Type.String({ description: "要在 Blender 中执行的 Python 代码" }),
  }),
  execute: async (_id, params, signal) => {
    const data = await callBlender("execute_code", params, signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  },
};

export const getViewportScreenshotTool: AnyAgentTool = {
  name: "blender_get_screenshot",
  label: "Blender: Get Viewport Screenshot",
  description:
    "截取 Blender 3D 视口截图并返回图片，用于查看当前场景状态。每次调整模型后调用此工具查看效果。",
  parameters: Type.Object({
    max_size: Type.Optional(Type.Integer({ minimum: 100, maximum: 4096, default: 800 })),
  }),
  execute: async (_id, params, signal) => {
    const filepath = `/tmp/blender_screenshot_${Date.now()}.png`;
    const data = (await callBlender(
      "get_viewport_screenshot",
      { ...params, filepath },
      signal,
    )) as Record<string, unknown>;
    // read file as base64
    const fs = await import("fs");
    if (fs.existsSync(filepath)) {
      const imgData = fs.readFileSync(filepath).toString("base64");
      fs.unlinkSync(filepath);
      return {
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imgData } },
          { type: "text", text: JSON.stringify(data) },
        ],
      };
    }
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  },
};

export const searchPolyhavenAssetsTool: AnyAgentTool = {
  name: "blender_search_polyhaven",
  label: "Blender: Search Polyhaven Assets",
  description: "搜索 Polyhaven 资产库（模型、材质、HDRI）。",
  parameters: Type.Object({
    asset_type: Type.String({ description: "资产类型: hdris / textures / models / all" }),
    categories: Type.Optional(Type.String({ description: "分类过滤" })),
  }),
  execute: async (_id, params, signal) => {
    const data = await callBlender("search_polyhaven_assets", params, signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  },
};

export const downloadPolyhavenAssetTool: AnyAgentTool = {
  name: "blender_download_polyhaven",
  label: "Blender: Download Polyhaven Asset",
  description: "从 Polyhaven 下载并导入资产到 Blender 场景。",
  parameters: Type.Object({
    asset_id: Type.String({ description: "资产 ID" }),
    asset_type: Type.String({ description: "资产类型: hdris / textures / models" }),
    resolution: Type.String({ description: "分辨率，如 1k / 2k / 4k" }),
    file_format: Type.String({ description: "文件格式，如 blend / fbx / gltf" }),
  }),
  execute: async (_id, params, signal) => {
    const data = await callBlender("download_polyhaven_asset", params, signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  },
};

export const generateHyper3dModelTool: AnyAgentTool = {
  name: "blender_generate_3d_model",
  label: "Blender: Generate 3D Model (Hyper3D)",
  description: "通过文字描述使用 Hyper3D Rodin 生成 3D 模型并导入 Blender。",
  parameters: Type.Object({
    text_prompt: Type.String({ description: "3D 模型的文字描述" }),
    bbox_condition: Type.Optional(Type.String({ description: "边界框条件（可选）" })),
  }),
  execute: async (_id, params, signal) => {
    const data = await callBlender("generate_hyper3d_model_via_text", params, signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  },
};

export const exportGlbTool: AnyAgentTool = {
  name: "blender_export_glb",
  label: "Blender: Export GLB to 3D Viewer",
  description:
    "将当前 Blender 场景导出为 GLB 文件，自动更新 openclaw 3D 查看器。调用后在浏览器打开 /__openclaw__/canvas/blender-viewer.html 查看可交互的 3D 模型。",
  parameters: Type.Object({}),
  execute: async (_id, _params, signal) => {
    const os = await import("os");
    const outPath = `${os.homedir()}/.openclaw/canvas/model.glb`;
    const code = `
import bpy, os
path = "${outPath}"
os.makedirs(os.path.dirname(path), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=False)
print("exported:" + path)
`;
    const data = await callBlender("execute_code", { code }, signal);
    return {
      content: [
        {
          type: "text",
          text: `GLB exported. Open the 3D viewer at: http://localhost:18789/__openclaw__/canvas/blender-viewer.html\n\n${JSON.stringify(data)}`,
        },
      ],
    };
  },
};

export const allBlenderTools: AnyAgentTool[] = [
  getSceneInfoTool,
  getObjectInfoTool,
  executeBlenderCodeTool,
  getViewportScreenshotTool,
  searchPolyhavenAssetsTool,
  downloadPolyhavenAssetTool,
  generateHyper3dModelTool,
  exportGlbTool,
];
