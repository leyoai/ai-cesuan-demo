/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { TestItem, CalculationOrder, DashboardStats, CurrentUser } from "./src/types";

dotenv.config({ path: [".env.local", ".env"] });

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HMR_PORT = Number(process.env.VITE_HMR_PORT || 24678);
const GEMINI_ENABLED = process.env.ENABLE_GEMINI === "true";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 10000);

app.use(express.json({ limit: "10mb" }));

const parseCookies = (cookieHeader?: string) =>
  (cookieHeader || "").split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});

let guestSequence = 10000;
const usersById = new Map<string, CurrentUser>();
const usersByPhone = new Map<string, string>();

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

const getOrCreateUser = (req: express.Request, res: express.Response): CurrentUser => {
  const cookies = parseCookies(req.headers.cookie);
  let userId = cookies.guest_id;
  if (!userId || !usersById.has(userId)) {
    userId = `u-guest-${++guestSequence}`;
    const user: CurrentUser = {
      userId,
      userNickname: `访客${String(guestSequence).slice(-4)}`,
      createdAt: new Date().toISOString()
    };
    usersById.set(userId, user);
    res.setHeader("Set-Cookie", `guest_id=${encodeURIComponent(userId)}; Max-Age=${180 * 24 * 60 * 60}; Path=/; HttpOnly; SameSite=Lax`);
    return user;
  }
  return usersById.get(userId)!;
};

const seedUser = (user: CurrentUser) => {
  usersById.set(user.userId, user);
  if (user.phone) usersByPhone.set(user.phone, user.userId);
};

seedUser({ userId: "u-10001", userNickname: "星球访客A", phone: "13800138001", createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() });
seedUser({ userId: "u-10002", userNickname: "星球访客B", phone: "13800138002", createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() });
seedUser({ userId: "u-10003", userNickname: "星球访客C", createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString() });

const withOrderPhone = (order: CalculationOrder): CalculationOrder => ({
  ...order,
  phone: order.userId ? usersById.get(order.userId)?.phone : undefined
});

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!GEMINI_ENABLED) {
    console.warn("Gemini disabled. Running in simulated offline fallback mode.");
  } else if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log(`Gemini API initialized successfully. Model: ${GEMINI_MODEL}`);
  } else {
    console.warn("ENABLE_GEMINI is true, but GEMINI_API_KEY is missing or placeholder. Running in simulated offline fallback mode.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini API Client:", err);
}

