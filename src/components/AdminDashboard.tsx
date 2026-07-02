/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Calendar,
  ChevronDown,
  Copy,
  Cpu,
  Edit,
  Eraser,
  FileText,
  HelpCircle,
  Italic,
  LayoutGrid,
  List,
  ListOrdered,
  Plus,
  Settings,
  Sparkles,
  Terminal,
  Trash,
  TrendingUp,
  Underline,
  UploadCloud,
  X
} from "lucide-react";
import {
  BannerSlide,
  CalculationOrder,
  ConversionRecommendation,
  HomepageProduct,
  MiddleRecommendation,
  ProductSku,
  ShortcutItem,
  TestItem
} from "../types";

interface AdminDashboardProps {
  tests: TestItem[];
  orders: CalculationOrder[];
  onRefresh: () => void;
  onUpdateTest: (updatedTest: TestItem) => void;
  onDeleteTest?: (testId: string) => void;
  slides?: BannerSlide[];
  onUpdateSlides?: (slides: BannerSlide[]) => void;
  shortcuts?: ShortcutItem[];
  onUpdateShortcuts?: (shortcuts: ShortcutItem[]) => void;
  middleRecs?: MiddleRecommendation[];
  onUpdateMiddleRecs?: (middleRecs: MiddleRecommendation[]) => void;
  homepageProducts?: HomepageProduct[];
  onUpdateHomepageProducts?: (homepageProducts: HomepageProduct[]) => void;
  conversionRecs?: ConversionRecommendation[];
  onUpdateConversionRecs?: (conversionRecs: ConversionRecommendation[]) => void;
  productSkus?: ProductSku[];
  onUpdateProductSkus?: (productSkus: ProductSku[]) => void;
}

interface QuestionBankItem {
  id: string;
  category: TestItem["category"];
  sequence: number;
  dimension: string;
  question: string;
  options: string[];
  scores: string[];
  linkedCount: number;
}

interface MarketingCampaign {
  id: string;
  name: string;
  mediaAccountId?: string;
  skuId?: string;
  skuName?: string;
  testId: string;
  testName: string;
  platform: "巨量" | "快手" | string;
  price: number;
  deductionPercent: number;
  linkUrl: string;
  heroImage?: string;
  subtitle?: string;
  detailBody?: string;
  disclaimerText?: string;
  advertiserName?: string;
  buttonText?: string;
  buttonStyle?: "solid" | "outline" | "glow";
  themeColor?: string;
  status: "enabled" | "disabled";
  createdAt: string;
  views: number;
  requests: number;
  pays: number;
  adSpend: number;
  reportViews: number;
}

interface MediaAccount {
  id: string;
  name: string;
  platform: "巨量" | "快手";
  company: string;
  createdAt: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  content: string;
  linkedTemplates: TestItem[];
  isCustom?: boolean;
}

type MenuKey =
  | "items"
  | "questionBank"
  | "operation"
  | "marketing"
  | "orders"
  | "prompts";

type MarketingTab = "landing" | "data" | "accounts";

const REPORT_TEMPLATE_STORAGE_KEY = "admin_report_templates_v1";
const REPORT_TEMPLATE_DISABLED_STORAGE_KEY = "admin_report_template_disabled_v1";
type FreeReportThemeOption = {
  id: string;
  name: string;
  title: string;
  category: TestItem["category"];
  target: NonNullable<TestItem["assessmentTarget"]>;
};

const FREE_REPORT_THEME_OPTIONS: FreeReportThemeOption[] = [
  { id: "love_test", name: "恋爱测试", title: "你们的恋爱关系初判", category: "emotion", target: "double" },
  { id: "crush_test", name: "暗恋测试", title: "你们的暗恋阶段初判", category: "emotion", target: "double" },
  { id: "love_fit_test", name: "恋爱适配测试", title: "你们的关系适配初判", category: "emotion", target: "double" },
  { id: "dating_test", name: "脱单测试", title: "你的脱单卡点初判", category: "emotion", target: "single" },
  { id: "marriage_test", name: "婚姻测试", title: "你们的婚姻结构初判", category: "emotion", target: "double" },
  { id: "communication_test", name: "沟通测试", title: "你的沟通模式初判", category: "emotion", target: "double" },
  { id: "marriage_status_test", name: "婚姻状态测试", title: "你们的婚姻温度初判", category: "emotion", target: "double" },
  { id: "annual_growth_test", name: "年度发展测试", title: "你的年度发展主线初判", category: "astrology", target: "single" },
  { id: "personality_test", name: "性格测试", title: "你的核心性格初判", category: "personality", target: "single" },
  { id: "emotional_overthinking", name: "情绪内耗", title: "你的内耗来源初判", category: "emotion", target: "single" },
  { id: "career_planning", name: "职业规划", title: "你的职业方向初判", category: "career", target: "single" },
  { id: "relationship_review", name: "感情复盘测试", title: "你的感情复盘初判", category: "emotion", target: "single" }
];

const getMediaPlatformKey = (platform: string) => (platform === "快手" ? "kuaishou" : "juliang");

const defaultMediaAccounts: MediaAccount[] = [
  { id: "jl-jl1000", name: "巨量投放账号-1000", platform: "巨量", company: "上海星盘文化科技有限公司", createdAt: "2026-06-01 09:00" },
  { id: "ks-ks2000", name: "快手投放账号-2000", platform: "快手", company: "杭州灵感互动科技有限公司", createdAt: "2026-06-03 10:30" },
  { id: "jl-jl1001", name: "巨量投放账号-1001", platform: "巨量", company: "上海星盘文化科技有限公司", createdAt: "2026-06-04 09:00" }
];

const getOrderStatusLabel = (status: CalculationOrder["status"]) => {
  if (status === "paid") return { label: "已支付", className: "bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/35" };
  if (status === "pending") return { label: "待支付", className: "bg-amber-950/40 text-amber-300 border-amber-900/60" };
  if (status === "failed") return { label: "支付失败", className: "bg-red-950/40 text-red-300 border-red-900/60" };
  return { label: "已退款", className: "bg-slate-900 text-slate-400 border-slate-700" };
};

