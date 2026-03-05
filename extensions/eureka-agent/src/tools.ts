import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "openclaw/plugin-sdk/matrix";
import { callEureka } from "./client.js";

export const retrievePatentsTool: AnyAgentTool = {
  name: "retrieve_patents",
  label: "Patent Retrieval",
  description:
    "专利结构化检索（NL2SQL）：精确条件检索专利，支持号码、实体、地域、时间、法律状态等维度。" +
    "输入规范：去分析化、去品牌化、关键词≤3个、结构化表达。返回0结果时简化query重试，仍为0则切换vector_documents。",
  parameters: Type.Object({
    question: Type.String({ description: "专利搜索表达式（中/英文与用户语言一致，日文转英文）" }),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 30 })),
  }),
  execute: async (_id, params, signal) => {
    const data = await callEureka("retrieve-patents", params, "CN", signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }], details: data };
  },
};

export const retrievePapersTool: AnyAgentTool = {
  name: "retrieve_papers",
  label: "Paper Retrieval",
  description: "学术文献结构化检索（NL2SQL）：精确检索论文，支持作者、机构、期刊、时间等维度。",
  parameters: Type.Object({
    question: Type.String({ description: "文献搜索表达式" }),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 30 })),
  }),
  execute: async (_id, params, signal) => {
    const data = await callEureka("retrieve-papers", params, "CN", signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }], details: data };
  },
};

export const vectorDocumentsTool: AnyAgentTool = {
  name: "vector_documents",
  label: "Vector Document Search",
  description:
    "向量语义检索：跨数据源检索专利和论文，适合模糊/语义查询，NL2SQL无结果时的备选方案。",
  parameters: Type.Object({
    question: Type.String({ description: "自然语言查询" }),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 50, default: 20 })),
  }),
  execute: async (_id, params, signal) => {
    const data = await callEureka("retrieve-vector-documents", params, "CN", signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }], details: data };
  },
};

export const retrieveWebTool: AnyAgentTool = {
  name: "retrieve_web",
  label: "Web Search",
  description: "互联网检索：获取最新动态、新闻、产品说明等实时信息。",
  parameters: Type.Object({
    question: Type.String({ description: "搜索查询" }),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 20, default: 10 })),
  }),
  execute: async (_id, params, signal) => {
    const data = await callEureka("retrieve-web", params, "CN", signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }], details: data };
  },
};

export const searchCompanyTool: AnyAgentTool = {
  name: "search_company",
  label: "Company Search",
  description: "公司搜索：自然语言查询公司信息，支持NL2SQL和facet聚合。",
  parameters: Type.Object({
    question: Type.String({ description: "公司搜索查询" }),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 50, default: 20 })),
  }),
  execute: async (_id, params, signal) => {
    const data = await callEureka("search-company", params, "CN", signal);
    return { content: [{ type: "text", text: JSON.stringify(data) }], details: data };
  },
};

export const allEurekaTools: AnyAgentTool[] = [
  retrievePatentsTool,
  retrievePapersTool,
  vectorDocumentsTool,
  retrieveWebTool,
  searchCompanyTool,
];