// In-Memory Database for dynamic interaction between the Mini-Program and Admin Backend
const DEFAULT_TESTS: TestItem[] = [
  // MBTI
  {
    id: "mbti-standard",
    name: "16型人格标准潜能报告",
    category: "mbti",
    description: "全面系统解析你的认知功能优势与短板，深度探索自我心智模型。",
    price: 19.9,
    originalPrice: 99.0,
    icon: "Brain",
    tag: "专业",
    tagColor: "indigo",
    isActive: true,
    calculateCount: 15302,
    successRate: 99.1,
    promptTemplate: `# Role: 资深心理学专家 & MBTI认证分析师
# Task: 根据用户的MBTI类型或测评倾向，生成一份深度、严谨且具有启发性的潜能分析报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免空洞的套话，多用心理学机制解释：
1. 【灵魂画像】：用3个硬核关键词和一段200字左右的深度白描，剖析该人格的核心本质。
2. 【心理功能认知链】：基于MBTI的四功能矩阵（主导、辅助、第三、劣势功能），拆解Ta在处理信息和做决策时的底层逻辑。
3. 【三大核心潜能】：详细阐述该人格在哪些领域或情境下具有降维打击般的天然优势。
4. 【盲区与盲点】：指出其最容易陷入的“人格陷阱”（如：内耗、过度掌控、情感忽视），并从认知行为疗法（CBT）角度给出2个具体的破局练习。

## Tone:
专业、深刻、客观、具有疗愈感和启发性。`
  },
  {
    id: "mbti-animal",
    name: "假如MBTI有拟人：你的灵魂是哪种小动物/打工人？",
    category: "mbti",
    description: "趣味解读你的MBTI属性，发现潜藏在身体里的神奇动物和隐藏职场人设！",
    price: 9.9,
    originalPrice: 39.0,
    icon: "User",
    tag: "趣味",
    tagColor: "pink",
    isActive: true,
    calculateCount: 28401,
    successRate: 98.5,
    promptTemplate: `# Role: 爆款小红书文案写手 & 网感十级学者
# Task: 将用户的MBTI类型转化为一个极具趣味性、画面感和社交分享欲的“拟人化标签报告”。

## Input:
- 免费报告: {Free_Report}

## Output Format & Content:
请使用大量网感代称、emoji和排版技巧，输出以下内容：
1. 【灵魂拟人形象】：为该人格匹配一个极为贴切的动物或职场角色（如：卡皮巴拉、疯狂旋转的PPT、表面高冷内心弹幕刷屏的猫咪）。
2. 【精神状态图鉴】：
   - 顺风时的状态（开心、得意时的行为表现）
   - 逆风/发疯时的状态（压力大时的搞笑/真实反应）
3. 【社交/生存潜规则】：3条关于如何正确顺毛捋这个类型的“使用说明书”。
4. 【专属DNA共振句】：写一句让该人格看到直呼“你在我身上安了监控吗？！”的毒舌或治愈金句。

## Tone:
幽默讽刺、网感十足、金句频出、极其适合截图发朋友圈。`
  },
  // 星座 Astrology
  {
    id: "astrology-sun-moon",
    name: "三主星深度星盘报告（太阳/月亮/上升）",
    category: "astrology",
    description: "重度星盘解析，揭秘太阳意志、月亮潜意识与上升面具的命运纠葛。",
    price: 29.9,
    originalPrice: 158.0,
    icon: "Compass",
    tag: "深度",
    tagColor: "purple",
    isActive: true,
    calculateCount: 12053,
    successRate: 98.8,
    promptTemplate: `# Role: 荣格心理原型研究者 & 西洋现代星占分析师
# Task: 根据用户的星盘相关资料与咨询问题，生成一份兼具心理象征与现实启发的三主星深度报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免宿命化断言，用“西方占星依据 + 大白话解释 + 行动建议”完成分析：
1. 【算法依据】：说明本报告来自西方占星学的太阳、月亮、上升三主星分析，并结合用户出生日期、出生时间、出生地点和当前问题生成。不要写成玄学断言，要让用户知道“为什么会得出这个结论”。
2. 【三主星人格底色】：分别解释太阳、月亮、上升所代表的意志、安全感与外在人格面具；每个点都要翻译成用户能听懂的日常表现。
3. 【内在冲突地图】：指出三主星之间可能形成的拉扯、补偿与防御模式，并用大白话解释“这在生活里会表现成什么”。
4. 【关系与事业显化】：分析该配置在亲密关系、表达方式、职业选择中的具体表现。机会、风险和建议必须具体到人、事、时间或动作。
5. 【盲区与开运破局点】：给出3个现实可执行的调整建议，避免迷信化表达。

## Tone:
清楚、接地气、有逻辑依据。可以保留少量象征语言，但每个专业判断后都必须补一句大白话解释。`
  },
  {
    id: "astrology-monthly",
    name: "12星座本月隐藏避坑指南",
    category: "astrology",
    description: "轻量级高频运势导航，指出本月感情、事业与财富的隐秘雷区与幸运契机。",
    price: 6.9,
    originalPrice: 29.0,
    icon: "Sparkles",
    tag: "运势",
    tagColor: "amber",
    isActive: true,
    calculateCount: 45012,
    successRate: 99.5,
    promptTemplate: `# Role: 星座趋势观察者 & 行动规划顾问
# Task: 根据用户背景和当前问题，生成一份本月可执行的星座避坑与机会指南。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免夸张承诺，重点帮助用户看清节奏和行动优先级：
1. 【算法依据】：说明本报告来自西方占星学的月度行运/星座节奏分析，并结合用户资料和当前问题生成。用大白话解释“为什么本月会出现这些机会或风险”。
2. 【本月总基调】：用3个关键词概括本月主题，并把每个关键词翻译成现实里的表现。
3. 【事业与搞钱】：指出适合推进、需要观望、容易踩坑的事项。不要只写“机会增强”，要写清楚“什么机会、多久内、适合做什么”。
4. 【情绪与关系】：分析人际/亲密关系中的敏感点、机会窗口和沟通建议。涉及桃花时，要写成“1个月内桃花运不错，可能有1-2个互动机会/朋友旧识重新升温”这类用户能直接理解的话。
5. 【高能避坑清单】：列出5条本月具体避坑建议，每条都要说明原因。

## Tone:
清醒、实用、有陪伴感，像一位懂心理节奏的朋友。少用高级抽象词，多用用户一看就懂的生活化表达。`
  },
  // 人格 Personality
  {
    id: "personality-bigfive",
    name: "正版九型人格/大五人格核心动机测算",
    category: "personality",
    description: "学术权威量表支持，探究你行为背后的核心驱动力与底层逻辑。",
    price: 39.9,
    originalPrice: 199.0,
    icon: "Award",
    tag: "权威",
    tagColor: "slate",
    isActive: true,
    calculateCount: 8904,
    successRate: 99.2,
    promptTemplate: `# Role: 人格心理学研究者 & 量表解读顾问
# Task: 根据用户的人格测评结果，生成一份基于大五人格/九型人格视角的核心动机分析报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免给用户贴固定标签，多用“特质光谱”和“情境触发”解释：
1. 【核心动机画像】：提炼用户最可能被什么驱动、害怕什么、在追求什么。
2. 【性格特质光谱】：从开放性、责任心、外向性、宜人性、神经质或九型动力角度拆解表现。
3. 【防御与压力反应】：指出压力下容易出现的防御机制和行为代价。
4. 【成长雷达】：给出3个可训练的成长方向，每个方向提供一个具体练习。

## Tone:
专业、客观、温和，不评判、不绝对化。`
  },
  {
    id: "personality-projective",
    name: "情境投射：潜意识里的“另一个你”",
    category: "personality",
    description: "通过森林、城堡等潜意识意象投射，遇见内心深处最真实的自己。",
    price: 15.9,
    originalPrice: 69.0,
    icon: "Heart",
    tag: "心理",
    tagColor: "emerald",
    isActive: true,
    calculateCount: 16294,
    successRate: 98.7,
    promptTemplate: `# Role: 投射测验咨询师 & 潜意识意象叙事治疗师
# Task: 根据用户背景与咨询问题，生成一份带有画面感的潜意识投射解读报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免神秘化恐吓，所有象征解释都要落回心理需求和现实处境：
1. 【意象场景】：构建一个森林/房屋/城堡/荒岛式的象征场景，用细节呈现用户当前内在状态。
2. 【潜意识线索】：解释场景中的关键符号分别对应哪些情绪、关系需求或未被看见的自我部分。
3. 【内在冲突】：指出用户可能正在经历的拉扯、防御与渴望。
4. 【温柔整合练习】：给出2个书写或想象练习，帮助用户把潜意识线索转化为行动。

## Tone:
细腻、有画面感、抚慰但不失边界。`
  },
  // 职业 Career
  {
    id: "career-holland",
    name: "霍兰德职业兴趣与专业匹配度报告",
    category: "career",
    description: "结合心理学兴趣倾向测算，精准匹配最契合你的专业与理想工作赛道。",
    price: 25.9,
    originalPrice: 129.0,
    icon: "Briefcase",
    tag: "实用",
    tagColor: "blue",
    isActive: true,
    calculateCount: 11048,
    successRate: 99.0,
    promptTemplate: `# Role: 职业生涯规划师 & 霍兰德RIASEC测评顾问
# Task: 根据用户职业兴趣测评倾向，生成一份专业方向与职业环境匹配报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免泛泛推荐热门职业，重点解释“为什么适合/不适合”：
1. 【职业兴趣画像】：用RIASEC语言解释用户的兴趣结构和工作动机。
2. 【理想工作环境】：拆解Ta最适合的组织氛围、任务类型、协作方式和成长路径。
3. 【专业/职业匹配清单】：给出5个匹配方向，并说明匹配逻辑与风险。
4. 【避坑与下一步】：指出2类高消耗环境，并给出3个可执行探索动作。

## Tone:
务实、清晰、像资深职业顾问，既鼓励也讲现实约束。`
  },
  {
    id: "career-gallup",
    name: "盖洛普优势定位：测测你的吸金/搞钱天赋",
    category: "career",
    description: "抛弃无用焦虑，发掘你与生俱来的变现能力和核心财富杠杆机能。",
    price: 29.9,
    originalPrice: 149.0,
    icon: "Briefcase",
    tag: "爆款",
    tagColor: "red",
    isActive: true,
    calculateCount: 32095,
    successRate: 98.5,
    promptTemplate: `# Role: 优势识别教练 & 商业定位顾问
# Task: 根据用户优势测评倾向，生成一份关于吸金能力、变现杠杆与风险盲区的报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免财富焦虑和玄学承诺，重点讲清“优势如何被市场需要”：
1. 【核心搞钱天赋】：提炼用户最可能带来价值交换的3项优势。
2. 【变现杠杆】：分析适合的产品形态、服务场景、合作模式或职业策略。
3. 【财务风险盲区】：指出可能导致错失机会或消耗收益的行为模式。
4. 【30天行动路线】：给出一份具体的低成本验证计划，包含观察、试错和复盘。

## Tone:
敏锐、现实、鼓励行动，不制造暴富幻想。`
  },
  // 情感 Relationship
  {
    id: "relationship-attachment",
    name: "亲密关系：成人依恋类型与恋爱盲区测试",
    category: "emotion",
    description: "安全、焦虑还是回避？专业心理学量表帮你破解恋爱中的吸渣或推离魔咒。",
    price: 29.9,
    originalPrice: 169.0,
    icon: "Heart",
    tag: "治愈",
    tagColor: "rose",
    isActive: true,
    calculateCount: 17290,
    successRate: 99.3,
    promptTemplate: `# Role: 亲密关系咨询师 & 成人依恋理论研究者
# Task: 根据用户依恋测评倾向，生成一份关于恋爱模式、情绪防御与安全感修复的报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免责备用户或伴侣，重点解释依恋机制如何影响关系选择：
1. 【依恋模式画像】：说明用户可能偏安全、焦虑、回避或混合型的表现。
2. 【触发点与防御】：分析在亲密关系中最容易被触发的情绪按钮和防御动作。
3. 【关系循环】：拆解Ta如何在靠近、试探、失望、退缩之间形成重复模式。
4. 【安全型练习】：给出2个具体沟通练习和1个自我安抚练习。

## Tone:
温柔、专业、不评判，具有修复感和边界感。`
  },
  {
    id: "relationship-lovelang",
    name: "五大爱之语：测测你和伴侣的“情感电量”",
    category: "emotion",
    description: "了解彼此如何表达爱与感受爱，化解无意间的沟通伤害，让伴侣电量满格。",
    price: 19.9,
    originalPrice: 89.0,
    icon: "Sparkles",
    tag: "双人",
    tagColor: "pink",
    isActive: true,
    calculateCount: 22104,
    successRate: 98.9,
    promptTemplate: `# Role: 亲密关系沟通教练 & 五大爱之语分析师
# Task: 根据用户与伴侣的测评倾向，生成一份关于情感表达、需求错位与关系回温的双人报告。

## Input:
- 免费报告: {Free_Report}
- 用户背景: {Basic_Info}
- 当前咨询问题: {Question}

## Output Format & Content:
请按照以下结构输出报告，避免站队或评判任何一方，重点解释“爱意如何在表达和接收中错位”：
1. 【双方情感电量图】：分别说明用户与伴侣最需要被看见的情感需求。
2. 【爱之语错位点】：用五大爱之语解释双方可能如何误解彼此的付出。
3. 【冲突循环】：拆解争吵或冷淡背后的需求、表达方式和防御机制。
4. 【关系回温练习】：给出3个本周可执行的小行动，包含一句可直接使用的沟通话术。

## Tone:
公平、温柔、具体，帮助双方重新听懂彼此。`
  }
];

let tests: TestItem[] = [...DEFAULT_TESTS];

const getAssessmentMode = (test: TestItem): "quiz_score" | "profile_inference" =>
  test.assessmentMode || (test.category === "astrology" ? "profile_inference" : "quiz_score");

const genderLabel = (gender?: CalculationOrder["gender"]) =>
  gender === "female" ? "女" : gender === "other" ? "其他" : "男";

const buildOwnProfileInfo = (order: Pick<CalculationOrder, "userName" | "gender" | "birthDate" | "birthTime" | "birthPlace">) =>
  `本人资料：姓名：${order.userName}；性别：${genderLabel(order.gender)}；出生日期：${order.birthDate || "未填写"}；出生时间：${order.birthTime || "未填写"}；出生地点：${order.birthPlace || "未填写"}`;

const buildPartnerProfileInfo = (order: Pick<CalculationOrder, "partnerName" | "partnerGender" | "partnerBirthDate" | "partnerBirthTime">) =>
  `对方资料：姓名/称呼：${order.partnerName || "未填写"}；性别：${order.partnerGender ? genderLabel(order.partnerGender) : "未填写"}；出生日期：${order.partnerBirthDate || "未填写"}；出生时间：${order.partnerBirthTime || "未填写"}`;

const hasPartnerProfile = (order: Pick<CalculationOrder, "partnerName" | "partnerGender" | "partnerBirthDate" | "partnerBirthTime">) =>
  Boolean(order.partnerName || order.partnerGender || order.partnerBirthDate || order.partnerBirthTime);