export default function AdminDashboard({
  tests,
  orders,
  onRefresh,
  onUpdateTest,
  onDeleteTest,
  slides,
  onUpdateSlides,
  shortcuts,
  onUpdateShortcuts,
  middleRecs,
  onUpdateMiddleRecs,
  homepageProducts,
  onUpdateHomepageProducts,
  conversionRecs,
  onUpdateConversionRecs,
  productSkus = [],
  onUpdateProductSkus
}: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("items");
  const [marketingTab, setMarketingTab] = useState<MarketingTab>("landing");
  const [landingNameFilter, setLandingNameFilter] = useState("");
  const [landingPlatformFilter, setLandingPlatformFilter] = useState<"all" | "巨量" | "快手">("all");
  const [landingSkuFilter, setLandingSkuFilter] = useState("all");
  const [landingCreatedDateFilter, setLandingCreatedDateFilter] = useState("");
  const [landingMediaAccountIdFilter, setLandingMediaAccountIdFilter] = useState("");
  const [landingMediaAccountNameFilter, setLandingMediaAccountNameFilter] = useState("");
  const [channelDateFilter, setChannelDateFilter] = useState("");
  const [channelLandingNameFilter, setChannelLandingNameFilter] = useState("");
  const [channelPlatformFilter, setChannelPlatformFilter] = useState<"all" | "巨量" | "快手">("all");
  const [channelAccountIdFilter, setChannelAccountIdFilter] = useState("");
  const [channelAccountNameFilter, setChannelAccountNameFilter] = useState("");
  const [channelDeductionFilter, setChannelDeductionFilter] = useState("");
  const [mediaAccountPlatformFilter, setMediaAccountPlatformFilter] = useState<"all" | "巨量" | "快手">("all");
  const [mediaAccountKeywordFilter, setMediaAccountKeywordFilter] = useState("");
  const [mediaAccounts, setMediaAccounts] = useState<MediaAccount[]>(defaultMediaAccounts);
  const [showMediaAccountModal, setShowMediaAccountModal] = useState(false);
  const [editingMediaAccountId, setEditingMediaAccountId] = useState<string | null>(null);
  const [mediaAccountIdInput, setMediaAccountIdInput] = useState("");
  const [mediaAccountNameInput, setMediaAccountNameInput] = useState("");
  const [mediaAccountPlatformInput, setMediaAccountPlatformInput] = useState<"巨量" | "快手">("巨量");
  const [mediaAccountCompanyInput, setMediaAccountCompanyInput] = useState("");
  const [copiedCampId, setCopiedCampId] = useState<string | null>(null);
  const [openFormulaKey, setOpenFormulaKey] = useState<string | null>(null);
  const [showLandingModal, setShowLandingModal] = useState(false);
  const [editingLandingId, setEditingLandingId] = useState<string | null>(null);
  const [landingFormName, setLandingFormName] = useState("");
  const [landingFormPlatform, setLandingFormPlatform] = useState<"巨量" | "快手">("巨量");
  const [landingFormMediaAccountId, setLandingFormMediaAccountId] = useState("");
  const [landingFormDeduction, setLandingFormDeduction] = useState("100");
  const [landingFormSkuId, setLandingFormSkuId] = useState("");
  const [landingFormHeroImage, setLandingFormHeroImage] = useState("");
  const [landingFormDetailBody, setLandingFormDetailBody] = useState("");
  const [landingFormDisclaimerText, setLandingFormDisclaimerText] = useState("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。");
  const [landingFormAdvertiserName, setLandingFormAdvertiserName] = useState("广州学诚网络科技有限公司");
  const [landingFormButtonText, setLandingFormButtonText] = useState("马上测试");
  const [landingFormButtonStyle, setLandingFormButtonStyle] = useState<"solid" | "outline" | "glow">("solid");
  const [landingFormThemeColor, setLandingFormThemeColor] = useState("#1D9E75");
  const [orderDateFilter, setOrderDateFilter] = useState("");
  const [orderNoFilter, setOrderNoFilter] = useState("");
  const [orderPhoneFilter, setOrderPhoneFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "paid" | "refunded" | "pending">("all");
  const [orderPaymentMethodFilter, setOrderPaymentMethodFilter] = useState<"all" | "wechat" | "alipay">("all");
  const orderDateInputRef = useRef<HTMLInputElement>(null);
  const [viewingOrderReport, setViewingOrderReport] = useState<CalculationOrder | null>(null);
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [refundOrderTarget, setRefundOrderTarget] = useState<CalculationOrder | null>(null);
  const [refundReasonInput, setRefundReasonInput] = useState("");
  const [itemTab, setItemTab] = useState<"templates" | "skus">("templates");
  const [operationTab, setOperationTab] = useState<"recommend" | "shortcut" | "conversion">("recommend");
  const [managingPromptTemplateId, setManagingPromptTemplateId] = useState<string | null>(null);
  const [promptAssociationIds, setPromptAssociationIds] = useState<string[]>([]);
  const [reportTemplateKeywordFilter, setReportTemplateKeywordFilter] = useState("");
  const [reportTemplateContentFilter, setReportTemplateContentFilter] = useState("all");
  const [customReportTemplates, setCustomReportTemplates] = useState<ReportTemplate[]>(() => {
    const saved = window.localStorage.getItem(REPORT_TEMPLATE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => typeof item?.id === "string" && typeof item?.name === "string" && typeof item?.content === "string")
            .map((item) => ({ id: item.id, name: item.name, content: item.content, linkedTemplates: [], isCustom: true }));
        }
      } catch (error) {}
    }
    return [];
  });
  const [disabledReportTemplateIds, setDisabledReportTemplateIds] = useState<string[]>(() => {
    const saved = window.localStorage.getItem(REPORT_TEMPLATE_DISABLED_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((id) => typeof id === "string");
      } catch (error) {}
    }
    return [];
  });
  const [showReportTemplateModal, setShowReportTemplateModal] = useState(false);
  const [editingReportTemplateId, setEditingReportTemplateId] = useState<string | null>(null);
  const [reportTemplateName, setReportTemplateName] = useState("");
  const [reportTemplateContent, setReportTemplateContent] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemFormStep, setItemFormStep] = useState<"basic" | "questions" | "details">("basic");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<TestItem["category"]>("mbti");
  const [itemAssessmentMode, setItemAssessmentMode] = useState<"quiz_score" | "profile_inference">("quiz_score");
  const [itemTarget, setItemTarget] = useState<"single" | "double">("single");
  const defaultProfileFields: NonNullable<TestItem["profileFields"]> = ["userName", "gender", "birthDate", "birthTime", "birthPlace", "question"];
  const defaultQuizProfileFields: NonNullable<TestItem["profileFields"]> = ["gender"];
  const [itemProfileFields, setItemProfileFields] = useState<NonNullable<TestItem["profileFields"]>>(defaultQuizProfileFields);
  const [itemQuestionBankIds, setItemQuestionBankIds] = useState<string[]>([]);
  const [itemQuestionSearch, setItemQuestionSearch] = useState("");
  const [itemPrice, setItemPrice] = useState("19.9");
  const [itemOriginalPrice, setItemOriginalPrice] = useState("99");
  const [itemDescription, setItemDescription] = useState("");
  const [itemHeroImage, setItemHeroImage] = useState("");
  const [itemDetailBody, setItemDetailBody] = useState("");
  const [itemDisclaimerText, setItemDisclaimerText] = useState("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。");
  const [itemButtonText, setItemButtonText] = useState("马上测试");
  const [itemThemeColor, setItemThemeColor] = useState("#f59e0b");
  const [itemPromptRefId, setItemPromptRefId] = useState("");
  const [itemFreeReportThemeId, setItemFreeReportThemeId] = useState("love_test");
  const [templateNameFilter, setTemplateNameFilter] = useState("");
  const [templateSkuFilter, setTemplateSkuFilter] = useState("all");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<"all" | TestItem["category"]>("all");
  const [templateCreatedDateFilter, setTemplateCreatedDateFilter] = useState("");
  const [openTemplateFilterSelect, setOpenTemplateFilterSelect] = useState<"sku" | "category" | null>(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
  const [productNameFilter, setProductNameFilter] = useState("");
  const [productTemplateFilter, setProductTemplateFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "已上架" | "已下架">("all");
  const [productPriceFilter, setProductPriceFilter] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productTemplateId, setProductTemplateId] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("19.9");
  const [productOriginalPrice, setProductOriginalPrice] = useState("99");
  const [productStatus, setProductStatus] = useState<"已上架" | "已下架">("已下架");
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionCategory, setQuestionCategory] = useState<TestItem["category"]>("mbti");
  const [questionSequence, setQuestionSequence] = useState("1");
  const [questionDimension, setQuestionDimension] = useState("E/I 维度");
  const [questionContent, setQuestionContent] = useState("");
  const [questionOptions, setQuestionOptions] = useState("选项A\n选项B");
  const [questionScores, setQuestionScores] = useState("A +2\nB +2");
  const [questionFilter, setQuestionFilter] = useState<"all" | TestItem["category"]>("all");
  const [questionKeywordFilter, setQuestionKeywordFilter] = useState("");
  const [operationNotice, setOperationNotice] = useState<string | null>(null);
  const [recommendNameFilter, setRecommendNameFilter] = useState("");
  const [recommendPositionFilter, setRecommendPositionFilter] = useState<"all" | "首页顶部" | "首页中部" | "商品列表">("all");
  const [recommendStatusFilter, setRecommendStatusFilter] = useState<"all" | "已上架" | "已下架">("all");
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [editingRecommendId, setEditingRecommendId] = useState<number | null>(null);
  const [recommendName, setRecommendName] = useState("");
  const [recommendPosition, setRecommendPosition] = useState<"首页顶部" | "首页中部" | "商品列表">("首页顶部");
  const [recommendSortOrder, setRecommendSortOrder] = useState("1");
  const [recommendTargetType, setRecommendTargetType] = useState<"product" | "link">("product");
  const [recommendTargetSkuId, setRecommendTargetSkuId] = useState("");
  const [recommendLinkUrl, setRecommendLinkUrl] = useState("");
  const [recommendImageUrl, setRecommendImageUrl] = useState("");
  const [recommendStatus, setRecommendStatus] = useState<"已上架" | "已下架">("已上架");
  const [shortcutNameFilter, setShortcutNameFilter] = useState("");
  const [shortcutStatusFilter, setShortcutStatusFilter] = useState<"all" | "已上架" | "已下架">("all");
  const [showShortcutModal, setShowShortcutModal] = useState(false);
  const [editingShortcutId, setEditingShortcutId] = useState<string | null>(null);
  const [shortcutLabel, setShortcutLabel] = useState("");
  const [shortcutSortOrder, setShortcutSortOrder] = useState("1");
  const [shortcutTargetType, setShortcutTargetType] = useState<"product" | "link">("product");
  const [shortcutTargetSkuId, setShortcutTargetSkuId] = useState("");
  const [shortcutLinkUrl, setShortcutLinkUrl] = useState("");
  const [shortcutIcon, setShortcutIcon] = useState("");
  const [shortcutStatus, setShortcutStatus] = useState<"已上架" | "已下架">("已上架");
  const [shortcutColorTheme, setShortcutColorTheme] = useState<ShortcutItem["colorTheme"]>("indigo");
  const [conversionNameFilter, setConversionNameFilter] = useState("");
  const [conversionStatusFilter, setConversionStatusFilter] = useState<"all" | "已上架" | "已下架">("all");
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [editingConversionId, setEditingConversionId] = useState<string | null>(null);
  const [conversionName, setConversionName] = useState("");
  const [conversionScene, setConversionScene] = useState<"prepay" | "paid">("prepay");
  const [conversionSortOrder, setConversionSortOrder] = useState("1");
  const [conversionTargetType, setConversionTargetType] = useState<"product" | "link">("product");
  const [conversionTargetSkuId, setConversionTargetSkuId] = useState("");
  const [conversionLinkUrl, setConversionLinkUrl] = useState("");
  const [conversionImageUrl, setConversionImageUrl] = useState("");
  const [conversionStatus, setConversionStatus] = useState<"已上架" | "已下架">("已上架");
  const [conversionStartAt, setConversionStartAt] = useState("2026-06-01T00:00");
  const [conversionEndAt, setConversionEndAt] = useState("2026-12-31T23:59");
  const [adminAlert, setAdminAlert] = useState<{ message: string; title?: string } | null>(null);
  const [adminConfirm, setAdminConfirm] = useState<{ message: string; title?: string; onConfirm: () => void | Promise<void> } | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const adminToastTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const getStatusLabel = (status?: "已上架" | "已下架") => (status === "已下架" ? "停用" : "启用");

  const categoryLabels: Record<TestItem["category"], string> = {
    mbti: "MBTI",
    sbti: "SBTI",
    emotion: "情绪测试",
    career: "职业测试",
    personality: "人格测试",
    astrology: "星座"
  };
  const questionCategoryOptions = ["mbti", "sbti", "emotion", "career", "personality", "astrology"] as const;
  const questionCategoryLabels: Record<(typeof questionCategoryOptions)[number], string> = {
    mbti: "MBTI",
    sbti: "SBTI",
    emotion: "情绪测试",
    career: "职业测试",
    personality: "人格测试",
    astrology: "星座"
  };
  const questionCategoryBadgeClasses: Record<(typeof questionCategoryOptions)[number], string> = {
    mbti: "border-violet-500/50 bg-violet-950/50 text-violet-200",
    sbti: "border-sky-500/50 bg-sky-950/45 text-sky-200",
    emotion: "border-pink-500/50 bg-pink-950/45 text-pink-200",
    career: "border-[#1D9E75]/50 bg-[#1D9E75]/15 text-[#9CE6CF]",
    personality: "border-amber-500/50 bg-[#1D9E75]/15 text-[#9CE6CF]",
    astrology: "border-indigo-500/50 bg-indigo-950/45 text-indigo-200"
  };
  const questionCategoryOrder = questionCategoryOptions.reduce<Record<string, number>>((map, category, index) => {
    map[category] = index;
    return map;
  }, {});
  const mbtiDimensionOptions = [
    { value: "E/I 维度", label: "E/I（外向/内向）", poles: ["E", "I"] },
    { value: "S/N 维度", label: "S/N（感知/直觉）", poles: ["S", "N"] },
    { value: "T/F 维度", label: "T/F（思考/情感）", poles: ["T", "F"] },
    { value: "J/P 维度", label: "J/P（判断/感知）", poles: ["J", "P"] }
  ];
  const independentCategoryDimensionOptions: Record<Exclude<(typeof questionCategoryOptions)[number], "mbti">, string[]> = {
    sbti: ["外向值", "内向值", "理性值", "感性值", "行动值"],
    emotion: ["焦虑值", "压力值", "愉悦值", "稳定值"],
    career: ["兴趣值", "能力值", "稳定值", "发展值"],
    personality: ["外向值", "敏感值", "理性值", "执行值", "稳定值"],
    astrology: ["太阳能量", "月亮能量", "上升能量", "关系能量", "行动建议"]
  };
  const questionOptionLabels = ["A", "B", "C", "D"];

  const showAdminAlert = (message: string, title = "提示") => {
    setAdminAlert({ message, title });
  };

  const showAdminToast = (message: string) => {
    setAdminToast(message);
    if (adminToastTimerRef.current) window.clearTimeout(adminToastTimerRef.current);
    adminToastTimerRef.current = window.setTimeout(() => {
      setAdminToast(null);
      adminToastTimerRef.current = null;
    }, 1800);
  };

  const showAdminConfirm = (message: string, onConfirm: () => void | Promise<void>, title = "确认操作") => {
    setAdminConfirm({ message, title, onConfirm });
  };

  useEffect(() => {
    window.localStorage.setItem(
      REPORT_TEMPLATE_STORAGE_KEY,
      JSON.stringify(customReportTemplates.map(({ id, name, content }) => ({ id, name, content })))
    );
  }, [customReportTemplates]);

  useEffect(() => {
    window.localStorage.setItem(REPORT_TEMPLATE_DISABLED_STORAGE_KEY, JSON.stringify(disabledReportTemplateIds));
  }, [disabledReportTemplateIds]);

  const promptTemplates = Array.from(
    tests.reduce<Map<string, ReportTemplate>>((map, test) => {
      const templateId = test.promptTemplateId || `tpl-${test.id}`;
      const existing = map.get(templateId);
      if (existing) {
        existing.linkedTemplates.push(test);
        return map;
      }
      map.set(templateId, {
        id: templateId,
        name: `${test.name}默认报告模板`,
        content: test.promptTemplate,
        linkedTemplates: [test]
      });
      return map;
    }, new Map(customReportTemplates.map((template) => [template.id, { ...template, linkedTemplates: [] }]))).values()
  );
  const toEightDigitId = (seed: string) => {
    if (/^\d{8}$/.test(seed)) return seed;
    if (/^\d+$/.test(seed)) return seed.length > 8 ? seed.slice(-8) : seed.padStart(8, "0");
    const hash = seed.split("").reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 90000000, 10000000);
    return String(hash).padStart(8, "0");
  };
  const generateEightDigitId = (existingIds: string[]) => {
    const existingIdSet = new Set(existingIds.flatMap((id) => [id, toEightDigitId(id)]));
    let nextId = "";
    do {
      nextId = String(Math.floor(10000000 + Math.random() * 90000000));
    } while (existingIdSet.has(nextId));
    return nextId;
  };
  const getPromptTemplateName = (test: TestItem) => {
    const templateId = test.promptTemplateId || `tpl-${test.id}`;
    return promptTemplates.find((template) => template.id === templateId)?.name || `${test.name}默认报告模板`;
  };
  const getDefaultFreeReportThemeId = (category: TestItem["category"]) => {
    if (category === "career") return "career_planning";
    if (category === "personality" || category === "mbti" || category === "sbti") return "personality_test";
    if (category === "astrology") return "annual_growth_test";
    return "love_test";
  };
  const getFreeReportThemeOption = (themeId: string) =>
    FREE_REPORT_THEME_OPTIONS.find((item) => item.id === themeId);
  const getFreeReportThemeTarget = (themeId: string) =>
    getFreeReportThemeOption(themeId)?.target || "single";
  const getFreeReportThemeLabel = (test: TestItem) => {
    const themeId = test.freeReportThemeId || getDefaultFreeReportThemeId(test.category);
    const theme = getFreeReportThemeOption(themeId);
    return theme ? `${theme.name}｜${theme.title}` : "未关联免费报告模板";
  };
  const getSkuById = (skuId?: string) => productSkus.find((sku) => sku.id === skuId);
  const getTestBySkuId = (skuId?: string) => {
    const sku = getSkuById(skuId);
    return sku ? tests.find((test) => test.id === sku.projectId) : undefined;
  };
  const getRecommendationTargetLabel = (item: BannerSlide) => {
    if (item.targetType === "link") return item.linkUrl || "-";
    const sku = getSkuById(item.targetSkuId);
    const test = sku ? tests.find((entry) => entry.id === sku.projectId) : tests.find((entry) => entry.id === item.testId);
    return sku?.name || test?.name || item.targetSkuId || item.testId || "-";
  };
  const getRecommendationImageLabel = (item: BannerSlide) => item.imageUrl ? "已上传" : "未上传";
  const recommendationPositionOrder: Record<string, number> = {
    首页顶部: 0,
    首页中部: 1,
    商品列表: 2
  };
  const recommendationIdSegments: Record<string, number> = {
    首页中部: 1000,
    商品列表: 2000,
    首页顶部: 3000
  };
  const recommendationPositionBadgeClasses: Record<string, string> = {
    首页顶部: "border-indigo-500/50 bg-indigo-950/45 text-indigo-200",
    首页中部: "border-rose-500/50 bg-rose-950/45 text-rose-200",
    商品列表: "border-amber-500/50 bg-[#1D9E75]/15 text-[#9CE6CF]"
  };
  const getRecommendationImageSpec = (position: BannerSlide["displayPosition"]) => {
    if (position === "首页中部") {
      return {
        label: "推荐尺寸 300 x 300 px，方形图；H5 首页中推卡片缩略图按 1:1 展示",
        frameClass: "mx-auto aspect-square min-h-[220px] max-w-[260px]"
      };
    }
    if (position === "商品列表") {
      return {
        label: "推荐尺寸 750 x 266 px，圆角横幅；适配竞品商品列表头图约 2.8:1",
        frameClass: "aspect-[750/266] min-h-[170px]"
      };
    }
    return {
      label: "推荐尺寸 750 x 316 px，圆角横幅；适配 H5 首页顶部轮播约 2.37:1",
      frameClass: "aspect-[750/316] min-h-[178px]"
    };
  };
  const getNextRecommendationSort = (position: BannerSlide["displayPosition"]) => {
    const values = (slides || [])
      .filter((item) => (item.displayPosition || "首页顶部") === position)
      .map((item) => Number(item.sortOrder || 0));
    return Math.max(0, ...values) + 1;
  };
  const generateRecommendationId = (position: "首页顶部" | "首页中部" | "商品列表") => {
    const segment = recommendationIdSegments[position];
    const existingIds = new Set((slides || []).map((item) => Number(item.id)));
    const segmentIds = [...existingIds].filter((id) => id >= segment && id < segment + 1000);
    let nextId = Math.max(segment, ...segmentIds) + 1;
    while (existingIds.has(nextId)) nextId += 1;
    return nextId;
  };
  const resetRecommendationForm = (position: "首页顶部" | "首页中部" | "商品列表" = "首页顶部") => {
    const defaultSku = productSkus.find((sku) => sku.status === "已上架") || productSkus[0];
    const defaultTest = defaultSku ? tests.find((test) => test.id === defaultSku.projectId) : tests[0];
    setEditingRecommendId(null);
    setRecommendName(defaultTest ? `${defaultTest.name}推荐` : "新增推荐位");
    setRecommendPosition(position);
    setRecommendSortOrder(String(getNextRecommendationSort(position)));
    setRecommendTargetType("product");
    setRecommendTargetSkuId(defaultSku?.id || (defaultTest ? `sku-${defaultTest.id}-standard` : ""));
    setRecommendLinkUrl("");
    setRecommendImageUrl("");
    setRecommendStatus("已上架");
  };
  const openCreateRecommendation = () => {
    const defaultPosition = recommendPositionFilter === "all" ? "首页顶部" : recommendPositionFilter;
    resetRecommendationForm(defaultPosition);
    setShowRecommendModal(true);
  };
  const openEditRecommendation = (item: BannerSlide) => {
    setEditingRecommendId(item.id);
    setRecommendName(item.name || item.title || "");
    setRecommendPosition((item.displayPosition === "首页中部" || item.displayPosition === "商品列表") ? item.displayPosition : "首页顶部");
    setRecommendSortOrder(String(item.sortOrder ?? 1));
    setRecommendTargetType(item.targetType === "link" ? "link" : "product");
    setRecommendTargetSkuId(item.targetSkuId || "");
    setRecommendLinkUrl(item.linkUrl || "");
    setRecommendImageUrl(item.imageUrl || "");
    setRecommendStatus(item.status || "已上架");
    setShowRecommendModal(true);
  };
  const getShortcutTargetLabel = (item: ShortcutItem) => {
    if (item.targetType === "link") return item.linkUrl || "-";
    const sku = getSkuById(item.targetSkuId);
    const test = sku ? tests.find((entry) => entry.id === sku.projectId) : tests.find((entry) => entry.id === item.testId);
    return sku?.name || test?.name || item.targetSkuId || item.testId || "-";
  };
  const getNextShortcutSort = () => Math.max(0, ...(shortcuts || []).map((item) => Number(item.sortOrder || 0))) + 1;
  const generateShortcutId = () => {
    const segment = 4000;
    const existingIds = new Set((shortcuts || []).map((item) => Number(item.id)));
    const segmentIds = [...existingIds].filter((id) => id >= segment && id < segment + 1000);
    let nextId = Math.max(segment, ...segmentIds) + 1;
    while (existingIds.has(nextId)) nextId += 1;
    return String(nextId);
  };
  const resetShortcutForm = () => {
    const defaultSku = productSkus.find((sku) => sku.status === "已上架") || productSkus[0];
    const defaultTest = defaultSku ? tests.find((test) => test.id === defaultSku.projectId) : tests[0];
    setEditingShortcutId(null);
    setShortcutLabel(defaultTest ? defaultTest.name.slice(0, 10) : "新增入口");
    setShortcutSortOrder(String(getNextShortcutSort()));
    setShortcutTargetType("product");
    setShortcutTargetSkuId(defaultSku?.id || (defaultTest ? `sku-${defaultTest.id}-standard` : ""));
    setShortcutLinkUrl("");
    setShortcutIcon(defaultTest?.icon || "Brain");
    setShortcutStatus("已上架");
    setShortcutColorTheme("indigo");
  };
  const openCreateShortcut = () => {
    resetShortcutForm();
    setShowShortcutModal(true);
  };
  const openEditShortcut = (item: ShortcutItem) => {
    setEditingShortcutId(item.id);
    setShortcutLabel(item.label);
    setShortcutSortOrder(String(item.sortOrder ?? 1));
    setShortcutTargetType(item.targetType === "link" ? "link" : "product");
    setShortcutTargetSkuId(item.targetSkuId || "");
    setShortcutLinkUrl(item.linkUrl || "");
    setShortcutIcon(item.icon || "Brain");
    setShortcutStatus(item.status || "已上架");
    setShortcutColorTheme(item.colorTheme);
    setShowShortcutModal(true);
  };
  const getConversionTargetLabel = (item: ConversionRecommendation) => {
    if (item.targetType === "link") return item.linkUrl || "-";
    const sku = getSkuById(item.targetSkuId);
    const test = sku ? tests.find((entry) => entry.id === sku.projectId) : tests.find((entry) => entry.id === item.targetTestId);
    return sku?.name || test?.name || item.targetSkuId || item.targetTestId || "-";
  };
  const getNextConversionSort = (scene: ConversionRecommendation["scene"]) => {
    const values = (conversionRecs || [])
      .filter((item) => item.scene === scene)
      .map((item) => Number(item.sortOrder || 0));
    return Math.max(0, ...values) + 1;
  };
  const getConversionIdSegment = (scene: ConversionRecommendation["scene"]) => scene === "prepay" ? 5000 : 6000;
  const generateConversionId = (scene: ConversionRecommendation["scene"]) => {
    const segment = getConversionIdSegment(scene);
    const existingIds = new Set((conversionRecs || []).map((item) => Number(item.id)));
    const segmentIds = [...existingIds].filter((id) => id >= segment && id < segment + 1000);
    let nextId = Math.max(segment, ...segmentIds) + 1;
    while (existingIds.has(nextId)) nextId += 1;
    return String(nextId);
  };
  const resetConversionForm = (scene: "prepay" | "paid" = "prepay") => {
    const defaultSku = productSkus.find((sku) => sku.status === "已上架") || productSkus[0];
    const defaultTest = defaultSku ? tests.find((test) => test.id === defaultSku.projectId) : tests[0];
    setEditingConversionId(null);
    setConversionName(defaultTest ? `${defaultTest.name}转化推荐` : "新增转化推荐");
    setConversionScene(scene);
    setConversionSortOrder(String(getNextConversionSort(scene)));
    setConversionTargetType("product");
    setConversionTargetSkuId(defaultSku?.id || (defaultTest ? `sku-${defaultTest.id}-standard` : ""));
    setConversionLinkUrl("");
    setConversionImageUrl("");
    setConversionStatus("已上架");
    setConversionStartAt("2026-06-01T00:00");
    setConversionEndAt("2026-12-31T23:59");
  };
  const openCreateConversion = () => {
    resetConversionForm("prepay");
    setShowConversionModal(true);
  };
  const openEditConversion = (item: ConversionRecommendation) => {
    setEditingConversionId(item.id);
    setConversionName(item.name || "");
    setConversionScene(item.scene);
    setConversionSortOrder(String(item.sortOrder ?? 1));
    setConversionTargetType(item.targetType);
    setConversionTargetSkuId(item.targetSkuId || "");
    setConversionLinkUrl(item.linkUrl || "");
    setConversionImageUrl(item.imageUrl || "");
    setConversionStatus(item.status || "已上架");
    setConversionStartAt(item.startAt || "");
    setConversionEndAt(item.endAt || "");
    setShowConversionModal(true);
  };
  const applyRichTextCommand = (command: string) => {
    document.execCommand(command);
  };

  const categoryHasQuestionEntry = (_category: TestItem["category"]) => true;
  const getCategoryAssessmentMode = (category: TestItem["category"]): "quiz_score" | "profile_inference" =>
    category === "astrology" ? "profile_inference" : "quiz_score";
  const getResolvedItemAssessmentMode = () => itemCategory === "astrology" ? itemAssessmentMode : getCategoryAssessmentMode(itemCategory);

  const profileFieldLabels: Record<NonNullable<TestItem["profileFields"]>[number], string> = {
    userName: "姓名",
    gender: "性别",
    birthDate: "生日",
    birthTime: "生辰",
    birthPlace: "出生地点",
    question: "用户问题"
  };

  const [questionBankRows, setQuestionBankRows] = useState<QuestionBankItem[]>([
    { id: "q-mbti-01", category: "mbti", sequence: 1, dimension: "E/I 维度", question: "聚会后你通常如何恢复能量？", options: ["独处整理", "继续社交", "看情况"], scores: ["I +2", "E +2", "I +1"], linkedCount: 3 },
    { id: "q-mbti-02", category: "mbti", sequence: 2, dimension: "S/N 维度", question: "你更信任事实细节还是可能性图景？", options: ["事实细节", "可能性", "二者结合"], scores: ["S +2", "N +2", "N +1"], linkedCount: 2 },
    { id: "q-mbti-03", category: "mbti", sequence: 3, dimension: "T/F 维度", question: "做重要决定时你更看重什么？", options: ["逻辑利弊", "人际感受", "先听建议"], scores: ["T +2", "F +2", "F +1"], linkedCount: 0 },
    { id: "q-mbti-04", category: "mbti", sequence: 4, dimension: "J/P 维度", question: "面对临时变化的计划，你通常会？", options: ["重排流程", "顺势调整", "先观察"], scores: ["J +2", "P +2", "P +1"], linkedCount: 0 },
    { id: "q-sbti-01", category: "sbti", sequence: 1, dimension: "外向值 / 内向值 / 理性值 / 感性值 / 行动值", question: "遇到新机会时，你第一反应更接近？", options: ["立刻尝试", "先做评估", "询问他人"], scores: ["行动值 +2", "理性值 +2", "外向值 +1"], linkedCount: 0 },
    { id: "q-sbti-02", category: "sbti", sequence: 2, dimension: "外向值 / 内向值 / 理性值 / 感性值 / 行动值", question: "长时间独处后，你通常会？", options: ["感到恢复", "想找人聊聊", "开始制定计划"], scores: ["内向值 +2", "外向值 +2", "理性值 +1"], linkedCount: 0 },
    { id: "q-sbti-03", category: "sbti", sequence: 3, dimension: "外向值 / 内向值 / 理性值 / 感性值 / 行动值", question: "被别人误解时，你更倾向于？", options: ["解释事实", "表达感受", "暂时沉默"], scores: ["理性值 +2", "感性值 +2", "内向值 +1"], linkedCount: 0 },
    { id: "q-sbti-04", category: "sbti", sequence: 4, dimension: "外向值 / 内向值 / 理性值 / 感性值 / 行动值", question: "推进一个目标时，你最依赖什么？", options: ["执行节奏", "灵感状态", "外部反馈"], scores: ["行动值 +2", "感性值 +1", "外向值 +2"], linkedCount: 0 },
    { id: "q-emotion-01", category: "emotion", sequence: 1, dimension: "焦虑值 / 压力值 / 愉悦值 / 稳定值", question: "亲密关系里对方回复慢时，你的第一反应是？", options: ["焦虑", "理解", "回避"], scores: ["焦虑值 +2", "稳定值 +2", "压力值 +2"], linkedCount: 2 },
    { id: "q-emotion-02", category: "emotion", sequence: 2, dimension: "焦虑值 / 压力值 / 愉悦值 / 稳定值", question: "压力堆积时，你更常出现哪种状态？", options: ["反复担心", "情绪麻木", "主动放松"], scores: ["焦虑值 +2", "压力值 +2", "愉悦值 +2"], linkedCount: 0 },
    { id: "q-emotion-03", category: "emotion", sequence: 3, dimension: "焦虑值 / 压力值 / 愉悦值 / 稳定值", question: "遇到冲突后，你通常多久能平复？", options: ["很久", "一会儿", "很快"], scores: ["压力值 +2", "稳定值 +1", "稳定值 +2"], linkedCount: 0 },
    { id: "q-emotion-04", category: "emotion", sequence: 4, dimension: "焦虑值 / 压力值 / 愉悦值 / 稳定值", question: "你最近感到开心的频率更接近？", options: ["很少", "偶尔", "经常"], scores: ["压力值 +2", "愉悦值 +1", "愉悦值 +2"], linkedCount: 0 },
    { id: "q-career-01", category: "career", sequence: 1, dimension: "兴趣值 / 能力值 / 稳定值 / 发展值", question: "面对高压任务时你更倾向于？", options: ["拆解步骤", "找人协作", "边做边探索"], scores: ["能力值 +2", "稳定值 +2", "发展值 +1"], linkedCount: 1 },
    { id: "q-career-02", category: "career", sequence: 2, dimension: "兴趣值 / 能力值 / 稳定值 / 发展值", question: "选择工作机会时，你最看重？", options: ["成长空间", "收入稳定", "兴趣匹配"], scores: ["发展值 +2", "稳定值 +2", "兴趣值 +2"], linkedCount: 0 },
    { id: "q-career-03", category: "career", sequence: 3, dimension: "兴趣值 / 能力值 / 稳定值 / 发展值", question: "遇到不会的任务时，你通常会？", options: ["查资料学习", "请教同事", "先试试看"], scores: ["能力值 +2", "稳定值 +1", "发展值 +2"], linkedCount: 0 },
    { id: "q-career-04", category: "career", sequence: 4, dimension: "兴趣值 / 能力值 / 稳定值 / 发展值", question: "长期职业规划里，你更希望获得？", options: ["专业壁垒", "稳定节奏", "更多可能"], scores: ["能力值 +2", "稳定值 +2", "发展值 +2"], linkedCount: 0 },
    { id: "q-personality-01", category: "personality", sequence: 1, dimension: "外向值 / 敏感值 / 理性值 / 执行值 / 稳定值", question: "进入陌生环境时，你通常会？", options: ["主动破冰", "先观察", "保持礼貌距离"], scores: ["外向值 +2", "敏感值 +2", "稳定值 +1"], linkedCount: 0 },
    { id: "q-personality-02", category: "personality", sequence: 2, dimension: "外向值 / 敏感值 / 理性值 / 执行值 / 稳定值", question: "计划被打断时，你最明显的反应是？", options: ["快速重排", "情绪受影响", "无所谓"], scores: ["执行值 +2", "敏感值 +2", "稳定值 +2"], linkedCount: 0 },
    { id: "q-personality-03", category: "personality", sequence: 3, dimension: "外向值 / 敏感值 / 理性值 / 执行值 / 稳定值", question: "面对复杂问题，你通常先做什么？", options: ["拆分变量", "凭感觉判断", "马上行动"], scores: ["理性值 +2", "敏感值 +1", "执行值 +2"], linkedCount: 0 },
    { id: "q-personality-04", category: "personality", sequence: 4, dimension: "外向值 / 敏感值 / 理性值 / 执行值 / 稳定值", question: "别人评价你时，最常出现哪个关键词？", options: ["靠谱", "细腻", "有主见"], scores: ["稳定值 +2", "敏感值 +2", "理性值 +2"], linkedCount: 0 },
    { id: "q-astrology-01", category: "astrology", sequence: 1, dimension: "太阳能量 / 月亮能量 / 上升能量 / 关系能量 / 行动建议", question: "你最近最想从星盘里确认哪类主题？", options: ["自我定位", "关系走向", "事业节奏"], scores: ["太阳能量 +2", "关系能量 +2", "行动建议 +2"], linkedCount: 0 },
    { id: "q-astrology-02", category: "astrology", sequence: 2, dimension: "太阳能量 / 月亮能量 / 上升能量 / 关系能量 / 行动建议", question: "面对重要变化时，你更常出现哪种反应？", options: ["主动推进", "情绪波动", "观察环境"], scores: ["太阳能量 +2", "月亮能量 +2", "上升能量 +2"], linkedCount: 0 },
    { id: "q-astrology-03", category: "astrology", sequence: 3, dimension: "太阳能量 / 月亮能量 / 上升能量 / 关系能量 / 行动建议", question: "你希望报告给你的建议更偏向？", options: ["性格洞察", "关系提醒", "行动规划"], scores: ["上升能量 +2", "关系能量 +2", "行动建议 +2"], linkedCount: 0 }
  ]);

  const getProductSku = (skuId?: string, projectId?: string) =>
    productSkus.find((sku) => sku.id === skuId) ||
    productSkus.find((sku) => sku.projectId === projectId) ||
    productSkus[0];

  const getProjectSkus = (projectId: string) => productSkus.filter((sku) => sku.projectId === projectId);
  const filteredProductSkus = [...productSkus]
    .filter((sku) => {
      const keyword = productNameFilter.trim().toLowerCase();
      const matchesName = !keyword || sku.name.toLowerCase().includes(keyword) || sku.id.includes(keyword);
      const matchesTemplate = productTemplateFilter === "all" || sku.projectId === productTemplateFilter;
      const matchesStatus = productStatusFilter === "all" || sku.status === productStatusFilter;
      const matchesPrice = !productPriceFilter.trim() || String(sku.price).includes(productPriceFilter.trim());
      return matchesName && matchesTemplate && matchesStatus && matchesPrice;
    })
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const getQuestionLinkedTemplates = (questionId: string) => tests.filter((test) => test.questionBankIds?.includes(questionId));
  const getQuestionLinkedCount = (questionId: string) => getQuestionLinkedTemplates(questionId).length;
  const getIndependentDimensionOptions = (category: TestItem["category"]) =>
    category !== "mbti" && category in independentCategoryDimensionOptions
      ? independentCategoryDimensionOptions[category as Exclude<(typeof questionCategoryOptions)[number], "mbti">]
      : [];
  const getDefaultQuestionDimension = (category: TestItem["category"]) =>
    category === "mbti" ? mbtiDimensionOptions[0].value : getIndependentDimensionOptions(category)[0] || "独立维度";
  const getDefaultQuestionScores = (category: TestItem["category"]) => {
    if (category === "mbti") return "E +2\nI +2";
    const dimensions = getIndependentDimensionOptions(category);
    return `${dimensions[0] || "维度A"} +2\n${dimensions[1] || dimensions[0] || "维度B"} +2`;
  };
  const getNextQuestionSequence = (category: TestItem["category"], ignoredQuestionId?: string) =>
    Math.max(
      0,
      ...questionBankRows
        .filter((item) => item.category === category && item.id !== ignoredQuestionId)
        .map((item) => item.sequence)
    ) + 1;
  const getQuestionFormRows = () => {
    const options = questionOptions.split("\n");
    const scores = questionScores.split("\n");
    const rowCount = Math.min(4, Math.max(2, options.length, scores.length));
    return Array.from({ length: rowCount }, (_, index) => ({
      option: options[index] || "",
      score: scores[index] || ""
    }));
  };
  const getSelectedMbtiDimension = () => mbtiDimensionOptions.find((item) => item.value === questionDimension) || mbtiDimensionOptions[0];
  const parseScoreParts = (score: string) => {
    const trimmed = score.trim();
    const match = trimmed.match(/^(.+?)\s*([+-]?\d+)$/);
    return {
      dimensionOrPole: match?.[1]?.trim() || "",
      scoreValue: match?.[2]?.replace(/^\+/, "") || ""
    };
  };
  const formatQuestionOptionForList = (item: QuestionBankItem, option: string, index: number) => {
    const score = item.scores[index] || "";
    const scoreParts = parseScoreParts(score);
    if (!scoreParts.dimensionOrPole || !scoreParts.scoreValue) return `${option}（${score || "未设分"}）`;
    const scoreText = `${scoreParts.dimensionOrPole} +${scoreParts.scoreValue}`;
    const attribution = item.category === "mbti" ? `${item.dimension.replace(" 维度", "")}: ${scoreText}` : scoreText;
    return `${option}（${attribution}）`;
  };
  const buildQuestionScore = (dimensionOrPole: string, scoreValue: string) => {
    const numericValue = scoreValue.trim().replace(/^\+/, "");
    return `${dimensionOrPole.trim()} +${numericValue || "1"}`;
  };
  const updateQuestionOptionRow = (index: number, field: "option" | "score" | "dimensionOrPole" | "scoreValue", value: string) => {
    const rows = getQuestionFormRows();
    if (field === "option" || field === "score") {
      rows[index] = { ...rows[index], [field]: value };
    } else {
      const scoreParts = parseScoreParts(rows[index].score);
      const nextParts = { ...scoreParts, [field]: value };
      rows[index] = { ...rows[index], score: buildQuestionScore(nextParts.dimensionOrPole, nextParts.scoreValue) };
    }
    setQuestionOptions(rows.map((row) => row.option).join("\n"));
    setQuestionScores(rows.map((row) => row.score).join("\n"));
  };
  const addQuestionOptionRow = () => {
    const rows = getQuestionFormRows();
    if (rows.length >= 4) {
      showAdminAlert("选项数量最多4个。");
      return;
    }
    setQuestionOptions([...rows.map((row) => row.option), ""].join("\n"));
    const independentDimensions = getIndependentDimensionOptions(questionCategory);
    setQuestionScores([...rows.map((row) => row.score), questionCategory === "mbti" ? `${getSelectedMbtiDimension().poles[0]} +1` : `${independentDimensions[0] || "维度"} +1`].join("\n"));
  };
  const removeQuestionOptionRow = (index: number) => {
    const rows = getQuestionFormRows();
    if (rows.length <= 2) {
      showAdminAlert("至少保留2个选项。");
      return;
    }
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setQuestionOptions(nextRows.map((row) => row.option).join("\n"));
    setQuestionScores(nextRows.map((row) => row.score).join("\n"));
  };

  const questionKeyword = questionKeywordFilter.trim().toLowerCase();
  const filteredQuestionBankRows = questionBankRows
    .map((item) => ({
      ...item,
      linkedCount: getQuestionLinkedCount(item.id)
    }))
    .filter((item) => questionFilter === "all" || item.category === questionFilter)
    .filter((item) => {
      if (!questionKeyword) return true;
      return [
        item.id,
        categoryLabels[item.category],
        String(item.sequence),
        item.dimension,
        item.question,
        ...item.options,
        ...item.scores
      ].some((value) => value.toLowerCase().includes(questionKeyword));
    })
    .sort((a, b) => {
      if (questionFilter !== "all") return a.sequence - b.sequence;
      return (questionCategoryOrder[a.category] ?? 99) - (questionCategoryOrder[b.category] ?? 99) || a.sequence - b.sequence;
    });

  const currentCategoryQuestionBankRows = [...questionBankRows]
    .filter((item) => item.category === itemCategory)
    .sort((a, b) => a.sequence - b.sequence);
  const itemQuestionSearchKeyword = itemQuestionSearch.trim().toLowerCase();
  const selectableQuestionBankRows = currentCategoryQuestionBankRows.filter((item) => {
    if (!itemQuestionSearchKeyword) return true;
    return [
      String(item.sequence),
      item.id,
      item.dimension,
      item.question,
      ...item.options,
      ...item.scores
    ].some((value) => value.toLowerCase().includes(itemQuestionSearchKeyword));
  });
  const selectableQuestionIds = selectableQuestionBankRows.map((item) => item.id);
  const allSelectableQuestionsSelected = selectableQuestionIds.length > 0 && selectableQuestionIds.every((id) => itemQuestionBankIds.includes(id));
  const toggleAllSelectableQuestions = (checked: boolean) => {
    setItemQuestionBankIds((prev) => {
      if (!checked) return prev.filter((id) => !selectableQuestionIds.includes(id));
      return Array.from(new Set([...prev, ...selectableQuestionIds]));
    });
  };
  const itemFormSteps = [
    { key: "basic" as const, label: "基本信息" },
    ...(getResolvedItemAssessmentMode() === "quiz_score" ? [{ key: "questions" as const, label: "选择题目" }] : []),
    { key: "details" as const, label: "详情页配置" }
  ];
  const getNextItemFormStep = () => {
    if (itemFormStep === "basic") return getResolvedItemAssessmentMode() === "quiz_score" ? "questions" : "details";
    if (itemFormStep === "questions") return "details";
    return "details";
  };
  const getPrevItemFormStep = () => {
    if (itemFormStep === "details") return getResolvedItemAssessmentMode() === "quiz_score" ? "questions" : "basic";
    if (itemFormStep === "questions") return "basic";
    return "basic";
  };
  const validateBasicItemStep = () => {
    const resolvedMode = getResolvedItemAssessmentMode();
    if (!itemName.trim()) {
      showAdminToast("请输入测算内容模板名称");
      return false;
    }
    if (itemName.trim().length > 30) {
      showAdminToast("模板名称字数不能超过30个字");
      return false;
    }
    if (itemProfileFields.length === 0) {
      showAdminAlert("内容模板需至少选择1个前置资料字段。");
      return false;
    }
    return true;
  };
  const validateQuestionsItemStep = () => {
    if (getResolvedItemAssessmentMode() === "quiz_score" && itemQuestionBankIds.length === 0) {
      showAdminAlert("题库计分型内容模板需至少选择1道对应分类题目。");
      return false;
    }
    return true;
  };
  const goNextItemFormStep = () => {
    if (itemFormStep === "basic" && !validateBasicItemStep()) return;
    if (itemFormStep === "questions" && !validateQuestionsItemStep()) return;
    setItemFormStep(getNextItemFormStep());
  };
  const openQuestionBankFromItemModal = () => {
    setShowItemModal(false);
    setQuestionFilter(itemCategory);
    setActiveMenu("questionBank");
  };

  const openCreateReportTemplate = () => {
    setEditingReportTemplateId(null);
    setReportTemplateName("");
    setReportTemplateContent("");
    setShowReportTemplateModal(true);
  };

  const openEditReportTemplate = (template: ReportTemplate) => {
    setEditingReportTemplateId(template.id);
    setReportTemplateName(template.name);
    setReportTemplateContent(template.content);
    setShowReportTemplateModal(true);
  };

  const toggleReportTemplateStatus = (templateId: string) => {
    setDisabledReportTemplateIds((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId]
    );
  };

  const copyReportTemplate = async (template: ReportTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      showAdminToast("报告话术已复制");
    } catch (error) {
      showAdminAlert("复制失败，请手动复制报告话术。");
    }
  };

  const deleteReportTemplate = (template: ReportTemplate) => {
    const hasCustomTemplate = customReportTemplates.some((item) => item.id === template.id);
    if (!hasCustomTemplate) {
      showAdminAlert("系统默认报告模板不支持删除，可通过停用控制状态。");
      return;
    }
    showAdminConfirm(
      `确认删除「${template.name}」吗？已关联内容模板会恢复到各自默认报告模板。`,
      () => {
        setCustomReportTemplates((current) => current.filter((item) => item.id !== template.id));
        setDisabledReportTemplateIds((current) => current.filter((id) => id !== template.id));
        tests
          .filter((test) => (test.promptTemplateId || `tpl-${test.id}`) === template.id)
          .forEach((test) => onUpdateTest({ ...test, promptSourceTestId: undefined, promptTemplateId: `tpl-${test.id}` }));
      },
      "删除报告模板"
    );
  };

  const saveReportTemplate = () => {
    const name = reportTemplateName.trim();
    const content = reportTemplateContent.trim();
    if (!name) {
      showAdminToast("请输入模板名称");
      return;
    }
    if (name.length > 30) {
      showAdminToast("模板名称字数不能超过30个字");
      return;
    }
    if (!content) {
      showAdminToast("请输入提示词正文");
      return;
    }
    const id = editingReportTemplateId || `tpl-report-${Date.now().toString(36)}`;
    setCustomReportTemplates((current) => {
      const nextTemplate = { id, name, content, linkedTemplates: [], isCustom: true };
      return current.some((item) => item.id === id)
        ? current.map((item) => item.id === id ? nextTemplate : item)
        : [nextTemplate, ...current];
    });
    setShowReportTemplateModal(false);
    setEditingReportTemplateId(null);
    showAdminToast(editingReportTemplateId ? "报告模板已更新" : "报告模板已新增");
  };

  const openManagePromptAssociations = (templateId: string) => {
    const template = promptTemplates.find((item) => item.id === templateId);
    setManagingPromptTemplateId(templateId);
    setPromptAssociationIds(template?.linkedTemplates.map((item) => item.id) || []);
  };

  const filteredReportTemplates = promptTemplates.filter((template) => {
    const keyword = reportTemplateKeywordFilter.trim().toLowerCase();
    const matchesKeyword = !keyword
      || template.id.toLowerCase().includes(keyword)
      || template.name.toLowerCase().includes(keyword)
      || template.content.toLowerCase().includes(keyword)
      || template.linkedTemplates.some((item) => item.name.toLowerCase().includes(keyword));
    const matchesContent = reportTemplateContentFilter === "all"
      || template.linkedTemplates.some((item) => item.id === reportTemplateContentFilter);
    return matchesKeyword && matchesContent;
  });

  const togglePromptAssociation = (templateId: string) => {
    setPromptAssociationIds((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId]
    );
  };

  const savePromptAssociations = () => {
    const template = promptTemplates.find((item) => item.id === managingPromptTemplateId);
    if (!template) return;
    const selectedIds = new Set(promptAssociationIds);
    tests.forEach((test) => {
      const currentTemplateId = test.promptTemplateId || `tpl-${test.id}`;
      const shouldUseTemplate = selectedIds.has(test.id);
      const isCurrentlyLinked = currentTemplateId === template.id;
      if (shouldUseTemplate && !isCurrentlyLinked) {
        onUpdateTest({
          ...test,
          promptSourceTestId: template.id,
          promptTemplateId: template.id,
          promptTemplate: template.content
        });
      }
      if (!shouldUseTemplate && isCurrentlyLinked) {
        onUpdateTest({
          ...test,
          promptSourceTestId: undefined,
          promptTemplateId: `tpl-${test.id}`
        });
      }
    });
    setManagingPromptTemplateId(null);
    showAdminToast("关联内容模板已更新");
  };

  const filteredContentTemplates = [...tests]
    .filter((test) => {
      const keyword = templateNameFilter.trim().toLowerCase();
      const linkedSkus = getProjectSkus(test.id);
      const matchesName = !keyword || test.name.toLowerCase().includes(keyword) || test.id.toLowerCase().includes(keyword);
      const matchesSku = templateSkuFilter === "all" || linkedSkus.some((sku) => sku.id === templateSkuFilter);
      const matchesCategory = templateCategoryFilter === "all" || test.category === templateCategoryFilter;
      const matchesCreatedDate = !templateCreatedDateFilter || test.createdAt === templateCreatedDateFilter;
      return matchesName && matchesSku && matchesCategory && matchesCreatedDate;
    })
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const showOperationNotice = (message: string) => {
    setOperationNotice(message);
    window.setTimeout(() => setOperationNotice(null), 1800);
  };

  const openCreateItem = () => {
    setEditingItemId(null);
    setItemFormStep("basic");
    setItemName("");
    setItemCategory("mbti");
    setItemAssessmentMode("quiz_score");
    setItemTarget("single");
    setItemProfileFields(defaultQuizProfileFields);
    setItemQuestionBankIds([]);
    setItemQuestionSearch("");
    setItemPrice("19.9");
    setItemOriginalPrice("99");
    setItemDescription("");
    setItemHeroImage("");
    setItemDetailBody("");
    setItemDisclaimerText("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。");
    setItemButtonText("马上测试");
    setItemThemeColor("#f59e0b");
    setItemPromptRefId(promptTemplates[0]?.id || "");
    setItemFreeReportThemeId(getDefaultFreeReportThemeId("mbti"));
    setShowItemModal(true);
  };

  const openEditItem = (test: TestItem) => {
    setEditingItemId(test.id);
    setItemFormStep("basic");
    setItemName(test.name);
    setItemCategory(test.category);
    setItemAssessmentMode(test.assessmentMode || getCategoryAssessmentMode(test.category));
    const nextFreeReportThemeId = test.freeReportThemeId || getDefaultFreeReportThemeId(test.category);
    setItemTarget(test.assessmentTarget === "double" || getFreeReportThemeTarget(nextFreeReportThemeId) === "double" ? "double" : "single");
    const nextAssessmentMode = test.assessmentMode || getCategoryAssessmentMode(test.category);
    const nextProfileFields = test.profileFields || (nextAssessmentMode === "profile_inference" ? defaultProfileFields : defaultQuizProfileFields);
    setItemProfileFields(test.category === "astrology" && nextAssessmentMode === "profile_inference" && !nextProfileFields.includes("birthPlace") ? [...nextProfileFields, "birthPlace"] : nextProfileFields);
    setItemQuestionBankIds(
      test.questionBankIds?.length
        ? test.questionBankIds
        : (test.assessmentMode || getCategoryAssessmentMode(test.category)) === "quiz_score"
          ? questionBankRows.filter((item) => item.category === test.category).map((item) => item.id)
          : []
    );
    setItemQuestionSearch("");
    setItemPrice(String(test.price));
    setItemOriginalPrice(String(test.originalPrice));
    setItemDescription(test.description);
    setItemHeroImage(test.detailHeroImage || "");
    setItemDetailBody(test.detailBody || "");
    setItemDisclaimerText(test.detailDisclaimerText || "测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。");
    setItemButtonText(test.detailButtonText || "马上测试");
    setItemThemeColor(test.detailThemeColor || "#f59e0b");
    setItemPromptRefId(test.promptTemplateId || `tpl-${test.id}`);
    setItemFreeReportThemeId(nextFreeReportThemeId);
    setShowItemModal(true);
  };

  const saveItem = () => {
    const resolvedMode = getResolvedItemAssessmentMode();
    if (!itemName.trim()) {
      showAdminToast("请输入测算内容模板名称");
      return;
    }
    if (itemName.trim().length > 30) {
      showAdminToast("模板名称字数不能超过30个字");
      return;
    }
    if (resolvedMode === "quiz_score" && itemQuestionBankIds.length === 0) {
      showAdminAlert("题库计分型内容模板需至少选择1道对应分类题目。");
      return;
    }
    if (itemProfileFields.length === 0) {
      showAdminAlert("内容模板需至少选择1个前置资料字段。");
      return;
    }
    if (!itemDisclaimerText.trim()) {
      showAdminAlert("请输入免责声明。");
      return;
    }
    if (!FREE_REPORT_THEME_OPTIONS.some((theme) => theme.id === itemFreeReportThemeId)) {
      showAdminAlert("请选择免费报告模板。");
      return;
    }
    const existing = tests.find((test) => test.id === editingItemId);
    const safeId = editingItemId || generateEightDigitId(tests.map((test) => test.id));
    const referencedPrompt = promptTemplates.find((template) => template.id === itemPromptRefId);
    const promptTemplate = referencedPrompt?.content || existing?.promptTemplate || "请基于用户资料生成一份结构化测算报告。";
    const nextItem: TestItem = {
      id: safeId,
      name: itemName.trim(),
      category: itemCategory,
      assessmentMode: resolvedMode,
      assessmentTarget: itemTarget,
      profileFields: itemProfileFields,
      description: itemDescription.trim() || existing?.description || "后台新增测算商品。",
      detailHeroImage: itemHeroImage.trim(),
      detailBody: itemDetailBody.trim(),
      detailDisclaimerText: itemDisclaimerText.trim() || "测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。",
      detailButtonText: itemButtonText.trim() || "马上测试",
      detailThemeColor: itemThemeColor,
      price: Number(itemPrice) || existing?.price || 19.9,
      originalPrice: Number(itemOriginalPrice) || existing?.originalPrice || 99,
      icon: existing?.icon || "Sparkles",
      tag: existing?.tag || "新品",
      tagColor: existing?.tagColor || "amber",
      isActive: existing?.isActive ?? true,
      questionBankIds: resolvedMode === "quiz_score" ? itemQuestionBankIds : [],
      freeReportThemeId: itemFreeReportThemeId,
      promptSourceTestId: referencedPrompt?.id,
      promptTemplateId: referencedPrompt?.id || `tpl-${safeId}`,
      promptTemplate,
      calculateCount: existing?.calculateCount || 0,
      successRate: existing?.successRate || 99,
      createdAt: existing?.createdAt || new Date().toISOString().slice(0, 10)
    };
    onUpdateTest(nextItem);
    setShowItemModal(false);
  };

  const deleteContentTemplate = (test: TestItem) => {
    const linkedSkus = getProjectSkus(test.id);
    const activeLinkedSkus = linkedSkus.filter((sku) => sku.status === "已上架");
    if (activeLinkedSkus.length > 0) {
      showAdminAlert(`该内容模板仍有关联商品处于已上架状态，请先下架全部商品后再删除。\n当前已上架商品：${activeLinkedSkus.map((sku) => sku.name).join("、")}`);
      return;
    }
    showAdminConfirm(
      `确认删除「${test.name}」吗？删除需要二次确认，关联商品展示也会失去内容来源。`,
      () => onDeleteTest?.(test.id),
      "删除内容模板"
    );
  };

  const openCreateProduct = () => {
    setEditingProductId(null);
    setProductTemplateId("");
    setProductName("");
    setProductPrice("19.9");
    setProductOriginalPrice("");
    setProductStatus("已下架");
    setShowProductModal(true);
  };

  const openEditProduct = (sku: ProductSku) => {
    setEditingProductId(sku.id);
    setProductTemplateId(sku.projectId);
    setProductName(sku.name);
    setProductPrice(String(sku.price));
    setProductOriginalPrice(sku.originalPrice === undefined ? "" : String(sku.originalPrice));
    setProductStatus(sku.status);
    setShowProductModal(true);
  };

  const toggleProductStatus = (skuId: string) => {
    onUpdateProductSkus?.(productSkus.map((sku) => sku.id === skuId ? { ...sku, status: sku.status === "已上架" ? "已下架" : "已上架" } : sku));
  };

  const saveProduct = () => {
    const template = tests.find((test) => test.id === productTemplateId);
    if (!template) {
      showAdminAlert("新增商品必须选择关联内容模板。");
      return;
    }
    if (!productName.trim()) {
      showAdminAlert("请输入商品名称。");
      return;
    }
    if (productName.trim().length > 30) {
      showAdminAlert("商品名称字数不能超过30个字。");
      return;
    }
    if (productPrice.trim() === "" || Number(productPrice) < 0) {
      showAdminAlert("请输入有效售价，售价为0时表示免费。");
      return;
    }
    const nextProduct: ProductSku = {
      id: editingProductId || generateEightDigitId(productSkus.map((sku) => sku.id)),
      name: productName.trim(),
      projectId: template.id,
      projectName: template.name,
      price: Number(productPrice),
      originalPrice: productOriginalPrice.trim() === "" ? undefined : Number(productOriginalPrice),
      status: productStatus,
      createdAt: productSkus.find((sku) => sku.id === editingProductId)?.createdAt || new Date().toISOString().slice(0, 10)
    };
    onUpdateProductSkus?.(editingProductId ? productSkus.map((sku) => sku.id === editingProductId ? nextProduct : sku) : [nextProduct, ...productSkus]);
    setShowProductModal(false);
  };

  const openCreateQuestion = () => {
    const defaultCategory = questionFilter !== "all" && categoryHasQuestionEntry(questionFilter) ? questionFilter : "mbti";
    setEditingQuestionId(null);
    setQuestionCategory(defaultCategory);
    setQuestionSequence(String(getNextQuestionSequence(defaultCategory)));
    setQuestionDimension(getDefaultQuestionDimension(defaultCategory));
    setQuestionContent("");
    setQuestionOptions("选项A\n选项B");
    setQuestionScores(getDefaultQuestionScores(defaultCategory));
    setShowQuestionModal(true);
  };

  const openEditQuestion = (item: QuestionBankItem) => {
    const allowedDimensions = getIndependentDimensionOptions(item.category);
    const normalizedScores = item.category === "mbti"
      ? item.scores
      : item.scores.map((score, index) => {
          const scoreParts = parseScoreParts(score);
          const fallbackDimension = allowedDimensions[index % Math.max(1, allowedDimensions.length)] || "独立维度";
          return buildQuestionScore(
            allowedDimensions.includes(scoreParts.dimensionOrPole) ? scoreParts.dimensionOrPole : fallbackDimension,
            scoreParts.scoreValue || "1"
          );
        });
    setEditingQuestionId(item.id);
    setQuestionCategory(item.category);
    setQuestionSequence(String(item.sequence));
    setQuestionDimension(item.dimension);
    setQuestionContent(item.question);
    setQuestionOptions(item.options.join("\n"));
    setQuestionScores(normalizedScores.join("\n"));
    setShowQuestionModal(true);
  };

  const saveQuestion = () => {
    const existingQuestion = questionBankRows.find((item) => item.id === editingQuestionId);
    const resolvedCategory = existingQuestion?.category || questionCategory;
    const sequence = Number(questionSequence);
    const formRows = getQuestionFormRows();
    const options = formRows.map((item) => item.option.trim());
    const scores = formRows.map((item) => item.score.trim());
    const selectedMbtiDimension = mbtiDimensionOptions.find((item) => item.value === questionDimension);

    if (!categoryHasQuestionEntry(resolvedCategory)) {
        showAdminAlert("题库题目只能归属于 MBTI、SBTI、情绪测试、职业测试、人格测试。");
      return;
    }
    if (!Number.isInteger(sequence) || sequence < 1) {
      showAdminAlert("题目序号必须为大于0的整数。");
      return;
    }
    if (questionBankRows.some((item) => item.category === resolvedCategory && item.id !== editingQuestionId && item.sequence === sequence)) {
      showAdminAlert("同一分类下题目序号不能重复，请调整序号。");
      return;
    }
    if (!questionContent.trim()) {
      showAdminAlert("请输入题目内容。");
      return;
    }
    if (questionContent.trim().length > 100) {
      showAdminAlert("题目内容不能超过100字。");
      return;
    }
    if (options.length < 2 || options.length > 4) {
      showAdminAlert("选项数量需为2-4个。");
      return;
    }
    if (options.some((option) => !option)) {
      showAdminAlert("每个选项内容都必须填写。");
      return;
    }
    if (scores.length !== options.length || scores.some((score) => !score.trim())) {
      showAdminAlert("每个选项都必须填写对应维度/极性和得分。");
      return;
    }
    if (resolvedCategory === "mbti") {
      if (!selectedMbtiDimension) {
        showAdminAlert("MBTI 题目必须先选择 E/I、S/N、T/F、J/P 中的一个计分维度。");
        return;
      }
      const allowedPoles = selectedMbtiDimension.poles;
      const invalidScore = scores.find((score) => {
        const match = score.match(/^([A-Z])\s*\+?(\d+)$/i);
        return !match || !allowedPoles.includes(match[1].toUpperCase()) || Number(match[2]) < 1;
      });
      if (invalidScore) {
        showAdminAlert(`MBTI 每个选项需选择「${allowedPoles[0]}」或「${allowedPoles[1]}」，并填写正整数得分。`);
        return;
      }
    } else {
      const allowedDimensions = getIndependentDimensionOptions(resolvedCategory);
      const invalidScore = scores.find((score) => {
        const scoreParts = parseScoreParts(score);
        return !allowedDimensions.includes(scoreParts.dimensionOrPole) || !/^\d+$/.test(scoreParts.scoreValue) || Number(scoreParts.scoreValue) < 1;
      });
      if (invalidScore) {
        showAdminAlert("SBTI、情绪测试、职业测试、人格测试的每个选项都必须选择当前分类的独立维度，并填写正整数得分。");
        return;
      }
    }
    const savedDimension = resolvedCategory === "mbti" ? questionDimension.trim() : getIndependentDimensionOptions(resolvedCategory).join(" / ");
    const nextQuestion: QuestionBankItem = {
      id: editingQuestionId || `q-${Date.now()}`,
      category: resolvedCategory,
      sequence,
      dimension: savedDimension || "通用维度",
      question: questionContent.trim(),
      options,
      scores,
      linkedCount: getQuestionLinkedCount(editingQuestionId || "")
    };
    setQuestionBankRows((prev) =>
      editingQuestionId
        ? prev.map((item) => (item.id === editingQuestionId ? nextQuestion : item))
        : [nextQuestion, ...prev]
    );
    setShowQuestionModal(false);
  };

  const deleteQuestion = (id: string) => {
    const linkedTemplates = tests.filter((test) => test.questionBankIds?.includes(id));
    if (linkedTemplates.length > 0) {
      showAdminAlert(`该题目已被内容模板关联，不允许删除。\n关联模板：${linkedTemplates.map((template) => template.name).join("、")}`);
      return;
    }
    showAdminConfirm(
      "确认删除该题目吗？删除需要二次确认。",
      () => setQuestionBankRows((prev) => prev.filter((item) => item.id !== id)),
      "删除题目"
    );
  };

  const createSlide = () => {
    openCreateRecommendation();
  };

  const saveRecommendation = () => {
    if (!onUpdateSlides || !slides) return;
    const resolvedName = recommendName.trim();
    const sortOrder = Number(recommendSortOrder);
    if (!resolvedName) {
      showAdminAlert("请输入推荐名称");
      return;
    }
    if (resolvedName.length > 30) {
      showAdminAlert("推荐名称不能超过30个字");
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 1) {
      showAdminAlert("排序必须是大于0的整数");
      return;
    }
    const isDuplicateSort = slides.some((item) =>
      item.id !== editingRecommendId &&
      (item.displayPosition || "首页顶部") === recommendPosition &&
      Number(item.sortOrder || 0) === sortOrder
    );
    if (isDuplicateSort) {
      showAdminAlert("同一展示位置下排序序号不能重复");
      return;
    }
    if (recommendTargetType === "link" && !recommendLinkUrl.trim()) {
      showAdminAlert("请输入链接地址");
      return;
    }
    if (recommendTargetType === "product" && !recommendTargetSkuId) {
      showAdminAlert("请选择关联商品");
      return;
    }
    const selectedSku = getSkuById(recommendTargetSkuId);
    const selectedTest = selectedSku ? tests.find((test) => test.id === selectedSku.projectId) : tests[0];
    const existing = slides.find((item) => item.id === editingRecommendId);
    const nextId = existing && (existing.displayPosition || "首页顶部") === recommendPosition
      ? existing.id
      : generateRecommendationId(recommendPosition);
    const nextItem: BannerSlide = {
      ...(existing || {
        id: nextId,
        tag1: "推荐",
        tag2: "新品",
        subtitle: "金盾级隐私保护 • 匿名测评",
        buttonText: "立即测评",
        bgGradient: "from-amber-950 via-slate-950 to-[#292524]",
        textGlow: "text-[#1D9E75]"
      }),
      id: nextId,
      name: resolvedName,
      displayPosition: recommendPosition,
      targetType: recommendTargetType,
      targetSkuId: recommendTargetType === "product" ? recommendTargetSkuId : undefined,
      linkUrl: recommendTargetType === "link" ? recommendLinkUrl.trim() : "",
      imageUrl: recommendImageUrl,
      sortOrder,
      status: recommendStatus,
      title: resolvedName,
      description: selectedTest?.description || existing?.description || "点击查看测算详情",
      testId: selectedSku?.projectId || selectedTest?.id || existing?.testId || "",
      tag2: recommendPosition,
    };
    const nextSlides = editingRecommendId
      ? slides.map((item) => item.id === editingRecommendId ? nextItem : item)
      : [...slides, nextItem];
    onUpdateSlides(nextSlides);
    setShowRecommendModal(false);
    showOperationNotice(editingRecommendId ? "已更新推荐位" : "已新增推荐位");
  };

  const handleRecommendationImageUpload = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showAdminAlert("推荐位图仅支持 jpg/png");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAdminAlert("推荐位图大小不能超过5M");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setRecommendImageUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const updateSlideStatus = (item: BannerSlide) => {
    if (!onUpdateSlides || !slides) return;
    onUpdateSlides(slides.map((slide) => slide.id === item.id ? { ...slide, status: item.status === "已下架" ? "已上架" : "已下架" } : slide));
  };

  const deleteSlide = (id: number) => {
    if (!onUpdateSlides || !slides) return;
    const item = slides.find((slide) => slide.id === id);
    if ((item?.status || "已上架") !== "已下架") {
      showAdminAlert("需下架推荐位后才允许删除");
      return;
    }
    showAdminConfirm(
      "确认删除该推荐位吗？",
      () => onUpdateSlides(slides.filter((item) => item.id !== id)),
      "删除推荐位"
    );
  };

  const createShortcut = () => {
    openCreateShortcut();
  };

  const saveShortcut = () => {
    if (!onUpdateShortcuts || !shortcuts) return;
    const label = shortcutLabel.trim();
    const sortOrder = Number(shortcutSortOrder);
    if (!label) {
      showAdminAlert("请输入入口名称");
      return;
    }
    if (label.length > 10) {
      showAdminAlert("金刚区名称不能超过10个字");
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 1) {
      showAdminAlert("排序必须是大于0的整数");
      return;
    }
    const isDuplicateSort = shortcuts.some((item) => item.id !== editingShortcutId && Number(item.sortOrder || 0) === sortOrder);
    if (isDuplicateSort) {
      showAdminAlert("金刚区排序序号不能重复");
      return;
    }
    if (shortcutTargetType === "link" && !shortcutLinkUrl.trim()) {
      showAdminAlert("请输入链接地址");
      return;
    }
    if (shortcutTargetType === "product" && !shortcutTargetSkuId) {
      showAdminAlert("请选择关联商品");
      return;
    }
    const selectedSku = getSkuById(shortcutTargetSkuId);
    const selectedTest = selectedSku ? tests.find((test) => test.id === selectedSku.projectId) : tests[0];
    const existing = shortcuts.find((item) => item.id === editingShortcutId);
    const nextItem: ShortcutItem = {
      id: editingShortcutId || generateShortcutId(),
      testId: selectedSku?.projectId || selectedTest?.id || existing?.testId || "",
      targetType: shortcutTargetType,
      targetSkuId: shortcutTargetType === "product" ? shortcutTargetSkuId : undefined,
      linkUrl: shortcutTargetType === "link" ? shortcutLinkUrl.trim() : "",
      label,
      icon: shortcutIcon || selectedTest?.icon || "Brain",
      status: shortcutStatus,
      colorTheme: shortcutColorTheme,
      sortOrder
    };
    onUpdateShortcuts(editingShortcutId ? shortcuts.map((item) => item.id === editingShortcutId ? nextItem : item) : [...shortcuts, nextItem]);
    setShowShortcutModal(false);
    showOperationNotice(editingShortcutId ? "已更新金刚区入口" : "已新增金刚区入口");
  };

  const handleShortcutIconUpload = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showAdminAlert("金刚区入口图仅支持 jpg/png");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAdminAlert("金刚区入口图大小不能超过5M");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setShortcutIcon(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const deleteShortcut = (id: string) => {
    if (!onUpdateShortcuts || !shortcuts) return;
    const item = shortcuts.find((entry) => entry.id === id);
    if ((item?.status || "已上架") !== "已下架") {
      showAdminAlert("需下架金刚区入口后才允许删除");
      return;
    }
    showAdminConfirm(
      "确认删除该金刚区入口吗？",
      () => onUpdateShortcuts(shortcuts.filter((item) => item.id !== id)),
      "删除金刚区入口"
    );
  };

  const updateShortcutStatus = (item: ShortcutItem) => {
    if (!onUpdateShortcuts || !shortcuts) return;
    onUpdateShortcuts(shortcuts.map((entry) => entry.id === item.id ? { ...entry, status: (item.status || "已上架") === "已下架" ? "已上架" : "已下架" } : entry));
  };

  const createMiddleRec = () => {
    if (!onUpdateMiddleRecs || !middleRecs || !tests[0]) return;
    onUpdateMiddleRecs([
      ...middleRecs,
      {
        id: `mid-${Date.now()}`,
        testId: tests[0].id,
        title: "新增中部推荐",
        description: tests[0].description,
        tagText: "推荐",
        theme: "amber",
        sortOrder: middleRecs.length + 1
      }
    ]);
    showOperationNotice("已新增中部推荐");
  };

  const deleteMiddleRec = (id: string) => {
    if (!onUpdateMiddleRecs || !middleRecs) return;
    onUpdateMiddleRecs(middleRecs.filter((item) => item.id !== id));
  };

  const createHomepageProduct = () => {
    if (!onUpdateHomepageProducts || !homepageProducts || !tests[0]) return;
    onUpdateHomepageProducts([
      ...homepageProducts,
      {
        id: `hp-${Date.now()}`,
        testId: tests[0].id,
        targetType: "product",
        targetSkuId: `sku-${tests[0].id}-standard`,
        name: tests[0].name,
        description: tests[0].description,
        icon: tests[0].icon,
        badgeText: tests[0].tag,
        originalPrice: tests[0].originalPrice,
        price: tests[0].price,
        sortOrder: homepageProducts.length + 1
      }
    ]);
    showOperationNotice("已新增商品展示入口");
  };

  const deleteHomepageProduct = (id: string) => {
    if (!onUpdateHomepageProducts || !homepageProducts) return;
    onUpdateHomepageProducts(homepageProducts.filter((item) => item.id !== id));
  };

  const createConversionRec = () => {
    openCreateConversion();
  };

  const saveConversion = () => {
    if (!onUpdateConversionRecs || !conversionRecs) return;
    const name = conversionName.trim();
    const sortOrder = Number(conversionSortOrder);
    if (!name) {
      showAdminAlert("请输入推荐名称");
      return;
    }
    if (name.length > 30) {
      showAdminAlert("推荐名称不能超过30个字");
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 1) {
      showAdminAlert("排序必须是大于0的整数");
      return;
    }
    const isDuplicateSort = conversionRecs.some((item) =>
      item.id !== editingConversionId &&
      item.scene === conversionScene &&
      Number(item.sortOrder || 0) === sortOrder
    );
    if (isDuplicateSort) {
      showAdminAlert("同一展示场景下排序序号不能重复");
      return;
    }
    if (conversionTargetType === "link" && !conversionLinkUrl.trim()) {
      showAdminAlert("请输入链接地址");
      return;
    }
    if (conversionTargetType === "product" && !conversionTargetSkuId) {
      showAdminAlert("请选择关联商品");
      return;
    }
    if (!conversionStartAt || !conversionEndAt) {
      showAdminAlert("请选择展示开始和结束时间");
      return;
    }
    if (new Date(conversionStartAt).getTime() > new Date(conversionEndAt).getTime()) {
      showAdminAlert("展示开始时间不能晚于结束时间");
      return;
    }
    const selectedSku = getSkuById(conversionTargetSkuId);
    const selectedTest = selectedSku ? tests.find((test) => test.id === selectedSku.projectId) : tests[0];
    const existing = conversionRecs.find((item) => item.id === editingConversionId);
    const nextId = existing && existing.scene === conversionScene
      ? existing.id
      : generateConversionId(conversionScene);
    const nextItem: ConversionRecommendation = {
      id: nextId,
      name,
      scene: conversionScene,
      targetType: conversionTargetType,
      targetTestId: selectedSku?.projectId || selectedTest?.id || "",
      targetSkuId: conversionTargetType === "product" ? conversionTargetSkuId : undefined,
      linkUrl: conversionTargetType === "link" ? conversionLinkUrl.trim() : "",
      imageUrl: conversionImageUrl,
      sortOrder,
      status: conversionStatus,
      startAt: conversionStartAt,
      endAt: conversionEndAt
    };
    onUpdateConversionRecs(editingConversionId ? conversionRecs.map((item) => item.id === editingConversionId ? nextItem : item) : [...conversionRecs, nextItem]);
    setShowConversionModal(false);
    showOperationNotice(editingConversionId ? "已更新转化推荐" : "已新增转化推荐");
  };

  const handleConversionImageUpload = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showAdminAlert("展示图仅支持 jpg/png");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAdminAlert("展示图大小不能超过5M");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setConversionImageUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const deleteConversionRec = (id: string) => {
    if (!onUpdateConversionRecs || !conversionRecs) return;
    const item = conversionRecs.find((entry) => entry.id === id);
    if ((item?.status || "已上架") !== "已下架") {
      showAdminAlert("需下架转化推荐位后才允许删除");
      return;
    }
    showAdminConfirm(
      "确认删除该转化推荐位吗？",
      () => onUpdateConversionRecs(conversionRecs.filter((item) => item.id !== id)),
      "删除转化推荐位"
    );
  };

  const updateConversionStatus = (item: ConversionRecommendation) => {
    if (!onUpdateConversionRecs || !conversionRecs) return;
    onUpdateConversionRecs(conversionRecs.map((entry) => entry.id === item.id ? { ...entry, status: (item.status || "已上架") === "已下架" ? "已上架" : "已下架" } : entry));
  };

  const defaultCampaigns: MarketingCampaign[] = [
    {
      id: "JL1000",
      name: "抖音星盘双人配对高热转化渠道",
      mediaAccountId: "jl-jl1000",
      skuId: "sku-relationship-attachment-standard",
      skuName: "亲密关系：成人依恋类型与恋爱盲区测试 标准售卖SKU",
      testId: "relationship-attachment",
      testName: "亲密关系：成人依恋类型与恋爱盲区测试",
      platform: "巨量",
      price: 29.9,
      deductionPercent: 100,
      linkUrl: `${window.location.origin}/?media=juliang&channel=JL1000&landing=JL1000&testId=relationship-attachment&disclaimer=${encodeURIComponent("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。")}&advertiser=${encodeURIComponent("广州学诚网络科技有限公司")}`,
      subtitle: "亲密关系里的真实依恋线索",
      detailBody: "从互动模式、情绪反应与安全感需求三个维度，生成你的亲密关系洞察。",
      disclaimerText: "测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。",
      advertiserName: "广州学诚网络科技有限公司",
      buttonText: "马上测试",
      buttonStyle: "solid",
      themeColor: "#1D9E75",
      status: "enabled",
      createdAt: "2026-06-01 10:25",
      views: 1250,
      requests: 1250,
      pays: 62,
      adSpend: 1280,
      reportViews: 45
    },
    {
      id: "KS2000",
      name: "快手MBTI拟人物语爆款曝光",
      mediaAccountId: "ks-ks2000",
      skuId: "sku-mbti-animal-standard",
      skuName: "假如MBTI有拟人：你的灵魂是哪种小动物/打工人？ 标准售卖SKU",
      testId: "mbti-animal",
      testName: "假如MBTI有拟人：你的灵魂是哪种小动物/打工人？",
      platform: "快手",
      price: 9.9,
      deductionPercent: 80,
      linkUrl: `${window.location.origin}/?media=kuaishou&channel=KS2000&landing=KS2000&testId=mbti-animal&disclaimer=${encodeURIComponent("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。")}&advertiser=${encodeURIComponent("广州学诚网络科技有限公司")}`,
      subtitle: "把 MBTI 变成更容易传播的人设标签",
      detailBody: "用轻量题目生成拟人化人格画像，适合短视频曝光与裂变转化。",
      disclaimerText: "测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。",
      advertiserName: "广州学诚网络科技有限公司",
      buttonText: "马上测试",
      buttonStyle: "glow",
      themeColor: "#22c55e",
      status: "enabled",
      createdAt: "2026-06-03 14:10",
      views: 3420,
      requests: 3420,
      pays: 114,
      adSpend: 2360,
      reportViews: 90
    },
    {
      id: "JL1001",
      name: "微信高阶运势精准裂变2组",
      mediaAccountId: "jl-jl1001",
      skuId: "sku-astrology-sun-moon-standard",
      skuName: "三主星深度星盘报告（太阳/月亮/上升） 标准售卖SKU",
      testId: "astrology-sun-moon",
      testName: "三主星深度星盘报告（太阳/月亮/上升）",
      platform: "巨量",
      price: 29.9,
      deductionPercent: 65,
      linkUrl: `${window.location.origin}/?media=juliang&channel=JL1001&landing=JL1001&testId=astrology-sun-moon&disclaimer=${encodeURIComponent("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。")}&advertiser=${encodeURIComponent("广州学诚网络科技有限公司")}`,
      subtitle: "太阳、月亮、上升的完整星盘线索",
      detailBody: "从三主星组合解读近期状态、情绪底色与长期发展主题。",
      disclaimerText: "测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。",
      advertiserName: "广州学诚网络科技有限公司",
      buttonText: "查看报告",
      buttonStyle: "outline",
      themeColor: "#8b5cf6",
      status: "disabled",
      createdAt: "2026-06-04 09:30",
      views: 580,
      requests: 580,
      pays: 8,
      adSpend: 430,
      reportViews: 6
    }
  ];

  const normalizeLandingIds = (items: MarketingCampaign[]) => {
    let juliangIndex = 1000;
    let kuaishouIndex = 2000;
    return items.map((item) => {
      if (/^(JL|KS)\d+$/i.test(item.id)) return item;
      const nextId = item.platform === "快手" ? `KS${kuaishouIndex++}` : `JL${juliangIndex++}`;
      const sku = getProductSku(item.skuId, item.testId);
      return {
        ...item,
        id: nextId,
        linkUrl: `${window.location.origin}/?media=${getMediaPlatformKey(item.platform)}&channel=${nextId}&landing=${nextId}&skuId=${sku?.id || ""}&testId=${sku?.projectId || item.testId || ""}`
      };
    });
  };

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => normalizeLandingIds(defaultCampaigns));
  const getMediaAccount = (accountId?: string, platform?: string) =>
    mediaAccounts.find((account) => account.id === accountId)
    || mediaAccounts.find((account) => account.platform === platform)
    || null;

  const landingPlatformOptions = Array.from(new Set([...mediaAccounts.map((account) => account.platform), ...campaigns.map((camp) => camp.platform)].filter(Boolean))) as string[];
  const filteredCampaigns = campaigns.filter((camp) => {
    const keyword = landingNameFilter.trim().toLowerCase();
    const accountIdKeyword = landingMediaAccountIdFilter.trim().toLowerCase();
    const accountNameKeyword = landingMediaAccountNameFilter.trim().toLowerCase();
    const sku = getProductSku(camp.skuId, camp.testId);
    const mediaAccount = getMediaAccount(camp.mediaAccountId, camp.platform);
    const matchesName = !keyword || camp.name.toLowerCase().includes(keyword);
    const matchesPlatform = landingPlatformFilter === "all" || camp.platform === landingPlatformFilter;
    const matchesSku = landingSkuFilter === "all" || sku?.id === landingSkuFilter || camp.skuId === landingSkuFilter;
    const matchesCreatedDate = !landingCreatedDateFilter || camp.createdAt.startsWith(landingCreatedDateFilter);
    const matchesAccountId = !accountIdKeyword || (mediaAccount?.id || "").toLowerCase().includes(accountIdKeyword);
    const matchesAccountName = !accountNameKeyword || (mediaAccount?.name || "").toLowerCase().includes(accountNameKeyword);
    return matchesName && matchesPlatform && matchesSku && matchesCreatedDate && matchesAccountId && matchesAccountName;
  });
  const filteredMediaAccounts = mediaAccounts.filter((account) => {
    const keyword = mediaAccountKeywordFilter.trim().toLowerCase();
    const matchesPlatform = mediaAccountPlatformFilter === "all" || account.platform === mediaAccountPlatformFilter;
    const matchesKeyword = !keyword || account.id.toLowerCase().includes(keyword) || account.name.toLowerCase().includes(keyword);
    return matchesPlatform && matchesKeyword;
  });
  const getOrderPaymentMethodValue = (order: CalculationOrder): "wechat" | "alipay" =>
    order.paymentMethod || (Number(order.id.replace(/\D/g, "")) % 2 === 0 ? "alipay" : "wechat");

  const getOrderAccount = (order: CalculationOrder) => ({
    userId: order.userId || `u-guest-${String(Math.abs(order.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0))).padStart(5, "0")}`,
    userNickname: order.userNickname || (order.userName ? `访客-${order.userName}` : "匿名访客")
  });

  const getOrderRelatedCampaigns = (order: CalculationOrder) =>
    campaigns.filter((camp) => camp.testId === order.testId || camp.testName === order.testName);

  const getOrderRelatedSkuIds = (order: CalculationOrder) => {
    const ids = new Set<string>();
    productSkus.forEach((sku) => {
      if (sku.projectId === order.testId || sku.projectName === order.testName) ids.add(sku.id);
    });
    getOrderRelatedCampaigns(order).forEach((camp) => {
      if (camp.skuId) ids.add(camp.skuId);
    });
    return ids;
  };

  const getOrderGenderLabel = (gender?: CalculationOrder["gender"]) => {
    if (gender === "male") return "男";
    if (gender === "female") return "女";
    return "其他";
  };

  const formatOrderDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (part: number) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatProfileDateTime = (date?: string, time?: string) => {
    if (!date) return "免填公历生日";
    return `${date} ${time || "具体时辰未知"}`;
  };

  const formatPartnerProfileDateTime = (date?: string, time?: string) => {
    if (!date) return "未填写";
    return `${date} ${time || "具体时辰未知"}`;
  };

  const hasPartnerProfile = (order: CalculationOrder) => Boolean(order.partnerName || order.partnerBirthDate || order.partnerBirthTime);

  const canViewOrderReport = (order: CalculationOrder) => (order.status === "paid" || order.status === "refunded") && Boolean(order.resultReport);

  const handleRefundOrder = async (order: CalculationOrder) => {
    if (order.status !== "paid") return;
    setRefundReasonInput("");
    setRefundOrderTarget(order);
  };

  const submitRefundOrder = async () => {
    if (!refundOrderTarget || refundOrderTarget.status !== "paid") return;
    const reason = refundReasonInput.trim();
    if (!reason) {
      showAdminAlert("请填写退款原因。");
      return;
    }

    setRefundingOrderId(refundOrderTarget.id);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(refundOrderTarget.id)}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundReason: reason })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        showAdminAlert(data.error || "退款提交失败，请稍后重试");
        return;
      }
      setRefundOrderTarget(null);
      setRefundReasonInput("");
      onRefresh();
      showAdminAlert("退款已提交支付平台并处理成功，订单状态已更新为已退款。");
    } catch (error) {
      console.error("退款处理失败:", error);
      showAdminAlert("退款提交失败，请检查支付平台接口状态。");
    } finally {
      setRefundingOrderId(null);
    }
  };

  const openOrderDatePicker = () => {
    const input = orderDateInputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // Some browsers only allow the native picker from direct input interaction.
    }
  };

  const filteredOrders = orders.filter((order) => {
    const paymentMethod = getOrderPaymentMethodValue(order);
    const normalizedPhoneFilter = orderPhoneFilter.replace(/\D/g, "");
    const normalizedOrderPhone = (order.phone || "").replace(/\D/g, "");
    const matchesDate = !orderDateFilter || order.createdAt.startsWith(orderDateFilter);
    const matchesOrderNo = !orderNoFilter.trim() || order.id.toLowerCase().includes(orderNoFilter.trim().toLowerCase());
    const matchesPhone = !normalizedPhoneFilter || normalizedOrderPhone.includes(normalizedPhoneFilter);
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    const matchesPaymentMethod = orderPaymentMethodFilter === "all" || paymentMethod === orderPaymentMethodFilter;

    return matchesDate && matchesOrderNo && matchesPhone && matchesStatus && matchesPaymentMethod;
  }).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const copyLandingLink = async (camp: MarketingCampaign) => {
    try {
      await navigator.clipboard.writeText(camp.linkUrl);
      setCopiedCampId(camp.id);
      setTimeout(() => setCopiedCampId(null), 1400);
    } catch {
      showAdminAlert(`请手动复制落地页链接：${camp.linkUrl}`);
    }
  };

  const getLandingSkuDetail = (skuId?: string) => {
    const sku = getProductSku(skuId);
    const test = sku ? tests.find((item) => item.id === sku.projectId) : undefined;
    return { sku, test };
  };

  const buildLandingLink = (platform: string, id: string, sku?: ProductSku, testId?: string, disclaimerText?: string, advertiserName?: string) => {
    const params = new URLSearchParams({
      media: getMediaPlatformKey(platform),
      channel: id,
      landing: id,
      skuId: sku?.id || "",
      testId: sku?.projectId || testId || ""
    });
    if (disclaimerText?.trim()) params.set("disclaimer", disclaimerText.trim());
    if (advertiserName?.trim()) params.set("advertiser", advertiserName.trim());
    return `${window.location.origin}/?${params.toString()}`;
  };

  const generateLandingId = (platform: "巨量" | "快手") => {
    const prefix = platform === "快手" ? "KS" : "JL";
    const base = platform === "快手" ? 2000 : 1000;
    const usedNumbers = campaigns
      .map((camp) => {
        const match = camp.id.match(new RegExp(`^${prefix}(\\d+)$`, "i"));
        return match ? Number(match[1]) : null;
      })
      .filter((value): value is number => Number.isFinite(value));
    const existingIds = new Set(campaigns.map((camp) => camp.id.toUpperCase()));
    let nextNumber = Math.max(base - 1, ...usedNumbers) + 1;
    let nextId = `${prefix}${nextNumber}`;
    while (existingIds.has(nextId.toUpperCase())) {
      nextNumber += 1;
      nextId = `${prefix}${nextNumber}`;
    }
    return nextId;
  };

  const resetLandingForm = (skuId?: string) => {
    const defaultSku = getProductSku(skuId);
    const defaultTest = defaultSku ? tests.find((test) => test.id === defaultSku.projectId) : tests[0];
    const defaultAccount = mediaAccounts.find((account) => account.platform === "巨量");
    setEditingLandingId(null);
    setLandingFormName(defaultTest ? `${defaultTest.name.slice(0, 20)}投放页` : "新增落地页");
    setLandingFormPlatform("巨量");
    setLandingFormMediaAccountId(defaultAccount?.id || "");
    setLandingFormDeduction("100");
    setLandingFormSkuId(defaultSku?.id || "");
    setLandingFormHeroImage(defaultTest?.detailHeroImage || "");
    setLandingFormDetailBody(defaultTest?.detailBody || defaultTest?.description || "");
    setLandingFormDisclaimerText("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。");
    setLandingFormAdvertiserName("广州学诚网络科技有限公司");
    setLandingFormButtonText(defaultTest?.detailButtonText || "马上测试");
    setLandingFormButtonStyle("solid");
    setLandingFormThemeColor(defaultTest?.detailThemeColor || "#1D9E75");
  };

  const openCreateLanding = () => {
    resetLandingForm();
    setShowLandingModal(true);
  };

  const openEditLanding = (camp: MarketingCampaign) => {
    const { sku, test } = getLandingSkuDetail(camp.skuId);
    setEditingLandingId(camp.id);
    setLandingFormName(camp.name);
    setLandingFormPlatform(camp.platform === "快手" ? "快手" : "巨量");
    setLandingFormMediaAccountId(camp.mediaAccountId || getMediaAccount(undefined, camp.platform)?.id || "");
    setLandingFormDeduction(String(camp.deductionPercent));
    setLandingFormSkuId(sku?.id || camp.skuId || "");
    setLandingFormHeroImage(camp.heroImage || test?.detailHeroImage || "");
    setLandingFormDetailBody(camp.detailBody || test?.detailBody || test?.description || "");
    setLandingFormDisclaimerText(camp.disclaimerText || "测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。");
    setLandingFormAdvertiserName(camp.advertiserName || "广州学诚网络科技有限公司");
    setLandingFormButtonText(camp.buttonText || test?.detailButtonText || "马上测试");
    setLandingFormButtonStyle(camp.buttonStyle || "solid");
    setLandingFormThemeColor(camp.themeColor || test?.detailThemeColor || "#1D9E75");
    setShowLandingModal(true);
  };

  const handleLandingPlatformChange = (platform: "巨量" | "快手") => {
    setLandingFormPlatform(platform);
    const currentAccount = getMediaAccount(landingFormMediaAccountId);
    if (!currentAccount || currentAccount.platform !== platform) {
      setLandingFormMediaAccountId(mediaAccounts.find((account) => account.platform === platform)?.id || "");
    }
  };

  const handleLandingSkuChange = (skuId: string) => {
    const sku = getProductSku(skuId);
    const test = sku ? tests.find((item) => item.id === sku.projectId) : undefined;
    setLandingFormSkuId(skuId);
    if (!editingLandingId) {
      setLandingFormName(test ? `${test.name.slice(0, 20)}投放页` : landingFormName);
    }
    if (test) {
      setLandingFormHeroImage(test.detailHeroImage || "");
      setLandingFormDetailBody(test.detailBody || test.description || "");
      setLandingFormDisclaimerText("测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。");
      setLandingFormButtonText(test.detailButtonText || "马上测试");
      setLandingFormButtonStyle("solid");
      setLandingFormThemeColor(test.detailThemeColor || "#1D9E75");
    }
  };

  const handleLandingHeroUpload = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showAdminAlert("头图仅支持 jpg/png 图片。");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAdminAlert("头图大小不能超过5M。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLandingFormHeroImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const saveLandingCampaign = () => {
    if (!landingFormName.trim()) {
      showAdminAlert("请输入落地页名称。");
      return;
    }
    if (landingFormName.trim().length > 30) {
      showAdminAlert("落地页名称字数不能超过30个字。");
      return;
    }
    const deduction = Number(landingFormDeduction);
    if (!Number.isFinite(deduction) || deduction < 0 || deduction > 100) {
      showAdminAlert("回传比例需填写0-100之间的百分比。");
      return;
    }
    const sku = getProductSku(landingFormSkuId);
    if (!sku) {
      showAdminAlert("请选择关联SKU。");
      return;
    }
    const selectedAccount = getMediaAccount(landingFormMediaAccountId);
    if (!selectedAccount || selectedAccount.platform !== landingFormPlatform) {
      showAdminAlert("请选择当前投放平台下的媒体账号。");
      return;
    }
    if (landingFormButtonText.trim().length > 10) {
      showAdminAlert("按钮文案字数不能超过10个字。");
      return;
    }
    if (!landingFormDisclaimerText.trim()) {
      showAdminAlert("请输入免责声明。");
      return;
    }
    if (!landingFormAdvertiserName.trim()) {
      showAdminAlert("请输入投放主体。");
      return;
    }
    const test = tests.find((item) => item.id === sku.projectId);
    const now = new Date().toISOString().substring(0, 16).replace("T", " ");
    const existing = campaigns.find((camp) => camp.id === editingLandingId);
    const id = editingLandingId || generateLandingId(landingFormPlatform);
    const item: MarketingCampaign = {
      id,
      name: landingFormName.trim(),
      mediaAccountId: selectedAccount.id,
      skuId: sku?.id,
      skuName: sku?.name,
      testId: sku?.projectId || test?.id || "mbti-standard",
      testName: sku?.projectName || test?.name || "未知内容模板",
      platform: landingFormPlatform,
      price: sku?.price || 19.9,
      deductionPercent: deduction,
      linkUrl: buildLandingLink(landingFormPlatform, id, sku, test?.id, landingFormDisclaimerText, landingFormAdvertiserName),
      heroImage: landingFormHeroImage,
      subtitle: "",
      detailBody: landingFormDetailBody.trim(),
      disclaimerText: landingFormDisclaimerText.trim(),
      advertiserName: landingFormAdvertiserName.trim(),
      buttonText: landingFormButtonText.trim() || "马上测试",
      buttonStyle: landingFormButtonStyle,
      themeColor: landingFormThemeColor,
      status: existing?.status || "enabled",
      createdAt: existing?.createdAt || now,
      views: existing?.views || 0,
      requests: existing?.requests || 0,
      pays: existing?.pays || 0,
      adSpend: existing?.adSpend || 0,
      reportViews: existing?.reportViews || 0
    };
    setCampaigns((prev) => editingLandingId ? prev.map((camp) => camp.id === editingLandingId ? item : camp) : [item, ...prev]);
    setShowLandingModal(false);
  };

  const toggleCampaignStatus = (camp: MarketingCampaign) => {
    setCampaigns((prev) =>
      prev.map((item) => (item.id === camp.id ? { ...item, status: item.status === "enabled" ? "disabled" : "enabled" } : item))
    );
  };

  const deleteCampaign = (camp: MarketingCampaign) => {
    if (camp.status === "enabled") {
      showAdminAlert("请先停用该落地页，再执行删除。");
      return;
    }
    setCampaigns((prev) => prev.filter((item) => item.id !== camp.id));
  };

  const resetMediaAccountForm = () => {
    setEditingMediaAccountId(null);
    setMediaAccountIdInput("");
    setMediaAccountNameInput("");
    setMediaAccountPlatformInput("巨量");
    setMediaAccountCompanyInput("");
  };

  const openCreateMediaAccount = () => {
    resetMediaAccountForm();
    setShowMediaAccountModal(true);
  };

  const openEditMediaAccount = (account: MediaAccount) => {
    setEditingMediaAccountId(account.id);
    setMediaAccountIdInput(account.id);
    setMediaAccountNameInput(account.name);
    setMediaAccountPlatformInput(account.platform);
    setMediaAccountCompanyInput(account.company);
    setShowMediaAccountModal(true);
  };

  const saveMediaAccount = () => {
    const id = mediaAccountIdInput.trim();
    const name = mediaAccountNameInput.trim();
    const company = mediaAccountCompanyInput.trim();
    if (!id) {
      showAdminAlert("请输入媒体账号ID。");
      return;
    }
    if (!editingMediaAccountId && mediaAccounts.some((account) => account.id.toLowerCase() === id.toLowerCase())) {
      showAdminAlert("媒体账号ID已存在，请更换。");
      return;
    }
    if (!name) {
      showAdminAlert("请输入媒体账号名称。");
      return;
    }
    if (!company) {
      showAdminAlert("请输入开户公司。");
      return;
    }
    const now = new Date().toISOString().substring(0, 16).replace("T", " ");
    setMediaAccounts((prev) =>
      editingMediaAccountId
        ? prev.map((account) =>
            account.id === editingMediaAccountId
              ? { ...account, name, platform: mediaAccountPlatformInput, company }
              : account
          )
        : [{ id, name, platform: mediaAccountPlatformInput, company, createdAt: now }, ...prev]
    );
    setShowMediaAccountModal(false);
    resetMediaAccountForm();
  };

  const deleteMediaAccount = (account: MediaAccount) => {
    const linkedCampaign = campaigns.find((camp) => camp.mediaAccountId === account.id);
    if (linkedCampaign) {
      showAdminAlert(`该媒体账号已关联落地页「${linkedCampaign.name}」，不允许删除。`);
      return;
    }
    if (!window.confirm(`确认删除媒体账号「${account.name}」吗？删除后不可恢复。`)) return;
    setMediaAccounts((prev) => prev.filter((item) => item.id !== account.id));
  };

  const menuItems: Array<{ key: MenuKey; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { key: "items", label: "商品管理", icon: <Settings className="w-4 h-4 text-red-500" /> },
    { key: "questionBank", label: "题库管理", icon: <HelpCircle className="w-4 h-4 text-violet-500" /> },
    { key: "operation", label: "运营管理", icon: <LayoutGrid className="w-4 h-4 text-[#1D9E75]" /> },
    { key: "marketing", label: "投放管理", icon: <TrendingUp className="w-4 h-4 text-pink-500" /> },
    { key: "orders", label: "订单数据", icon: <FileText className="w-4 h-4 text-indigo-500" />, badge: orders.length },
    { key: "prompts", label: "报告管理", icon: <Cpu className="w-4 h-4 text-[#1D9E75]" /> }
  ];

  const FilterDropdown = ({
    id,
    label,
    value,
    options,
    onChange,
    minWidth = "min-w-[170px]",
    widthClass = "w-full"
  }: {
    id: string;
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    minWidth?: string;
    widthClass?: string;
  }) => {
    const selectedLabel = options.find((option) => option.value === value)?.label || options[0]?.label || "";
    const isOpen = openFilterDropdown === id;

    return (
      <div
        className={`relative flex shrink-0 ${widthClass} ${minWidth} flex-col gap-1 text-xs font-bold text-slate-500`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenFilterDropdown(null);
        }}
      >
        {label}
        <button
          type="button"
          onClick={() => setOpenFilterDropdown((current) => current === id ? null : id)}
          className="flex h-10 items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-left text-xs text-slate-200 outline-none transition-colors hover:border-neutral-700 focus:border-[#1D9E75]"
        >
          <span className="min-w-0 truncate">{selectedLabel}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180 text-[#1D9E75]" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-neutral-800 bg-slate-950 py-1 shadow-2xl shadow-black">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpenFilterDropdown(null);
                }}
                className={`block w-full px-3 py-2 text-left text-xs hover:bg-neutral-900 ${value === option.value ? "text-[#1D9E75]" : "text-slate-300"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const formatAdminMoney = (value: number) => `￥${value.toFixed(value % 1 === 0 ? 0 : 1)}`;
  const formatAdminPercent = (value: number) => `${value.toFixed(1)}%`;
  const getChannelPlanName = (camp: MarketingCampaign) => {
    const sku = getProductSku(camp.skuId, camp.testId);
    const baseName = sku?.name || camp.skuName || camp.testName;
    return `${baseName.replace(/\s*标准售卖SKU$/, "")} 投放计划`;
  };
  const buildPurchaseStage = (camp: MarketingCampaign, stage: 1 | 2 | 3, payCount: number, uv: number) => {
    const sku = getProductSku(camp.skuId, camp.testId);
    const fallbackSku = productSkus[(stage - 1) % Math.max(productSkus.length, 1)];
    const productName = stage === 1
      ? sku?.name || camp.skuName || camp.testName
      : fallbackSku?.name || `${camp.testName} ${stage === 2 ? "进阶版" : "深度版"}`;
    const productPrice = stage === 1 ? camp.price : Number(fallbackSku?.price || camp.price);
    const income = payCount * productPrice;
    return {
      productName,
      productPrice,
      payCount,
      deductedPayCount: Math.floor(payCount * (camp.deductionPercent / 100)),
      conversionRate: uv ? (payCount / uv) * 100 : 0,
      refundCount: Math.floor(payCount * (stage === 1 ? 0.03 : stage === 2 ? 0.04 : 0.05)),
      income,
      reportViews: Math.max(0, Math.round((camp.reportViews || 0) * (stage === 1 ? 0.72 : stage === 2 ? 0.2 : 0.08)))
    };
  };
  const channelDataRows = campaigns.map((camp) => {
    const mediaAccount = getMediaAccount(camp.mediaAccountId, camp.platform);
    const answerCount = Math.round(camp.requests * 0.76);
    const profileCount = Math.round(camp.requests * 0.58);
    const uv = Math.max(1, Math.round(camp.views * 0.82));
    const validActions = Math.min(uv, Math.max(answerCount, profileCount));
    const firstPays = Math.max(camp.pays, Math.round(camp.pays * 1.08));
    const secondPays = Math.round(camp.pays * 0.42);
    const thirdPays = Math.round(camp.pays * 0.18);
    const firstBase = buildPurchaseStage(camp, 1, firstPays, uv);
    const secondBase = buildPurchaseStage(camp, 2, secondPays, uv);
    const thirdBase = buildPurchaseStage(camp, 3, thirdPays, uv);
    const first = { ...firstBase, cumulativeRoi: camp.adSpend ? firstBase.income / camp.adSpend : 0 };
    const second = { ...secondBase, cumulativeRoi: camp.adSpend ? (firstBase.income + secondBase.income) / camp.adSpend : 0 };
    const third = { ...thirdBase, cumulativeRoi: camp.adSpend ? (firstBase.income + secondBase.income + thirdBase.income) / camp.adSpend : 0 };
    const totalPayCount = camp.pays;
    const totalIncome = first.income + second.income + third.income;
    const acquisitionCost = totalPayCount ? camp.adSpend / totalPayCount : 0;
    const roi = camp.adSpend ? totalIncome / camp.adSpend : 0;

    return {
      camp,
      date: camp.createdAt.slice(0, 10),
      campaignId: mediaAccount?.id || `${camp.platform === "快手" ? "ks" : "jl"}-${camp.id.toLowerCase()}`,
      account: mediaAccount?.name || `${camp.platform}投放账号-${camp.id.slice(-4)}`,
      plan: `${camp.id}-PLAN`,
      planName: getChannelPlanName(camp),
      pv: camp.views,
      uv,
      answerCount,
      profileCount,
      validActions,
      validActionRate: uv ? Math.min(100, (validActions / uv) * 100) : 0,
      first,
      second,
      third,
      totalPayCount,
      totalIncome,
      acquisitionCost,
      roi
    };
  });
  const filteredChannelDataRows = channelDataRows.filter((row) => {
    const matchesDate = !channelDateFilter || row.date === channelDateFilter;
    const matchesName = !channelLandingNameFilter.trim() || row.camp.name.toLowerCase().includes(channelLandingNameFilter.trim().toLowerCase());
    const matchesPlatform = channelPlatformFilter === "all" || row.camp.platform === channelPlatformFilter;
    const matchesAccountId = !channelAccountIdFilter.trim() || row.campaignId.toLowerCase().includes(channelAccountIdFilter.trim().toLowerCase());
    const matchesAccountName = !channelAccountNameFilter.trim() || row.account.toLowerCase().includes(channelAccountNameFilter.trim().toLowerCase());
    const matchesDeduction = !channelDeductionFilter.trim() || String(row.camp.deductionPercent).includes(channelDeductionFilter.trim());
    return matchesDate && matchesName && matchesPlatform && matchesAccountId && matchesAccountName && matchesDeduction;
  });

  const renderMarketing = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 w-fit">
          {[
            ["landing", "落地页列表"],
            ["data", "渠道数据"],
            ["accounts", "媒体账号"]
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMarketingTab(key as MarketingTab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold ${
                marketingTab === key ? "bg-[#1D9E75] text-slate-950" : "bg-neutral-900 text-slate-400 hover:text-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {marketingTab === "landing" && (
          <button
            type="button"
            onClick={openCreateLanding}
            className="flex items-center gap-1 rounded-xl bg-[#1D9E75] px-3.5 py-2 text-xs font-bold text-slate-950 shadow shadow-[#0A3B2D]/50 transition-colors hover:bg-[#31B58C]"
          >
            <Plus className="h-3.5 w-3.5" /> 新增落地页
          </button>
        )}
        {marketingTab === "accounts" && (
          <button
            type="button"
            onClick={openCreateMediaAccount}
            className="flex items-center gap-1 rounded-xl bg-[#1D9E75] px-3.5 py-2 text-xs font-bold text-slate-950 shadow shadow-[#0A3B2D]/50 transition-colors hover:bg-[#31B58C]"
          >
            <Plus className="h-3.5 w-3.5" /> 新增媒体账号
          </button>
        )}
      </div>

      {marketingTab === "landing" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <label className="flex w-full flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">落地页名称</span>
                <input
                  value={landingNameFilter}
                  onChange={(event) => setLandingNameFilter(event.target.value)}
                  placeholder="输入落地页名称筛选"
                  className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]/70"
                />
              </label>
              <FilterDropdown
                id="landing-platform-filter"
                label="投放平台"
                value={landingPlatformFilter}
                minWidth="min-w-0"
                options={[{ value: "all", label: "全部平台" }, ...landingPlatformOptions.map((platform) => ({ value: platform, label: platform }))]}
                onChange={(value) => setLandingPlatformFilter(value as "all" | "巨量" | "快手")}
              />
              <label className="flex w-full flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">投放账号ID</span>
                <input
                  value={landingMediaAccountIdFilter}
                  onChange={(event) => setLandingMediaAccountIdFilter(event.target.value)}
                  placeholder="输入投放账号ID筛选"
                  className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#1D9E75]"
                />
              </label>
              <label className="flex w-full flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">投放账号名称</span>
                <input
                  value={landingMediaAccountNameFilter}
                  onChange={(event) => setLandingMediaAccountNameFilter(event.target.value)}
                  placeholder="输入投放账号名称筛选"
                  className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#1D9E75]"
                />
              </label>
              <FilterDropdown
                id="landing-sku-filter"
                label="关联商品"
                value={landingSkuFilter}
                minWidth="min-w-0"
                options={[{ value: "all", label: "全部商品" }, ...productSkus.map((sku) => ({ value: sku.id, label: sku.name }))]}
                onChange={setLandingSkuFilter}
              />
              <label className="flex w-full flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">创建时间</span>
                <input
                  type="date"
                  value={landingCreatedDateFilter}
                  onChange={(event) => setLandingCreatedDateFilter(event.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                />
              </label>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 bg-neutral-900/30 p-4">
              <span className="text-xs font-bold text-slate-400">落地页列表 ({filteredCampaigns.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1700px] w-full table-fixed text-left text-xs text-slate-300">
              <thead className="border-b border-neutral-800 bg-[#090d16]/30 font-mono text-[10px] text-slate-500">
                <tr>
                  <th className="w-[90px] p-3 pl-4">落地页ID</th>
                  <th className="w-[210px] p-3">落地页名称</th>
                  <th className="w-[76px] p-3">投放平台</th>
                  <th className="w-[160px] p-3">投放账号ID</th>
                  <th className="w-[180px] p-3">投放账号名称</th>
                  <th className="w-[82px] p-3">回传比例</th>
                  <th className="w-[330px] p-3">关联商品</th>
                  <th className="w-[330px] p-3">落地页链接</th>
                  <th className="w-[72px] p-3">状态</th>
                  <th className="w-[122px] p-3">创建时间</th>
                  <th className="w-[150px] p-3 pr-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredCampaigns.map((camp) => {
                  const sku = getProductSku(camp.skuId, camp.testId);
                  const mediaAccount = getMediaAccount(camp.mediaAccountId, camp.platform);
                  return (
                    <tr key={camp.id} className="hover:bg-neutral-900/30">
                      <td className="whitespace-nowrap p-3 pl-4 font-mono font-bold text-[#1D9E75]">{camp.id}</td>
                      <td className="p-3">
                        <div className="truncate font-bold text-slate-200" title={camp.name}>
                          {camp.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-3">{camp.platform}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-slate-400">{mediaAccount?.id || "-"}</td>
                      <td className="p-3">
                        <div className="truncate text-slate-300" title={mediaAccount?.name || "-"}>{mediaAccount?.name || "-"}</div>
                      </td>
                      <td className="whitespace-nowrap p-3 font-mono text-[#1D9E75]">{camp.deductionPercent}%</td>
                      <td className="p-3">
                        <div className="truncate text-[#1D9E75]" title={sku?.name || camp.skuName || camp.testName}>
                          {sku?.name || camp.skuName || camp.testName}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => copyLandingLink(camp)}
                          className="inline-flex max-w-full items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-400 hover:text-[#1D9E75]"
                        >
                          <Copy className="h-3 w-3 shrink-0" />
                          <span className="truncate">{copiedCampId === camp.id ? "已复制" : camp.linkUrl}</span>
                        </button>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] ${
                            camp.status === "enabled"
                              ? "border-[#1D9E75]/30 bg-[#1D9E75]/10 text-[#1D9E75]"
                              : "border-slate-700 bg-slate-900 text-slate-400"
                          }`}
                        >
                          {camp.status === "enabled" ? "启用" : "停用"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap p-3 font-mono text-[11px] leading-5 text-slate-500">{camp.createdAt}</td>
                      <td className="p-3 pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleCampaignStatus(camp)}
                            title={camp.status === "enabled" ? "停用" : "启用"}
                            className="inline-flex h-8 min-w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 px-2 text-[10px] text-slate-300 hover:border-pink-500/60"
                          >
                            {camp.status === "enabled" ? "停用" : "启用"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditLanding(camp)}
                            title="编辑"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-slate-300"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCampaign(camp)}
                            title="删除"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/60 bg-red-950/30 text-red-400"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-xs text-slate-500">
                      暂无匹配落地页
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      ) : marketingTab === "data" ? (
        <div className="space-y-4">
        <div className="relative z-20 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <label className="flex w-full flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">日期</span>
              <input
                type="date"
                value={channelDateFilter}
                onChange={(event) => setChannelDateFilter(event.target.value)}
                style={{ colorScheme: "dark" }}
                className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none transition-colors focus:border-[#1D9E75]/70"
              />
            </label>
            <label className="flex w-full flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">落地页名称</span>
              <input
                value={channelLandingNameFilter}
                onChange={(event) => setChannelLandingNameFilter(event.target.value)}
                placeholder="输入落地页名称筛选"
                className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]/70"
              />
            </label>
            <FilterDropdown
              id="channel-platform-filter"
              label="投放平台"
              value={channelPlatformFilter}
              minWidth="min-w-0"
              options={[{ value: "all", label: "全部平台" }, ...landingPlatformOptions.map((platform) => ({ value: platform, label: platform }))]}
              onChange={(value) => setChannelPlatformFilter(value as "all" | "巨量" | "快手")}
            />
            <label className="flex w-full flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">投放账号ID</span>
              <input
                value={channelAccountIdFilter}
                onChange={(event) => setChannelAccountIdFilter(event.target.value)}
                placeholder="输入投放账号ID筛选"
                className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]/70"
              />
            </label>
            <label className="flex w-full flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">投放账号</span>
              <input
                value={channelAccountNameFilter}
                onChange={(event) => setChannelAccountNameFilter(event.target.value)}
                placeholder="输入投放账号筛选"
                className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]/70"
              />
            </label>
            <label className="flex w-full flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">回传比例</span>
              <input
                type="number"
                min={0}
                max={100}
                value={channelDeductionFilter}
                onChange={(event) => setChannelDeductionFilter(event.target.value)}
                placeholder="输入回传比例"
                className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]/70"
              />
            </label>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="border-b border-neutral-800 bg-neutral-900/30 p-4">
            <span className="text-xs font-bold text-slate-400">渠道数据列表 ({filteredChannelDataRows.length})</span>
            <p className="mt-1 text-[10px] text-slate-500">按日期、广告计划与落地页组合生成数据；首购/二购/三购付费数按环节原始次数统计，总付费数按后台去重口径统计。</p>
          </div>
          <div className="overflow-x-auto overflow-y-visible">
            <table className="min-w-[4520px] w-full table-fixed text-left text-[11px] text-slate-300">
              <thead className="border-b border-neutral-800 bg-[#090d16]/30 text-[10px] text-slate-500">
                <tr>
                  <th colSpan={8} className="border-r border-neutral-800 p-3 text-[#9CE6CF]">基础归因</th>
                  <th colSpan={5} className="border-r border-neutral-800 p-3 text-[#9CE6CF]">访问与有效行为</th>
                  <th colSpan={9} className="border-r border-neutral-800 p-3 text-[#9CE6CF]">首购</th>
                  <th colSpan={9} className="border-r border-neutral-800 p-3 text-[#9CE6CF]">二购</th>
                  <th colSpan={9} className="border-r border-neutral-800 p-3 text-[#9CE6CF]">三购</th>
                  <th colSpan={5} className="p-3 text-[#9CE6CF]">汇总</th>
                </tr>
                <tr className="border-t border-neutral-800">
                  {[
                    ["日期", "w-[96px]"],
                    ["落地页名称", "w-[340px]"],
                    ["回传比例", "w-[78px]"],
                    ["投放平台", "w-[76px]"],
                    ["投放账号ID", "w-[130px]"],
                    ["投放账号", "w-[180px]"],
                    ["广告计划ID", "w-[120px]"],
                    ["广告计划名称", "w-[300px]"],
                    ["访问PV", "w-[78px]"],
                    ["访问UV", "w-[78px]"],
                    ["答题数", "w-[78px]"],
                    ["填写资料", "w-[78px]"],
                    ["有效行为转化率", "w-[116px]", "有效行为转化率 = 去重有效行为用户数 / 访问UV\n去重有效行为用户数不超过访问UV"],
                    ["购买商品", "w-[320px]"],
                    ["价格", "w-[72px]"],
                    ["付费数", "w-[70px]"],
                    ["扣量付费数", "w-[104px]", "扣量付费数 = floor(真实付费数 × 回传比例)\n结果向下取整"],
                    ["付费转化率", "w-[96px]", "首购付费转化率 = 首购付费数 / 访问UV"],
                    ["退款数", "w-[76px]"],
                    ["付费收入", "w-[92px]"],
                    ["累计ROI", "w-[86px]", "首购累计ROI = 首购累计付费收入 / 投放消耗金额"],
                    ["报告查看数", "w-[96px]"],
                    ["购买商品", "w-[320px]"],
                    ["价格", "w-[72px]"],
                    ["付费数", "w-[70px]"],
                    ["扣量付费数", "w-[104px]", "扣量付费数 = floor(真实付费数 × 回传比例)\n结果向下取整"],
                    ["付费转化率", "w-[96px]", "二购付费转化率 = 二购付费数 / 访问UV"],
                    ["退款数", "w-[76px]"],
                    ["付费收入", "w-[92px]"],
                    ["累计ROI", "w-[86px]", "二购累计ROI = (首购付费收入 + 二购付费收入) / 投放消耗金额"],
                    ["报告查看数", "w-[96px]"],
                    ["购买商品", "w-[320px]"],
                    ["价格", "w-[72px]"],
                    ["付费数", "w-[70px]"],
                    ["扣量付费数", "w-[104px]", "扣量付费数 = floor(真实付费数 × 回传比例)\n结果向下取整"],
                    ["付费转化率", "w-[96px]", "三购付费转化率 = 三购付费数 / 访问UV"],
                    ["退款数", "w-[76px]"],
                    ["付费收入", "w-[92px]"],
                    ["累计ROI", "w-[86px]", "三购累计ROI = (首购付费收入 + 二购付费收入 + 三购付费收入) / 投放消耗金额"],
                    ["报告查看数", "w-[96px]"],
                    ["总付费数", "w-[82px]", "总付费数 = 后台订单去重后的付费用户/订单数\n首购、二购、三购付费数按环节原始次数统计，不在这里相加"],
                    ["总付费收入", "w-[100px]"],
                    ["投放消耗金额", "w-[108px]"],
                    ["买量成本", "w-[96px]", "买量成本 = 投放消耗金额 / 总付费数"],
                    ["ROI", "w-[72px]", "ROI = 总付费收入 / 投放消耗金额"]
                  ].map(([head, width, formula], index) => {
                    const formulaKey = `${head}-${index}`;
                    return (
                    <th key={formulaKey} className={`${width} whitespace-nowrap p-3`}>
                      <span className="inline-flex items-center gap-1">
                        {head}
                        {formula && (
                          <span className="relative inline-flex">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenFormulaKey((current) => current === formulaKey ? null : formulaKey);
                            }}
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition-colors ${
                              openFormulaKey === formulaKey
                                ? "border-[#1D9E75] bg-[#1D9E75]/15 text-[#9CE6CF]"
                                : "border-slate-700 bg-slate-950 text-slate-500 hover:border-[#1D9E75]/70 hover:text-[#9CE6CF]"
                            }`}
                            aria-label={`${head}计算公式`}
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                          {openFormulaKey === formulaKey && (
                            <span
                              className="absolute right-0 top-5 z-50 w-[360px] whitespace-pre-line rounded-xl border border-[#1D9E75]/25 bg-[#08111d]/95 p-3 text-left font-sans text-[11px] font-normal leading-5 text-slate-300 shadow-2xl shadow-black/50 backdrop-blur"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <span className="mb-1 block text-[10px] font-bold text-[#9CE6CF]">说明</span>{formula}
                            </span>
                          )}
                          </span>
                        )}
                      </span>
                    </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredChannelDataRows.map((row) => {
                  const renderStageCells = (stage: typeof row.first) => (
                    <>
                      <td className="p-3 align-top">
                        <div className="whitespace-normal break-words leading-5 text-[#1D9E75]" title={stage.productName}>{stage.productName}</div>
                      </td>
                      <td className="whitespace-nowrap p-3 font-mono text-red-300">{formatAdminMoney(stage.productPrice)}</td>
                      <td className="whitespace-nowrap p-3 font-mono">{stage.payCount}</td>
                      <td className="whitespace-nowrap p-3 font-mono">{stage.deductedPayCount}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-cyan-300">{formatAdminPercent(stage.conversionRate)}</td>
                      <td className="whitespace-nowrap p-3 font-mono">{stage.refundCount}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-[#1D9E75]">{formatAdminMoney(stage.income)}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-cyan-300">{stage.cumulativeRoi ? stage.cumulativeRoi.toFixed(2) : "-"}</td>
                      <td className="whitespace-nowrap p-3 font-mono">{stage.reportViews}</td>
                    </>
                  );
                  return (
                    <tr key={row.camp.id} className="align-top hover:bg-neutral-900/30">
                      <td className="whitespace-nowrap p-3 font-mono">{row.date}</td>
                      <td className="p-3 align-top">
                        <div className="whitespace-normal break-words font-bold leading-5 text-slate-200" title={row.camp.name}>{row.camp.name}</div>
                      </td>
                      <td className="whitespace-nowrap p-3 font-mono text-[#1D9E75]">{row.camp.deductionPercent}%</td>
                      <td className="whitespace-nowrap p-3">{row.camp.platform}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-slate-400">{row.campaignId}</td>
                      <td className="p-3 align-top">
                        <div className="whitespace-normal break-words leading-5" title={row.account}>{row.account}</div>
                      </td>
                      <td className="whitespace-nowrap p-3 font-mono text-slate-400">{row.plan}</td>
                      <td className="p-3 align-top">
                        <div className="whitespace-normal break-words leading-5 text-slate-300" title={row.planName}>{row.planName}</div>
                      </td>
                      <td className="whitespace-nowrap p-3 font-mono">{row.pv}</td>
                      <td className="whitespace-nowrap p-3 font-mono">{row.uv}</td>
                      <td className="whitespace-nowrap p-3 font-mono">{row.answerCount}</td>
                      <td className="whitespace-nowrap p-3 font-mono">{row.profileCount}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-cyan-300">{formatAdminPercent(row.validActionRate)}</td>
                      {renderStageCells(row.first)}
                      {renderStageCells(row.second)}
                      {renderStageCells(row.third)}
                      <td className="whitespace-nowrap p-3 font-mono">{row.totalPayCount}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-[#1D9E75]">{formatAdminMoney(row.totalIncome)}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-red-300">{formatAdminMoney(row.camp.adSpend)}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-cyan-300">{row.acquisitionCost ? formatAdminMoney(row.acquisitionCost) : "-"}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-cyan-300">{row.roi ? row.roi.toFixed(2) : "-"}</td>
                    </tr>
                  );
                })}
                {filteredChannelDataRows.length === 0 && (
                  <tr>
                    <td colSpan={45} className="p-8 text-center text-xs text-slate-500">
                      暂无匹配渠道数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="grid items-end gap-4 md:grid-cols-[220px_320px]">
              <FilterDropdown
                id="media-account-platform-filter"
                label="媒体平台"
                value={mediaAccountPlatformFilter}
                minWidth="min-w-0"
                options={[
                  { value: "all", label: "全部平台" },
                  { value: "巨量", label: "巨量" },
                  { value: "快手", label: "快手" }
                ]}
                onChange={(value) => setMediaAccountPlatformFilter(value as "all" | "巨量" | "快手")}
              />
              <label className="flex w-full flex-col gap-1">
                <span className="text-xs font-bold text-slate-500">媒体账号</span>
                <input
                  value={mediaAccountKeywordFilter}
                  onChange={(event) => setMediaAccountKeywordFilter(event.target.value)}
                  placeholder="输入媒体账号ID/名称筛选"
                  className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#1D9E75]"
                />
              </label>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 bg-neutral-900/30 p-4">
              <span className="text-xs font-bold text-slate-400">媒体账号列表 ({filteredMediaAccounts.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full table-fixed text-left text-xs text-slate-300">
                <thead className="border-b border-neutral-800 bg-[#090d16]/30 text-[10px] text-slate-500">
                  <tr>
                    <th className="w-[160px] p-3 pl-4">媒体账号ID</th>
                    <th className="w-[260px] p-3">媒体账号名称</th>
                    <th className="w-[120px] p-3">媒体平台</th>
                    <th className="w-[280px] p-3">开户公司</th>
                    <th className="w-[140px] p-3">创建时间</th>
                    <th className="w-[120px] p-3 pr-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredMediaAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-neutral-900/30">
                      <td className="whitespace-nowrap p-3 pl-4 font-mono font-bold text-[#1D9E75]">{account.id}</td>
                      <td className="p-3 font-bold text-slate-200">{account.name}</td>
                      <td className="whitespace-nowrap p-3">{account.platform}</td>
                      <td className="p-3 text-slate-400">{account.company}</td>
                      <td className="whitespace-nowrap p-3 font-mono text-[11px] text-slate-500">{account.createdAt}</td>
                      <td className="p-3 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditMediaAccount(account)}
                            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[10px] text-slate-300 hover:border-[#1D9E75]/60 hover:text-[#9CE6CF]"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMediaAccount(account)}
                            className="rounded-lg border border-red-900/60 bg-red-950/30 px-2.5 py-1 text-[10px] text-red-400 hover:bg-red-950/50"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMediaAccounts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                        暂无匹配媒体账号
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLandingModal = () => {
    if (!showLandingModal) return null;
    const { sku, test } = getLandingSkuDetail(landingFormSkuId);
    const previewTitle = landingFormName.trim() || test?.name || "新增落地页";
    const previewSubtitle = sku?.name || test?.name || "SKU详情页配置";
    const previewDetailHtml = landingFormDetailBody || `<p>${test?.description || "填写描述正文后可在这里预览详情页内容。"}</p>`;
    const previewThemeColor = landingFormThemeColor || "#1D9E75";
    const previewButtonStyle =
      landingFormButtonStyle === "outline"
        ? {
            className: "border bg-slate-950/90 text-slate-100 shadow-[inset_0_0_18px_rgba(255,255,255,0.03)]",
            style: {
              borderColor: previewThemeColor,
              color: previewThemeColor,
              boxShadow: `inset 0 0 18px rgba(255,255,255,0.03), 0 0 18px ${previewThemeColor}44`
            }
          }
        : landingFormButtonStyle === "glow"
          ? {
              className: "animate-pulse border border-white/20 text-slate-950 shadow-lg",
              style: {
                background: `linear-gradient(135deg, ${previewThemeColor} 0%, ${previewThemeColor}cc 100%)`,
                boxShadow: `0 0 26px ${previewThemeColor}88, 0 10px 24px ${previewThemeColor}33`
              }
            }
          : {
              className: "border border-white/20 text-white shadow-lg",
              style: {
                background: `linear-gradient(135deg, ${previewThemeColor} 0%, ${previewThemeColor}dd 52%, ${previewThemeColor}aa 100%)`,
                boxShadow: `0 10px 24px ${previewThemeColor}5c`
              }
            };

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020617] p-6">
        <div className="flex h-[min(720px,calc(100vh-3rem))] w-[min(1120px,calc(100vw-3rem))] flex-col rounded-3xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl shadow-black">
          <div className="mb-4 flex shrink-0 items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#9CE6CF]">{editingLandingId ? "编辑落地页" : "新增落地页"}</h3>
              <p className="mt-1 text-[10px] text-slate-500">落地页ID {editingLandingId || "保存时按平台分段自动生成"}</p>
            </div>
            <button type="button" onClick={() => setShowLandingModal(false)} className="rounded-lg border border-neutral-800 p-2 text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <section className="rounded-2xl border border-neutral-800 bg-slate-950 p-4">
                  <h4 className="mb-3 text-xs font-bold text-slate-300">基本投放信息</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1.5 text-[10px] font-bold text-slate-500 md:col-span-2">
                      <span className="flex items-center justify-between">
                        <span>落地页名称 <span className="text-[#1D9E75]">*</span></span>
                        <span className={`font-mono text-[10px] ${landingFormName.length >= 30 ? "text-red-400" : "text-slate-500"}`}>{landingFormName.length}/30</span>
                      </span>
                      <input
                        maxLength={30}
                        value={landingFormName}
                        onChange={(event) => setLandingFormName(event.target.value)}
                        className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                      />
                    </label>
                    <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                      投放平台
                      <select
                        value={landingFormPlatform}
                        onChange={(event) => handleLandingPlatformChange(event.target.value as "巨量" | "快手")}
                        className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                      >
                        <option value="巨量">巨量</option>
                        <option value="快手">快手</option>
                      </select>
                    </label>
                    <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                      媒体账号 <span className="text-[#1D9E75]">*</span>
                      <select
                        value={landingFormMediaAccountId}
                        onChange={(event) => setLandingFormMediaAccountId(event.target.value)}
                        className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">请选择媒体账号</option>
                        {mediaAccounts.filter((account) => account.platform === landingFormPlatform).map((account) => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                      回传策略
                      <div className="flex h-10 items-center rounded-xl border border-neutral-800 bg-[#030713] px-3 focus-within:border-[#1D9E75]">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={landingFormDeduction}
                          onChange={(event) => setLandingFormDeduction(event.target.value)}
                          className="min-w-0 flex-1 bg-transparent text-xs text-slate-200 outline-none"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    </label>
                    <label className="space-y-1.5 text-[10px] font-bold text-slate-500 md:col-span-2">
                      关联SKU <span className="text-[#1D9E75]">*</span>
                      <select
                        value={landingFormSkuId}
                        onChange={(event) => handleLandingSkuChange(event.target.value)}
                        className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">请选择SKU</option>
                        {productSkus.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      {sku ? (
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-800 bg-[#030713] px-3 py-2 text-[10px] font-medium">
                          <span className="text-slate-500">当前售价</span>
                          <span className="font-mono text-sm font-black text-red-300">￥{sku.price}</span>
                          {sku.originalPrice !== undefined && Number(sku.originalPrice) > Number(sku.price) && (
                            <span className="font-mono text-[10px] text-slate-600 line-through">￥{sku.originalPrice}</span>
                          )}
                          <span className={`ml-auto rounded-full border px-2 py-0.5 text-[9px] ${sku.status === "已上架" ? "border-[#1D9E75]/40 bg-[#1D9E75]/10 text-[#9CE6CF]" : "border-slate-700 bg-slate-900 text-slate-500"}`}>
                            {sku.status}
                          </span>
                        </div>
                      ) : (
                        <span className="block text-[9px] font-medium text-slate-600">选择关联SKU后自动展示商品售价。</span>
                      )}
                      <span className="block text-[9px] font-medium text-slate-600">关联后自动继承该SKU所属内容模板的详情页配置。</span>
                    </label>
                  </div>
                </section>
                <section className="rounded-2xl border border-neutral-800 bg-slate-950 p-4">
                  <h4 className="mb-3 text-xs font-bold text-slate-300">个性化详情页配置</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 text-[10px] font-bold text-slate-500 md:col-span-2">
                      头图
                      {landingFormHeroImage ? (
                        <div className="relative aspect-[25/11] w-full overflow-hidden rounded-xl border border-neutral-800 bg-slate-950">
                          <img src={landingFormHeroImage} alt="落地页头图预览" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setLandingFormHeroImage("")}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-black/70 text-slate-200 hover:border-red-400 hover:text-red-300"
                            aria-label="删除已上传头图"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="flex aspect-[25/11] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1D9E75]/70 bg-slate-950 text-center hover:border-[#1D9E75] hover:bg-[#1D9E75]/5"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleLandingHeroUpload(event.dataTransfer.files?.[0]);
                          }}
                        >
                          <UploadCloud className="mb-2 h-8 w-8 text-[#1D9E75]" />
                          <span className="text-xs font-bold text-slate-300">点击或将图片拖拽到这里上传</span>
                          <span className="mt-1 text-[10px] font-medium text-slate-500">推荐尺寸 750 x 324 px，支持 jpg/png，大小不超过5M</span>
                          <span className="mt-1 text-[10px] font-medium text-slate-600">可留空，留空时继续使用SKU内容模板的头图。</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={(event) => {
                              handleLandingHeroUpload(event.target.files?.[0]);
                              event.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="grid gap-3 md:col-span-2 lg:grid-cols-3">
                      <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                        主色调
                        <div className="flex h-10 items-center gap-2 rounded-xl border border-neutral-800 bg-[#030713] px-3 focus-within:border-[#1D9E75]">
                          <input type="color" value={landingFormThemeColor} onChange={(event) => setLandingFormThemeColor(event.target.value)} className="h-6 w-8 border-0 bg-transparent p-0" />
                          <input value={landingFormThemeColor} onChange={(event) => setLandingFormThemeColor(event.target.value)} className="min-w-0 flex-1 bg-transparent font-mono text-xs text-slate-200 outline-none" />
                        </div>
                      </label>
                      <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                        按钮文案
                        <input
                          maxLength={10}
                          value={landingFormButtonText}
                          onChange={(event) => setLandingFormButtonText(event.target.value)}
                          className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                        />
                      </label>
                      <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                        按钮样式
                        <select
                          value={landingFormButtonStyle}
                          onChange={(event) => setLandingFormButtonStyle(event.target.value as "solid" | "outline" | "glow")}
                          className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                        >
                          <option value="solid">高转化渐变</option>
                          <option value="outline">霓虹描边</option>
                          <option value="glow">呼吸发光</option>
                        </select>
                      </label>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-bold text-slate-500 md:col-span-2">
                      描述正文
                      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-[#030713] focus-within:border-[#1D9E75]">
                        <div className="flex items-center gap-1 border-b border-neutral-800 bg-neutral-900/60 p-1.5">
                          {[
                            { command: "bold", label: "加粗", icon: <Bold className="h-3.5 w-3.5" /> },
                            { command: "italic", label: "斜体", icon: <Italic className="h-3.5 w-3.5" /> },
                            { command: "underline", label: "下划线", icon: <Underline className="h-3.5 w-3.5" /> },
                            { command: "insertUnorderedList", label: "无序列表", icon: <List className="h-3.5 w-3.5" /> },
                            { command: "insertOrderedList", label: "有序列表", icon: <ListOrdered className="h-3.5 w-3.5" /> },
                            { command: "removeFormat", label: "清除格式", icon: <Eraser className="h-3.5 w-3.5" /> }
                          ].map((tool) => (
                            <button
                              key={tool.command}
                              type="button"
                              title={tool.label}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                applyRichTextCommand(tool.command);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-slate-950 text-slate-400 hover:border-[#1D9E75]/60 hover:text-[#1D9E75]"
                            >
                              {tool.icon}
                            </button>
                          ))}
                        </div>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(event) => setLandingFormDetailBody(event.currentTarget.innerHTML)}
                          className="min-h-[136px] w-full px-3 py-2 text-xs leading-relaxed text-slate-200 outline-none empty:before:text-slate-600 empty:before:content-['请输入描述正文...'] [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:font-bold [&_ul]:list-disc"
                          dangerouslySetInnerHTML={{ __html: landingFormDetailBody }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 md:col-span-2 md:grid-cols-[1fr_260px]">
                      <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                        免责声明 <span className="text-[#1D9E75]">*</span>
                        <textarea
                          value={landingFormDisclaimerText}
                          onChange={(event) => setLandingFormDisclaimerText(event.target.value)}
                          rows={3}
                          className="min-h-[86px] w-full resize-none rounded-xl border border-neutral-800 bg-[#030713] px-3 py-2 text-xs leading-relaxed text-slate-200 outline-none focus:border-[#1D9E75]"
                        />
                      </label>
                      <label className="space-y-1.5 text-[10px] font-bold text-slate-500">
                        投放主体 <span className="text-[#1D9E75]">*</span>
                        <input
                          value={landingFormAdvertiserName}
                          onChange={(event) => setLandingFormAdvertiserName(event.target.value)}
                          className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                        />
                        <span className="block text-[9px] font-medium text-slate-600">仅投放落地页展示，普通商品详情页不展示该字段。</span>
                      </label>
                    </div>
                  </div>
                </section>
              </div>
              <aside className="rounded-2xl border border-neutral-800 bg-slate-950 p-4">
                <h4 className="mb-3 text-xs font-bold text-slate-300">详情页预览</h4>
                <div className="h-[520px] overflow-y-auto rounded-[26px] border border-neutral-800 bg-[#090d1c] p-3 shadow-inner shadow-black/60">
                  <div className="mb-3 rounded-lg border border-neutral-800 bg-slate-950/50 px-2 py-1 text-[9px] text-slate-400">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">🔒 本网页数据安全由阿里云提供，严格加密</span>
                      <span className="shrink-0 font-bold text-[#10B981]">● 严防泄露</span>
                    </div>
                  </div>

                  <div
                    className="relative mb-4 min-h-[190px] overflow-hidden rounded-2xl border border-indigo-200/20 bg-gradient-to-br from-indigo-700 via-[#3B82F6] to-cyan-500 p-4 text-center text-white shadow-lg"
                  >
                    {landingFormHeroImage ? (
                      <img src={landingFormHeroImage} alt="详情页头图预览" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute left-3 top-2 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                        <div className="absolute bottom-1 right-2 h-24 w-24 rounded-full bg-yellow-400/10 blur-lg" />
                        <div className="absolute inset-0 flex items-end justify-between px-4 opacity-15">
                          <svg viewBox="0 0 100 100" className="h-16 w-16 text-white">
                            <path d="M 10 90 Q 25 60 40 90 Z" fill="currentColor" />
                            <circle cx="25" cy="50" r="12" fill="currentColor" />
                          </svg>
                          <svg viewBox="0 0 100 100" className="h-20 w-20 text-white">
                            <path d="M 20 100 Q 50 40 80 100 Z" fill="currentColor" />
                            <circle cx="50" cy="30" r="16" fill="currentColor" />
                          </svg>
                        </div>
                      </>
                    )}
                    <div className="relative z-10 flex min-h-[158px] flex-col items-center justify-center">
                      <span className="mb-2 rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-yellow-200">
                        OFFICIAL ASSESSMENT
                      </span>
                      <h1 className="text-lg font-black tracking-wider text-white drop-shadow-md">{previewTitle}</h1>
                      <p className="mt-1 text-[10px] font-medium text-white/85 opacity-90">「 {previewSubtitle} 」</p>
                      <div className="mt-3 rounded-full bg-[#FEF08A] px-4 py-1.5 text-[10px] font-black text-amber-950 shadow-md">
                        你的性格，适合什么样的选择？
                      </div>
                      <div className="mt-2 flex items-center gap-1 font-mono text-[9px] text-white/75">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>当前已有 20,156 人完成测评鉴定</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-left font-sans text-slate-200">
                    <section className="rounded-2xl border border-neutral-900 bg-slate-950/60 p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-1.5 border-b border-dashed border-neutral-800 pb-2">
                        <span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: previewThemeColor }} />
                        <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: previewThemeColor }}>测评介绍 • Detail Intro</h3>
                      </div>
                      <div
                        className="text-[11.5px] leading-relaxed text-slate-300 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500/80 [&_blockquote]:bg-blue-950/30 [&_blockquote]:p-2.5 [&_blockquote]:text-blue-200 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-black [&_h1]:text-indigo-100 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-dashed [&_h2]:border-neutral-800 [&_h2]:pb-2 [&_h2]:text-sm [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-widest [&_h2]:text-indigo-200 [&_h3]:mb-2 [&_h3]:text-xs [&_h3]:font-black [&_h3]:text-indigo-200 [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_strong]:font-black [&_strong]:text-slate-200 [&_ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html: previewDetailHtml }}
                      />
                    </section>

                    <section className="rounded-2xl border border-neutral-900 bg-slate-950/60 p-4 text-[10.5px] text-slate-300 shadow-sm">
                      <div className="mb-2 flex items-center gap-1.5 border-b border-neutral-800 pb-1.5">
                        <span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: previewThemeColor }} />
                        <span className="font-bold text-slate-200">测评须知</span>
                      </div>
                      <div className="space-y-1 leading-normal text-slate-500">
                        <p>1. 请在舒畅且无外界严重干扰的氛围中完成测评。</p>
                        <p>2. 所有档案信息经行业安全加密体系传输。</p>
                        <p>3. 报告将结合题库计分或资料推演生成。</p>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-900 bg-slate-950/60 p-4 text-[10.5px] text-slate-500 shadow-sm">
                      <div className="space-y-1 leading-relaxed">
                        {(landingFormDisclaimerText || "测试结果仅供娱乐和参考！\n本测试为付费测试，付费后可查看测试结果。").split("\n").filter(Boolean).map((line, index) => (
                          <p key={`${line}-${index}`} className={index === 0 ? "font-bold text-slate-300" : ""}>{line}</p>
                        ))}
                        <p>投放主体：{landingFormAdvertiserName || "广州学诚网络科技有限公司"}</p>
                      </div>
                    </section>

                    <button
                      type="button"
                      className={`relative w-full overflow-hidden rounded-2xl px-3 py-3.5 text-xs font-black tracking-wider transition-all ${previewButtonStyle.className}`}
                      style={previewButtonStyle.style}
                    >
                      {landingFormButtonStyle !== "outline" && <span className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent" />}
                      <span className="relative">{landingFormButtonText || "马上测试"} ➔</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
          <div className="mt-5 flex shrink-0 justify-end gap-3 border-t border-neutral-800 pt-4">
            <button type="button" onClick={() => setShowLandingModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-neutral-800">取消</button>
            <button type="button" onClick={saveLandingCampaign} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存</button>
          </div>
        </div>
      </div>
    );
  };

  const renderItemModal = () => {
    if (!showItemModal) return null;
    const isLastStep = itemFormStep === "details";
    const resolvedMode = getResolvedItemAssessmentMode();

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#020617] p-6">
        <div className="flex h-[min(680px,calc(100vh-3rem))] w-[min(1180px,calc(100vw-3rem))] flex-col rounded-3xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl shadow-black">
          <div className="mb-4 flex shrink-0 items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-[#9CE6CF]">{editingItemId ? "编辑测算内容模板" : "新增测算内容模板"}</h3>
            <button type="button" onClick={() => setShowItemModal(false)} className="rounded-lg border border-neutral-800 p-2 text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-4 grid shrink-0 gap-2 sm:grid-cols-3">
            {itemFormSteps.map((step, index) => {
              const active = itemFormStep === step.key;
              const complete = itemFormSteps.findIndex((item) => item.key === itemFormStep) > index;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => {
                    if (step.key === "basic") setItemFormStep("basic");
                    if (step.key === "questions" && validateBasicItemStep()) setItemFormStep("questions");
                    if (step.key === "details" && validateBasicItemStep() && (getResolvedItemAssessmentMode() !== "quiz_score" || validateQuestionsItemStep())) setItemFormStep("details");
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${
                    active
                      ? "border-[#1D9E75] bg-[#1D9E75] text-slate-950"
                      : complete
                        ? "border-[#1D9E75]/35 bg-[#1D9E75]/10 text-[#1D9E75]"
                        : "border-neutral-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${active ? "bg-slate-950 text-[#1D9E75]" : "bg-neutral-900 text-slate-400"}`}>{index + 1}</span>
                  {step.label}
                </button>
              );
            })}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden pr-1">
            <div className="grid h-full min-h-0 gap-4 overflow-y-auto pr-1 lg:grid-cols-[1.05fr_0.95fr]">
              {itemFormStep === "basic" && <section className="h-full min-h-0 overflow-y-auto rounded-2xl border border-neutral-800 bg-slate-950/60 p-4 lg:col-span-2">
                <div className="space-y-3">
                <div className="text-xs font-bold text-[#1D9E75]">基础信息</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center justify-between">
                      <span>模板名称</span>
                      <span className={`font-mono text-[10px] ${itemName.length >= 30 ? "text-red-400" : "text-slate-500"}`}>
                        {itemName.length}/30
                      </span>
                    </span>
                    <input maxLength={30} value={itemName} onChange={(event) => setItemName(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
                    <span className="block text-[9px] font-medium text-slate-600">字数不超过30个字</span>
                  </label>
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    测算分类
                    <select
                      value={itemCategory}
                      onChange={(event) => {
                        const nextCategory = event.target.value as TestItem["category"];
                        const nextMode = getCategoryAssessmentMode(nextCategory);
                        const nextThemeId = getDefaultFreeReportThemeId(nextCategory);
                        setItemCategory(nextCategory);
                        setItemAssessmentMode(nextMode);
                        setItemFreeReportThemeId(nextThemeId);
                        setItemTarget(getFreeReportThemeTarget(nextThemeId));
                        setItemProfileFields(nextMode === "profile_inference" ? defaultProfileFields : defaultQuizProfileFields);
                        setItemQuestionBankIds([]);
                        setItemQuestionSearch("");
                        if (nextMode === "profile_inference") {
                          if (itemFormStep === "questions") setItemFormStep("details");
                        }
                      }}
                      className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                    >
                      {questionCategoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {categoryLabels[category]}
                        </option>
                      ))}
                    </select>
                    <span className="block text-[9px] font-medium text-slate-600">{categoryHasQuestionEntry(itemCategory) ? "有关联题目入口" : "无关联题目入口"}</span>
                  </label>
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    测算方式
                    <select
                      disabled={itemCategory !== "astrology"}
                      value={resolvedMode}
                      onChange={(event) => {
                        const nextMode = event.target.value as "quiz_score" | "profile_inference";
                        setItemAssessmentMode(nextMode);
                        setItemProfileFields(nextMode === "profile_inference" ? defaultProfileFields : defaultQuizProfileFields);
                        if (nextMode === "profile_inference") {
                          setItemQuestionBankIds([]);
                          if (itemFormStep === "questions") setItemFormStep("details");
                        }
                      }}
                      className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-[#1D9E75] disabled:text-slate-600"
                    >
                      <option value="quiz_score">题库计分</option>
                      <option value="profile_inference">资料推演</option>
                    </select>
                    <span className="block text-[9px] font-medium text-slate-600">{itemCategory === "astrology" ? "星座支持题库计分或资料推演" : "根据测算分类自动匹配"}</span>
                  </label>
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    测算对象
                    <select value={itemTarget} onChange={(event) => setItemTarget(event.target.value as "single" | "double")} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                      <option value="single">单人对象</option>
                      <option value="double">双人关系</option>
                    </select>
                    <span className="block text-[9px] font-medium text-slate-600">双人测算表示测你和 TA 的关系，仍由当前用户单人作答。</span>
                  </label>
                </div>
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500">{resolvedMode === "profile_inference" ? "资料推演字段" : "资料填写字段"}</div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(profileFieldLabels) as Array<keyof typeof profileFieldLabels>).map((field) => (
                        <label key={field} className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-[10px] text-slate-300">
                          <input
                            type="checkbox"
                            checked={itemProfileFields.includes(field)}
                            onChange={(event) => setItemProfileFields((prev) => event.target.checked ? [...prev, field] : prev.filter((item) => item !== field))}
                          />
                          {profileFieldLabels[field]}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>}

              {itemFormStep === "questions" && resolvedMode === "quiz_score" && <section className="flex h-full min-h-0 flex-col rounded-2xl border border-neutral-800 bg-slate-950/60 p-4 lg:col-span-2">
                <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#1D9E75]">选择题目</div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      题目数据来源：题库管理 · 当前仅展示 {categoryLabels[itemCategory]} 分类题目
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openQuestionBankFromItemModal}
                      className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-bold text-slate-300 hover:border-[#1D9E75]/60"
                    >
                      管理题库
                    </button>
                    <div className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-bold text-slate-400">
                      已选 {itemQuestionBankIds.length} / 搜索结果 {selectableQuestionBankRows.length} / 总数 {currentCategoryQuestionBankRows.length}
                    </div>
                  </div>
                </div>
                {resolvedMode === "quiz_score" ? (
                  <>
                    <div className="mb-3 shrink-0">
                      <input
                        value={itemQuestionSearch}
                        onChange={(event) => setItemQuestionSearch(event.target.value)}
                        placeholder={`搜索${categoryLabels[itemCategory]}题目序号、题干、维度、选项`}
                        className="h-10 w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]"
                      />
                    </div>
                    <label className="mb-2 flex shrink-0 items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-xs font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={allSelectableQuestionsSelected}
                        disabled={selectableQuestionIds.length === 0}
                        onChange={(event) => toggleAllSelectableQuestions(event.target.checked)}
                      />
                      全选
                    </label>
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2">
                      {selectableQuestionBankRows.map((question) => (
                        <label key={question.id} className="flex items-start gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 p-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={itemQuestionBankIds.includes(question.id)}
                            onChange={(event) => setItemQuestionBankIds((prev) => event.target.checked ? [...prev, question.id] : prev.filter((id) => id !== question.id))}
                          />
                          <span>
                            <span className="font-mono text-[#1D9E75]">{question.sequence}</span>
                            <span className="ml-2 text-slate-200">{question.question}</span>
                            <span className="mt-1 block text-[10px] text-slate-500">{question.dimension}</span>
                          </span>
                        </label>
                      ))}
                    {currentCategoryQuestionBankRows.length === 0 && (
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-xs text-slate-500">
                        <div className="font-bold text-slate-300">题库管理中当前分类暂无题目</div>
                        <p className="mt-1">请先在题库管理里新增 {categoryLabels[itemCategory]} 分类题目，再回到内容模板选择。</p>
                        <button
                          type="button"
                          onClick={openQuestionBankFromItemModal}
                          className="mt-3 rounded-lg bg-[#1D9E75] px-3 py-1.5 text-[10px] font-bold text-slate-950"
                        >
                          去题库管理新增
                        </button>
                      </div>
                    )}
                    {currentCategoryQuestionBankRows.length > 0 && selectableQuestionBankRows.length === 0 && (
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-xs text-slate-500">
                        <div className="font-bold text-slate-300">未找到匹配题目</div>
                        <p className="mt-1">当前只在 {categoryLabels[itemCategory]} 分类题库内搜索，请换一个关键词。</p>
                      </div>
                    )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-xs text-slate-500">测算方式为资料推演时，不需要选择题库题目。</div>
                )}
              </section>}

              {itemFormStep === "details" && <section className="rounded-2xl border border-neutral-800 bg-slate-950/60 p-4 lg:col-span-2">
                <div className="space-y-3">
                <div className="text-xs font-bold text-[#1D9E75]">详情页配置</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1 text-[10px] font-bold text-slate-500">
                    头图
                    {itemHeroImage ? (
                      <div className="relative aspect-[25/11] w-full overflow-hidden rounded-xl border border-neutral-800 bg-slate-950">
                        <img src={itemHeroImage} alt="头图预览" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setItemHeroImage("")}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-black/70 text-slate-200 hover:border-red-400 hover:text-red-300"
                          aria-label="删除已上传头图"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className="flex aspect-[25/11] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1D9E75]/70 bg-slate-950 text-center hover:border-[#1D9E75] hover:bg-[#1D9E75]/5"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const file = event.dataTransfer.files?.[0];
                          if (!file) return;
                          if (!["image/png", "image/jpeg"].includes(file.type)) {
                            showAdminAlert("头图仅支持 jpg/png 图片。");
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            showAdminAlert("头图大小不能超过5M。");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => setItemHeroImage(String(reader.result || ""));
                          reader.readAsDataURL(file);
                        }}
                      >
                        <UploadCloud className="mb-2 h-8 w-8 text-[#1D9E75]" />
                        <span className="text-xs font-bold text-slate-300">点击或将图片拖拽到这里上传</span>
                        <span className="mt-1 text-[10px] font-medium text-slate-500">推荐尺寸 750 x 324 px，支持 jpg/png，大小不超过5M</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              showAdminAlert("头图大小不能超过5M。");
                              event.target.value = "";
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => setItemHeroImage(String(reader.result || ""));
                            reader.readAsDataURL(file);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div className="space-y-1 text-[10px] font-bold text-slate-500 md:col-span-2">
                    描述正文
                    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-slate-950 focus-within:border-[#1D9E75]">
                      <div className="flex items-center gap-1 border-b border-neutral-800 bg-neutral-900/60 p-1.5">
                        {[
                          { command: "bold", label: "加粗", icon: <Bold className="h-3.5 w-3.5" /> },
                          { command: "italic", label: "斜体", icon: <Italic className="h-3.5 w-3.5" /> },
                          { command: "underline", label: "下划线", icon: <Underline className="h-3.5 w-3.5" /> },
                          { command: "insertUnorderedList", label: "无序列表", icon: <List className="h-3.5 w-3.5" /> },
                          { command: "insertOrderedList", label: "有序列表", icon: <ListOrdered className="h-3.5 w-3.5" /> },
                          { command: "removeFormat", label: "清除格式", icon: <Eraser className="h-3.5 w-3.5" /> }
                        ].map((tool) => (
                          <button
                            key={tool.command}
                            type="button"
                            title={tool.label}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              applyRichTextCommand(tool.command);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-slate-950 text-slate-400 hover:border-[#1D9E75]/60 hover:text-[#1D9E75]"
                          >
                            {tool.icon}
                          </button>
                        ))}
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(event) => setItemDetailBody(event.currentTarget.innerHTML)}
                        className="min-h-[96px] w-full px-3 py-2 text-xs leading-relaxed text-slate-200 outline-none empty:before:text-slate-600 empty:before:content-['请输入描述正文...'] [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:font-bold [&_ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html: itemDetailBody }}
                      />
                    </div>
                  </div>
                  <label className="space-y-1 text-[10px] font-bold text-slate-500 md:col-span-2">
                    免责声明 <span className="text-[#1D9E75]">*</span>
                    <textarea
                      value={itemDisclaimerText}
                      onChange={(event) => setItemDisclaimerText(event.target.value)}
                      rows={3}
                      className="min-h-[86px] w-full resize-none rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs leading-relaxed text-slate-200 outline-none focus:border-[#1D9E75]"
                    />
                  </label>
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    按钮文案
                    <input maxLength={10} value={itemButtonText} onChange={(event) => setItemButtonText(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
                  </label>
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    主色调
                    <input type="color" value={itemThemeColor} onChange={(event) => setItemThemeColor(event.target.value)} className="h-9 w-full rounded-xl border border-neutral-800 bg-slate-950 px-2 py-1 outline-none focus:border-[#1D9E75]" />
                  </label>
                </div>
                </div>
              </section>}

              {itemFormStep === "details" && <section className="rounded-2xl border border-neutral-800 bg-slate-950/60 p-4 lg:col-span-2">
                <div className="space-y-3">
                <div className="text-xs font-bold text-[#1D9E75]">关联付费报告模板</div>
                <select value={itemPromptRefId} onChange={(event) => setItemPromptRefId(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                  {promptTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
                <p className="text-[10px] text-slate-600">付费报告生成时将使用选中的付费报告模板；可在提示词里引用 {"{Free_Report}"} 承接免费结论。</p>
                </div>
              </section>}

              {itemFormStep === "details" && <section className="rounded-2xl border border-neutral-800 bg-slate-950/60 p-4 lg:col-span-2">
                <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-[#1D9E75]">关联免费报告模板</div>
                  <p className="mt-1 text-[10px] text-slate-600">免费报告展示模板固定，这里只选择 12 个主题中的一套规则和文案。</p>
                </div>
                <select
                  value={itemFreeReportThemeId}
                  onChange={(event) => {
                    const nextThemeId = event.target.value;
                    setItemFreeReportThemeId(nextThemeId);
                    setItemTarget(getFreeReportThemeTarget(nextThemeId));
                  }}
                  className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                >
                  {FREE_REPORT_THEME_OPTIONS.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}｜{theme.title}
                    </option>
                  ))}
                </select>
                </div>
              </section>}
            </div>
          </div>
          <div className="mt-4 flex shrink-0 justify-end gap-2">
            <button type="button" onClick={() => setShowItemModal(false)} className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-slate-300">取消</button>
            {itemFormStep !== "basic" && (
              <button type="button" onClick={() => setItemFormStep(getPrevItemFormStep())} className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-slate-300">上一步</button>
            )}
            <button type="button" onClick={isLastStep ? saveItem : goNextItemFormStep} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">
              {isLastStep ? "保存" : getResolvedItemAssessmentMode() !== "quiz_score" && itemFormStep === "basic" ? "下一步：详情页配置" : "下一步"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderItems = () => (
    <>
    <div className="space-y-4">
      <div className="flex gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 w-fit">
        {[
          ["templates", "内容模板列表"],
          ["skus", "商品列表"]
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setItemTab(key as "templates" | "skus")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              itemTab === key ? "bg-[#1D9E75] text-slate-950" : "bg-neutral-900 text-slate-400 hover:text-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {itemTab === "templates" ? (
        <div className="space-y-3">
          <div className="relative z-20 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-[220px] flex-col gap-1 text-xs font-bold text-slate-500">
                模板名称
                <input value={templateNameFilter} onChange={(event) => setTemplateNameFilter(event.target.value)} className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
              </label>
              <div className="relative flex min-w-[240px] flex-col gap-1 text-xs font-bold text-slate-500">
                关联商品
                <button
                  type="button"
                  onClick={() => setOpenTemplateFilterSelect((current) => current === "sku" ? null : "sku")}
                  className="flex h-10 items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-left text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                >
                  <span className="min-w-0 truncate">{templateSkuFilter === "all" ? "全部商品" : productSkus.find((sku) => sku.id === templateSkuFilter)?.name || "全部商品"}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
                {openTemplateFilterSelect === "sku" && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-neutral-800 bg-slate-950 py-1 shadow-2xl shadow-black">
                    {[{ id: "all", name: "全部商品" }, ...productSkus].map((sku) => (
                      <button
                        key={sku.id}
                        type="button"
                        onClick={() => {
                          setTemplateSkuFilter(sku.id);
                          setOpenTemplateFilterSelect(null);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-neutral-900 ${templateSkuFilter === sku.id ? "text-[#1D9E75]" : "text-slate-300"}`}
                      >
                        {sku.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex min-w-[180px] flex-col gap-1 text-xs font-bold text-slate-500">
                测算分类
                <button
                  type="button"
                  onClick={() => setOpenTemplateFilterSelect((current) => current === "category" ? null : "category")}
                  className="flex h-10 items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-left text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                >
                  <span>{templateCategoryFilter === "all" ? "全部分类" : categoryLabels[templateCategoryFilter]}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
                {openTemplateFilterSelect === "category" && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-neutral-800 bg-slate-950 py-1 shadow-2xl shadow-black">
                    {[{ value: "all" as const, label: "全部分类" }, ...questionCategoryOptions.map((category) => ({ value: category, label: categoryLabels[category] }))].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setTemplateCategoryFilter(option.value);
                          setOpenTemplateFilterSelect(null);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-neutral-900 ${templateCategoryFilter === option.value ? "text-[#1D9E75]" : "text-slate-300"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex min-w-[180px] flex-col gap-1 text-xs font-bold text-slate-500">
                创建时间
                <input
                  type="date"
                  value={templateCreatedDateFilter}
                  onChange={(event) => setTemplateCreatedDateFilter(event.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                />
              </label>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/30 p-4">
              <span className="text-xs font-bold text-slate-400">内容模板列表 ({filteredContentTemplates.length})</span>
              <button
                type="button"
                onClick={openCreateItem}
                className="flex items-center gap-1 rounded-xl bg-[#1D9E75] px-3 py-1.5 text-xs font-bold text-slate-950"
              >
                <Plus className="h-3.5 w-3.5" /> 新增内容模板
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1460px] w-full text-left text-xs text-slate-300">
                <thead className="border-b border-neutral-800 bg-[#090d16]/30 text-[10px] text-slate-500">
                  <tr>
                    {["模板ID", "模板名称", "关联商品", "测算分类", "测算模式", "测算对象", "题目数", "付费报告模板", "免费报告模板", "创建时间", "操作"].map((head) => (
                      <th key={head} className="p-3 whitespace-nowrap">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredContentTemplates.map((test) => {
                    const linkedSkus = getProjectSkus(test.id);
                    return (
                      <tr key={test.id} className="hover:bg-neutral-900/30">
                        <td className="p-3 font-mono text-[#1D9E75]">{toEightDigitId(test.id)}</td>
                        <td className="p-3 font-bold text-slate-200">
                          <div className="max-w-[240px] truncate" title={test.name}>{test.name}</div>
                        </td>
                        <td className="p-3">
                          <div className="max-w-[260px] truncate text-slate-400" title={linkedSkus.map((sku) => sku.name).join("、")}>
                            {linkedSkus.length ? linkedSkus.map((sku) => sku.name).join("、") : "未关联商品"}
                          </div>
                        </td>
                        <td className="p-3">{categoryLabels[test.category]}</td>
                        <td className="p-3">{test.assessmentMode === "profile_inference" ? "资料推演" : "题库计分"}</td>
                        <td className="p-3">{test.assessmentTarget === "double" ? "双人关系" : "单人对象"}</td>
                        <td className="p-3 font-mono">{test.questionBankIds?.length || 0}</td>
                        <td className="p-3">
                          <div className="max-w-[220px] truncate text-slate-400" title={getPromptTemplateName(test)}>{getPromptTemplateName(test)}</div>
                        </td>
                        <td className="p-3">
                          <div className="max-w-[220px] truncate text-slate-400" title={getFreeReportThemeLabel(test)}>{getFreeReportThemeLabel(test)}</div>
                        </td>
                        <td className="p-3 text-slate-500">{test.createdAt || "-"}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditItem(test)}
                              className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteContentTemplate(test)}
                              className="rounded-lg border border-red-900/60 bg-red-950/30 px-2 py-1 text-[10px] text-red-400"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredContentTemplates.length === 0 && (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-xs text-slate-500">暂无匹配内容模板</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative z-20 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="grid items-end gap-3 xl:grid-cols-[220px_minmax(360px,1fr)_180px_170px]">
              <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
                商品名称
                <input value={productNameFilter} onChange={(event) => setProductNameFilter(event.target.value)} className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
              </label>
              <FilterDropdown
                id="product-template-filter"
                label="关联模板"
                value={productTemplateFilter}
                minWidth="min-w-0"
                options={[{ value: "all", label: "全部模板" }, ...tests.map((test) => ({ value: test.id, label: test.name }))]}
                onChange={setProductTemplateFilter}
              />
              <FilterDropdown
                id="product-status-filter"
                label="状态"
                value={productStatusFilter}
                minWidth="min-w-0"
                options={[
                  { value: "all", label: "全部状态" },
                  { value: "已上架", label: "启用" },
                  { value: "已下架", label: "停用" }
                ]}
                onChange={(value) => setProductStatusFilter(value as "all" | "已上架" | "已下架")}
              />
              <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
                价格
                <input type="number" min={0} step={0.1} value={productPriceFilter} onChange={(event) => setProductPriceFilter(event.target.value)} className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
              </label>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/30 p-4">
              <span className="text-xs font-bold text-slate-400">商品列表 ({filteredProductSkus.length})</span>
              <button
                type="button"
                onClick={openCreateProduct}
                className="flex items-center gap-1 rounded-xl bg-[#1D9E75] px-3 py-1.5 text-xs font-bold text-slate-950"
              >
                <Plus className="h-3.5 w-3.5" /> 新增商品
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full text-left text-xs text-slate-300">
                <thead className="border-b border-neutral-800 bg-[#090d16]/30 text-[10px] text-slate-500">
                  <tr>
                    {["商品ID", "商品名称", "关联内容模板", "售价", "状态", "操作"].map((head) => (
                      <th key={head} className="p-3 whitespace-nowrap">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredProductSkus.map((sku) => (
                    <tr key={sku.id} className="hover:bg-neutral-900/30">
                      <td className="p-3 font-mono text-[#1D9E75]">{sku.id}</td>
                      <td className="p-3 font-bold text-slate-200">{sku.name}</td>
                      <td className="p-3 text-slate-400">{sku.projectName}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-red-400">￥{sku.price}</span>
                        {sku.originalPrice !== undefined && <span className="ml-2 font-mono text-slate-500 line-through">￥{sku.originalPrice}</span>}
                      </td>
                      <td className="p-3">{getStatusLabel(sku.status)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProduct(sku)}
                            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleProductStatus(sku.id)}
                            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300"
                          >
                            {sku.status === "已上架" ? "停用" : "启用"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProductSkus.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-slate-500">暂无匹配商品，请新增商品并选择关联内容模板</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
    {showProductModal && (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020617] p-6">
        <div className="w-[min(640px,calc(100vw-2rem))] rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl shadow-black">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-[#9CE6CF]">{editingProductId ? "编辑商品" : "新增商品"}</h3>
            <button type="button" onClick={() => setShowProductModal(false)} className="rounded-lg border border-neutral-800 p-2 text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-[10px] font-bold text-slate-500 md:col-span-2">
              <span className="flex items-center justify-between">
                <span>商品名称 <span className="text-[#1D9E75]">*</span></span>
                <span className={`font-mono text-[10px] ${productName.length >= 30 ? "text-red-400" : "text-slate-500"}`}>{productName.length}/30</span>
              </span>
              <input maxLength={30} value={productName} onChange={(event) => setProductName(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
            </label>
            <label className="space-y-1 text-[10px] font-bold text-slate-500 md:col-span-2">
              关联内容模板 <span className="text-[#1D9E75]">*</span>
              <select
                value={productTemplateId}
                onChange={(event) => {
                  const template = tests.find((test) => test.id === event.target.value);
                  setProductTemplateId(event.target.value);
                  if (template && !productName.trim()) {
                    setProductName(`${template.name} 标准售卖SKU`);
                    setProductPrice(String(template.price));
                    setProductOriginalPrice(String(template.originalPrice));
                  }
                }}
                className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
              >
                <option value="">请选择内容模板</option>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>{test.name}</option>
                ))}
              </select>
              <span className="block text-[9px] font-medium text-slate-600">商品将使用该内容模板的题目、详情页配置与AI报告模板。</span>
            </label>
            <label className="space-y-1 text-[10px] font-bold text-slate-500">
              售价 <span className="text-[#1D9E75]">*</span>
              <input type="number" min={0} step={0.1} value={productPrice} onChange={(event) => setProductPrice(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
              <span className="block text-[9px] font-medium text-slate-600">售价为0时表示免费。</span>
            </label>
            <label className="space-y-1 text-[10px] font-bold text-slate-500">
              划线价格
              <input type="number" min={0} step={0.1} value={productOriginalPrice} onChange={(event) => setProductOriginalPrice(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
            </label>
            <label className="space-y-1 text-[10px] font-bold text-slate-500 md:col-span-2">
              状态
              <select value={productStatus} onChange={(event) => setProductStatus(event.target.value as "已上架" | "已下架")} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                <option value="已上架">启用</option>
                <option value="已下架">停用</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setShowProductModal(false)} className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-slate-300">取消</button>
            <button type="button" onClick={saveProduct} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存</button>
          </div>
        </div>
      </div>
    )}
    </>
  );

  const renderQuestionBank = () => (
    <div className="space-y-3">
      <div className="relative z-20 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="grid items-end gap-3 md:grid-cols-[240px_190px]">
          <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
            题目关键字
            <input
              maxLength={30}
              value={questionKeywordFilter}
              onChange={(event) => setQuestionKeywordFilter(event.target.value)}
              placeholder="输入题目关键字筛选"
              className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
            />
          </label>
          <FilterDropdown
            id="question-category-filter"
            label="题目分类"
            value={questionFilter}
            minWidth="min-w-0"
            options={[{ value: "all", label: "全部分类" }, ...questionCategoryOptions.map((category) => ({ value: category, label: categoryLabels[category] }))]}
            onChange={(value) => setQuestionFilter(value as "all" | TestItem["category"])}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-900/30 p-4">
          <span className="text-xs font-bold text-slate-400">题库列表 ({filteredQuestionBankRows.length})</span>
          <button
            type="button"
            onClick={openCreateQuestion}
            className="flex items-center gap-1 rounded-xl bg-[#1D9E75] px-3 py-1.5 text-xs font-bold text-slate-950"
          >
            <Plus className="h-3.5 w-3.5" /> 新增题目
          </button>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1040px] w-full text-left text-xs text-slate-300">
          <thead className="border-b border-neutral-800 bg-[#090d16]/30 text-[10px] text-slate-500">
            <tr>
              {[
                "题目序号",
                "题目标题",
                "题目选项",
                "关联内容模板",
                "操作"
              ].map((head) => (
                <th key={head} className="p-3 whitespace-nowrap">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filteredQuestionBankRows.map((item, index) => {
              const linkedTemplates = getQuestionLinkedTemplates(item.id);
              const linkedTemplateNames = linkedTemplates.map((template) => template.name).join("、");
              const visibleLinkedTemplates = linkedTemplates.slice(0, 2);
              const hiddenLinkedTemplateCount = Math.max(0, linkedTemplates.length - visibleLinkedTemplates.length);
              const optionDisplay = item.options.map((option, index) => formatQuestionOptionForList(item, option, index)).join(" / ");
              const category = item.category as (typeof questionCategoryOptions)[number];
              const showCategoryGroup = questionFilter === "all" && (index === 0 || filteredQuestionBankRows[index - 1].category !== item.category);
              return (
                <React.Fragment key={item.id}>
                  {showCategoryGroup && (
                    <tr className="bg-neutral-900/50">
                      <td colSpan={5} className="px-3 py-2">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${questionCategoryBadgeClasses[category]}`}>
                          {questionCategoryLabels[category]}
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-neutral-900/30">
                    <td className="p-3 font-mono">{item.sequence}</td>
                    <td className="p-3"><div className="max-w-[260px] truncate" title={item.question}>{item.question}</div></td>
                    <td className="p-3 text-slate-400">
                      <div className="max-w-[520px] truncate" title={optionDisplay}>{optionDisplay}</div>
                    </td>
                    <td className="p-3">
                      {linkedTemplates.length > 0 ? (
                        <div className="max-w-[280px]" title={linkedTemplateNames}>
                          <div className="mb-1 inline-flex rounded-full border border-indigo-500/40 bg-indigo-950/40 px-2 py-0.5 text-[10px] font-bold text-indigo-200">
                            {linkedTemplates.length} 个模板
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {visibleLinkedTemplates.map((template) => (
                              <span key={template.id} className="max-w-[128px] truncate rounded-md border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] text-slate-300">
                                {template.name}
                              </span>
                            ))}
                            {hiddenLinkedTemplateCount > 0 && (
                              <span className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] text-slate-500">
                                +{hiddenLinkedTemplateCount}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEditQuestion(item)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300">编辑</button>
                        <button type="button" onClick={() => deleteQuestion(item.id)} className="rounded-lg border border-red-900/60 bg-red-950/30 px-2 py-1 text-[10px] text-red-400">删除</button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
            {filteredQuestionBankRows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-slate-500">暂无匹配题目</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      {showQuestionModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#020617] p-6">
          <div className="flex h-[min(640px,calc(100vh-3rem))] w-[min(760px,calc(100vw-2rem))] flex-col rounded-2xl border border-neutral-700 bg-[#202020] p-5 shadow-2xl shadow-black">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">{editingQuestionId ? "编辑题目" : "新增题目"}</h3>
              <button type="button" onClick={() => setShowQuestionModal(false)} className="rounded-lg border border-neutral-600 p-2 text-slate-300 hover:bg-neutral-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-[104px_1fr]">
                <label className="space-y-1.5 text-xs font-bold text-slate-400">
                  题目序号
                  <input
                    inputMode="numeric"
                    value={questionSequence}
                    onChange={(event) => setQuestionSequence(event.target.value)}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-2 text-center text-base font-bold text-slate-950 outline-none focus:border-[#1D9E75]"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-bold text-slate-400">
                  题目内容 <span className="text-[#1D9E75]">*</span>
                  <textarea
                    maxLength={100}
                    value={questionContent}
                    onChange={(event) => setQuestionContent(event.target.value)}
                    placeholder="请输入题目正文..."
                    rows={3}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#1D9E75]"
                  />
                </label>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400">
                    所属分类 <span className="text-[#1D9E75]">*</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {questionCategoryOptions.map((category) => {
                      const active = questionCategory === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          disabled={Boolean(editingQuestionId)}
                          onClick={() => {
                            const rows = getQuestionFormRows();
                            const nextDimensions = getIndependentDimensionOptions(category);
                            setQuestionCategory(category);
                            setQuestionSequence(String(getNextQuestionSequence(category)));
                            setQuestionDimension(getDefaultQuestionDimension(category));
                            setQuestionScores(
                              rows
                                .map((row, index) => {
                                  const scoreParts = parseScoreParts(row.score);
                                  const numericScore = scoreParts.scoreValue || (index < 2 ? "2" : "1");
                                  if (category === "mbti") {
                                    const poles = mbtiDimensionOptions[0].poles;
                                    return buildQuestionScore(poles[index % 2], numericScore);
                                  }
                                  return buildQuestionScore(
                                    nextDimensions.includes(scoreParts.dimensionOrPole)
                                      ? scoreParts.dimensionOrPole
                                      : nextDimensions[index % Math.max(1, nextDimensions.length)] || `维度${questionOptionLabels[index]}`,
                                    numericScore
                                  );
                                })
                                .join("\n")
                            );
                          }}
                          className={`rounded-full border px-3.5 py-2 text-xs font-bold ${
                            active
                              ? "border-[#1D9E75] bg-[#1D9E75]/80 text-white"
                              : "border-neutral-600 bg-neutral-800 text-slate-300 hover:border-[#1D9E75] disabled:bg-neutral-800/50 disabled:text-slate-600"
                          }`}
                        >
                          {questionCategoryLabels[category]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {questionCategory === "mbti" && <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400">计分维度 <span className="text-[#1D9E75]">*</span></div>
                  <div className="flex flex-wrap gap-2">
                      {mbtiDimensionOptions.map((dimension) => {
                        const active = questionDimension === dimension.value;
                        return (
                          <button
                            key={dimension.value}
                            type="button"
                            onClick={() => {
                              const rows = getQuestionFormRows();
                              setQuestionDimension(dimension.value);
                              setQuestionScores(
                                rows
                                  .map((row, index) => {
                                    const numericScore = parseScoreParts(row.score).scoreValue || "2";
                                    return buildQuestionScore(dimension.poles[index % 2], numericScore);
                                  })
                                  .join("\n")
                              );
                            }}
                            className={`rounded-lg border px-4 py-2 text-xs font-bold ${
                              active
                                ? "border-[#1D9E75] bg-[#1D9E75]/80 text-white"
                                : "border-neutral-600 bg-neutral-800 text-slate-300 hover:border-[#1D9E75]"
                            }`}
                          >
                            {dimension.label.split("（")[0]}
                          </button>
                        );
                      })}
                    </div>
                </div>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400">选项与得分 <span className="text-[#1D9E75]">*</span></div>
                  <span className="rounded-full bg-neutral-800 px-2 py-1 text-[10px] font-bold text-slate-400">
                    {getQuestionFormRows().length}/4
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-neutral-700">
                  {getQuestionFormRows().map((row, index) => {
                    const scoreParts = parseScoreParts(row.score);
                    const mbtiDimension = getSelectedMbtiDimension();
                    const independentDimensions = getIndependentDimensionOptions(questionCategory);
                    return (
                      <div
                        key={index}
                        className={`grid items-center gap-2 border-b border-neutral-700 bg-neutral-900/35 p-2 last:border-b-0 ${
                          questionCategory === "mbti"
                            ? "grid-cols-[34px_1fr_106px_88px_32px]"
                            : "grid-cols-[34px_1fr_150px_88px_32px]"
                        }`}
                      >
                          <span className="text-center text-xs font-bold text-slate-400">{questionOptionLabels[index]}.</span>
                          <input
                            value={row.option}
                            onChange={(event) => updateQuestionOptionRow(index, "option", event.target.value)}
                            placeholder="选项内容"
                            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#1D9E75]"
                          />
                          {questionCategory === "mbti" ? (
                            <div className="flex gap-1">
                              {mbtiDimension.poles.map((pole) => {
                                const activePole = (scoreParts.dimensionOrPole || mbtiDimension.poles[0]).toUpperCase() === pole;
                                return (
                                  <button
                                    key={pole}
                                    type="button"
                                    onClick={() => updateQuestionOptionRow(index, "dimensionOrPole", pole)}
                                    className={`h-9 min-w-12 rounded-md border px-3 text-xs font-bold ${
                                      activePole
                                        ? "border-[#1D9E75] bg-[#1D9E75] text-white"
                                        : "border-neutral-600 bg-neutral-800 text-slate-300 hover:border-[#1D9E75]"
                                    }`}
                                  >
                                    {pole}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <select
                              value={independentDimensions.includes(scoreParts.dimensionOrPole) ? scoreParts.dimensionOrPole : independentDimensions[0] || ""}
                              onChange={(event) => updateQuestionOptionRow(index, "dimensionOrPole", event.target.value)}
                              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#1D9E75]"
                            >
                              {independentDimensions.map((dimension) => (
                                <option key={dimension} value={dimension}>{dimension}</option>
                              ))}
                            </select>
                          )}
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={scoreParts.scoreValue}
                            onChange={(event) => updateQuestionOptionRow(index, "scoreValue", event.target.value)}
                            placeholder="得分"
                            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-center text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#1D9E75]"
                          />
                          <button
                            type="button"
                            onClick={() => removeQuestionOptionRow(index)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-700 text-slate-500 hover:border-red-500 hover:text-red-300"
                            aria-label={`删除选项${questionOptionLabels[index]}`}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={addQuestionOptionRow}
                  className="mx-auto block rounded-md px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-[#1D9E75] disabled:text-neutral-700"
                  disabled={getQuestionFormRows().length >= 4}
                >
                  + 添加选项
                </button>
              </div>
            </div>
            <div className="mt-5 flex shrink-0 justify-end gap-3 border-t border-neutral-700 pt-5">
              <button type="button" onClick={() => setShowQuestionModal(false)} className="rounded-md px-5 py-2 text-xs font-bold text-slate-400 hover:bg-neutral-800">取消</button>
              <button type="button" onClick={saveQuestion} className="rounded-md bg-[#1D9E75] px-5 py-2 text-xs font-bold text-white hover:bg-[#31B58C]">保存题目</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOperation = () => {
    const operationTabs: Array<[typeof operationTab, string]> = [
      ["recommend", "推荐列表"],
      ["shortcut", "金刚区列表"],
      ["conversion", "转化推荐列表"]
    ];
    const tableClass = "min-w-[1040px] w-full text-left text-xs text-slate-300";
    const headClass = "border-b border-neutral-800 bg-[#090d16]/30 text-[10px] text-slate-500";
    const recommendationImageSpec = getRecommendationImageSpec(recommendPosition);
    const filteredRecommendations = [...(slides || [])]
      .filter((item) => {
        const keyword = recommendNameFilter.trim().toLowerCase();
        const name = `${item.name || ""} ${item.title || ""}`.toLowerCase();
        const position = item.displayPosition || "首页顶部";
        const status = item.status || "已上架";
        return (!keyword || name.includes(keyword)) &&
          (recommendPositionFilter === "all" || position === recommendPositionFilter) &&
          (recommendStatusFilter === "all" || status === recommendStatusFilter);
      })
      .sort((a, b) => {
        const aPosition = recommendationPositionOrder[a.displayPosition || "首页顶部"] ?? 99;
        const bPosition = recommendationPositionOrder[b.displayPosition || "首页顶部"] ?? 99;
        if (aPosition !== bPosition) return aPosition - bPosition;
        return Number(a.sortOrder || a.id) - Number(b.sortOrder || b.id);
      });
    const filteredShortcuts = [...(shortcuts || [])]
      .filter((item) => {
        const keyword = shortcutNameFilter.trim().toLowerCase();
        const status = item.status || "已上架";
        return (!keyword || item.label.toLowerCase().includes(keyword)) &&
          (shortcutStatusFilter === "all" || status === shortcutStatusFilter);
      })
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    const filteredConversions = [...(conversionRecs || [])]
      .filter((item) => {
        const keyword = conversionNameFilter.trim().toLowerCase();
        const status = item.status || "已上架";
        return (!keyword || item.name.toLowerCase().includes(keyword)) &&
          (conversionStatusFilter === "all" || status === conversionStatusFilter);
      })
      .sort((a, b) => {
        if (a.scene !== b.scene) return a.scene === "prepay" ? -1 : 1;
        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 w-fit">
            {operationTabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setOperationTab(key)}
                className={`rounded-xl px-4 py-2 text-xs font-bold ${operationTab === key ? "bg-[#1D9E75] text-slate-950" : "bg-neutral-900 text-slate-400 hover:text-slate-100"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (operationTab === "recommend") createSlide();
              if (operationTab === "shortcut") createShortcut();
              if (operationTab === "conversion") createConversionRec();
            }}
            className="flex items-center gap-1 rounded-xl bg-[#1D9E75] px-3 py-2 text-xs font-bold text-slate-950"
          >
            <Plus className="h-3.5 w-3.5" /> 新增配置
          </button>
        </div>
        {operationNotice && (
          <div className="rounded-xl border border-[#1D9E75]/30 bg-[#1D9E75]/10 px-3 py-2 text-xs font-bold text-[#1D9E75]">{operationNotice}</div>
        )}
        {operationTab === "recommend" && (
          <div className="relative z-20 grid items-end gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 md:grid-cols-3">
            <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
              推荐位名称
              <input value={recommendNameFilter} onChange={(event) => setRecommendNameFilter(event.target.value)} className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="名称输入框" />
            </label>
            <FilterDropdown
              id="recommend-position-filter"
              label="展示位置"
              value={recommendPositionFilter}
              minWidth="min-w-0"
              options={[
                { value: "all", label: "全部位置" },
                { value: "首页顶部", label: "首页顶部" },
                { value: "首页中部", label: "首页中部" },
                { value: "商品列表", label: "商品列表" }
              ]}
              onChange={(value) => setRecommendPositionFilter(value as typeof recommendPositionFilter)}
            />
            <FilterDropdown
              id="recommend-status-filter"
              label="状态"
              value={recommendStatusFilter}
              minWidth="min-w-0"
              options={[
                { value: "all", label: "全部状态" },
                { value: "已上架", label: "已上架" },
                { value: "已下架", label: "已下架" }
              ]}
              onChange={(value) => setRecommendStatusFilter(value as typeof recommendStatusFilter)}
            />
          </div>
        )}
        {operationTab === "shortcut" && (
          <div className="relative z-20 grid items-end gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 md:grid-cols-2">
              <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
                金刚区名称
                <input value={shortcutNameFilter} onChange={(event) => setShortcutNameFilter(event.target.value)} className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="名称输入框" />
              </label>
              <FilterDropdown
                id="shortcut-status-filter"
                label="状态"
                value={shortcutStatusFilter}
                minWidth="min-w-0"
                options={[
                  { value: "all", label: "全部状态" },
                  { value: "已上架", label: "已上架" },
                  { value: "已下架", label: "已下架" }
                ]}
                onChange={(value) => setShortcutStatusFilter(value as typeof shortcutStatusFilter)}
              />
          </div>
        )}
        {operationTab === "conversion" && (
          <div className="relative z-20 grid items-end gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 md:grid-cols-2">
            <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
              推荐位名称
              <input value={conversionNameFilter} onChange={(event) => setConversionNameFilter(event.target.value)} className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="名称输入框" />
            </label>
            <FilterDropdown
              id="conversion-status-filter"
              label="状态"
              value={conversionStatusFilter}
              minWidth="min-w-0"
              options={[
                { value: "all", label: "全部状态" },
                { value: "已上架", label: "已上架" },
                { value: "已下架", label: "已下架" }
              ]}
              onChange={(value) => setConversionStatusFilter(value as typeof conversionStatusFilter)}
            />
          </div>
        )}
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="overflow-x-auto">
            {operationTab === "recommend" && (
              <table className={tableClass}>
                <thead className={headClass}><tr>{["推荐位ID", "推荐名称", "展示位置", "跳转类型", "关联商品/链接", "排序", "状态", "推荐位图", "操作"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredRecommendations.map((item, index) => {
                    const position = item.displayPosition || "首页顶部";
                    const prevPosition = filteredRecommendations[index - 1]?.displayPosition || "首页顶部";
                    const showPositionGroup = recommendPositionFilter === "all" && (index === 0 || prevPosition !== position);
                    return (
                      <React.Fragment key={item.id}>
                        {showPositionGroup && (
                          <tr className="bg-neutral-900/50">
                            <td colSpan={9} className="px-3 py-2">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${recommendationPositionBadgeClasses[position] || "border-neutral-700 bg-neutral-900 text-slate-300"}`}>
                                {position}
                              </span>
                            </td>
                          </tr>
                        )}
                        <tr className="hover:bg-neutral-900/30">
                          <td className="p-3 font-mono text-[#1D9E75]">{item.id}</td>
                          <td className="p-3 font-bold text-slate-200">{item.name || item.title}</td>
                          <td className="p-3">{position}</td>
                          <td className="p-3">{item.targetType === "link" ? "链接" : "商品"}</td>
                          <td className="p-3 text-slate-400">{getRecommendationTargetLabel(item)}</td>
                          <td className="p-3 font-mono">{item.sortOrder ?? item.id}</td>
                          <td className="p-3">{item.status || "已上架"}</td>
                          <td className="p-3">{getRecommendationImageLabel(item)}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button type="button" onClick={() => updateSlideStatus(item)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300">{item.status === "已下架" ? "上架" : "下架"}</button>
                              <button type="button" onClick={() => openEditRecommendation(item)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300">编辑</button>
                              <button type="button" onClick={() => deleteSlide(item.id)} className="rounded-lg border border-red-900/60 bg-red-950/30 px-2 py-1 text-[10px] text-red-400">删除</button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                  {filteredRecommendations.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-xs text-slate-500">暂无匹配推荐位</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {operationTab === "shortcut" && (
              <table className={tableClass}>
                <thead className={headClass}><tr>{["金刚区ID", "金刚区名称", "排序", "跳转类型", "关联商品/链接", "状态", "icon图", "操作"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredShortcuts.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-900/30">
                      <td className="p-3 font-mono text-[#1D9E75]">{item.id}</td>
                      <td className="p-3 font-bold text-slate-200">{item.label}</td>
                      <td className="p-3 font-mono">{item.sortOrder ?? 0}</td>
                      <td className="p-3">{item.targetType === "link" ? "链接" : "商品"}</td>
                      <td className="p-3 text-slate-400">{getShortcutTargetLabel(item)}</td>
                      <td className="p-3">{item.status || "已上架"}</td>
                      <td className="p-3">{item.icon ? "已上传/已配置" : "未上传"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => updateShortcutStatus(item)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300">{(item.status || "已上架") === "已下架" ? "上架" : "下架"}</button>
                          <button type="button" onClick={() => openEditShortcut(item)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300">编辑</button>
                          <button type="button" onClick={() => deleteShortcut(item.id)} className="rounded-lg border border-red-900/60 bg-red-950/30 px-2 py-1 text-[10px] text-red-400">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredShortcuts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-xs text-slate-500">暂无匹配金刚区入口</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {operationTab === "conversion" && (
              <table className={tableClass}>
                <thead className={headClass}><tr>{["推荐ID", "推荐名称", "展示场景", "跳转类型", "关联商品/链接", "排序", "开始时间", "结束时间", "状态", "展示图", "操作"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredConversions.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-900/30">
                      <td className="p-3 font-mono text-[#1D9E75]">{item.id}</td>
                      <td className="p-3 font-bold text-slate-200">{item.name}</td>
                      <td className="p-3">{item.scene === "prepay" ? "未付费" : "已付费"}</td>
                      <td className="p-3">{item.targetType === "link" ? "链接" : "商品"}</td>
                      <td className="p-3 text-slate-400">{getConversionTargetLabel(item)}</td>
                      <td className="p-3 font-mono">{item.sortOrder}</td>
                      <td className="p-3 text-slate-500">{item.startAt}</td>
                      <td className="p-3 text-slate-500">{item.endAt}</td>
                      <td className="p-3">{item.status || "已上架"}</td>
                      <td className="p-3">{item.imageUrl ? "已上传" : "未上传"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => updateConversionStatus(item)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300">{(item.status || "已上架") === "已下架" ? "上架" : "下架"}</button>
                          <button type="button" onClick={() => openEditConversion(item)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] text-slate-300">编辑</button>
                          <button type="button" onClick={() => deleteConversionRec(item.id)} className="rounded-lg border border-red-900/60 bg-red-950/30 px-2 py-1 text-[10px] text-red-400">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredConversions.length === 0 && (
                    <tr>
                      <td colSpan={11} className="p-6 text-center text-xs text-slate-500">暂无匹配转化推荐位</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {showRecommendModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020617] p-6">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-[#0b0f18] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{editingRecommendId ? "编辑推荐位" : "新增推荐位"}</h3>
                  <p className="mt-1 text-[10px] text-slate-500">推荐位 ID {editingRecommendId || "保存时自动生成4位数字"}</p>
                </div>
                <button type="button" onClick={() => setShowRecommendModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-neutral-800 hover:text-slate-200" aria-label="关闭">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  推荐名称
                  <input maxLength={30} value={recommendName} onChange={(event) => setRecommendName(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="字数不超过30个字" />
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  展示位置
                  <select
                    value={recommendPosition}
                    onChange={(event) => {
                      const nextPosition = event.target.value as typeof recommendPosition;
                      setRecommendPosition(nextPosition);
                      if (!editingRecommendId) setRecommendSortOrder(String(getNextRecommendationSort(nextPosition)));
                    }}
                    className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                  >
                    <option value="首页顶部">首页顶部</option>
                    <option value="首页中部">首页中部</option>
                    <option value="商品列表">商品列表</option>
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  排序
                  <input inputMode="numeric" value={recommendSortOrder} onChange={(event) => setRecommendSortOrder(event.target.value.replace(/[^\d]/g, ""))} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  状态
                  <select value={recommendStatus} onChange={(event) => setRecommendStatus(event.target.value as typeof recommendStatus)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                    <option value="已上架">已上架</option>
                    <option value="已下架">已下架</option>
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  跳转类型
                  <select value={recommendTargetType} onChange={(event) => setRecommendTargetType(event.target.value as typeof recommendTargetType)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                    <option value="product">商品</option>
                    <option value="link">链接</option>
                  </select>
                </label>
                {recommendTargetType === "product" ? (
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    关联商品
                    <select value={recommendTargetSkuId} onChange={(event) => setRecommendTargetSkuId(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                      <option value="">请选择商品</option>
                      {productSkus.map((sku) => (
                        <option key={sku.id} value={sku.id}>{sku.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    链接地址
                    <input value={recommendLinkUrl} onChange={(event) => setRecommendLinkUrl(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="https://..." />
                  </label>
                )}
                <div className="space-y-2 md:col-span-2">
                  <div className="text-[10px] font-bold text-slate-500">推荐位图</div>
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleRecommendationImageUpload(event.dataTransfer.files?.[0]);
                    }}
                    className={`relative overflow-hidden rounded-xl border border-dashed border-[#1D9E75]/80 bg-[#15110d] transition-colors hover:border-[#1D9E75] ${recommendationImageSpec.frameClass}`}
                  >
                    {recommendImageUrl ? (
                      <>
                        <img src={recommendImageUrl} alt="推荐位图预览" className="absolute inset-0 h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setRecommendImageUrl("")}
                          className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-black/70 text-slate-200 hover:border-red-400 hover:text-red-300"
                          aria-label="删除已上传推荐位图"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <label className="flex h-full min-h-[178px] cursor-pointer flex-col items-center justify-center px-4 py-8 text-center">
                        <UploadCloud className="mb-2 h-8 w-8 text-[#1D9E75]" />
                        <span className="text-xs font-bold text-slate-100">点击或将图片拖拽到这里上传</span>
                        <span className="mt-1 text-[10px] font-medium text-slate-500">{recommendationImageSpec.label}；支持 jpg/png，大小不超过5M</span>
                        <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => handleRecommendationImageUpload(event.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3 border-t border-neutral-800 pt-4">
                <button type="button" onClick={() => setShowRecommendModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-neutral-800">取消</button>
                <button type="button" onClick={saveRecommendation} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存</button>
              </div>
            </div>
          </div>
        )}
        {showShortcutModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020617] p-6">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-[#0b0f18] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{editingShortcutId ? "编辑金刚区入口" : "新增金刚区入口"}</h3>
                  <p className="mt-1 text-[10px] text-slate-500">入口添加成功默认上架；H5 发现页仅展示已上架入口</p>
                </div>
                <button type="button" onClick={() => setShowShortcutModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-neutral-800 hover:text-slate-200" aria-label="关闭">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  金刚区名称
                  <input maxLength={10} value={shortcutLabel} onChange={(event) => setShortcutLabel(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="字数不超过10个字" />
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  排序
                  <input inputMode="numeric" value={shortcutSortOrder} onChange={(event) => setShortcutSortOrder(event.target.value.replace(/[^\d]/g, ""))} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  状态
                  <select value={shortcutStatus} onChange={(event) => setShortcutStatus(event.target.value as typeof shortcutStatus)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                    <option value="已上架">已上架</option>
                    <option value="已下架">已下架</option>
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  主题色
                  <select value={shortcutColorTheme} onChange={(event) => setShortcutColorTheme(event.target.value as ShortcutItem["colorTheme"])} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                    {["indigo", "amber", "pink", "purple", "emerald", "rose", "teal"].map((theme) => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  跳转类型
                  <select value={shortcutTargetType} onChange={(event) => setShortcutTargetType(event.target.value as typeof shortcutTargetType)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                    <option value="product">商品</option>
                    <option value="link">链接</option>
                  </select>
                </label>
                {shortcutTargetType === "product" ? (
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    关联商品
                    <select value={shortcutTargetSkuId} onChange={(event) => setShortcutTargetSkuId(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                      <option value="">请选择商品</option>
                      {productSkus.map((sku) => (
                        <option key={sku.id} value={sku.id}>{sku.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    链接地址
                    <input value={shortcutLinkUrl} onChange={(event) => setShortcutLinkUrl(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="https://..." />
                  </label>
                )}
                <div className="space-y-2 md:col-span-2">
                  <div className="text-[10px] font-bold text-slate-500">icon图</div>
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleShortcutIconUpload(event.dataTransfer.files?.[0]);
                    }}
                    className="relative aspect-square min-h-[180px] max-w-[210px] overflow-hidden rounded-xl border border-dashed border-[#1D9E75]/80 bg-[#15110d] transition-colors hover:border-[#1D9E75]"
                  >
                    {/^(data:image|blob:|https?:\/\/)/.test(shortcutIcon) ? (
                      <>
                        <img src={shortcutIcon} alt="金刚区icon预览" className="absolute inset-0 h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setShortcutIcon("")}
                          className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-black/70 text-slate-200 hover:border-red-400 hover:text-red-300"
                          aria-label="删除已上传金刚区icon图"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <label className="flex h-full min-h-[180px] cursor-pointer flex-col items-center justify-center px-4 py-6 text-center">
                        <UploadCloud className="mb-2 h-8 w-8 text-[#1D9E75]" />
                        <span className="text-xs font-bold text-slate-100">点击或将图片拖拽到这里上传</span>
                        <span className="mt-1 text-[10px] font-medium text-slate-500">推荐尺寸 300 x 300 px，圆角方图；支持 jpg/png，大小不超过5M</span>
                        <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => handleShortcutIconUpload(event.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3 border-t border-neutral-800 pt-4">
                <button type="button" onClick={() => setShowShortcutModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-neutral-800">取消</button>
                <button type="button" onClick={saveShortcut} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存</button>
              </div>
            </div>
          </div>
        )}
        {showConversionModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020617] p-6">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-[#0b0f18] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{editingConversionId ? "编辑转化推荐位" : "新增转化推荐位"}</h3>
                  <p className="mt-1 text-[10px] text-slate-500">未付费在收银台停留约9秒触发；已付费在阅读报告底部或停留后触发，每个订单仅弹一次。</p>
                </div>
                <button type="button" onClick={() => setShowConversionModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-neutral-800 hover:text-slate-200" aria-label="关闭">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  推荐名称
                  <input maxLength={30} value={conversionName} onChange={(event) => setConversionName(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="字数不超过30个字" />
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  展示场景
                  <select
                    value={conversionScene}
                    onChange={(event) => {
                      const nextScene = event.target.value as typeof conversionScene;
                      setConversionScene(nextScene);
                      if (!editingConversionId) setConversionSortOrder(String(getNextConversionSort(nextScene)));
                    }}
                    className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                  >
                    <option value="prepay">未付费</option>
                    <option value="paid">已付费</option>
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  排序
                  <input inputMode="numeric" value={conversionSortOrder} onChange={(event) => setConversionSortOrder(event.target.value.replace(/[^\d]/g, ""))} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  状态
                  <select value={conversionStatus} onChange={(event) => setConversionStatus(event.target.value as typeof conversionStatus)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                    <option value="已上架">已上架</option>
                    <option value="已下架">已下架</option>
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  跳转类型
                  <select value={conversionTargetType} onChange={(event) => setConversionTargetType(event.target.value as typeof conversionTargetType)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                    <option value="product">商品</option>
                    <option value="link">链接</option>
                  </select>
                </label>
                {conversionTargetType === "product" ? (
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    关联商品
                    <select value={conversionTargetSkuId} onChange={(event) => setConversionTargetSkuId(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                      <option value="">请选择商品</option>
                      {productSkus.map((sku) => (
                        <option key={sku.id} value={sku.id}>{sku.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="space-y-1 text-[10px] font-bold text-slate-500">
                    链接地址
                    <input value={conversionLinkUrl} onChange={(event) => setConversionLinkUrl(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" placeholder="https://..." />
                  </label>
                )}
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  展示开始时间
                  <input type="datetime-local" value={conversionStartAt} onChange={(event) => setConversionStartAt(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
                </label>
                <label className="space-y-1 text-[10px] font-bold text-slate-500">
                  展示结束时间
                  <input type="datetime-local" value={conversionEndAt} onChange={(event) => setConversionEndAt(event.target.value)} className="w-full rounded-xl border border-neutral-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
                </label>
                <div className="space-y-2 md:col-span-2">
                  <div className="text-[10px] font-bold text-slate-500">展示图</div>
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleConversionImageUpload(event.dataTransfer.files?.[0]);
                    }}
                    className="relative aspect-[3/4] min-h-[180px] max-w-[180px] overflow-hidden rounded-xl border border-dashed border-[#1D9E75]/80 bg-[#15110d] transition-colors hover:border-[#1D9E75]"
                  >
                    {conversionImageUrl ? (
                      <>
                        <img src={conversionImageUrl} alt="转化推荐展示图预览" className="absolute inset-0 h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setConversionImageUrl("")}
                          className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-black/70 text-slate-200 hover:border-red-400 hover:text-red-300"
                          aria-label="删除已上传转化展示图"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <label className="flex h-full min-h-[180px] cursor-pointer flex-col items-center justify-center px-4 py-6 text-center">
                        <UploadCloud className="mb-2 h-8 w-8 text-[#1D9E75]" />
                        <span className="text-xs font-bold text-slate-100">点击或将图片拖拽到这里上传</span>
                        <span className="mt-1 text-[10px] font-medium text-slate-500">推荐尺寸 300 x 400 px，竖向缩略图；支持 jpg/png，大小不超过5M</span>
                        <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => handleConversionImageUpload(event.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3 border-t border-neutral-800 pt-4">
                <button type="button" onClick={() => setShowConversionModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-neutral-800">取消</button>
                <button type="button" onClick={saveConversion} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPrompts = () => {
    const managingTemplate = promptTemplates.find((template) => template.id === managingPromptTemplateId);
    return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-500">筛选项</span>
          <button
            type="button"
            onClick={openCreateReportTemplate}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1D9E75] px-3 text-xs font-bold text-slate-950 hover:bg-[#38c59b]"
          >
            <Plus className="h-3.5 w-3.5" />
            新增报告模板
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_220px_auto]">
          <label className="flex min-w-0 flex-col gap-1 text-[10px] font-bold text-slate-500">
            模板搜索
            <input
              value={reportTemplateKeywordFilter}
              onChange={(event) => setReportTemplateKeywordFilter(event.target.value)}
              placeholder="输入模板ID、模板名称、内容模板或报告话术"
              className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-[10px] font-bold text-slate-500">
            关联内容模板
            <select
              value={reportTemplateContentFilter}
              onChange={(event) => setReportTemplateContentFilter(event.target.value)}
              className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
            >
              <option value="all">全部内容模板</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>{test.name}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setReportTemplateKeywordFilter("");
                setReportTemplateContentFilter("all");
              }}
              className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-xs font-bold text-slate-300 hover:border-[#1D9E75]/50 hover:text-[#1D9E75]"
            >
              重置
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-b-2xl border border-[#243044] bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-xs text-slate-300">
            <thead className="border-b border-[#243044] bg-[#111827] text-[11px] text-slate-500">
              <tr>
                {["模板ID", "模板名称", "关联内容模板", "状态", "操作"].map((head) => (
                  <th key={head} className="px-5 py-4 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243044]">
              {filteredReportTemplates.map((template) => {
                const isDisabled = disabledReportTemplateIds.includes(template.id);
                const visibleLinkedTemplates = template.linkedTemplates.slice(0, 2);
                const hiddenLinkedCount = template.linkedTemplates.length - visibleLinkedTemplates.length;
                return (
                <tr key={template.id} className="hover:bg-[#172033]">
                  <td className="px-5 py-4 font-mono text-[#667085]">{template.id}</td>
                  <td className="px-5 py-4 font-bold text-slate-100">{template.name}</td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-[360px] flex-wrap gap-1.5">
                      {visibleLinkedTemplates.length ? visibleLinkedTemplates.map((linkedTemplate) => (
                        <span key={linkedTemplate.id} className="max-w-[180px] truncate rounded-full border border-blue-400/35 bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-200" title={linkedTemplate.name}>
                          {linkedTemplate.name}
                        </span>
                      )) : <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs text-slate-500">未关联内容模板</span>}
                      {hiddenLinkedCount > 0 && (
                        <span className="rounded-full border border-slate-600 bg-slate-700/50 px-3 py-1 text-xs text-slate-400">+{hiddenLinkedCount}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-2 font-bold ${isDisabled ? "text-slate-500" : "text-emerald-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isDisabled ? "bg-slate-500" : "bg-emerald-400"}`} />
                      {isDisabled ? "停用" : "启用"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                      <button type="button" onClick={() => toggleReportTemplateStatus(template.id)} className="text-blue-400 hover:text-blue-300">
                        {isDisabled ? "启用" : "停用"}
                      </button>
                      <button type="button" onClick={() => openEditReportTemplate(template)} className="text-blue-400 hover:text-blue-300">
                        编辑
                      </button>
                      <button type="button" onClick={() => copyReportTemplate(template)} className="text-blue-400 hover:text-blue-300">
                        复制
                      </button>
                      <button type="button" onClick={() => deleteReportTemplate(template)} className="text-red-400 hover:text-red-300">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );})}
              {filteredReportTemplates.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-500">暂无匹配报告模板，请调整筛选条件</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showReportTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] p-4">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 p-5">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{editingReportTemplateId ? "编辑报告模板" : "新增报告模板"}</h3>
                <p className="mt-1 text-[10px] text-slate-500">填写报告生成话术。</p>
              </div>
              <button type="button" onClick={() => { setShowReportTemplateModal(false); setEditingReportTemplateId(null); }} className="rounded-xl p-2 text-slate-500 hover:bg-neutral-900 hover:text-slate-200" aria-label="关闭报告模板弹窗">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
                  模板名称
                  <input
                    maxLength={30}
                    value={reportTemplateName}
                    onChange={(event) => setReportTemplateName(event.target.value)}
                    placeholder="字数不超过30个字"
                    className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]"
                  />
                  <span className="text-right text-[10px] font-medium text-slate-600">{reportTemplateName.length}/30</span>
                </label>
                <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
                  提示词正文
                  <textarea
                    value={reportTemplateContent}
                    onChange={(event) => setReportTemplateContent(event.target.value)}
                    placeholder="请输入报告生成话术。"
                    className="min-h-[280px] resize-y rounded-xl border border-neutral-800 bg-[#030713] px-3 py-3 text-xs leading-6 text-slate-200 outline-none focus:border-[#1D9E75]"
                  />
                </label>
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-neutral-800 p-4">
              <button type="button" onClick={() => { setShowReportTemplateModal(false); setEditingReportTemplateId(null); }} className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-slate-300">取消</button>
              <button type="button" onClick={saveReportTemplate} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存</button>
            </div>
          </div>
        </div>
      )}
      {managingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] p-4">
          <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 p-5">
              <div>
                <h3 className="text-sm font-bold text-slate-100">管理关联内容模板</h3>
                <p className="mt-1 max-w-xl truncate text-[10px] text-slate-500">{managingTemplate.name}</p>
              </div>
              <button type="button" onClick={() => setManagingPromptTemplateId(null)} className="rounded-xl p-2 text-slate-500 hover:bg-neutral-900 hover:text-slate-200" aria-label="关闭关联管理">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5">
              {tests.map((test) => (
                <label key={test.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-800 bg-slate-950/70 p-3 hover:border-[#1D9E75]/50">
                  <input
                    type="checkbox"
                    checked={promptAssociationIds.includes(test.id)}
                    onChange={() => togglePromptAssociation(test.id)}
                    className="h-4 w-4 accent-[#1D9E75]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-slate-200">{test.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{categoryLabels[test.category]}</span>
                      <span className="font-mono">{test.id}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-neutral-800 p-4">
              <span className="text-[10px] text-slate-500">已选择 {promptAssociationIds.length} 个内容模板</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setManagingPromptTemplateId(null)} className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-slate-300">取消</button>
                <button type="button" onClick={savePromptAssociations} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存关联</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  };

  const renderOrders = () => (
    <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="relative z-20 border-b border-neutral-800 bg-neutral-900/30 p-4">
        <div className="grid min-w-[1120px] grid-cols-[210px_170px_210px_180px_190px] items-end gap-4">
          <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
            日期
            <div className="relative">
              <input
                ref={orderDateInputRef}
                type="date"
                value={orderDateFilter}
                onClick={openOrderDatePicker}
                onChange={(event) => setOrderDateFilter(event.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-neutral-800 bg-[#030713] px-3 pr-10 text-xs font-medium text-slate-200 outline-none transition-colors focus:border-[#1D9E75]"
              />
              <button
                type="button"
                aria-label="选择日期"
                onClick={openOrderDatePicker}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-neutral-800 hover:text-[#1D9E75]"
              >
                <Calendar className="h-3.5 w-3.5" />
              </button>
            </div>
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
            订单号
            <input
              value={orderNoFilter}
              onChange={(event) => setOrderNoFilter(event.target.value)}
              placeholder="输入订单号"
              className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs font-medium text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]"
            />
          </label>
          <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-500">
            手机号码
            <input
              value={orderPhoneFilter}
              inputMode="numeric"
              onChange={(event) => setOrderPhoneFilter(event.target.value.replace(/[^\d]/g, ""))}
              placeholder="输入手机号码"
              className="h-10 w-full rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs font-medium text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D9E75]"
            />
          </label>
          <FilterDropdown
            id="order-status-filter"
            label="状态"
            value={orderStatusFilter}
            minWidth="min-w-0"
            widthClass="w-full"
            options={[
              { value: "all", label: "全部" },
              { value: "paid", label: "已支付" },
              { value: "refunded", label: "已退款" },
              { value: "pending", label: "待支付" }
            ]}
            onChange={(value) => setOrderStatusFilter(value as "all" | "paid" | "refunded" | "pending")}
          />
          <FilterDropdown
            id="order-payment-filter"
            label="支付方式"
            value={orderPaymentMethodFilter}
            minWidth="min-w-0"
            widthClass="w-full"
            options={[
              { value: "all", label: "全部" },
              { value: "wechat", label: "微信支付" },
              { value: "alipay", label: "支付宝支付" }
            ]}
            onChange={(value) => setOrderPaymentMethodFilter(value as "all" | "wechat" | "alipay")}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1640px] w-full text-left text-xs text-slate-300">
          <thead className="border-b border-neutral-800 bg-[#090d16]/30 text-[10px] text-slate-500">
            <tr>
              {["日期", "订单号", "用户ID", "手机号码", "测算档案", "下单商品", "提交信息", "订单金额", "支付方式", "退款原因", "订单状态", "操作"].map((head) => (
                <th key={head} className="p-3">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filteredOrders.map((order) => {
              const status = getOrderStatusLabel(order.status);
              const paymentMethod = getOrderPaymentMethodValue(order);
              const account = getOrderAccount(order);
              const hasPartner = hasPartnerProfile(order);
              const canViewReport = canViewOrderReport(order);
              const canRefund = order.status === "paid";
              return (
                <tr key={order.id} className="hover:bg-neutral-900/30">
                  <td className="p-3 font-mono text-[10px] text-slate-400">{formatOrderDateTime(order.createdAt)}</td>
                  <td className="p-3 font-mono text-slate-500">{order.id}</td>
                  <td className="p-3 font-mono text-cyan-400">{account.userId}</td>
                  <td className="p-3 font-mono text-slate-400">{order.phone || ""}</td>
                  <td className="p-3">
                    <div className="space-y-1 font-bold text-slate-200">
                      <div>
                        <span className="text-[10px] font-normal text-slate-500">{hasPartner ? "本人：" : "本人："}</span>
                        {order.userName}
                        {hasPartner && <span className="ml-1 text-[10px] font-normal text-slate-500">({getOrderGenderLabel(order.gender)})</span>}
                      </div>
                      {hasPartner && (
                        <div>
                          <span className="text-[10px] font-normal text-pink-500">对方：</span>
                          {order.partnerName || "未填写"}
                          <span className="ml-1 text-[10px] font-normal text-slate-500">({getOrderGenderLabel(order.partnerGender)})</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-[#1D9E75]">{order.testName}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">
                    {hasPartner ? (
                      <div className="space-y-1">
                        <div><span className="font-sans text-slate-500">本人 </span>{formatProfileDateTime(order.birthDate, order.birthTime)}</div>
                        <div><span className="font-sans text-pink-500">对方 </span>{formatPartnerProfileDateTime(order.partnerBirthDate, order.partnerBirthTime)}</div>
                      </div>
                    ) : (
                      formatProfileDateTime(order.birthDate, order.birthTime)
                    )}
                    {order.quizAnswers && (
                      <div className="mt-0.5 max-w-[180px] truncate font-sans text-[10px] text-[#1D9E75]" title={order.quizAnswers}>
                        答题: {order.quizAnswers}
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-red-400">￥{order.price}</td>
                  <td className="p-3">{paymentMethod === "alipay" ? "支付宝支付" : "微信支付"}</td>
                  <td className="p-3">
                    {order.status === "refunded" ? (
                      <span className="block max-w-[160px] truncate text-slate-400" title={order.refundReason || "后台人工退款"}>
                        {order.refundReason || "后台人工退款"}
                      </span>
                    ) : (
                      <span className="text-slate-700">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`rounded border px-2 py-0.5 text-[10px] ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={!canViewReport}
                        onClick={() => canViewReport && setViewingOrderReport(order)}
                        className={`rounded border px-2.5 py-1 text-[10px] transition-colors ${
                          canViewReport
                            ? "border-neutral-700 bg-neutral-800 text-[#1D9E75] hover:bg-neutral-700"
                            : "cursor-not-allowed border-neutral-800 bg-neutral-900 text-slate-600"
                        }`}
                      >
                        {canViewReport ? "查看报告" : order.status === "pending" ? "待支付" : order.status === "failed" ? "支付失败" : "报告生成中"}
                      </button>
                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => showAdminAlert("关闭订单接口尚未接入，当前仅展示后台操作入口。")}
                          className="rounded border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[10px] text-slate-300 transition-colors hover:bg-neutral-800"
                        >
                          关闭订单
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={!canRefund || refundingOrderId === order.id}
                        onClick={() => handleRefundOrder(order)}
                        className={`rounded border px-2.5 py-1 text-[10px] transition-colors ${
                          canRefund
                            ? "border-red-900/60 bg-red-950/30 text-red-300 hover:bg-red-950/50"
                            : "cursor-not-allowed border-neutral-800 bg-neutral-900 text-slate-600"
                        }`}
                      >
                        {refundingOrderId === order.id ? "退款中" : "退款"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={12} className="p-10 text-center text-xs text-slate-500">
                  {orders.length === 0 ? "暂无订单记录" : "暂无符合筛选条件的订单记录"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {refundOrderTarget && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6">
          <div className="w-full max-w-[420px] rounded-3xl border border-red-900/50 bg-neutral-950 p-5 text-left shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-red-200">填写退款原因</h2>
                <p className="mt-1 text-[10px] text-slate-500">订单号：{refundOrderTarget.id} ｜ 退款金额：￥{refundOrderTarget.price}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRefundOrderTarget(null);
                  setRefundReasonInput("");
                }}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-slate-400 hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={refundReasonInput}
              onChange={(event) => setRefundReasonInput(event.target.value)}
              placeholder="请输入退款原因，例如：用户申请退款 / 重复支付 / 测算信息填写错误"
              className="h-28 w-full resize-none rounded-2xl border border-neutral-800 bg-[#030713] p-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-red-500/70"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRefundOrderTarget(null);
                  setRefundReasonInput("");
                }}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-neutral-800"
              >
                取消
              </button>
              <button
                type="button"
                disabled={refundingOrderId === refundOrderTarget.id}
                onClick={submitRefundOrder}
                className="rounded-xl border border-red-800 bg-red-950/60 px-4 py-2 text-xs font-bold text-red-100 transition-colors hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refundingOrderId === refundOrderTarget.id ? "提交中" : "确认退款"}
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingOrderReport && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6">
          <div className="flex max-h-[720px] w-full max-w-[620px] flex-col rounded-3xl border border-[#1D9E75]/30 bg-[#FAF5EC] p-6 text-left text-slate-900 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-dashed border-[#1D9E75]/20 pb-3">
              <h2 className="text-base font-bold text-[#0A3B2D]">个人深度测评与探索报告</h2>
              <button
                type="button"
                onClick={() => setViewingOrderReport(null)}
                className="rounded-xl border border-[#1D9E75]/20 bg-[#DDF5EE] px-3 py-2 text-[#0A3B2D] hover:bg-[#DDF5EE]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-[#1D9E75]/10 bg-[#1D9E75]/5 p-3 text-xs">
              <p><span className="font-bold">姓名：</span>{viewingOrderReport.userName}</p>
              <p><span className="font-bold">性别：</span>{viewingOrderReport.gender === "male" ? "男" : viewingOrderReport.gender === "female" ? "女" : "其他"}</p>
              <p><span className="font-bold">订单：</span>{viewingOrderReport.id}</p>
              <p><span className="font-bold">商品：</span>{viewingOrderReport.testName}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-line rounded-2xl bg-white/60 p-4 text-sm leading-7 text-slate-800">
              {viewingOrderReport.resultReport || "报告尚未生成。"}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMediaAccountModal = () => {
    if (!showMediaAccountModal) return null;
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020617] p-6">
        <div className="w-[min(560px,calc(100vw-2rem))] rounded-3xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl shadow-black">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#9CE6CF]">{editingMediaAccountId ? "编辑媒体账号" : "新增媒体账号"}</h3>
              <p className="mt-1 text-[10px] text-slate-500">用于落地页绑定投放账号与渠道数据归因。</p>
            </div>
            <button type="button" onClick={() => { setShowMediaAccountModal(false); resetMediaAccountForm(); }} className="rounded-lg border border-neutral-800 p-2 text-slate-400" aria-label="关闭媒体账号弹窗">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
              媒体账号ID
              <input
                value={mediaAccountIdInput}
                disabled={Boolean(editingMediaAccountId)}
                onChange={(event) => setMediaAccountIdInput(event.target.value)}
                className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75] disabled:cursor-not-allowed disabled:text-slate-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
              媒体账号名称
              <input value={mediaAccountNameInput} onChange={(event) => setMediaAccountNameInput(event.target.value)} className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
              媒体平台
              <select value={mediaAccountPlatformInput} onChange={(event) => setMediaAccountPlatformInput(event.target.value as "巨量" | "快手")} className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]">
                <option value="巨量">巨量</option>
                <option value="快手">快手</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
              开户公司
              <input value={mediaAccountCompanyInput} onChange={(event) => setMediaAccountCompanyInput(event.target.value)} className="h-10 rounded-xl border border-neutral-800 bg-[#030713] px-3 text-xs text-slate-200 outline-none focus:border-[#1D9E75]" />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2 border-t border-neutral-800 pt-4">
            <button type="button" onClick={() => { setShowMediaAccountModal(false); resetMediaAccountForm(); }} className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-slate-300">取消</button>
            <button type="button" onClick={saveMediaAccount} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950">保存</button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeMenu === "marketing") return renderMarketing();
    if (activeMenu === "orders") return renderOrders();
    if (activeMenu === "items") return renderItems();
    if (activeMenu === "operation") return renderOperation();
    if (activeMenu === "prompts") return renderPrompts();
    return renderQuestionBank();
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col self-stretch overflow-hidden rounded-3xl border border-neutral-800 bg-slate-950 text-slate-100 shadow-2xl select-text">
      <div className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 shadow-lg shadow-amber-900/20">
            <Cpu className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-sm font-bold">
              AI测算管理后台
              <span className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-[10px] tracking-wide text-[#1D9E75]">
                PRO v2.4
              </span>
            </h1>
            <p className="text-left text-[10px] text-slate-500">多维智能测评大数据与用户发展轨迹分析大盘</p>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <aside className="flex w-56 flex-col border-r border-neutral-800 bg-neutral-950 p-4">
          <div className="space-y-1.5">
            <span className="mb-3 block pl-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
              核心控制菜单
            </span>
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                  activeMenu === item.key
                    ? "border border-[#1D9E75]/25 bg-[#1D9E75]/15 font-bold text-[#1D9E75]"
                    : "text-slate-400 hover:bg-neutral-900/60 hover:text-slate-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto rounded-md border border-red-900/40 bg-red-950 px-1.5 py-0.25 text-[9px] font-bold text-red-400">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-900/20 p-6 text-left">{renderContent()}</main>
      </div>
      {activeMenu === "items" && renderItemModal()}
      {activeMenu === "marketing" && renderLandingModal()}
      {activeMenu === "marketing" && renderMediaAccountModal()}
      {adminToast && (
        <div className="pointer-events-none fixed left-1/2 top-8 z-[1200] -translate-x-1/2 rounded-xl border border-[#1D9E75]/40 bg-[#071711]/95 px-4 py-2 text-xs font-bold text-[#9CE6CF] shadow-2xl shadow-black/40">
          {adminToast}
        </div>
      )}
      {adminAlert && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#0b0f18] p-5 text-left shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{adminAlert.title || "提示"}</h3>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-400">{adminAlert.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdminAlert(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-black/50 text-slate-300 hover:border-[#1D9E75] hover:text-[#1D9E75]"
                aria-label="关闭提示"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAdminAlert(null)}
                className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
      {adminConfirm && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#0b0f18] p-5 text-left shadow-2xl">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-100">{adminConfirm.title || "确认操作"}</h3>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-400">{adminConfirm.message}</p>
            </div>
            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
              <button
                type="button"
                onClick={() => setAdminConfirm(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-neutral-800"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = adminConfirm.onConfirm;
                  setAdminConfirm(null);
                  void action();
                }}
                className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-slate-950"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="hidden">
        <Sparkles />
        <Terminal />
      </div>
    </div>
  );
}
