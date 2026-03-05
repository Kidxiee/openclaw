import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "openclaw/plugin-sdk/matrix";
import { callEureka } from "./client.js";

// Skills are long-running streaming tasks in eureka agent.
// In OpenClaw we expose them as regular tools that call the Python skill HTTP endpoint.
// The skill endpoint returns a streaming SSE response; we collect the full result here.

const SKILL_BASE_URL =
  process.env["EUREKA_SKILL_BASE_URL"] ??
  process.env["EUREKA_API_BASE_URL"] ??
  "http://localhost:8000";

async function callSkill(
  skillName: string,
  params: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<string> {
  const url = `${SKILL_BASE_URL.replace(/\/$/, "")}/api/skills/${skillName}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });
  if (!res.ok) throw new Error(`Skill ${skillName} error ${res.status}: ${await res.text()}`);
  return res.text();
}

function makeSkillTool(name: string, label: string, description: string): AnyAgentTool {
  return {
    name,
    label,
    description,
    parameters: Type.Object({
      context: Type.String({ description: "任务上下文和用户需求" }),
      session_id: Type.Optional(Type.String({ description: "会话ID，用于关联历史数据" })),
    }),
    execute: async (_id, params, signal) => {
      const text = await callSkill(name, params, signal);
      return { content: [{ type: "text", text }], details: { skill: name } };
    },
  };
}

export const allEurekaSkills: AnyAgentTool[] = [
  makeSkillTool("plg_qa_summary", "Research Summary", "生成综合研究报告，整合专利、文献、网络数据"),
  makeSkillTool("tech_profile", "Tech Profile", "生成技术画像报告，分析技术发展脉络和竞争格局"),
  makeSkillTool("competitor_landscape", "Competitor Landscape", "竞争对手技术格局分析"),
  makeSkillTool("fto_analysis", "FTO Analysis", "自由实施分析（Freedom to Operate）"),
  makeSkillTool("design_around", "Design Around", "规避设计方案生成"),
  makeSkillTool("triz_solution", "TRIZ Solution", "基于TRIZ方法论的创新解决方案"),
  makeSkillTool("tech_roadmap_generator", "Tech Roadmap", "技术路线图生成"),
  makeSkillTool("validation_plan", "Validation Plan", "技术验证方案生成"),
];