const buildProfileInfo = (order: Pick<CalculationOrder, "userName" | "gender" | "birthDate" | "birthTime" | "birthPlace" | "partnerName" | "partnerGender" | "partnerBirthDate" | "partnerBirthTime">) =>
  hasPartnerProfile(order)
    ? `${buildOwnProfileInfo(order)}\n${buildPartnerProfileInfo(order)}`
    : buildOwnProfileInfo(order);

const buildScoreSummary = (quizAnswers?: string) => {
  if (!quizAnswers) return "";
  const answerCount = quizAnswers.split("\n").filter(line => /^Q\d+/.test(line.trim())).length;
  return `题库计分结果：已完成 ${answerCount || "多"} 道题，系统已根据答案聚合维度倾向。维度摘要会用于约束 AI 只做解释和建议，不重新发明结论。`;
};

const buildTraditionalSummary = (test: TestItem, order: Pick<CalculationOrder, "userName" | "gender" | "birthDate" | "birthTime" | "birthPlace" | "partnerName" | "partnerGender" | "partnerBirthDate" | "partnerBirthTime">) => {
  if (getAssessmentMode(test) === "quiz_score") {
    return "传统断语：题库计分型测算以题目得分作为基础结论，AI 只在该结论上补充解释、风险和行动建议。";
  }
  return `传统断语：基于${buildProfileInfo(order)}，先由传统规则引擎生成确定性摘要，再交由 AI 补充完整报告。`;
};

const DEFAULT_FREE_REPORT_TEMPLATE = `【{title}】
根据你的答题 / 资料，系统初步识别到：{primaryLabel}。
{primaryLabelCopy}

免费预览显示：
- {metric1Label}：{metric1Value}
  {metric1Copy}
- {metric2Label}：{metric2Value}
  {metric2Copy}
- {metric3Label}：{metric3Value}
  {metric3Copy}

一句话洞察：{oneLineInsight}
初步建议：{lightAdvice}`;

type FreeReportTheme = {
  id: string;
  name: string;
  title: string;
  primaryLabel: string;
  primaryLabelCopy: string;
  metrics: Array<{ key: string; label: string; value: string; copy: string }>;
  oneLineInsight: string;
  lightAdvice: string;
};

const FREE_REPORT_THEMES: FreeReportTheme[] = [
  { id: "love_test", name: "恋爱测试", title: "你们的恋爱关系初判", primaryLabel: "稳定观察期", primaryLabelCopy: "你们之间有继续发展的基础，但关键要看双方回应是否稳定、关系边界是否清楚。", metrics: [{ key: "relationshipClarity", label: "关系清晰度", value: "中", copy: "彼此有好感或互动基础，但关系定义和下一步还需要确认。" }, { key: "investmentBalance", label: "双方投入平衡", value: "一方更主动", copy: "关系里可能存在一方推进更多、另一方回应较慢的情况。" }, { key: "relationshipStickingPoint", label: "当前恋爱卡点", value: "边界和节奏", copy: "真正影响关系质量的是边界是否清楚、推进节奏是否一致。" }], oneLineInsight: "这段关系的关键不是有没有心动，而是双方能不能稳定回应、清楚表达和一起推进。", lightAdvice: "先确认对方是否愿意持续投入，再决定主动推进还是放慢节奏。" },
  { id: "crush_test", name: "暗恋测试", title: "你们的暗恋阶段初判", primaryLabel: "互有好感期", primaryLabelCopy: "对方不是完全无感，但关系还需要更多稳定互动来确认。", metrics: [{ key: "signalClarity", label: "对方回应清晰度", value: "高", copy: "对方的回应和主动性相对稳定。" }, { key: "interactionHeat", label: "互动热度", value: "升温", copy: "近期互动有推进迹象。" }, { key: "advanceRisk", label: "推进风险", value: "低", copy: "可以用轻度试探观察对方接球意愿。" }], oneLineInsight: "容易把单次回应放大成关系信号，需要看连续行为。", lightAdvice: "先用一次轻度邀约或话题延展测试对方是否愿意接住。" },
  { id: "love_fit_test", name: "恋爱适配测试", title: "你们的关系适配初判", primaryLabel: "稳定互补型", primaryLabelCopy: "你们差异存在，但能形成支持和补位。", metrics: [{ key: "attractionSource", label: "吸引力来源", value: "表达吸引", copy: "容易被对方的回应、热情或存在感吸引。" }, { key: "mainConflict", label: "主要冲突点", value: "节奏错位", copy: "一方想推进，一方需要更多确认或空间。" }, { key: "longTermRisk", label: "长期适配风险", value: "高", copy: "长期需要处理明显的沟通或现实压力。" }], oneLineInsight: "容易形成一方追问、一方退开的循环。", lightAdvice: "先观察冲突后能否修复，比只看甜蜜时是否合拍更重要。" },
  { id: "dating_test", name: "脱单测试", title: "你的脱单卡点初判", primaryLabel: "圈层过窄型", primaryLabelCopy: "你不是没有吸引力，而是可接触到合适对象的入口偏少。", metrics: [{ key: "dateResistance", label: "脱单阻力", value: "高", copy: "主要阻力来自入口、推进或防御模式。" }, { key: "mateClarity", label: "择偶清晰度", value: "高", copy: "你对适合什么人已有较清晰判断。" }, { key: "peachChannel", label: "桃花渠道", value: "熟人型", copy: "更适合从朋友介绍、熟人圈层和稳定互动开始。" }], oneLineInsight: "容易等待缘分自然发生，却没有给关系足够入口。", lightAdvice: "先扩一个稳定入口，再谈提高脱单概率。" },
  { id: "marriage_test", name: "婚姻测试", title: "你们的婚姻结构初判", primaryLabel: "稳定共建型", primaryLabelCopy: "你们具备共同承担的基础，适合继续强化协作和沟通。", metrics: [{ key: "conflictFrequency", label: "冲突频率", value: "高", copy: "冲突或冷处理已经明显影响关系安全感。" }, { key: "emotionalAccount", label: "情绪账户", value: "充足", copy: "关系里仍有正向体验和互相支持。" }, { key: "cooperationDegree", label: "协作程度", value: "高", copy: "双方具备一起处理现实问题的基础。" }], oneLineInsight: "关系问题不一定是不爱了，而是协作规则没有跟上。", lightAdvice: "先把一个现实分工问题谈清楚，比反复讨论态度更有效。" },
  { id: "communication_test", name: "沟通测试", title: "你的沟通模式初判", primaryLabel: "直接推进型", primaryLabelCopy: "你倾向快速把问题讲清楚，但容易让对方感到被推动。", metrics: [{ key: "expressionClarity", label: "表达清晰度", value: "高", copy: "你比较能把需求或事实讲清楚。" }, { key: "emotionalTrigger", label: "情绪触发点", value: "被误解", copy: "最容易被误解或否定触发。" }, { key: "coldWarRisk", label: "冷战风险", value: "高", copy: "冲突后容易拉开距离或长时间不沟通。" }], oneLineInsight: "真实需求容易被语气和防御动作盖住。", lightAdvice: "先说感受和需求，再说事实和方案。" },
  { id: "marriage_status_test", name: "婚姻状态测试", title: "你们的婚姻温度初判", primaryLabel: "稳定经营期", primaryLabelCopy: "关系整体仍有温度，适合继续建设规则和亲密感。", metrics: [{ key: "relationshipTemperature", label: "关系温度", value: "高", copy: "关系里仍有较多支持、回应和正向体验。" }, { key: "repairPotential", label: "修复可能", value: "高", copy: "有可行动的修复入口。" }, { key: "riskLevel", label: "风险等级", value: "低", copy: "关系风险相对可控。" }], oneLineInsight: "真正的问题可能是长期需求没有被听见。", lightAdvice: "先把沟通目标从争输赢改成恢复可沟通。" },
  { id: "annual_growth_test", name: "年度发展测试", title: "你的年度发展主线初判", primaryLabel: "蓄力期", primaryLabelCopy: "今年更适合打基础、补短板和稳定节奏。", metrics: [{ key: "annualMainline", label: "年度主线", value: "事业推进", copy: "今年更适合围绕工作、能力和资源做规划。" }, { key: "careerPace", label: "事业节奏", value: "上升", copy: "适合争取机会、提升曝光和主动推进。" }, { key: "relationshipPace", label: "感情节奏", value: "升温", copy: "适合增加真实互动和关系投入。" }], oneLineInsight: "今年不是单纯更努力，而是先把精力放到正确主线上。", lightAdvice: "先选一个年度主线，再安排事业、感情和自我提升的顺序。" },
  { id: "personality_test", name: "性格测试", title: "你的核心性格初判", primaryLabel: "推进领导型", primaryLabelCopy: "你擅长把想法变成行动，但需要避免过度紧绷。", metrics: [{ key: "strengthTrait", label: "优势特质", value: "外向值", copy: "连接、表达和带动氛围。" }, { key: "shortTrait", label: "短板特质", value: "外向值", copy: "表达和主动连接可能偏少。" }, { key: "growthDirection", label: "发展方向", value: "表达连接", copy: "练习更清楚地表达需求和想法。" }], oneLineInsight: "你的优势用对了是天赋，用过头就会变成消耗。", lightAdvice: "先识别一个最常被过度使用的优势，再练习给它加边界。" },
  { id: "emotional_overthinking", name: "情绪内耗", title: "你的内耗来源初判", primaryLabel: "焦虑预演型", primaryLabelCopy: "你容易提前想很多可能性，用预演风险换安全感。", metrics: [{ key: "anxietyLevel", label: "焦虑强度", value: "高", copy: "不确定感和反复担心比较明显。" }, { key: "pressureSource", label: "压力来源", value: "关系", copy: "主要消耗来自关系回应、边界或亲密互动。" }, { key: "recoveryAbility", label: "恢复能力", value: "高", copy: "你仍有较好的自我调节和恢复入口。" }], oneLineInsight: "容易用反复预演风险来换取短暂安全感。", lightAdvice: "先把今天必须处理的事和可以延后的担心分开。" },
  { id: "career_planning", name: "职业规划", title: "你的职业方向初判", primaryLabel: "兴趣探索型", primaryLabelCopy: "你需要先找到真正愿意持续投入的方向。", metrics: [{ key: "careerStrength", label: "职业优势", value: "兴趣值", copy: "好奇心、内容偏好和探索动力。" }, { key: "stabilityNeed", label: "稳定需求", value: "高", copy: "你需要较强安全感，不适合贸然高风险转向。" }, { key: "growthPotential", label: "成长潜力", value: "高", copy: "适合主动争取平台、项目或新赛道。" }], oneLineInsight: "当前重点不是追热门，而是找到能力、兴趣和风险承受的交集。", lightAdvice: "先做一次低成本验证，再决定是否转行或投入副业。" },
  { id: "relationship_review", name: "感情复盘测试", title: "你的感情复盘初判", primaryLabel: "需求错位型", primaryLabelCopy: "你们的分歧核心可能不是谁不够好，而是彼此要的关系不同。", metrics: [{ key: "attachmentDegree", label: "放不下程度", value: "高", copy: "这段关系仍明显牵动你的情绪和判断。" }, { key: "responsibilityPoint", label: "关系责任点", value: "沟通", copy: "很多问题卡在没有被有效讲清。" }, { key: "repairSpace", label: "修复空间", value: "高", copy: "仍有沟通和修复入口，但需要方法。" }], oneLineInsight: "你走不出来，可能是因为这段关系还有未被解释的问题。", lightAdvice: "先把事实、感受和期待分开写下来，不要急着判断谁对谁错。" }
];

