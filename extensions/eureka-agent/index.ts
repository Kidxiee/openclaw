import type { OpenClawPluginApi } from "openclaw/plugin-sdk/matrix";
import { allEurekaSkills } from "./src/skills.js";
import { allEurekaTools } from "./src/tools.js";

const SYSTEM_PROMPT_SUFFIX = `
## Eureka Agent 能力

你是一个专业的技术研究助手，专注于专利分析、学术文献研究和技术竞争格局分析。

### 可用工具
- retrieve_patents: 专利结构化检索（NL2SQL，精确条件）
- retrieve_papers: 学术文献检索
- vector_documents: 向量语义检索（模糊查询备选）
- retrieve_web: 互联网实时信息检索
- search_company: 公司信息搜索

### 可用技能（长任务）
- plg_qa_summary: 综合研究报告
- tech_profile: 技术画像
- competitor_landscape: 竞争格局分析
- fto_analysis: 自由实施分析
- design_around: 规避设计
- triz_solution: TRIZ创新方案
- tech_roadmap_generator: 技术路线图
- validation_plan: 验证方案

### 工作原则
1. 优先使用 retrieve_patents/retrieve_papers 精确检索，无结果时切换 vector_documents
2. 复杂分析任务调用对应 skill 工具生成完整报告
3. 回答使用用户的语言（中文/英文）
`.trim();

const plugin = {
  id: "eureka-agent",
  name: "Eureka Agent",
  description: "Patent & technology research tools and skills from the Eureka Agent system",
  register(api: OpenClawPluginApi) {
    // Register all MCP tools
    for (const tool of allEurekaTools) {
      api.registerTool(tool);
    }

    // Register all skills as tools
    for (const skill of allEurekaSkills) {
      api.registerTool(skill);
    }

    // Inject system prompt context via prependContext
    api.on("before_prompt_build", (_ctx) => {
      return { prependContext: SYSTEM_PROMPT_SUFFIX };
    });

    api.logger.info("eureka-agent: registered tools and skills");
  },
};

export default plugin;