const getDefaultFreeReportThemeId = (test: TestItem) => {
  if (test.category === "career") return "career_planning";
  if (test.category === "personality" || test.category === "mbti" || test.category === "sbti") return "personality_test";
  if (test.category === "astrology") return "annual_growth_test";
  return "love_test";
};

const getFreeReportTheme = (test: TestItem, incomingThemeId?: string) =>
  FREE_REPORT_THEMES.find((theme) => theme.id === (incomingThemeId || test.freeReportThemeId))
  || FREE_REPORT_THEMES.find((theme) => theme.id === getDefaultFreeReportThemeId(test))
  || FREE_REPORT_THEMES[0];

const renderTemplate = (template: string, variables: Record<string, string>) =>
  Object.entries(variables).reduce((text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, "g"), value), template);

const PAID_REPORT_PLAIN_LANGUAGE_RULES = `

【大白话表达约束（适用于所有付费 AI 报告模板）】
1. 报告开头必须增加“算法依据”小节，用 2-4 句说明本报告基于什么体系和什么输入生成。星座 / 星盘 / 出生资料类报告必须明确写“算法依据来自西方占星学”，并说明使用了出生日期、出生时间、出生地点、当前问题等资料；题库计分型报告则说明依据来自题库维度、命中标签和免费报告初判。
2. 每个专业判断必须先给用户能听懂的结论，再解释依据。不要只写“桃花活跃度高位”“关系筛选明朗期”“能量上升”这类高级抽象词。
3. 写机会、风险、建议时，要具体到时间、人、事、动作。例如：“1个月内桃花运不错，可能出现1-2个新的互动机会，或有朋友、旧相识重新升温。”
4. 每个阶段的“机会 / 风险 / 建议”都要短句化，先给用户能懂的结论，再补一句原因。避免堆砌高级概念。`;

const withPlainLanguageRules = (template: string) =>
  template.includes("【大白话表达约束") ? template : `${template}${PAID_REPORT_PLAIN_LANGUAGE_RULES}`;

const buildFreeReportPayload = (
  test: TestItem,
  order: Pick<CalculationOrder, "userName" | "gender" | "birthDate" | "birthTime" | "birthPlace" | "question" | "quizAnswers" | "scoreSummary" | "traditionalSummary">,
  incoming?: Pick<CalculationOrder, "freeReportThemeId" | "freeReportTemplateVersion" | "freeReportText">
) => {
  const theme = getFreeReportTheme(test, incoming?.freeReportThemeId);
  const templateVersion = incoming?.freeReportTemplateVersion || "v1";
  if (incoming?.freeReportText) {
    return {
      freeReportThemeId: theme.id,
      freeReportTemplateVersion: templateVersion,
      freeReportText: incoming.freeReportText
    };
  }

  const metrics = theme.metrics;
  const freeReportText = renderTemplate(DEFAULT_FREE_REPORT_TEMPLATE, {
    title: theme.title,
    primaryLabel: theme.primaryLabel,
    primaryLabelCopy: theme.primaryLabelCopy,
    metric1Label: metrics[0]?.label || "指标1",
    metric1Value: metrics[0]?.value || "-",
    metric1Copy: metrics[0]?.copy || "",
    metric2Label: metrics[1]?.label || "指标2",
    metric2Value: metrics[1]?.value || "-",
    metric2Copy: metrics[1]?.copy || "",
    metric3Label: metrics[2]?.label || "指标3",
    metric3Value: metrics[2]?.value || "-",
    metric3Copy: metrics[2]?.copy || "",
    oneLineInsight: theme.oneLineInsight,
    lightAdvice: theme.lightAdvice
  });
  return {
    freeReportThemeId: theme.id,
    freeReportTemplateVersion: templateVersion,
    freeReportText
  };
};

const applyPromptVariables = (template: string, order: CalculationOrder) => {
  const scoreSummary = order.scoreSummary || buildScoreSummary(order.quizAnswers);
  const traditionalSummary = order.traditionalSummary || "";
  const profileInfo = buildProfileInfo(order);
  const userResult = scoreSummary || traditionalSummary || "资料推演型测算结果：请基于用户背景、咨询问题与当前内容模板方向进行分析。";
  const partnerInfo = `伴侣姓名：${order.partnerName || "未填写"}；伴侣性别：${order.partnerGender ? genderLabel(order.partnerGender) : "未填写"}；伴侣出生日期：${order.partnerBirthDate || "未填写"}；伴侣出生时间：${order.partnerBirthTime || "未填写"}`;
  return withPlainLanguageRules(template)
    .replace(/\{User_Result\}/g, userResult)
    .replace(/\{Basic_Info\}/g, profileInfo)
    .replace(/\{User_Name\}/g, order.userName)
    .replace(/\{Gender\}/g, genderLabel(order.gender))
    .replace(/\{Birth_Date\}/g, order.birthDate || "无需生日选项")
    .replace(/\{Birth_Time\}/g, order.birthTime || "无需出生时辰")
    .replace(/\{Birth_Place\}/g, order.birthPlace || "无需出生地点")
    .replace(/\{Question\}/g, order.question || "无特定诉求")
    .replace(/\{Partner_Info\}/g, partnerInfo)
    .replace(/\{Partner_Name\}/g, order.partnerName || "未填写")
    .replace(/\{Partner_Gender\}/g, order.partnerGender ? genderLabel(order.partnerGender) : "未填写")
    .replace(/\{Partner_Birth_Date\}/g, order.partnerBirthDate || "未填写")
    .replace(/\{Partner_Birth_Time\}/g, order.partnerBirthTime || "未填写")
    .replace(/\${userName}/g, order.userName)
    .replace(/\${gender}/g, genderLabel(order.gender))
    .replace(/\${birthDate}/g, order.birthDate || "无需生日选项")
    .replace(/\${birthTime}/g, order.birthTime || "无需出生时辰")
    .replace(/\${birthPlace}/g, order.birthPlace || "无需出生地点")
    .replace(/\${question}/g, order.question || "无特定诉求")
    .replace(/\${partnerName}/g, order.partnerName || "未填写")
    .replace(/\${partnerGender}/g, order.partnerGender ? genderLabel(order.partnerGender) : "未填写")
    .replace(/\${partnerBirthDate}/g, order.partnerBirthDate || "未填写")
    .replace(/\${partnerBirthTime}/g, order.partnerBirthTime || "未填写")
    .replace(/\${quizAnswers}/g, order.quizAnswers || "非题库计分型，无答题明细")
    .replace(/\${scoreSummary}/g, scoreSummary || "无题库计分摘要")
    .replace(/\${dimensionScores}/g, scoreSummary || "无维度分值")
    .replace(/\${resultType}/g, scoreSummary ? "题库计分倾向" : "资料推演结果")
    .replace(/\${resultTags}/g, scoreSummary ? "结构化分值、维度倾向、可解释建议" : "传统断语、资料推演、AI补充")
    .replace(/\${traditionalSummary}/g, traditionalSummary || "无传统断语摘要")
    .replace(/\{Free_Report\}/g, order.freeReportText || "无免费报告正文")
    .replace(/\{Free_Report_Context\}/g, "")
    .replace(/\${freeReportText}/g, order.freeReportText || "无免费报告正文")
    .replace(/\${freeReportContext}/g, "")
    .replace(/\${freeReportThemeId}/g, order.freeReportThemeId || "无免费报告主题ID")
    .replace(/\${profileInfo}/g, profileInfo);
};

const hasFreeReportInputPlaceholder = (template: string) =>
  template.includes("{Free_Report}") || template.includes("${freeReportText}");

const appendFreeReportToPrompt = (prompt: string, order: CalculationOrder, sourceTemplate = "") => {
  if (!order.freeReportText) return prompt;
  const consistencyRule = `【免费报告一致性约束】
用户已在免费预览页看到算法初判。付费报告必须承接、解释、扩展，不得反向推翻。`;

  if (hasFreeReportInputPlaceholder(sourceTemplate)) {
    return `${prompt}

${consistencyRule}`;
  }

  return `${prompt}

${consistencyRule}

【免费报告正文】
${order.freeReportText}`;
};

const generateGeminiReport = async (prompt: string) => {
  if (!ai) return "";

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms`)), GEMINI_TIMEOUT_MS);
  });
  const response = await Promise.race([
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    }),
    timeout
  ]);

  return response.text || "";
};

let orders: CalculationOrder[] = [
  {
    id: "o-101",
    testId: "mbti-standard",
    testName: "16型人格标准潜能报告",
    userId: "u-10001",
    userNickname: "星球访客A",
    userName: "张若华",
    gender: "female",
    birthDate: "1994-10-12",
    birthTime: "08:30",
    question: "今年适合辞职创业开花店吗？财运如何？",
    price: 19.9,
    paymentMethod: "wechat",
    status: "paid",
    popupShown: true,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    resultReport: `### 【核心心智模型】
您的性格属于 ENFP 竞选者类型，主导功能外向直觉让您天生充满创意与活力，这十分契合花艺创业这种对美和情感都有高要求的领域。

### 【认知功能解析】
- **内向情感（Fi）作为辅助功能**，意味着您极度追求内在价值观的实现。开花店不仅是生计，更是您精神追求的外显。
- **劣势功能内向感觉（Si）**，可能导致您在店铺日常琐碎运营上感到枯竭。

### 【破局建议】
财运随情感联结而来。找一个擅长财务与细节管理的伙伴（如ISTJ），能让您无后顾之忧地发挥创意优势。`
  },
  {
    id: "o-102",
    testId: "relationship-attachment",
    testName: "亲密关系：成人依恋类型与恋爱盲区测试",
    userId: "u-10001",
    userNickname: "星球访客A",
    userName: "林逸尘",
    gender: "male",
    birthDate: "1998-05-24",
    birthTime: "14:15",
    partnerName: "苏晴",
    partnerGender: "female",
    partnerBirthDate: "1994-10-12",
    partnerBirthTime: "08:30",
    question: "我和她因为琐事发生了冷战，已经2周了，可以复合吗？她心里还在乎我吗？",
    price: 29.9,
    paymentMethod: "alipay",
    status: "paid",
    popupShown: true,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resultReport: `### 【情绪偏好点】
这段冷战体现了焦虑-回避循环。您在冲突时更倾向于通过冷处理来获取安全感，而对方或许积攒了不少沟通疲劳。

### 【本能防御模式分析】
回避冲突是一种心理防御，这并不代表不在乎，而是潜意识里害怕直面关系破裂的风险才选择用冷漠武装自己。对方其实只是在等你一个情绪的软座落脚。

### 【安全型依恋的核心行动指南】
抛弃非黑即白的逻辑辩驳，一条简单的破冰信息（“这两周冷战我也不好受，有些想你”）就能穿透长达两周的坚冰。`
  },
  {
    id: "o-103",
    testId: "astrology-sun-moon",
    testName: "三主星深度星盘报告（太阳/月亮/上升）",
    userId: "u-10002",
    userNickname: "星球访客B",
    userName: "许南星",
    gender: "female",
    birthDate: "1996-06-09",
    birthTime: "12:00",
    question: "最近半年事业方向总是摇摆，想看看适合深耕还是转型。",
    price: 39.9,
    paymentMethod: "wechat",
    status: "pending",
    popupShown: false,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: "o-104",
    testId: "career-holland",
    testName: "霍兰德职业兴趣与专业匹配度报告",
    userId: "u-10003",
    userNickname: "星球访客C",
    userName: "陈予安",
    gender: "male",
    birthDate: "1992-03-18",
    birthTime: "09:45",
    question: "想确认目前岗位和长期职业兴趣是否匹配。",
    price: 19.9,
    paymentMethod: "alipay",
    refundReason: "用户申请退款",
    status: "refunded",
    popupShown: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resultReport: `### 【职业兴趣结构】
您的兴趣结构更偏向研究型与社会型组合，适合需要分析判断、沟通协调和长期积累的岗位。

### 【匹配建议】
当前阶段可优先寻找能沉淀专业能力的方向，避免只因短期波动频繁切换赛道。`
  }
];

// Stats engine to aggregate real and mock activity
let stats: DashboardStats = {
  totalRevenue: 49.8, // 19.9 + 29.9
  totalOrders: 2,
  conversionRate: 64.2, // dynamic based on simulation
  activeUsers: 450,
  testBreakdown: [
    { name: "16型人格标准潜能报告", value: 19.9, color: "#6366F1" },
    { name: "假如MBTI有拟人：你的灵魂是哪种小动物/打工人？", value: 0, color: "#EF4444" },
    { name: "三主星深度星盘报告（太阳/月亮/上升）", value: 0, color: "#F59E0B" },
    { name: "12星座本月隐藏避坑指南", value: 0, color: "#10B981" },
    { name: "正版九型人格/大五人格核心动机测算", value: 0, color: "#8B5CF6" },
    { name: "情境投射：潜意识里的“另一个你”", value: 0, color: "#EC4899" },
    { name: "霍兰德职业兴趣与专业匹配度报告", value: 0, color: "#06B6D4" },
    { name: "盖洛普优势定位：测测你的吸金/搞钱天赋", value: 0, color: "#3B82F6" },
    { name: "亲密关系：成人依恋类型与恋爱盲区测试", value: 29.9, color: "#F43F5E" },
    { name: "五大爱之语：测测你和伴侣的“情感电量”", value: 0, color: "#14B8A6" }
  ],
  funnelStages: [
    { stage: "浏览首页", count: 1205, percentage: 100 },
    { stage: "点击项目", count: 874, percentage: 72.5 },
    { stage: "填参提交", count: 561, percentage: 46.5 },
    { stage: "调起支付", count: 284, percentage: 23.5 },
    { stage: "支付并输出报告", count: 182, percentage: 15.1 }
  ],
  weeklyRevenue: [
    { date: "06-03", amount: 480, orderCount: 15 },
    { date: "06-04", amount: 590, orderCount: 22 },
    { date: "06-05", amount: 720, orderCount: 28 },
    { date: "06-06", amount: 640, orderCount: 25 },
    { date: "06-07", amount: 890, orderCount: 34 },
    { date: "06-08", amount: 1120, orderCount: 41 },
    { date: "今日", amount: 49.8, orderCount: 2 }
  ]
};

// Functions to recompute stats dynamically
function recalculateStats() {
  const paidOrders = orders.filter((o) => o.status === "paid");
  const rev = paidOrders.reduce((sum, o) => sum + o.price, 0);
  stats.totalRevenue = parseFloat(rev.toFixed(2));
  stats.totalOrders = paidOrders.length;
  
  // Update breakdown
  const breakdownMap = new Map<string, number>();
  tests.forEach((t) => breakdownMap.set(t.name, 0));
  paidOrders.forEach((o) => {
    breakdownMap.set(o.testName, (breakdownMap.get(o.testName) || 0) + o.price);
  });
  
  const colors = ["#EF4444", "#F59E0B", "#6366F1", "#10B981", "#EC4899", "#8B5CF6"];
  stats.testBreakdown = Array.from(breakdownMap.entries()).map(([name, val], idx) => ({
    name,
    value: parseFloat(val.toFixed(2)),
    color: colors[idx % colors.length]
  }));

  // Match the latest day's amount with real calculations
  const todayRev = paidOrders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.price, 0);
  
  const todayOrders = paidOrders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .length;

  const weekly = [...stats.weeklyRevenue];
  const todayIdx = weekly.findIndex((w) => w.date === "今日");
  if (todayIdx !== -1) {
    weekly[todayIdx].amount = parseFloat(todayRev.toFixed(2));
    weekly[todayIdx].orderCount = todayOrders;
  }
  stats.weeklyRevenue = weekly;
  
  // Ensure conversion rates are reasonable
  const homepageVisits = stats.activeUsers * 2.8;
  const submissions = paidOrders.length + 50; 
  const payAttempts = paidOrders.length + 8;
  stats.funnelStages = [
    { stage: "浏览首页", count: Math.round(homepageVisits), percentage: 100 },
    { stage: "点击项目", count: Math.round(homepageVisits * 0.75), percentage: 75 },
    { stage: "填参提交", count: Math.round(submissions * 1.5), percentage: Math.round((submissions * 1.5 / homepageVisits) * 100) },
    { stage: "调起支付", count: Math.round(payAttempts), percentage: Math.round((payAttempts / homepageVisits) * 100) },
    { stage: "支付并输出报告", count: paidOrders.length, percentage: Math.round((paidOrders.length / homepageVisits) * 100) }
  ];
  stats.conversionRate = parseFloat(((paidOrders.length / homepageVisits) * 100).toFixed(1));
}

// API Routes

app.get("/api/session", (req, res) => {
  const user = getOrCreateUser(req, res);
  res.json(user);
});

app.post("/api/session/bind-phone", (req, res) => {
  const user = getOrCreateUser(req, res);
  const phone = normalizePhone(String(req.body.phone || ""));
  const code = String(req.body.code || "");
  if (!/^1\d{10}$/.test(phone)) {
    return res.status(400).json({ error: "请输入 11 位手机号" });
  }
  if (code && code.length < 4) {
    return res.status(400).json({ error: "验证码格式不正确" });
  }
  const updatedUser = { ...user, phone };
  usersById.set(user.userId, updatedUser);
  usersByPhone.set(phone, user.userId);
  res.json({ success: true, user: updatedUser });
});

app.get("/api/orders/lookup", (req, res) => {
  const orderNo = String(req.query.orderNo || "").trim();
  const phone = normalizePhone(String(req.query.phone || ""));
  const user = getOrCreateUser(req, res);

  let matched = orders;
  if (orderNo) {
    matched = orders.filter(order => order.id.toLowerCase() === orderNo.toLowerCase());
  } else if (phone) {
    const userId = usersByPhone.get(phone);
    matched = userId ? orders.filter(order => order.userId === userId) : [];
  } else {
    matched = orders.filter(order => order.userId === user.userId);
  }
  res.json(matched.map(withOrderPhone));
});

// 1. Get calculations configurations
app.get("/api/tests", (req, res) => {
  res.json(tests);
});

// 2. Add or update test item configuration
app.post("/api/tests/update", (req, res) => {
  const item: TestItem = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: "Invalid test item configuration" });
  }

  const index = tests.findIndex((t) => t.id === item.id);
  if (index !== -1) {
    tests[index] = { ...tests[index], ...item };
  } else {
    tests.push(item);
  }
  recalculateStats();
  res.json({ success: true, tests });
});

// 3. Batch reset tests to default
app.post("/api/tests/reset", (req, res) => {
  tests = [...DEFAULT_TESTS];
  recalculateStats();
  res.json({ success: true, tests });
});

// 4. Get order log
app.get("/api/orders", (req, res) => {
  res.json(orders.map(withOrderPhone));
});

// Create a pending (unpaid) order record
app.post("/api/orders", (req, res) => {
  const { testId, userName, gender, birthDate, birthTime, birthPlace, question, partnerName, partnerGender, partnerBirthDate, partnerBirthTime, quizAnswers, scoreSummary, traditionalSummary, freeReportThemeId, freeReportTemplateVersion, freeReportText, paymentMethod, price } = req.body;
  if (!testId || !userName) {
    return res.status(400).json({ error: "商品和用户名为必填项" });
  }
  const selectedTest = tests.find(t => t.id === testId);
  if (!selectedTest) {
    return res.status(404).json({ error: "Item not found" });
  }

  const orderId = "o-" + (100 + orders.length + 1);
  const currentUser = getOrCreateUser(req, res);
  const resolvedScoreSummary = scoreSummary || buildScoreSummary(quizAnswers);
  const resolvedTraditionalSummary = traditionalSummary || buildTraditionalSummary(selectedTest, { userName, gender: gender || "male", birthDate, birthTime, birthPlace, question: question || "无特定诉求" });
  const freeReportPayload = buildFreeReportPayload(
    selectedTest,
    {
      userName,
      gender: gender || "male",
      birthDate,
      birthTime,
      birthPlace,
      question: question || "无特定诉求",
      quizAnswers,
      scoreSummary: resolvedScoreSummary,
      traditionalSummary: resolvedTraditionalSummary
    },
    { freeReportThemeId, freeReportTemplateVersion, freeReportText }
  );
  const newOrder: CalculationOrder = {
    id: orderId,
    testId,
    testName: selectedTest.name,
    userId: currentUser.userId,
    userNickname: currentUser.userNickname,
    userName,
    gender: gender || "male",
    birthDate: birthDate || undefined,
    birthTime: birthTime || undefined,
    birthPlace: birthPlace || undefined,
    partnerName: partnerName || undefined,
    partnerGender: partnerGender || undefined,
    partnerBirthDate: partnerBirthDate || undefined,
    partnerBirthTime: partnerBirthTime || undefined,
    quizAnswers: quizAnswers || undefined,
    scoreSummary: resolvedScoreSummary,
    traditionalSummary: resolvedTraditionalSummary,
    ...freeReportPayload,
    question: question || "无特定诉求",
    price: typeof price === "number" && price >= 0 ? price : selectedTest.price,
    paymentMethod: paymentMethod === "alipay" ? "alipay" : "wechat",
    status: "pending",
    popupShown: false,
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  recalculateStats();
  res.json(newOrder);
});

// Delete an order
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders.splice(idx, 1);
    recalculateStats();
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Order not found" });
});

app.post("/api/orders/:id/conversion-popup-shown", (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "未找到对应的订单" });
  }
  order.popupShown = true;
  res.json({ success: true, order });
});

// Process payment for a pending order
app.post("/api/orders/:id/pay", async (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "未找到对应的订单" });
  }
  const order = orders[orderIndex];
  order.status = "paid";
  recalculateStats();

  const selectedTest = tests.find(t => t.id === order.testId);
  if (!selectedTest) {
    order.status = "failed";
    return res.status(404).json({ error: "未找到对应的测算项目类型" });
  }

  try {
    let finalReportText = "";
    let completedViaGemini = false;

    if (ai) {
      try {
        let prompt = appendFreeReportToPrompt(applyPromptVariables(selectedTest.promptTemplate, order), order, selectedTest.promptTemplate);

        if (order.partnerName) {
          prompt = prompt.replace(/\${partnerName}/g, order.partnerName);
        }
        if (order.partnerGender) {
          prompt = prompt.replace(/\${partnerGender}/g, order.partnerGender === "male" ? "男" : (order.partnerGender === "female" ? "女" : "其他"));
        }
        if (order.quizAnswers) {
          prompt = prompt.replace(/\${quizAnswers}/g, order.quizAnswers);
          prompt += `\n\n【用户答题测评原始客观参考记录】：\n${order.quizAnswers}\n\n【结构化计分摘要】：\n${order.scoreSummary || buildScoreSummary(order.quizAnswers)}`;
        }
        if (order.partnerName) {
          prompt += `\n\n【测算涉及伴侣信息】：\n姓名：${order.partnerName}，性别：${order.partnerGender === "male" ? "男" : "女"}，出生日期：${order.partnerBirthDate || "未填写"}，出生时间：${order.partnerBirthTime || "未填写"}`;
        }

        console.log(`Sending calculation request to Gemini [Model: ${GEMINI_MODEL}] for user ${order.userName}`);
        const responseText = await generateGeminiReport(prompt);

        if (responseText) {
          finalReportText = responseText;
          completedViaGemini = true;
          console.log("Calculated successfully via Gemini!");
        } else {
          throw new Error("Gemini API call succeeded but returned an empty response");
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API calculation failed during pending-pay route, falling back:", geminiErr);
      }
    }

    if (!completedViaGemini) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      let mockAnswersPrompt = "";
      if (order.quizAnswers) {
        mockAnswersPrompt = `\n\n### 【个人答题测评客观分析】\n根据您在行为偏好和特质评估的选择：\n${order.quizAnswers}\n系统捕捉到您潜在的心智倾向和极佳的行为决策风格。`;
      }
      if (order.scoreSummary) {
        mockAnswersPrompt += `\n\n### 【结构化维度计分摘要】\n${order.scoreSummary}`;
      }
      if (order.traditionalSummary) {
        mockAnswersPrompt += `\n\n### 【传统断语预分析】\n${order.traditionalSummary}`;
      }
      if (order.freeReportText) {
        mockAnswersPrompt += `\n\n### 【免费报告初判承接】\n${order.freeReportText}`;
      }
      if (order.partnerName) {
        mockAnswersPrompt += `\n\n### 【伴侣偏好与依恋模型测算】\n针对您填报的伴侣姓名【${order.partnerName}】（性别：${order.partnerGender === "male" ? "男" : "女"}），系统测算出两个人的长期契合度和心理交融契合态。在人际和亲密交互中，适度的独立与充分的理解是彼此最佳的情感保鲜密码。`;
      }

      let computedZodiac = "天秤座";
      if (order.birthDate) {
        try {
          const parts = order.birthDate.split("-");
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          const dates = [20, 19, 20, 20, 21, 21, 23, 23, 23, 23, 22, 22];
          const signs = ["摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座"];
          computedZodiac = (day < dates[month - 1] ? signs[(month - 2 === -1 ? 11 : month - 2)] : signs[month - 1]);
        } catch(e) {
          computedZodiac = "天秤座";
        }
      }
      const birthDetails = order.birthDate ? `，结合公历 ${order.birthDate} ${order.birthTime || "常规时间"} 的时辰星盘，` : "，";

      finalReportText = `### 【本心人格画布与心智映射】
（安全提示：当前服务器处于离线校验算法状态，以下内容为您安全生成的评估报告）
${order.userName}您的心智核心标志着【${computedZodiac}】的主导模式${birthDetails}具备极富生命朝气的直觉敏锐力与积极自省特色。您办事具备严谨高标准的逻辑条理，但在高频刺激或不确定局势下面临适度的情绪内耗。${mockAnswersPrompt}

### 【心智宽容调理与解压建议】
- **积极自愈机能**：多接触水性环境或绿意自然风光。平时维持充足水分和深度呼吸练习，对平衡脑内长效张力非常有益。
- **潜在盲点防御**：在面临重压时，切忌启动过度紧缩的防御外壳。多保持接纳姿态，冷处理事物3秒钟能让理性重占高地。

### 【长期成长周期与特定破局】
- **人生成长生命节律**：在未来数月内，您将步入一段关于个人界限及愿景配置的清晰调整节点。在与多方角色的对话中，维持真诚开放和得当的留白，将创造最优的执行路径。
- **深层诉求建议**：针对您所提报关于 “${order.question}” 的核心难题，从极优心理学及理性规划来看，无需过度焦虑代偿，维持自信正念前行，多与具有系统理性思维的伙伴协商协作，其前景自然豁然开朗。

### 【心理测评成长箴言】
面对难关无需忧虑：‘莫愁前路，乾坤万象随心自转’。维持内心从容优雅，您面临的成长绊脚石将一步步化为登高基石！`;
    }

    order.status = "paid";
    order.resultReport = finalReportText;
    selectedTest.calculateCount += 1;
    recalculateStats();

    res.json({
      success: true,
      order
    });

  } catch (err: any) {
    console.error("Destiny calculation from pending order error:", err);
    order.status = "failed";
    order.resultReport = `### 测算发生故障\n测试宇宙能量时发生了错误，原因为：${err.message || err}`;
    recalculateStats();
    res.status(500).json({ error: "服务器测算失败", details: err.message });
  }
});

// Submit refund request to payment provider and sync the order status.
app.post("/api/orders/:id/refund", async (req, res) => {
  const { id } = req.params;
  const refundReason = typeof req.body?.refundReason === "string" ? req.body.refundReason.trim() : "";
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "未找到对应的订单" });
  }
  if (order.status !== "paid") {
    return res.status(400).json({ error: "仅已支付订单支持退款" });
  }

  // In production this is where the payment provider refund API is called with the order id.
  await new Promise((resolve) => setTimeout(resolve, 500));
  order.status = "refunded";
  order.refundReason = refundReason || "后台人工退款";
  recalculateStats();

  res.json({
    success: true,
    refundStatus: "refunded",
    providerRequest: {
      orderId: order.id,
      amount: order.price
    },
    order
  });
});

// 5. Get metrics/dashboard statistics
app.get("/api/stats", (req, res) => {
  recalculateStats();
  res.json(stats);
});

// 6. Generate mock transaction data to simulate real-world activity
app.post("/api/stats/mock-traffic", (req, res) => {
  const firstNames = ["李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴"];
  const lastNames = ["建国", "美丽", "明华", "浩然", "梓轩", "若冰", "诗雨", "玉婷", "志强", "晓梅"];
  const randomName = firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)];
  
  const selectedTest = tests[Math.floor(Math.random() * tests.length)];
  const genders: ("male" | "female" | "other")[] = ["male", "female"];
  const randomGender = genders[Math.floor(Math.random() * genders.length)];
  
  const birthYears = [1985, 1990, 1995, 2000, 2005];
  const randomYear = birthYears[Math.floor(Math.random() * birthYears.length)];
  const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  
  const hours = String(Math.floor(Math.random() * 24)).padStart(2, "0");
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0");

  const mockQuestionsMap: Record<string, string[]> = {
    mbti: ["分析一下我的性格，适合去做销售和公关还是技术开发？", "我的决策倾向是偏理性还是偏感性？在日常工作中怎么防范这个盲点？", "作为INFP，如何在职场高压部门生存并发挥同理心？"],
    astrology: ["我和男朋友星盘里金星 and 月亮互补吗？能长相守吗？", "上升处女太阳双子，今年感情正缘运势和吉星方位在何处？", "本名星盘里第五宫有木星，是不是代表偏财和桃花很旺？"],
    personality: ["回避型人格怎么自救，经常在感情里想逃跑该怎么调整？", "原生家庭父母经常争吵，导致我现在不相信亲密关系，如何建立安全感？", "焦虑型依恋如何实现自我重塑，变得更加独立 and 自信？"],
    career: ["最近处于职业瓶颈期，怎么才能突破自我天花板获得职位跃升？", "如何提高沟通中的情绪管理和换位共情力？", "我是管理新人，如何掌握教练型和民主型两者的平衡艺术？"],
    emotion: ["暗恋同届校友很久了，不知道他对我是不是真的有意思，有多大成真几率？", "为什么我一遇到特别喜欢、极度在乎的人就会瞬间冷落对方，怎么克服这个恋爱易伤防线？", "我跟另一半冷战快一个月了，我们近期还有重修旧好的命运指引吗？"]
  };
  const category = selectedTest.category;
  const questions = mockQuestionsMap[category] || ["一生的大致运势如何？"];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  const mockAccountIndex = Math.floor(Math.random() * 6) + 1;

  // Create a beautiful precalculated report mockup for database records
  const resultReport = `### 【本心特质与深度心智画布】
针对【${randomName}】的自主心理感知模式，系统解析显示出极富朝气的主动直觉与高情商沟通活性。阁下具备独立自主的自省力系统，能在繁琐、不确定环境中快速构建逻辑条理。应对人际及未来规划时，展现了卓越的自组织协作与深长同理技能。

### 【心智调理与心理韧性恢复】
- **积极自愈特征**：高信度同理共鸣。日常中多处在水性环境、绿植自然中，主动给自己安排留白冥想时间，能极佳地舒缓焦虑。
- **潜在心理阻碍**：容易在一味渴求高标准目标的支配下陷入内部情绪耗竭。建议遇事冷处理3秒。

### 【三大核心心理健康指针评级】
- **情商沟通活性**：★★★★☆ (多有广泛的良性社交共鸣)
- **成长势能韧性**：★★★★★ (应对职业或亲密关系变化展现极佳重构力)
- **心智冷静带宽**：★★★☆☆ (在高压情境下需要注重边界防御与减压)

### 【成长型综合建议】
关于您所关切的「${randomQuestion}」：
从现代积极心理学和长效人生规划来看，任何情结或困境都是重构核心心智架构的绝佳契机。此去必定能建立坚如磐石的身心锚点，事事迎刃而解！`;

  const newOrder: CalculationOrder = {
    id: "o-" + (100 + orders.length + 1),
    testId: selectedTest.id,
    testName: selectedTest.name,
    userId: `u-demo-${String(mockAccountIndex).padStart(3, "0")}`,
    userNickname: `星友${mockAccountIndex}`,
    userName: randomName,
    gender: randomGender,
    birthDate: `${randomYear}-${randomMonth}-${randomDay}`,
    birthTime: `${hours}:${minutes}`,
    question: randomQuestion,
    price: selectedTest.price,
    paymentMethod: Math.random() > 0.5 ? "wechat" : "alipay",
    status: "paid",
    popupShown: true,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 6) * 3600 * 1000).toISOString(),
    resultReport
  };

  orders.unshift(newOrder);
  stats.activeUsers += Math.floor(Math.random() * 15) + 2;
  recalculateStats();

  res.json({ success: true, order: newOrder, stats });
});

// 7. Core client fortune-telling calculator integration (GEMINI POWERED)
app.post("/api/orders/calculate", async (req, res) => {
  const { testId, userName, gender, birthDate, birthTime, birthPlace, question, partnerName, partnerGender, partnerBirthDate, partnerBirthTime, quizAnswers, scoreSummary, traditionalSummary, freeReportThemeId, freeReportTemplateVersion, freeReportText, paymentMethod, price } = req.body;

  if (!testId || !userName) {
    return res.status(400).json({ error: "用户名与测评大类为必填参数" });
  }

  const selectedTest = tests.find((t) => t.id === testId);
  if (!selectedTest) {
    return res.status(404).json({ error: "未找到对应的测算项目类型" });
  }

  if (getAssessmentMode(selectedTest) === "profile_inference" && !birthDate) {
    return res.status(400).json({ error: "资料推演型测算必须填写出生阳历日期" });
  }

  // Create a paid order in the list before generating the report.
  const orderId = "o-" + (100 + orders.length + 1);
  const currentUser = getOrCreateUser(req, res);
  const resolvedScoreSummary = scoreSummary || buildScoreSummary(quizAnswers);
  const resolvedTraditionalSummary = traditionalSummary || buildTraditionalSummary(selectedTest, { userName, gender: gender || "male", birthDate, birthTime, birthPlace, question: question || "无特定诉求" });
  const freeReportPayload = buildFreeReportPayload(
    selectedTest,
    {
      userName,
      gender: gender || "male",
      birthDate,
      birthTime,
      birthPlace,
      question: question || "无特定诉求",
      quizAnswers,
      scoreSummary: resolvedScoreSummary,
      traditionalSummary: resolvedTraditionalSummary
    },
    { freeReportThemeId, freeReportTemplateVersion, freeReportText }
  );
  const newOrder: CalculationOrder = {
    id: orderId,
    testId: selectedTest.id,
    testName: selectedTest.name,
    userId: currentUser.userId,
    userNickname: currentUser.userNickname,
    userName,
    gender: gender || "male",
    birthDate: birthDate || undefined,
    birthTime: birthTime || undefined,
    birthPlace: birthPlace || undefined,
    partnerName: partnerName || undefined,
    partnerGender: partnerGender || undefined,
    partnerBirthDate: partnerBirthDate || undefined,
    partnerBirthTime: partnerBirthTime || undefined,
    quizAnswers: quizAnswers || undefined,
    scoreSummary: resolvedScoreSummary,
    traditionalSummary: resolvedTraditionalSummary,
    ...freeReportPayload,
    question: question || "无特定诉求，求批示人生大运与流年开解。",
    price: typeof price === "number" && price >= 0 ? price : selectedTest.price,
    paymentMethod: paymentMethod === "alipay" ? "alipay" : "wechat",
    status: "paid",
    popupShown: false,
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  recalculateStats();

  try {
    let finalReportText = "";
    let completedViaGemini = false;

    if (ai) {
      try {
        // Structure the full prompt using the administrator's editable Prompt Template configured on the backend!
        let prompt = appendFreeReportToPrompt(applyPromptVariables(selectedTest.promptTemplate, newOrder), newOrder, selectedTest.promptTemplate);

        // Replace optional variables if specified in the prompt template
        if (partnerName) {
          prompt = prompt.replace(/\${partnerName}/g, partnerName);
        }
        if (partnerGender) {
          prompt = prompt.replace(/\${partnerGender}/g, partnerGender === "male" ? "男" : (partnerGender === "female" ? "女" : "其他"));
        }
        if (quizAnswers) {
          prompt = prompt.replace(/\${quizAnswers}/g, quizAnswers);
          prompt += `\n\n【用户答题测评原始客观参考记录】：\n${quizAnswers}\n\n【结构化计分摘要】：\n${newOrder.scoreSummary || buildScoreSummary(quizAnswers)}`;
        }
        if (partnerName) {
          prompt += `\n\n【测算涉及伴侣信息】：\n姓名：${partnerName}，性别：${partnerGender === "male" ? "男" : "女"}，出生日期：${partnerBirthDate || "未填写"}，出生时间：${partnerBirthTime || "未填写"}`;
        }

        console.log(`Sending calculation request to Gemini [Model: ${GEMINI_MODEL}] for user ${userName}`);
        const responseText = await generateGeminiReport(prompt);

        if (responseText) {
          finalReportText = responseText;
          completedViaGemini = true;
          console.log("Calculated successfully via Gemini!");
        } else {
          throw new Error("Gemini API call succeeded but returned an empty response");
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API calculation failed, falling back to safe local simulation algorithm:", geminiErr);
        // We will continue to the fallback offline mock generator seamlessly!
      }
    }

    if (!completedViaGemini) {
      // Simulate slow reading since we are in fallback offline simulation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      let mockAnswersPrompt = "";
      if (quizAnswers) {
        mockAnswersPrompt = `\n\n### 【个人答题测评客观分析】\n您在行为偏好和特质评估的选择为：\n${quizAnswers}\n根据算法模型底色，这清晰展示了您内隐的心智模式和决策风格。`;
      }
      if (newOrder.scoreSummary) {
        mockAnswersPrompt += `\n\n### 【结构化维度计分摘要】\n${newOrder.scoreSummary}`;
      }
      if (newOrder.traditionalSummary) {
        mockAnswersPrompt += `\n\n### 【传统断语预分析】\n${newOrder.traditionalSummary}`;
      }
      if (newOrder.freeReportText) {
        mockAnswersPrompt += `\n\n### 【免费报告初判承接】\n${newOrder.freeReportText}`;
      }
      if (partnerName) {
        mockAnswersPrompt += `\n\n### 【伴侣偏好与依恋模型测算】\n针对您填报的伴侣姓名【${partnerName}】（性别：${partnerGender === "male" ? "男" : "女"}），系统计算出你们两人的性格兼容性与矛盾点。在日常交往中多倾听和接纳对方的边界，能建立更加深厚、稳固的安全型依恋纽带。`;
      }

      let computedZodiac = "天秤座";
      if (birthDate) {
        try {
          const parts = birthDate.split("-");
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          const dates = [20, 19, 20, 20, 21, 21, 23, 23, 23, 23, 22, 22];
          const signs = ["摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座"];
          computedZodiac = (day < dates[month - 1] ? signs[(month - 2 === -1 ? 11 : month - 2)] : signs[month - 1]);
        } catch(e) {
          computedZodiac = "天秤座";
        }
      }
      const birthDetails = birthDate ? `，根据公历 ${birthDate} ${birthTime || "常规时间"} 的星表黄道位置映射，` : "，";

      finalReportText = `### 【本心人格画布与心智映射】
（安全提示：当前服务器处于离线校验算法状态，以下内容为您安全生成的评估报告）
${userName}您的心智核心标志着【${computedZodiac}】的主导模式${birthDetails}具备极富生命朝气的直觉敏锐力与积极自省特色。您办事具备严谨高标准的逻辑条理，但在高频刺激或不确定局势下面临适度的情绪内耗。${mockAnswersPrompt}

### 【心智宽容调理与解压建议】
- **积极自愈机能**：多接触水性环境或绿意自然风光。平时维持充足水分和深度呼吸练习，对平衡脑内长效张力非常有益。
- **潜在盲点防御**：在面临重压时，切忌启动过度紧缩的防御外壳。多保持接纳姿态，冷处理事物3秒钟能让理性重占高地。

### 【长期成长周期与特定破局】
- **人生成长生命节律**：在未来数月内，您将步入一段关于个人界限及愿景配置的清晰调整节点。在与多方角色的对话中，维持真诚开放和得当的留白，将创造最优的执行路径。
- **深层诉求建议**：针对您所提报关于 “${question}” 的核心难题，从极优心理学及理性规划来看，无需过度焦虑代偿，维持自信正念前行，多与具有系统理性思维的伙伴协商协作，其前景自然豁然开朗。

### 【心理测评成长箴言】
面对难关无需忧虑：‘莫愁前路，乾坤万象随心自转’。维持内心从容优雅，您面临的成长绊脚石将一步步化为登高基石！`;
    }

    // Update order success state
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = "paid";
      orders[orderIndex].resultReport = finalReportText;
    }

    // Success rate slightly raises when calculation succeed
    selectedTest.calculateCount += 1;
    recalculateStats();

    res.json({
      success: true,
      order: orders.find((o) => o.id === orderId)
    });

  } catch (err: any) {
    console.error("Destiny calculation error:", err);
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = "failed";
      orders[orderIndex].resultReport = `### 测算发生故障\n测试调频宇宙能量时发生了错误，原因为：${err.message || err}。请点击重新测算。`;
    }
    recalculateStats();
    res.status(500).json({ error: "服务器测算失败", details: err.message });
  }
});

// Serve frontend build output on production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: HMR_PORT } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tianji Calculation & Admin Platform container operational.`);
    console.log(`Local address is http://localhost:${PORT}`);
  });
}

startServer();
