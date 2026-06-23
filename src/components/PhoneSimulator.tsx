/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Type, Compass, Calendar, ArrowLeft, CheckCircle2, 
  Clock, Smartphone, Wifi, Battery, ShoppingBag, User, 
  HelpCircle, ChevronRight, BookOpen, Lock, ShieldCheck, HelpCircle as HelpIcon,
  Heart, Briefcase, Award, Flame, TrendingUp, Brain, CreditCard, Star,
  ClipboardList, Trash2, Search, MessageCircle
} from "lucide-react";
import { motion } from "motion/react";
import { TestItem, CalculationOrder, BannerSlide, ShortcutItem, MiddleRecommendation, HomepageProduct, CurrentUser, ConversionRecommendation, ProductSku } from "../types";

const QUIZ_QUESTIONS: Record<
  string, 
  { id: string; text: string; options: { label: string; value: string; desc: string }[] }[]
> = {
  mbti: [
    {
      id: "Q1",
      text: "1. 在聚会或热闹社交场合中，你通常倾向于：",
      options: [
        { label: "A", value: "I", desc: "🧩 和熟悉的一两人深入交谈，偏向在独处中恢复精力" },
        { label: "B", value: "E", desc: "🎉 活跃地结识新面孔，在热闹和互动中感到能量满格" }
      ]
    },
    {
      id: "Q2",
      text: "2. 面对需要做抉择的棘手场景时，你更偏向于：",
      options: [
        { label: "A", value: "T", desc: "📊 剖析客观事实逻辑，看重理性条理与严谨的数据结果" },
        { label: "B", value: "F", desc: "❤️ 考虑他人的情感诉求，在同理心和价值观共振中作答" }
      ]
    },
    {
      id: "Q3",
      text: "3. 面对日复一日的工作或学习计划，你的做事风格是：",
      options: [
        { label: "A", value: "J", desc: "📅 制定清晰的时间节点与规程规划，习惯一切井井有条" },
        { label: "B", value: "P", desc: "🌊 顺其自然，拒绝让规则受困，喜欢即兴和随机应变" }
      ]
    }
  ],
  personality: [
    {
      id: "Q1",
      text: "1. 当你在亲密关系中感到委屈或安全感不足时，你常会：",
      options: [
        { label: "A", value: "回避型倾向", desc: "🧘 感到压力而退缩，选择独处或关闭心扉来防御伤害" },
        { label: "B", value: "焦虑型倾向", desc: "💬 急切沟通表达，一旦对方冷落就会容易陷入烦躁不安" }
      ]
    },
    {
      id: "Q2",
      text: "2. 自我觉察中，你对‘童年家庭氛围带来的潜移默化影响’看重于：",
      options: [
        { label: "A", value: "坚强防卫", desc: "🪵 习惯于伪装坚强优秀，通过懂事或独立获取父母肯定" },
        { label: "B", value: "边界期待", desc: "❤️ 深受关爱守护但存在高期望重担，总感到内心束缚" }
      ]
    },
    {
      id: "Q3",
      text: "3. 在日常最理想的亲密体验中，你的核心期望是：",
      options: [
        { label: "A", value: "绝对安全", desc: "🔒 能分享所有隐秘脆弱，建立百分之百的忠诚守护网" },
        { label: "B", value: "相互支持", desc: "🌿 既能在灵性深度呼应，又能各自保持宽松的成长边界" }
      ]
    }
  ],
  career: [
    {
      id: "Q1",
      text: "1. 当接收到团队内有冲突性甚至带攻击性的批评时，你会：",
      options: [
        { label: "A", value: "深度复盘", desc: "⚖️ 撇开个人情绪，只分析问题本质，提取出可提升的养分" },
        { label: "B", value: "情商调节", desc: "🌪️ 稍感挫败而起防御，事后寻找信任的同事化解情绪误区" }
      ]
    },
    {
      id: "Q2",
      text: "2. 在应对多部门联席或者资源冲突沟通时，你的处世策略是：",
      options: [
        { label: "A", value: "柔性协调", desc: "🤝 找寻各方隐秘契合利益，在共情与相互让步中达成双赢" },
        { label: "B", value: "极速效率", desc: "🎯 依凭制度规程推进，务求项目最高效落地，不拖泥带水" }
      ]
    },
    {
      id: "Q3",
      text: "3. 哪一种内在激励，对你而言是最大的职场源动力？",
      options: [
        { label: "A", value: "内生价值", desc: "🌟 掌握高专精技术、发挥独特的创造，体验极致解决感" },
        { label: "B", value: "外在护航", desc: "💎 拥有体面的荣誉晋升、有保障的发展路径与健全团队" }
      ]
    }
  ],
  emotion: [
    {
      id: "Q1",
      text: "1. 你们两个人目前的整体情感磁场，最符合：",
      options: [
        { label: "A", value: "热恋及执子手", desc: "💞 两人相知但带有摩擦，渴望看清彼此底层相融及软肋" },
        { label: "B", value: "单恋及探情缘", desc: "🗺️ 正处在单相思、暗恋或者不确定的暧昧迷雾期中" }
      ]
    },
    {
      id: "Q2",
      text: "2. 两个人在发生观点冲突甚至拌嘴时，多发生的场景是：",
      options: [
        { label: "A", value: "情绪开诚", desc: "💬 急切坦露观点期望，但往往说话过快偏离核心变成倾泻" },
        { label: "B", value: "隔阂抽离", desc: "🥀 一方容易闭口抽离表示冷静，另一方则愈发想要理论" }
      ]
    },
    {
      id: "Q3",
      text: "3. 你期许这份爱的探秘，能带给你怎样的心灵指引？",
      options: [
        { label: "A", value: "科学避阻", desc: "💡 能彻底读懂潜意识冲突，破除情感沟通盲抗从而稳定相伴" },
        { label: "B", value: "洞悉先机", desc: "🧠 明晰对方面具底下的真实态度，教我如何温柔有自尊作答" }
      ]
    }
  ],
  sbti: [
    {
      id: "Q1",
      text: "1. 当关系出现不确定信号时，你第一反应通常是：",
      options: [
        { label: "A", value: "安全确认", desc: "🛟 主动确认事实和感受，愿意把不安说清楚" },
        { label: "B", value: "自我保护", desc: "🧊 先观察甚至后退，避免自己在关系里暴露太多" }
      ]
    },
    {
      id: "Q2",
      text: "2. 面对亲密关系中的边界议题，你更接近：",
      options: [
        { label: "A", value: "高边界", desc: "📏 清楚表达自己的需求，也尊重对方独立空间" },
        { label: "B", value: "融合需求", desc: "🤝 更希望彼此保持高频同步和即时回应" }
      ]
    }
  ]
};

const getAssessmentMode = (test: TestItem): "quiz_score" | "profile_inference" =>
  test.assessmentMode || (test.category === "astrology" ? "profile_inference" : "quiz_score");

const getAssessmentTarget = (test: TestItem): "single" | "double" =>
  test.assessmentTarget || "single";

type ProfileField = NonNullable<TestItem["profileFields"]>[number];

const getProfileFields = (test: TestItem): ProfileField[] =>
  getAssessmentMode(test) === "profile_inference"
    ? test.profileFields || ["userName", "gender", "birthDate", "birthTime", "question"]
    : ["gender"];

const getQuizQuestions = (test: TestItem) => QUIZ_QUESTIONS[test.category] || [];

const categoryLabelsChinese: Record<TestItem["category"], string> = {
  mbti: "MBTI",
  sbti: "SBTI",
  emotion: "情绪",
  career: "职业",
  personality: "人格",
  astrology: "星座"
};

interface PhoneSimulatorProps {
  tests: TestItem[];
  onOrderCreated: () => void;
  orders: CalculationOrder[];
  currentUser?: CurrentUser | null;
  slides?: BannerSlide[];
  shortcuts?: ShortcutItem[];
  middleRecs?: MiddleRecommendation[];
  homepageProducts?: HomepageProduct[];
  conversionRecs?: ConversionRecommendation[];
  productSkus?: ProductSku[];
}

export default function PhoneSimulator({ 
  tests, 
  onOrderCreated, 
  orders, 
  currentUser,
  slides,
  shortcuts,
  middleRecs,
  homepageProducts,
  conversionRecs,
  productSkus = []
}: PhoneSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"home" | "history" | "my" | "service">("home");
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  
  // Custom states for new home page layout (King Kong navigation & Banner slides)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Form values
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [birthDate, setBirthDate] = useState("1996-06-09");
  const [birthTime, setBirthTime] = useState("12:00");
  const [question, setQuestion] = useState("");
  const [agreementChecked, setAgreementChecked] = useState(true);

  // Quiz-based values
  const [partnerName, setPartnerName] = useState("");
  const [partnerGender, setPartnerGender] = useState<"male" | "female" | "other">("female");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [partnerBirthTime, setPartnerBirthTime] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  // Quiz progressive state machine
  const [testPhase, setTestPhase] = useState<"landing" | "quiz" | "form">("landing");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Competitive Payflow States
  const [showPreviewReport, setShowPreviewReport] = useState(false);
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [previewGenerating, setPreviewGenerating] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<"wechat" | "alipay">("wechat");
  const [formattedQuizAnswers, setFormattedQuizAnswers] = useState("");
  const [activePaymentOrder, setActivePaymentOrder] = useState<CalculationOrder | null>(null);
  const [countdown, setCountdown] = useState("29:42");
  const [bindPhone, setBindPhone] = useState("");
  const [bindCode, setBindCode] = useState("");
  const [isBindingPhone, setIsBindingPhone] = useState(false);
  const [showBindPhoneModal, setShowBindPhoneModal] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [lookupKeyword, setLookupKeyword] = useState("");
  const [lookupMode, setLookupMode] = useState<"phone" | "order">("phone");
  const [lookupOrders, setLookupOrders] = useState<CalculationOrder[] | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [conversionPopupScene, setConversionPopupScene] = useState<"prepay" | "paid" | null>(null);
  const [conversionPopupSourceId, setConversionPopupSourceId] = useState<string | null>(null);
  const [conversionPopupIndex, setConversionPopupIndex] = useState(0);
  const [paidPopupEligibleOrderId, setPaidPopupEligibleOrderId] = useState<string | null>(null);
  const [reportHadUserScroll, setReportHadUserScroll] = useState(false);
  const shownConversionPopupKeys = React.useRef<Set<string>>(new Set());
  const markedPopupOrderIds = React.useRef<Set<string>>(new Set());
  const resumePaymentPreviewRef = React.useRef(false);
  const prepayPopupTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedTestRef = React.useRef<TestItem | null>(null);
  const calculationResultRef = React.useRef<CalculationOrder | null>(null);
  const isProcessingPaymentRef = React.useRef(false);

  // Reset quiz states when selectedTest changes
  useEffect(() => {
    const shouldResumePayment = resumePaymentPreviewRef.current && Boolean(selectedTest);
    setPartnerName("");
    setPartnerGender("female");
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setShowPreviewReport(Boolean(shouldResumePayment));
    setShowPaymentGate(false);
    setIsProcessingPayment(false);
    setPreviewGenerating(false);
    setPreviewStep(0);
    setPaymentFinished(false);
    setFormattedQuizAnswers("");
    setConversionPopupScene(null);
    setConversionPopupSourceId(null);
    setConversionPopupIndex(0);
    if (!shouldResumePayment) {
      setActivePaymentOrder(null);
    }
    setCountdown("29:42");
    if (selectedTest) {
      setTestPhase(shouldResumePayment ? "form" : "landing");
    }
    if (shouldResumePayment) {
      resumePaymentPreviewRef.current = false;
    }
  }, [selectedTest]);
  
  // Calculation session state
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const [calculationResult, setCalculationResult] = useState<CalculationOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  selectedTestRef.current = selectedTest;
  calculationResultRef.current = calculationResult;
  isProcessingPaymentRef.current = isProcessingPayment;

  const activeRecommendationSlides = React.useMemo(() => {
    return [...(slides || [])]
      .filter((slide) => (slide.status || "已上架") === "已上架")
      .sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id));
  }, [slides]);

  const activeTopSlides = React.useMemo(
    () => activeRecommendationSlides.filter((slide) => (slide.displayPosition || "首页顶部") === "首页顶部"),
    [activeRecommendationSlides]
  );

  const activeMiddleSlides = React.useMemo(
    () => activeRecommendationSlides.filter((slide) => slide.displayPosition === "首页中部"),
    [activeRecommendationSlides]
  );

  const activeProductSlides = React.useMemo(
    () => activeRecommendationSlides.filter((slide) => slide.displayPosition === "商品列表"),
    [activeRecommendationSlides]
  );

  useEffect(() => {
    if (currentSlide >= activeTopSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeTopSlides.length, currentSlide]);

  const activeHomepageEntries = React.useMemo(() => {
    if (activeProductSlides.length > 0) {
      return activeProductSlides
        .map(config => ({ config, test: tests.find(t => t.id === config.testId) }))
        .filter((entry): entry is { config: BannerSlide; test: TestItem } => !!entry.test && entry.test.isActive);
    }
    if (homepageProducts && homepageProducts.length > 0) {
      return [...homepageProducts]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(config => ({ config, test: tests.find(t => t.id === config.testId) }))
        .filter((entry): entry is { config: HomepageProduct; test: TestItem } => !!entry.test && entry.test.isActive);
    }
    return tests
      .filter(t => t.isActive)
      .map(test => ({ config: undefined, test }));
  }, [tests, homepageProducts, activeProductSlides]);

  const getProductSku = (skuId?: string | null, projectId?: string) =>
    productSkus.find((sku) => sku.id === skuId && sku.status !== "已下架") ||
    productSkus.find((sku) => sku.projectId === projectId && sku.status !== "已下架") ||
    productSkus.find((sku) => sku.id === skuId) ||
    productSkus.find((sku) => sku.projectId === projectId);

  const selectedProductSku = selectedTest ? getProductSku(selectedSkuId, selectedTest.id) : undefined;
  const selectedSalePrice = selectedProductSku?.price ?? selectedTest?.price ?? 0;
  const selectedOriginalPrice = selectedProductSku?.originalPrice ?? selectedTest?.originalPrice;

  const openConfiguredTarget = (testId: string, linkUrl?: string, skuId?: string) => {
    if (linkUrl?.trim()) {
      window.location.href = linkUrl.trim();
      return;
    }
    const targetSku = getProductSku(skuId, testId);
    const resolvedTestId = targetSku?.projectId || testId;
    const t = tests.find(x => x.id === resolvedTestId);
    if (t) {
      setSelectedSkuId(targetSku?.id || skuId || null);
      setSelectedTest(t);
    }
  };

  const openConversionTarget = (test: TestItem, skuId?: string) => {
    setSelectedSkuId(skuId || null);
    setSelectedTest(test);
    setCalculationResult(null);
    setShowPreviewReport(false);
    setShowPaymentGate(false);
    setIsCalculating(false);
    setActivePaymentOrder(null);
    setTestPhase("landing");
    setActiveTab("home");
  };

  type ConversionPopupItem = { rule: ConversionRecommendation; test?: TestItem };

  const getConversionItems = (scene: "prepay" | "paid", sourceId?: string): ConversionPopupItem[] => {
    const now = Date.now();
    const configuredItems = [...(conversionRecs || [])]
      .filter((item) => item.scene === scene)
      .filter((item) => (item.status || "已上架") === "已上架")
      .filter((item) => {
        if (item.targetType === "link") return true;
        const targetSku = getProductSku(item.targetSkuId, item.targetTestId);
        return (targetSku?.projectId || item.targetTestId) !== sourceId;
      })
      .filter((item) => {
        const start = item.startAt ? new Date(item.startAt).getTime() : 0;
        const end = item.endAt ? new Date(item.endAt).getTime() : Number.MAX_SAFE_INTEGER;
        if (Number.isNaN(start) || Number.isNaN(end)) return true;
        return now >= start && now <= end;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item) => {
        const targetSku = getProductSku(item.targetSkuId, item.targetTestId);
        return { rule: item, test: tests.find((test) => test.id === (targetSku?.projectId || item.targetTestId)) };
      })
      .filter((entry) => entry.rule.targetType === "link" ? !!entry.rule.linkUrl : !!entry.test && entry.test.isActive)
      .slice(0, 6);
    if (configuredItems.length > 0 || scene === "paid") return configuredItems;

    return tests
      .filter((test) => test.id !== sourceId && test.isActive)
      .slice(0, 6)
      .map((test, index) => ({
        test,
        rule: {
          id: `fallback-prepay-${test.id}`,
          name: `限时推荐-${test.name}`,
          scene: "prepay",
          targetType: "product",
          targetTestId: test.id,
          targetSkuId: `sku-${test.id}-standard`,
          imageUrl: test.detailHeroImage || "",
          sortOrder: index + 1,
          startAt: "",
          endAt: ""
        }
      }));
  };

  const openConversionPopup = (scene: "prepay" | "paid", sourceId: string, trigger: string) => {
    if (getConversionItems(scene, sourceId).length === 0) return false;
    const popupKey = `${scene}:${sourceId}:${trigger}`;
    if (shownConversionPopupKeys.current.has(popupKey)) return false;
    shownConversionPopupKeys.current.add(popupKey);
    setConversionPopupScene(scene);
    setConversionPopupSourceId(sourceId);
    setConversionPopupIndex(0);
    return true;
  };

  useEffect(() => {
    if (prepayPopupTimerRef.current) {
      clearTimeout(prepayPopupTimerRef.current);
      prepayPopupTimerRef.current = null;
    }
    if (!showPaymentGate) return;
    prepayPopupTimerRef.current = setTimeout(() => {
      const currentTest = selectedTestRef.current;
      if (!currentTest || calculationResultRef.current || isProcessingPaymentRef.current) return;
      openConversionPopup("prepay", currentTest.id, "payment-timeout");
      prepayPopupTimerRef.current = null;
    }, 9000);
    return () => {
      if (prepayPopupTimerRef.current) {
        clearTimeout(prepayPopupTimerRef.current);
        prepayPopupTimerRef.current = null;
      }
    };
  }, [showPaymentGate]);

  // Time ticker for phone status bar
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    const renderShortcutIcon = (icon: string) => {
    switch (icon) {
      case "Brain": return <Brain className="w-4 h-4" />;
      case "Compass": return <Compass className="w-4 h-4" />;
      case "Award": return <Award className="w-4 h-4" />;
      case "Briefcase": return <Briefcase className="w-4 h-4" />;
      case "Heart": return <Heart className="w-4 h-4" />;
      case "Star": return <Star className="w-4 h-4" />;
      case "Sparkles": return <Sparkles className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getShortcutColor = (theme: string) => {
    switch (theme) {
      case "indigo": return "bg-gradient-to-br from-indigo-600/20 to-indigo-950/30 text-indigo-300 border-indigo-900/30";
      case "amber": return "bg-gradient-to-br from-amber-600/20 to-amber-950/30 text-amber-300 border-amber-900/30";
      case "pink": return "bg-gradient-to-br from-pink-600/20 to-pink-950/30 text-pink-300 border-pink-900/30";
      case "purple": return "bg-gradient-to-br from-purple-600/20 to-purple-950/30 text-purple-300 border-purple-900/30";
      case "emerald": return "bg-gradient-to-br from-emerald-600/20 to-emerald-950/30 text-emerald-300 border-emerald-900/30";
      case "rose": return "bg-gradient-to-br from-rose-600/20 to-rose-955/30 text-rose-300 border-rose-900/30";
      case "teal": return "bg-gradient-to-br from-teal-600/20 to-teal-955/30 text-teal-300 border-teal-900/30";
      default: return "bg-gradient-to-br from-slate-600/20 to-slate-950/30 text-slate-300 border-neutral-800";
    }
  };

  const getMiddleRecommendationTheme = (theme: string) => {
    switch (theme) {
      case "rose": return {
        cardBg: "from-rose-950/40 via-neutral-950 to-slate-950 border-rose-900/30 hover:border-rose-500/50",
        tagBg: "bg-rose-600 text-rose-100",
        iconBg: "bg-pink-950/60 border-pink-900/30 text-pink-400",
        priceColor: "text-rose-400"
      };
      case "purple": return {
        cardBg: "from-purple-950/40 via-neutral-950 to-slate-950 border-purple-900/30 hover:border-purple-500/50",
        tagBg: "bg-purple-600 text-purple-100",
        iconBg: "bg-purple-950/60 border-purple-900/30 text-purple-400",
        priceColor: "text-purple-400"
      };
      case "emerald": return {
        cardBg: "from-emerald-950/40 via-neutral-950 to-slate-950 border-emerald-900/30 hover:border-emerald-500/50",
        tagBg: "bg-emerald-600 text-emerald-100",
        iconBg: "bg-emerald-950/60 border-emerald-900/30 text-emerald-400",
        priceColor: "text-emerald-400"
      };
      case "indigo": return {
        cardBg: "from-indigo-950/40 via-neutral-950 to-slate-950 border-indigo-900/30 hover:border-indigo-500/50",
        tagBg: "bg-indigo-600 text-indigo-100",
        iconBg: "bg-indigo-950/60 border-indigo-900/30 text-indigo-400",
        priceColor: "text-indigo-400"
      };
      case "amber": return {
        cardBg: "from-amber-950/40 via-neutral-950 to-slate-950 border-amber-900/30 hover:border-amber-500/50",
        tagBg: "bg-amber-600 text-amber-100",
        iconBg: "bg-amber-950/60 border-amber-900/30 text-amber-400",
        priceColor: "text-amber-400"
      };
      case "teal": return {
        cardBg: "from-teal-950/40 via-neutral-950 to-slate-950 border-teal-900/30 hover:border-teal-500/50",
        tagBg: "bg-teal-600 text-teal-100",
        iconBg: "bg-teal-950/60 border-teal-900/30 text-teal-400",
        priceColor: "text-teal-400"
      };
      case "red": return {
        cardBg: "from-red-950/40 via-neutral-950 to-slate-950 border-red-900/30 hover:border-red-500/50",
        tagBg: "bg-red-600 text-red-100",
        iconBg: "bg-red-950/60 border-red-900/30 text-red-405",
        priceColor: "text-red-450"
      };
      default: return {
        cardBg: "from-slate-900 via-neutral-950 to-slate-950 border-neutral-800 hover:border-slate-700",
        tagBg: "bg-slate-700 text-slate-100",
        iconBg: "bg-slate-950/60 border-neutral-800 text-slate-400",
        priceColor: "text-slate-400"
      };
    }
  };

  return () => clearInterval(timer);
  }, []);

  // Coupon countdown effect in preview & payment gate
  useEffect(() => {
    let seconds = 29 * 60 + 42;
    const timer = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(timer);
        return;
      }
      seconds--;
      const min = String(Math.floor(seconds / 60)).padStart(2, "0");
      const sec = String(seconds % 60).padStart(2, "0");
      setCountdown(`${min}:${sec}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [showPreviewReport, showPaymentGate]);

  // Progressive steps before paying (Preview Draft compilation)
  const previewSteps = [
    "⭐ 分析答题特征...",
    "🧠 计算性格画像...",
    "🧬 生成核心结论...",
    "📄 AI 正在生成报告..."
  ];

  // Progressive steps after paying (Secure unlocking and receiving the report)
  const decryptionProcessSteps = [
    "🟢 支付成功，已安全同步云端中枢报告...",
    "🔑 安全协议握手完毕，授权注入专属解密证书...",
    "📡 正在接收并解密完整报告文本及高维度诊断结果...",
    "⚡ 最终报告编译解密成功，即刻呈现完整解密智慧指引..."
  ];

  // Ticking preview generating progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (previewGenerating) {
      setPreviewStep(0);
      interval = setInterval(() => {
        setPreviewStep((prev) => {
          if (prev >= previewSteps.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [previewGenerating]);

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const timer = setTimeout(() => {
      setSmsCountdown(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [smsCountdown]);

  // Simulating nice background cosmic steps during calculations (decryption)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCalculating) {
      setCalcStep(0);
      interval = setInterval(() => {
        setCalcStep((prev) => {
          if (prev >= decryptionProcessSteps.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // slightly faster than 1500 to keep checkout snappy
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCalculating]);

  // Action helpers for Order History List (Task 4)
  const handleDeleteOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening report
    if (!confirm("确定要删除这笔测评订单吗？别担心，已支付的订单也可以随时通过客服找回。")) return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        onOrderCreated(); // refresh data
      } else {
        alert("删除失败，请稍后重试");
      }
    } catch (err) {
      console.error(err);
      alert("连接服务器失败");
    }
  };

  const handleCustomerService = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTest(null);
    setCalculationResult(null);
    setShowPaymentGate(false);
    setIsCalculating(false);
    setActiveTab("service");
  };

  const handleSendSmsCode = () => {
    if (smsCountdown > 0) return;
    const phone = (lookupMode === "phone" && activeTab === "history" ? lookupKeyword : bindPhone).replace(/\D/g, "");
    if (!/^1\d{10}$/.test(phone)) {
      alert("请输入正确的 11 位手机号");
      return;
    }
    setSmsCountdown(60);
    alert("验证码已发送。当前为原型演示，可输入任意验证码继续。");
  };

  const handlePayOrder = (order: CalculationOrder, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening empty report
    const t = tests.find(x => x.id === order.testId);
    if (t) {
      // Re-populate essential state so the payment gate has client-side data
      resumePaymentPreviewRef.current = true;
      setSelectedTest(t);
      setUserName(order.userName);
      setGender(order.gender);
      setBirthDate(order.birthDate || "");
      setBirthTime(order.birthTime || "");
      setPartnerName(order.partnerName || "");
      setPartnerGender(order.partnerGender || "female");
      setPartnerBirthDate(order.partnerBirthDate || "");
      setPartnerBirthTime(order.partnerBirthTime || "");
      setQuestion(order.question || "");
      
      // Set active order and enter the paid-unlock preview screen first.
      setActivePaymentOrder(order);
      setShowPreviewReport(true);
      setShowPaymentGate(false);
      setTestPhase("form");
    } else {
      alert("该测算商品原项暂不可用");
    }
  };

  const handleBindPhone = async () => {
    const phone = bindPhone.replace(/\D/g, "");
    if (!/^1\d{10}$/.test(phone)) {
      alert("请输入正确的 11 位手机号");
      return;
    }
    setIsBindingPhone(true);
    try {
      const response = await fetch("/api/session/bind-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: bindCode || "000000" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || "手机号绑定失败，请稍后重试");
        return;
      }
      setBindPhone("");
      setBindCode("");
      setShowBindPhoneModal(false);
      alert("手机号已绑定，后续可通过手机号找回报告。");
      onOrderCreated();
    } catch (err) {
      console.error("绑定手机号失败:", err);
      alert("绑定失败，请检查网络连接。");
    } finally {
      setIsBindingPhone(false);
    }
  };

  const handleLookupOrders = async () => {
    const keyword = lookupKeyword.trim();
    if (!keyword) {
      setLookupOrders(null);
      setLookupError(lookupMode === "phone" ? "请输入手机号" : "请输入订单号");
      return;
    }
    const phone = keyword.replace(/\D/g, "");
    if (lookupMode === "phone" && !/^1\d{10}$/.test(phone)) {
      setLookupError("请输入正确的 11 位手机号");
      return;
    }
    const query = lookupMode === "phone" ? `phone=${encodeURIComponent(phone)}` : `orderNo=${encodeURIComponent(keyword)}`;
    try {
      const response = await fetch(`/api/orders/lookup?${query}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        setLookupError("查询失败，请稍后重试");
        return;
      }
      setLookupOrders(data);
      setLookupError(data.length ? "" : "未找到匹配订单，请确认手机号或订单号。");
    } catch (err) {
      console.error("订单找回失败:", err);
      setLookupError("查询失败，请检查网络连接。");
    }
  };

  const buildScoreSummary = (answersSummary: string) => {
    if (!selectedTest) return "";
    const questionsList = getQuizQuestions(selectedTest);
    const dimensionMap: Record<string, number> = {};
    questionsList.forEach((q, index) => {
      const answer = quizAnswers[q.id];
      if (!answer) return;
      const dimension = selectedTest.category === "mbti" || selectedTest.category === "sbti"
        ? ["E/I", "T/F", "J/P", "S/N"][index % 4]
        : `${selectedTest.name.slice(0, 6)}维度${index + 1}`;
      dimensionMap[dimension] = (dimensionMap[dimension] || 0) + 1;
    });
    const dimensionText = Object.entries(dimensionMap).map(([key, value]) => `${key}: ${value}`).join("；") || "已完成核心题目";
    return `题库计分型测算：${selectedTest.name}。答题数量：${questionsList.length}。维度分值摘要：${dimensionText}。原始答题摘要：${answersSummary.slice(0, 280)}`;
  };

  const buildTraditionalSummary = () => {
    if (!selectedTest) return "";
    const profileText = [
      `称呼：${userName || "你"}`,
      `性别：${gender === "female" ? "女" : gender === "other" ? "其他" : "男"}`,
      birthDate ? `出生日期：${birthDate}` : "",
      birthTime ? `出生时间：${birthTime}` : "",
      question.trim() ? `咨询问题：${question.trim()}` : ""
    ].filter(Boolean).join("；");
    return `传统断语预览：基于${profileText}，先由确定性传统规则给出基础判断，再由 AI 在不否定该判断的前提下补充完整报告。`;
  };

  // Create a pending unpaid order on the backend
  const createPendingOrder = async (answersSummary: string): Promise<CalculationOrder | null> => {
    if (!selectedTest) return null;
    const mode = getAssessmentMode(selectedTest);
    const hasQuiz = mode === "quiz_score";
    const needsProfile = mode === "profile_inference";
    const isDouble = getAssessmentTarget(selectedTest) === "double";
    const orderUserName = userName.trim() || "你";
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: selectedTest.id,
          userName: orderUserName,
          gender,
          birthDate: needsProfile ? birthDate : undefined,
          birthTime: needsProfile ? birthTime : undefined,
          partnerName: isDouble ? partnerName.trim() || undefined : undefined,
          partnerGender: isDouble ? partnerGender : undefined,
          partnerBirthDate: isDouble ? partnerBirthDate || undefined : undefined,
          partnerBirthTime: isDouble ? partnerBirthTime || undefined : undefined,
          quizAnswers: hasQuiz ? answersSummary : undefined,
          scoreSummary: hasQuiz ? buildScoreSummary(answersSummary) : undefined,
          traditionalSummary: buildTraditionalSummary(),
          question: question.trim() ? question.trim() : undefined,
          paymentMethod: selectedPayMethod,
          price: selectedSalePrice
        })
      });
      if (response.ok) {
        const orderData = await response.json();
        setActivePaymentOrder(orderData);
        onOrderCreated(); // synchronized Load
        return orderData;
      }
    } catch (err) {
      console.error("Failed to create pending order:", err);
    }
    return null;
  };

  // Invokes the server-side API calculation (Triggered AFTER payment matches successfully!)
  const triggerCalculatorAPI = async (cachedAnswers: string) => {
    if (!selectedTest) return;

    setShowPreviewReport(false);
    setShowPaymentGate(false);
    setIsCalculating(true);
    setErrorMsg("");
    setCalculationResult(null);

    try {
      let response;
      if (activePaymentOrder) {
        // Pay for existing pending order!
        response = await fetch(`/api/orders/${activePaymentOrder.id}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
      } else {
        // Fallback or legacy direct calculation
        const mode = getAssessmentMode(selectedTest);
        const hasQuiz = mode === "quiz_score";
        const needsProfile = mode === "profile_inference";
        const isDouble = getAssessmentTarget(selectedTest) === "double";
        const orderUserName = userName.trim() || "你";

        response = await fetch("/api/orders/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testId: selectedTest.id,
            userName: orderUserName,
            gender,
            birthDate: needsProfile ? birthDate : undefined,
            birthTime: needsProfile ? birthTime : undefined,
            partnerName: isDouble ? partnerName.trim() || undefined : undefined,
            partnerGender: isDouble ? partnerGender : undefined,
            partnerBirthDate: isDouble ? partnerBirthDate || undefined : undefined,
            partnerBirthTime: isDouble ? partnerBirthTime || undefined : undefined,
            quizAnswers: hasQuiz ? cachedAnswers : undefined,
            scoreSummary: hasQuiz ? buildScoreSummary(cachedAnswers) : undefined,
            traditionalSummary: buildTraditionalSummary(),
            question: question.trim() ? question.trim() : undefined,
            paymentMethod: selectedPayMethod,
            price: selectedSalePrice
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "测算振频受阻，请稍后再试！");
      }

      const data = await response.json();
      if (data.success && data.order) {
        setPaidPopupEligibleOrderId(data.order.popupShown ? null : data.order.id);
        setCalculationResult(data.order);
        onOrderCreated(); // Trigger parent Admin sync
      } else {
        throw new Error(data.error || "测算受阻");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "连接测算服务器失败");
    } finally {
      setIsCalculating(false);
    }
  };

  // Step 1: Intercept form submit, validate and trigger "Preview Report Generating" loading phase
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!selectedTest) return;

    const mode = getAssessmentMode(selectedTest);
    const hasQuiz = mode === "quiz_score";
    const needsProfile = mode === "profile_inference";
    const isDouble = getAssessmentTarget(selectedTest) === "double";
    const requiredFields = getProfileFields(selectedTest);
    if (requiredFields.includes("userName") && !userName.trim()) {
      setErrorMsg("请输入您的姓名或称呼，以便开始个性化深度测评！");
      return;
    }

    // 2. Validate quiz answered complete
    let quizAnswersStr = "";
    if (hasQuiz) {
      const questionsList = getQuizQuestions(selectedTest);
      const isAllAnswered = questionsList.every(q => quizAnswers[q.id]);
      if (!isAllAnswered) {
        setErrorMsg("请回答全部测评问题，以便我们为您生成客观精细的报告。");
        return;
      }

      // Format beautiful quiz summary
      quizAnswersStr = questionsList
        .map((q) => {
          const chosenVal = quizAnswers[q.id];
          const option = q.options.find(o => o.value === chosenVal);
          return `${q.id}: ${q.text}\n  答案:【A还是B -> ${chosenVal}】${option ? option.desc : ""}`;
        })
        .join("\n");
    }
    if (needsProfile) {
      if (requiredFields.includes("birthDate") && !birthDate) {
        setErrorMsg("请填写出生日期，用于生成传统断语和后续 AI 报告。");
        return;
      }
      if (requiredFields.includes("birthTime") && !birthTime) {
        setErrorMsg("请填写出生时间，用于更完整的资料推演。");
        return;
      }
      if (requiredFields.includes("question") && !question.trim()) {
        setErrorMsg("请填写当前最想咨询的问题。");
        return;
      }
    }
    if (isDouble) {
      if (!partnerName.trim()) {
        setErrorMsg("请填写对方姓名或称呼。");
        return;
      }
      if (requiredFields.includes("birthDate") && !partnerBirthDate) {
        setErrorMsg("请填写对方出生日期。");
        return;
      }
      if (requiredFields.includes("birthTime") && !partnerBirthTime) {
        setErrorMsg("请填写对方出生时间。");
        return;
      }
    }

    setFormattedQuizAnswers(quizAnswersStr);
    setPreviewGenerating(true);

    // Call background pending order creation api
    createPendingOrder(quizAnswersStr);

    // Simulate 4s diagnostic loader to run through all 4 compilation steps, then unlock the mock premium lock and radar view!
    setTimeout(() => {
      setPreviewGenerating(false);
      setShowPreviewReport(true);
    }, 4000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "mbti":
      case "sbti": return <Brain className="w-5 h-5 text-purple-400" />;
      case "astrology": return <Compass className="w-5 h-5 text-amber-500" />;
      case "personality": return <Award className="w-5 h-5 text-emerald-400" />;
      case "career": return <Briefcase className="w-5 h-5 text-blue-400" />;
      case "emotion": return <Heart className="w-5 h-5 text-pink-500 font-bold" />;
      default: return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  // Convert raw ISO date to readable Chinese stamp format
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    } catch {
      return isoString;
    }
  };

  const renderShortcutIcon = (icon: string) => {
    switch (icon) {
      case "Brain": return <Brain className="w-4 h-4" />;
      case "Compass": return <Compass className="w-4 h-4" />;
      case "Award": return <Award className="w-4 h-4" />;
      case "Briefcase": return <Briefcase className="w-4 h-4" />;
      case "Heart": return <Heart className="w-4 h-4" />;
      case "Star": return <Star className="w-4 h-4" />;
      case "Sparkles": return <Sparkles className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const isImageIcon = (icon?: string) => !!icon && /^(data:image|blob:|https?:\/\/)/.test(icon);

  const getShortcutColor = (theme: string) => {
    switch (theme) {
      case "indigo": return "bg-gradient-to-br from-indigo-600/20 to-indigo-950/30 text-indigo-300 border-indigo-900/30";
      case "amber": return "bg-gradient-to-br from-amber-600/20 to-amber-950/30 text-amber-300 border-amber-900/30";
      case "pink": return "bg-gradient-to-br from-pink-600/20 to-pink-950/30 text-pink-300 border-pink-900/30";
      case "purple": return "bg-gradient-to-br from-purple-600/20 to-purple-950/30 text-purple-300 border-purple-900/30";
      case "emerald": return "bg-gradient-to-br from-emerald-600/20 to-emerald-950/30 text-emerald-300 border-emerald-900/30";
      case "rose": return "bg-gradient-to-br from-rose-600/20 to-rose-950/30 text-rose-300 border-rose-900/30";
      case "teal": return "bg-gradient-to-br from-teal-600/20 to-teal-955/30 text-teal-300 border-teal-900/30";
      default: return "bg-gradient-to-br from-slate-600/20 to-slate-950/30 text-slate-300 border-neutral-800";
    }
  };

  const getMiddleRecommendationTheme = (theme: string) => {
    switch (theme) {
      case "rose": return {
        cardBg: "from-rose-950/40 via-neutral-950 to-slate-950 border-rose-900/30 hover:border-rose-500/50",
        tagBg: "bg-rose-650 text-rose-100",
        iconBg: "bg-pink-950/60 border-pink-900/30 text-pink-400",
        priceColor: "text-rose-400"
      };
      case "purple": return {
        cardBg: "from-purple-950/40 via-neutral-950 to-slate-950 border-purple-900/30 hover:border-purple-500/50",
        tagBg: "bg-purple-650 text-purple-100",
        iconBg: "bg-purple-950/60 border-purple-900/30 text-purple-400",
        priceColor: "text-purple-400"
      };
      case "emerald": return {
        cardBg: "from-emerald-950/40 via-neutral-950 to-slate-950 border-emerald-900/30 hover:border-emerald-500/50",
        tagBg: "bg-emerald-650 text-emerald-100",
        iconBg: "bg-emerald-950/60 border-emerald-900/30 text-emerald-400",
        priceColor: "text-emerald-400"
      };
      case "indigo": return {
        cardBg: "from-indigo-950/40 via-neutral-950 to-slate-950 border-indigo-900/30 hover:border-indigo-500/50",
        tagBg: "bg-indigo-650 text-indigo-100",
        iconBg: "bg-indigo-950/60 border-indigo-900/30 text-indigo-400",
        priceColor: "text-indigo-400"
      };
      case "amber": return {
        cardBg: "from-amber-950/40 via-neutral-950 to-slate-950 border-amber-900/30 hover:border-amber-500/50",
        tagBg: "bg-amber-650 text-amber-100",
        iconBg: "bg-amber-950/60 border-amber-900/30 text-amber-400",
        priceColor: "text-amber-400"
      };
      case "teal": return {
        cardBg: "from-teal-950/40 via-neutral-950 to-slate-950 border-teal-900/30 hover:border-teal-500/50",
        tagBg: "bg-teal-650 text-teal-100",
        iconBg: "bg-teal-950/60 border-teal-900/30 text-teal-400",
        priceColor: "text-teal-400"
      };
      case "red": return {
        cardBg: "from-red-950/40 via-neutral-950 to-slate-950 border-red-900/30 hover:border-red-500/50",
        tagBg: "bg-red-600 text-red-100",
        iconBg: "bg-red-950/60 border-red-900/30 text-red-400",
        priceColor: "text-red-400"
      };
      default: return {
        cardBg: "from-slate-900 via-neutral-950 to-slate-950 border-neutral-800 hover:border-slate-700",
        tagBg: "bg-slate-700 text-slate-100",
        iconBg: "bg-slate-950/60 border-neutral-800 text-slate-400",
        priceColor: "text-slate-400"
      };
    }
  };

  const activeProfileFields = selectedTest ? getProfileFields(selectedTest) : [];
  const isQuizScoreForm = selectedTest ? getAssessmentMode(selectedTest) === "quiz_score" : false;
  const currentUserOrders = currentUser ? orders.filter(order => order.userId === currentUser.userId) : orders;
  const historyOrders = lookupOrders || currentUserOrders;
  const visibleHistoryOrders = historyOrders.filter(order => {
    if (orderStatusFilter === "all") return true;
    if (orderStatusFilter === "pending") return order.status === "pending";
    return order.status === "paid";
  });
  const activeConversionPopupAllItems = conversionPopupScene && conversionPopupSourceId
    ? getConversionItems(conversionPopupScene, conversionPopupSourceId)
    : [];
  const maxConversionPopupPages = Math.min(3, Math.ceil(activeConversionPopupAllItems.length / 2));
  const activeConversionPopupItems = activeConversionPopupAllItems.slice(conversionPopupIndex * 2, conversionPopupIndex * 2 + 2);
  const activeConversionPopupPrimary = activeConversionPopupItems[0] || null;
  const closeConversionPopup = () => {
    if (conversionPopupIndex < maxConversionPopupPages - 1) {
      setConversionPopupIndex(prev => prev + 1);
      return;
    }
    setConversionPopupScene(null);
    setConversionPopupSourceId(null);
    setConversionPopupIndex(0);
  };
  const confirmConversionPopup = () => {
    if (!activeConversionPopupPrimary) return;
    setConversionPopupScene(null);
    setConversionPopupSourceId(null);
    setConversionPopupIndex(0);
    if (activeConversionPopupPrimary.rule.targetType === "link" && activeConversionPopupPrimary.rule.linkUrl) {
      window.location.href = activeConversionPopupPrimary.rule.linkUrl;
      return;
    }
    if (activeConversionPopupPrimary.test) openConversionTarget(activeConversionPopupPrimary.test, activeConversionPopupPrimary.rule.targetSkuId);
  };
  const openConversionPopupItem = (item: ConversionPopupItem) => {
    setConversionPopupScene(null);
    setConversionPopupSourceId(null);
    setConversionPopupIndex(0);
    if (item.rule.targetType === "link" && item.rule.linkUrl) {
      window.location.href = item.rule.linkUrl;
      return;
    }
    if (item.test) openConversionTarget(item.test, item.rule.targetSkuId);
  };
  const requestClosePaymentGate = () => {
    if (isProcessingPayment) return;
    setShowPaymentGate(false);
  };

  const markReportPopupShown = async (orderId: string) => {
    markedPopupOrderIds.current.add(orderId);
    setCalculationResult(prev => prev?.id === orderId ? { ...prev, popupShown: true } : prev);
    try {
      await fetch(`/api/orders/${orderId}/conversion-popup-shown`, { method: "POST" });
      onOrderCreated();
    } catch (err) {
      console.error("Failed to mark conversion popup shown:", err);
    }
  };

  const tryOpenPaidConversionPopup = (trigger: string) => {
    if (!calculationResult) return false;
    if (paidPopupEligibleOrderId !== calculationResult.id) return false;
    if (calculationResult.popupShown || markedPopupOrderIds.current.has(calculationResult.id)) return false;
    const opened = openConversionPopup("paid", calculationResult.testId, trigger);
    if (opened) {
      markReportPopupShown(calculationResult.id);
    }
    return opened;
  };

  const handlePhoneContentScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!calculationResult) return;
    const target = event.currentTarget;
    const scrollable = target.scrollHeight > target.clientHeight + 24;
    const hasUserScrolled = reportHadUserScroll || target.scrollTop > 8;
    if (target.scrollTop > 8 && !reportHadUserScroll) {
      setReportHadUserScroll(true);
    }
    const reachedBottom = scrollable && hasUserScrolled && target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
    if (reachedBottom) {
      tryOpenPaidConversionPopup(`report-bottom:${calculationResult.id}`);
    }
  };

  useEffect(() => {
    setReportHadUserScroll(false);
    if (!calculationResult) return;
    if (paidPopupEligibleOrderId !== calculationResult.id) return;
    if (calculationResult.popupShown || markedPopupOrderIds.current.has(calculationResult.id)) return;
    const timer = setTimeout(() => {
      tryOpenPaidConversionPopup(`report-stay:${calculationResult.id}`);
    }, 12000);
    return () => clearTimeout(timer);
  }, [calculationResult?.id, calculationResult?.popupShown, paidPopupEligibleOrderId, conversionRecs, tests]);

  const AgreementNotice = () => (
    <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
      <input
        type="checkbox"
        checked={agreementChecked}
        onChange={(e) => setAgreementChecked(e.target.checked)}
        className="h-3 w-3 accent-amber-400"
        aria-label="同意用户协议和隐私协议"
      />
      <span>查看</span>
      <button
        type="button"
        onClick={() => alert("用户协议\n\n这里展示平台服务条款、付费规则、报告生成与售后说明。")}
        className="text-amber-400 underline-offset-2 hover:underline"
      >
        《用户协议》
      </button>
      <span>和</span>
      <button
        type="button"
        onClick={() => alert("隐私协议\n\n这里展示个人信息收集、使用、保存和保护说明。")}
        className="text-amber-400 underline-offset-2 hover:underline"
      >
        《隐私协议》
      </button>
    </div>
  );

  return (
    <div id="phone-container" className="relative mx-auto w-[390px] h-[800px] bg-slate-950 rounded-[45px] border-[12px] border-amber-900/40 shadow-[0_0_50px_rgba(217,119,6,0.15)] flex flex-col overflow-hidden select-none">
      
      {/* Notch / Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full mr-2"></div>
        <div className="w-10 h-1 bg-neutral-900 rounded-full"></div>
      </div>

      {/* Phone Screen Status Bar */}
      <div className={`h-11 px-6 pt-3 flex items-center justify-between text-[11px] font-semibold z-40 transition-colors duration-300 ${
        "bg-gradient-to-b from-neutral-950 to-transparent text-amber-100/70"
      }`}>
        <span>{currentTime || "12:00"}</span>
        <div className="flex items-center gap-1.5">
          <Wifi className={`w-3 h-3 ${"text-amber-200/60"}`} />
          <span className="text-[10px] tracking-widest text-[#10B981] font-extrabold">5G</span>
          <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-sm ${"bg-neutral-800"}`}>
            <Battery className="w-3.5 h-3.5 text-amber-500" />
            <span className="scale-75 text-[9px]">98%</span>
          </div>
        </div>
      </div>

      {/* Mobile Content Area */}
      <div 
        id="phone-screen" 
        onScroll={handlePhoneContentScroll}
        className={`flex-1 overflow-y-auto px-4 pb-20 pt-1 flex flex-col transition-colors duration-300 scrollbar-thin ${
          "bg-slate-900 text-slate-100 scrollbar-thumb-neutral-800"
        }`}
      >
        
        {/* IF CALCULATING TRANSITION SCREEN */}
        {isCalculating && (
          <div className="absolute inset-x-0 top-11 bottom-16 bg-slate-950/95 z-40 flex flex-col items-center justify-center p-6 text-center">
            {/* Pulsing Emerald Trigram Triggers */}
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border-2 border-emerald-500/30 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full border border-dashed border-emerald-400/80 animate-spin" style={{ animationDuration: "14s" }}></div>
              
              {/* Central Yin-Yang/Trigram Icon - Unlock Theme */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-amber-200 to-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse">
                <span className="text-2xl font-bold text-slate-950 font-serif">🔓</span>
              </div>
            </div>

            <h3 className="text-xl font-sans font-extrabold text-emerald-400 mb-2 tracking-widest">
              专属报告安全解密中
            </h3>
            <p className="text-xs text-neutral-300 max-w-[240px] mb-8 font-sans leading-relaxed">
              ✓ 支付成功！正在建立安全对焦通道，解密并下发您的专属报告...
            </p>

            <div className="w-full bg-slate-900 rounded-xl p-4 border border-neutral-800 text-left max-w-[280px]">
              {decryptionProcessSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`text-xs flex items-center gap-2 py-1.5 transition-all duration-300 ${
                    idx === calcStep 
                      ? "text-emerald-400 font-medium translate-x-2" 
                      : idx < calcStep 
                        ? "text-neutral-500 line-through decoration-neutral-600" 
                        : "text-neutral-700 font-light"
                  }`}
                >
                  <span className={idx === calcStep ? "animate-spin text-emerald-400 shrink-0" : "shrink-0"}>
                    {idx < calcStep ? "✓" : idx === calcStep ? "⚡" : "•"}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETAILS SCREEN */}
        {selectedTest ? (
          <div className="relative flex-1 flex flex-col py-2 animate-fade-in">
            {/* Header / Back & Historical Orders Quick Access */}
            <div className="flex items-center justify-between mb-4 mt-2 font-sans select-none gap-2 shrink-0">
              <button 
                onClick={() => { setSelectedTest(null); setSelectedSkuId(null); setCalculationResult(null); setErrorMsg(""); }}
                className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-lg ${
                  "text-amber-400/80 hover:text-amber-400 hover:bg-white/5"
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> 返回首页
              </button>
              <button
                onClick={() => { setSelectedTest(null); setSelectedSkuId(null); setCalculationResult(null); setErrorMsg(""); setActiveTab("history"); }}
                className="flex items-center gap-1 text-[11px] text-rose-100 font-extrabold bg-rose-500/15 border border-rose-400/50 px-2.5 py-1.5 rounded-full shadow-[0_0_14px_rgba(244,63,94,0.16)] transition-colors cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5" /> 我的订单
              </button>
            </div>

            {/* Banner of active test (completely hidden to simplify details and preview pages) */}
            {false && (
              <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-slate-950 p-4 rounded-2xl border border-red-900/30 shadow-md mb-5 text-left relative overflow-hidden">
                <div className="absolute right-2 bottom-0 text-7xl opacity-5 select-none font-serif text-red-500">
                  {selectedTest.category === "emotion" ? "情" : selectedTest.category === "astrology" ? "星" : selectedTest.category === "mbti" || selectedTest.category === "sbti" ? "格" : "质"}
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  {getCategoryIcon(selectedTest.category)}
                  <h2 className="text-base font-serif font-bold text-amber-200">{selectedTest.name}</h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-[90%]">
                  {selectedTest.description}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-red-400">￥{selectedSalePrice}</span>
                  {selectedOriginalPrice !== undefined && <span className="text-[10px] text-slate-500 line-through">原价 ￥{selectedOriginalPrice}</span>}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4F46E5]/20 text-indigo-300 ml-auto border border-indigo-900/30 font-medium">
                    安全加密支付
                  </span>
                </div>
              </div>
            )}

            {/* REPORT VIEW (IF ALREADY COMPLETED IN THE VIEW) */}
            {calculationResult ? (
              <div className="bg-[#FAF5EC] text-slate-900 p-5 rounded-2xl shadow-xl flex-1 flex flex-col border-4 border-amber-800/40 relative overflow-hidden text-left font-serif animate-fade-in">
                {/* Traditional Stamp & Border decoration */}
                <div className="absolute top-3 right-3 text-red-700/80 border-2 border-red-700/80 font-bold p-1 rounded uppercase tracking-widest text-[9px] -rotate-12 select-none font-sans">
                  天玑测评
                </div>

                <div className="border-b border-dashed border-amber-800/20 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-amber-900 mb-1 font-serif text-center">✨ 个人专属深度测评报告 ✨</h3>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-700">
                    <p><span className="font-sans font-medium text-slate-900">姓名：</span>{calculationResult.userName}</p>
                    <p><span className="font-sans font-medium text-slate-900">性别：</span>{calculationResult.gender === "male" ? "男" : calculationResult.gender === "female" ? "女" : "其他"}</p>
                    {calculationResult.birthDate ? (
                      <>
                        <p><span className="font-sans font-medium text-slate-900">生日：</span>{calculationResult.birthDate}</p>
                        <p><span className="font-sans font-medium text-slate-900">时间：</span>{calculationResult.birthTime || "未知"}</p>
                      </>
                    ) : (
                      <p className="col-span-2"><span className="font-sans font-medium text-slate-900">测评形式：</span>互动答题 (免疫生日排盘)</p>
                    )}
                    {calculationResult.partnerName && (
                      <p className="col-span-2 text-rose-800 font-sans font-medium flex items-center gap-1">
                        <span>💑 伴侣缘：</span>
                        <span>{calculationResult.partnerName} ({calculationResult.partnerGender === "male" ? "男" : "女"})</span>
                      </p>
                    )}
                  </div>
                  {calculationResult.question && (
                    <p className="text-[11px] text-slate-500 mt-2 font-serif italic border-l-2 border-amber-700/30 pl-2">
                      “{calculationResult.question}”
                    </p>
                  )}
                </div>
 
                {/* Report markdown style viewport */}
                <div className="flex-1 text-xs leading-relaxed text-slate-800 overflow-y-auto pr-1 max-h-[360px] scrollbar-thin scrollbar-thumb-amber-200">
                  <div className="space-y-4 whitespace-pre-line font-serif markdown-body-china">
                    {calculationResult.resultReport}
                  </div>
                </div>
 
                <div className="mt-4 rounded-xl border border-amber-800/20 bg-amber-50/70 p-3 font-sans">
                  {currentUser?.phone ? (
                    <p className="text-[11px] text-emerald-700 font-bold">
                      已绑定手机号：{currentUser.phone.slice(0, 3)}****{currentUser.phone.slice(-4)}，报告将永久关联当前用户ID。
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-[11px] text-amber-900 font-bold">绑定手机号，防止报告丢失</p>
                      <div className="space-y-2">
                        <label className="flex items-center h-11 rounded-lg border border-amber-200 bg-white overflow-hidden focus-within:border-amber-500 transition-colors">
                          <span className="w-16 shrink-0 border-r border-amber-100 text-center text-[12px] font-bold text-slate-800">手机号:</span>
                          <input
                            value={bindPhone}
                            onChange={(e) => setBindPhone(e.target.value)}
                            placeholder="输入手机号"
                            className="min-w-0 flex-1 bg-transparent px-3 text-[12px] text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </label>
                        <label className="flex items-center h-11 rounded-lg border border-amber-200 bg-white overflow-hidden focus-within:border-amber-500 transition-colors">
                          <span className="w-16 shrink-0 border-r border-amber-100 text-center text-[12px] font-bold text-slate-800">验证码:</span>
                          <input
                            value={bindCode}
                            onChange={(e) => setBindCode(e.target.value)}
                            placeholder="输入验证码"
                            className="min-w-0 flex-1 bg-transparent px-3 text-[12px] text-slate-900 outline-none placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={handleSendSmsCode}
                            disabled={smsCountdown > 0}
                            className="shrink-0 px-3 text-[11px] font-bold text-amber-800 hover:text-amber-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                          >
                            {smsCountdown > 0 ? `${smsCountdown}S` : "获取验证码"}
                          </button>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handleBindPhone}
                        disabled={isBindingPhone}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-2 rounded-lg disabled:opacity-60"
                      >
                        {isBindingPhone ? "绑定中..." : "绑定并保存报告"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 border-t border-dashed border-amber-800/20 pt-4">
                  <button
                    onClick={() => { setCalculationResult(null); }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-200 text-xs font-sans font-semibold py-2.5 rounded-xl transition-all shadow text-center"
                  >
                    重新测评
                  </button>
                </div>
              </div>
            ) : previewGenerating ? (
              <div className="flex-1 bg-slate-950 p-6 rounded-2xl border border-neutral-850 flex flex-col justify-center items-center text-center space-y-6 animate-fade-in relative overflow-hidden my-auto min-h-[300px]">
                <div className="absolute inset-x-0 -top-12 h-44 bg-gradient-to-b from-amber-500/10 to-transparent blur-2xl"></div>
                
                {/* Micro spinner or pulsing node */}
                <div className="relative w-20 h-20 flex items-center justify-center mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-amber-500/20 animate-pulse"></div>
                  <div className="absolute inset-4 rounded-full border border-dashed border-amber-400 animate-spin" style={{ animationDuration: "5s" }}></div>
                  <Brain className="w-6 h-6 text-amber-400 z-10" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-amber-200">✨ 专属报告生成中...</h3>
                  <p className="text-[9px] text-slate-450 mt-1">AI 正在整理你的测评结果</p>
                </div>

                <div className="w-full max-w-[260px] bg-slate-900 border border-neutral-850/50 p-3 rounded-xl space-y-2 text-left shrink-0 font-sans">
                  {previewSteps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`text-[9px] flex items-center gap-2 py-0.5 transition-all duration-300 ${
                        idx === previewStep 
                          ? "text-amber-300 font-medium translate-x-1" 
                          : idx < previewStep 
                            ? "text-slate-500 line-through decoration-slate-600" 
                            : "text-slate-650 font-light"
                      }`}
                    >
                      <span className={idx === previewStep ? "animate-spin text-amber-400 shrink-0" : "shrink-0"}>
                        {idx < previewStep ? "✓" : idx === previewStep ? "⚡" : "•"}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : showPreviewReport ? (
              <div className="flex-1 flex flex-col text-left relative overflow-hidden animate-fade-in font-sans pb-20">
                {/* Expectations Header Text & Subtle Customer Service link */}
                <div className="text-center space-y-1.5 mb-4 shrink-0 bg-slate-900 border border-neutral-850 p-3 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                    ✨ 支付完成即可解锁深度分析报告
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    回答及测算数据已被安全接收。付款后将立即输出专属报告：
                  </p>
                  <div className="flex items-center justify-center text-[9px] text-slate-500">
                    <span>遇到支付问题？</span>
                    <button 
                      onClick={handleCustomerService}
                      className="text-amber-500 font-bold underline ml-1 focus:outline-none cursor-pointer"
                    >
                      投诉
                    </button>
                  </div>
                </div>

                {/* Expectations Main Cards Container */}
                <div className="space-y-4.5 overflow-y-auto max-h-[380px] pr-0.5 scrollbar-thin">
                  {/* FREE UNLOCKED COGNITIVE TEASER / LEAD-IN (引子) */}
                  <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-3.5 space-y-3 relative overflow-hidden text-left">
                    {/* Glowing "Unlocked / Free" top bar */}
                    <div className="flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h5 className="text-[10px] font-sans text-emerald-400 font-extrabold uppercase tracking-widest">
                          第一阶段 · 心源特征初步诊断报告
                        </h5>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black border border-emerald-500/20 px-1.5 py-0.25 rounded-md flex items-center gap-0.5">
                        🔓 免费预览已解锁
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-lg border border-neutral-850/50 space-y-3">
                      <p className="text-[9px] text-slate-300 leading-relaxed font-serif">
                        根据参测者 <span className="text-amber-300 font-sans font-bold">{userName || "测试用户"}</span> 填报的数据，系统智能抓取到您潜在的本源心智图谱：您易在人际互动中展现出<span className="text-emerald-400">“表面沉稳、极速共情”</span>的特质。思维层次分明且具有极强的主动纠偏功能，以下为您初步评测的多维指标系数：
                      </p>

                      {/* Interactive indicator bars */}
                      <div className="space-y-2 text-slate-400">
                        {[
                          { label: "情绪敏感度 (Sensibility)", val: 78, color: "from-pink-500 to-rose-500", labelZh: "高反应感知力" },
                          { label: "潜意识直觉 (Intuition)", val: 86, color: "from-purple-500 to-indigo-500", labelZh: "深层洞察天赋" },
                          { label: "依恋包容性 (Attachment)", val: 64, color: "from-emerald-500 to-teal-500", labelZh: "安全共建欲望" },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between text-[8px]">
                              <span className="text-slate-300 font-medium">{item.label}</span>
                              <span className="text-emerald-400 font-bold">{item.val}% ({item.labelZh})</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden p-0.25 border border-white/5">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                                style={{ width: `${item.val}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const titles = (() => {
                      switch (selectedTest.category) {
                        case "mbti":
                        case "sbti":
                          return {
                            t1: "你隐藏的16型人格原初野心与潜能极位",
                            t2: "哪种职业环境与团队角色最适合你的特质",
                            desc1: "什么时候你才能找到本能发挥且得心应手、薪资丰厚的最优职业生态位？",
                            desc2: "你的职场致命生存雷区在何处，如何通过性格盲区防抱死机制实现逆袭？"
                          };
                        case "astrology":
                          return {
                            t1: "你的三位一体个人心理投影与人生星盘画布",
                            t2: "一生大运起伏变化与运势转机时间节点",
                            desc1: "代表个人核心意志、情绪本源与社会角色外壳的深层力量如何在此生交互碰撞？",
                            desc2: "你在何年何月最易获得财富跃迁、正缘现身或事业高光的终极星历指引？"
                          };
                        case "emotion":
                          return {
                            t1: "你距离理想爱情还有多远 · 脱单预测",
                            t2: "什么样的异性最适合与你白头偕老",
                            desc1: "什么时候你才能摆脱单身寂寞？您的Ta到底什么时候才会出现？",
                            desc2: "你们深层性格中是否存在天然的宿命羁绊、防御墙冲突还是安全型依恋纽带？"
                          };
                        case "personality":
                          return {
                            t1: "萨提亚四型恋爱人格依恋情结极深剖析",
                            t2: "逆转不安全感建立极高情商恋爱机制的自愈药方",
                            desc1: "为什么你往往一遇到极其心动、极度在乎的人就会瞬间感到冷淡或想要逃避？",
                            desc2: "如何打破焦虑/回避的循环痛苦，重塑恋爱依恋光谱里的完美安全感锚点？"
                          };
                        case "career":
                          return {
                            t1: "高情商与核心职场特质极轴多参数指标",
                            t2: "黄金社交沟通段位与高压恢复能效",
                            desc1: "你的本源社交常模和职场情绪稳定度、能量恢复带宽处于何等水平？",
                            desc2: "如何从管理新人或基层突破自我天花板，掌握以柔克刚的情商平衡艺术？"
                          };
                        default:
                          return {
                            t1: "您专属的成长潜能核心心智常模画布",
                            t2: "突破当下困惑与未来瓶颈的关键钥匙",
                            desc1: "您的心理防卫机制、在特定压力场景下的潜在决策偏向该如何科学校正？",
                            desc2: "针对您具体输入的问询切入点，专属AI大语言深度星历模型有何惊喜开解？"
                          };
                      }
                    })();

                    return (
                      <>
                        {/* Expected Card 1 */}
                        <div className="bg-slate-900 border border-neutral-800 rounded-xl p-3.5 space-y-3 relative overflow-hidden text-center">
                          <h5 className="text-[11px] font-bold text-rose-400 flex items-center justify-center gap-1.5">
                            <span>•••••</span>
                            <Heart className="w-3 text-rose-500 fill-rose-500" />
                            <span>{titles.t1}</span>
                            <Heart className="w-3 text-rose-500 fill-rose-500" />
                            <span>•••••</span>
                          </h5>

                          <div className="relative p-3 bg-slate-950/60 rounded-lg border border-neutral-850/60 text-left">
                            {/* Blur effect container (Figure 1: Expectation blur) */}
                            <div className="filter blur-[1.8px] opacity-30 select-none text-[9px] text-slate-300 leading-relaxed space-y-1.5">
                              <p className="font-bold text-amber-500">◆ 深度诊断：{userName || "测试用户"}</p>
                              <p>{titles.desc1}</p>
                              <p>通过多维数据交互，系统深度比算此项专属诊断，该层评估含有大约 2400 字的核心常模极性剖析，旨在彻底打破您的自我认知迷航。</p>
                            </div>
                            
                            {/* Padlock button overlay (Figure 1: Paid unlock button) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button
                                onClick={() => setShowPaymentGate(true)}
                                className="bg-[#FFE600] text-slate-950 text-2xs font-extrabold px-3 py-1.5 rounded-full shadow-[0_3px_10px_rgba(255,230,0,0.3)] flex items-center gap-1 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              >
                                🔒 付费解锁
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expected Card 2 */}
                        <div className="bg-slate-900 border border-neutral-800 rounded-xl p-3.5 space-y-3 relative overflow-hidden text-center">
                          <h5 className="text-[11px] font-bold text-rose-400 flex items-center justify-center gap-1.5">
                            <span>•••••</span>
                            <Heart className="w-3 text-rose-500 fill-rose-500" />
                            <span>{titles.t2}</span>
                            <Heart className="w-3 text-rose-500 fill-rose-500" />
                            <span>•••••</span>
                          </h5>

                          <div className="relative p-3 bg-slate-950/60 rounded-lg border border-neutral-850/60 text-left">
                            {/* Blur effect container */}
                            <div className="filter blur-[1.8px] opacity-30 select-none text-[9px] text-slate-300 leading-relaxed space-y-1.5">
                              <p className="font-bold text-amber-500">◆ 心理定向：核心势能维度分析</p>
                              <p>{titles.desc2}</p>
                              <p>高维心理向量对焦结果，结合荣格原型深度图景，本阶段章节包含详细的行为漏洞避雷针、伴侣互处雷区和情商自省对焦报告。</p>
                            </div>
                            
                            {/* Padlock button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button
                                onClick={() => setShowPaymentGate(true)}
                                className="bg-[#FFE600] text-slate-950 text-2xs font-extrabold px-3 py-1.5 rounded-full shadow-[0_3px_10px_rgba(255,230,0,0.3)] flex items-center gap-1 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              >
                                🔒 付费解锁
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="text-center py-2 text-[9px] text-slate-500 flex items-center justify-center gap-1 pb-4">
                    <span>🛡️ SSL数字安全托管协议保障</span>
                    <span>•</span>
                    <span>AI超算中枢数据对焦</span>
                  </div>
                </div>

                {/* 2. Sticky Pricing Bottom Bar (Figure 1: Sticky bar at bottom of payment page) */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-[#EE4035] flex items-center justify-between pl-4 pr-3.5 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.3)] border-t border-red-500">
                  {/* Left: Price and countdown */}
                  <div className="-ml-4 flex h-full min-w-[145px] flex-col justify-center border border-red-300/25 bg-[#F4433B] px-3 text-left font-sans shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-slate-100 text-[10px]">¥</span>
                      <span className="text-slate-100 font-extrabold text-lg leading-tight">
                        {selectedSalePrice}
                      </span>
                      {selectedOriginalPrice !== undefined && (
                        <span className="text-rose-200/70 line-through text-[9px]">
                          原价 ¥{selectedOriginalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-rose-100/90 text-[9px] font-black mt-0.5 leading-none flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 animate-pulse" />
                      <span>优惠倒计时：{countdown}</span>
                    </div>
                  </div>

                  {/* Right: Gold pulsating buy button */}
                  <button
                    onClick={() => setShowPaymentGate(true)}
                    className="bg-[#FFE600] hover:bg-[#ebd200] active:scale-97 text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg flex items-center gap-0.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>解锁全部内容</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ) : (
              /* FORM SUBMISSION VIEW / MULTI-PHASE WORKFLOW */
              <div className="space-y-4">
                {testPhase === "landing" && (
                  <div className="animate-fade-in text-left space-y-4">
                    {/* Tiny Cloud Safety Warning at Top */}
                    <div className="bg-slate-950/40 text-[9px] text-slate-400 py-1 px-3 rounded-lg border border-neutral-850/40 flex items-center justify-between font-sans">
                      <span>🔒 本网页数据安全由阿里云提供，严格加密</span>
                      <span className="text-[#10B981] font-bold">● 严防泄露</span>
                    </div>

                    {/* RENDER CATEGORY SPECIFIC LAYOUTS */}
                    {selectedTest.category === "emotion" && (
                      /* FIGURE 1: LOVE TOTEM / RELATIONSHIP LANDING STYLE */
                      <div className="bg-gradient-to-b from-[#110c22] via-slate-950 to-[#0e0a1b] p-5 rounded-2xl border border-pink-900/25 shadow-xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
                        {/* Upper brand */}
                        <div className="w-full flex items-center justify-between text-[11px] text-pink-300 font-sans border-b border-pink-950/60 pb-1.5">
                          <span className="font-semibold tracking-wider">天玑测算 • 爱情图腾类型生成器</span>
                          <span className="text-pink-400">☰</span>
                        </div>

                        {/* Title Display Banner */}
                        <div className="w-full pt-1">
                          <span className="inline-block text-[9px] bg-pink-950 text-pink-300 border border-pink-700/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                            生成器 GENERATOR
                          </span>
                          <h2 className="text-lg font-serif font-extrabold text-pink-100 tracking-wider mt-1.5">
                            爱情图腾类型
                          </h2>
                          <p className="text-[10px] text-slate-400 font-sans mt-1">
                            测一测，生成你的爱情图腾，让它守护你的爱情你的心
                          </p>
                        </div>

                        {/* Holographic Glowing Constellation beast / circle */}
                        <div className="relative w-44 h-44 my-2 flex items-center justify-center">
                          {/* Continuous spin outer star seal */}
                          <div className="absolute inset-0 rounded-full border border-dashed border-pink-500/30 animate-spin" style={{ animationDuration: "20s" }} />
                          <div className="absolute inset-1.5 rounded-full border border-double border-pink-500/10" />
                          <div className="absolute inset-4 rounded-full border border-pink-500/20 bg-pink-950/20 shadow-[0_0_25px_rgba(244,63,94,0.15)] flex items-center justify-center">
                            {/* Inner Zodiac vector beast (Lion) design */}
                            <div className="relative w-32 h-32 flex items-center justify-center overflow-hidden rounded-full">
                              {/* Beautiful starry background constellation overlay */}
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-950/40 via-transparent to-transparent opacity-80" />
                              
                              {/* Stylized vector representation of the starry lion / totem */}
                              <svg viewBox="0 0 100 100" className="w-24 h-24 text-pink-400/90 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse">
                                {/* Sacred Geometrical star connection lines */}
                                <line x1="20" y1="50" x2="35" y2="25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
                                <line x1="35" y1="25" x2="65" y2="25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
                                <line x1="65" y1="25" x2="80" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
                                <line x1="80" y1="50" x2="65" y2="75" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
                                <line x1="65" y1="75" x2="35" y2="75" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
                                <line x1="35" y1="75" x2="20" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
                                
                                <line x1="35" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" />
                                <line x1="65" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" />
                                <line x1="65" y1="75" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" />
                                <line x1="35" y1="75" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" />

                                {/* Lion/Beast stylized path */}
                                <path d="M 50 32 C 43 32, 38 37, 38 45 C 38 53, 44 55, 41 62 C 45 61, 48 58, 50 58 C 52 58, 55 61, 59 62 C 56 55, 62 53, 62 45 C 62 37, 57 32, 50 32 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                <circle cx="50" cy="45" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
                                <path d="M 46 45 C 48 48, 52 48, 54 45" fill="none" stroke="currentColor" strokeWidth="1" />
                                <circle cx="20" cy="50" r="1.5" fill="#f472b6" />
                                <circle cx="35" cy="25" r="1.5" fill="#f472b6" />
                                <circle cx="65" cy="25" r="1.5" fill="#f472b6" />
                                <circle cx="80" cy="50" r="1.5" fill="#f472b6" />
                                <circle cx="65" cy="75" r="1.5" fill="#f472b6" />
                                <circle cx="35" cy="75" r="1.5" fill="#f472b6" />
                                <circle cx="50" cy="50" r="2" fill="#fb7185" className="animate-ping" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Totem Features Outline */}
                        <div className="w-full bg-slate-950/60 p-3.5 rounded-xl border border-neutral-900 text-left space-y-2 text-[10px] text-slate-400 font-sans leading-relaxed">
                          <p className="font-semibold text-pink-300 text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>🧠 婚姻契合与亲密关系图腾包含</span>
                            <span className="text-amber-400">HOT 🔥</span>
                          </p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1">🔒 1. 心理依恋契合大图谱</span>
                            <span className="flex items-center gap-1">🦁 2. 双人特质守护兽映射</span>
                            <span className="flex items-center gap-1">❤️ 3. 伴侣偏好沟通雷区防线</span>
                            <span className="flex items-center gap-1">⚓ 4. 2026 关系防避与稳固向导</span>
                          </div>
                        </div>

                        {/* Instant CTA Button Skipping multiple choice */}
                        <AgreementNotice />
                        <motion.button
                          type="button"
                          onClick={() => setTestPhase(getAssessmentMode(selectedTest) === "quiz_score" ? "quiz" : "form")}
                          className="w-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-slate-950 font-extrabold py-4 px-4 rounded-xl text-xs tracking-wider cursor-pointer font-serif flex items-center justify-center gap-2 border border-pink-300/20 relative overflow-hidden"
                          animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              "0 12px 24px -3px rgba(244, 63, 94, 0.35), 0 0 0 0px rgba(244, 63, 94, 0.25)",
                              "0 18px 36px -3px rgba(244, 63, 94, 0.65), 0 0 0 12px rgba(244, 63, 94, 0)",
                              "0 12px 24px -3px rgba(244, 63, 94, 0.35), 0 0 0 0px rgba(244, 63, 94, 0.25)"
                            ]
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                        >
                          {/* Shimmer Stream */}
                          <div className="absolute inset-x-0 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none animate-sweep" />
                          <Heart className="w-4 h-4 fill-current animate-pulse text-slate-950" />
                          <span>{selectedTest.detailButtonText || "立即测算"} ➔</span>
                        </motion.button>
                        <p className="text-[9px] text-slate-500">点击直接输入双方生辰与姓名配对，无需答题</p>
                      </div>
                    )}

                    {selectedTest.category === "mbti" && (
                      /* FIGURE 2: MBTI 16 TYPES / PROFESSIONAL LANDING STYLE - CUSTOM COMPETE STYLE */
                      <div className="space-y-4 text-left font-sans animate-fade-in text-slate-200">
                        {/* 🌟 GORGEOUS HIGHLIGHTED TOP HEAD BANNER */}
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-700 via-[#3B82F6] to-cyan-500 p-5 text-white shadow-lg border border-indigo-200/20 text-center flex flex-col justify-center items-center min-h-[190px]">
                          {/* Floating aesthetic shapes mimicking illustration */}
                          <div className="absolute top-2 left-3 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
                          <div className="absolute bottom-1 right-2 w-24 h-24 bg-yellow-400/10 rounded-full blur-lg pointer-events-none" />
                          
                          {/* Animated vector silhouettes of modern creative minds */}
                          <div className="absolute inset-0 opacity-15 flex items-end justify-between pointer-events-none px-4">
                            {/* SVG people working or showing heads */}
                            <svg viewBox="0 0 100 100" className="w-16 h-16 text-white">
                              <path d="M 10 90 Q 25 60 40 90 Z" fill="currentColor"/>
                              <circle cx="25" cy="50" r="12" fill="currentColor"/>
                            </svg>
                            <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
                              <path d="M 20 100 Q 50 40 80 100 Z" fill="currentColor"/>
                              <circle cx="50" cy="30" r="16" fill="currentColor"/>
                            </svg>
                          </div>

                          <span className="text-[9px] uppercase tracking-[0.2em] font-black bg-white/15 px-2.5 py-0.75 rounded-full border border-white/20 shadow-sm backdrop-blur-xs text-yellow-200 mb-2 font-mono">
                            OFFICIAL ASSESSMENT
                          </span>
                          <h1 className="text-lg font-black tracking-wider text-white drop-shadow-md">
                            MBTI 职业性格测评
                          </h1>
                          <p className="text-[10px] text-indigo-100 font-medium tracking-tight mt-1 opacity-90">
                            「 了解您的性格优势，找对您的职场跑道 」
                          </p>

                          {/* Bright yellow competitor style banner card */}
                          <div className="mt-3.5 bg-[#FEF08A] text-amber-955 px-4 py-1.5 rounded-full text-[10px] font-black shadow-md border border-yellow-300 animate-pulse flex items-center gap-1">
                            <span className="text-rose-500">❖</span>
                            <span>你的性格，适合什么样的工作？</span>
                            <span className="text-rose-500">❖</span>
                          </div>

                          {/* Test stats banner */}
                          <div className="text-[9px] text-indigo-200 mt-2.5 opacity-80 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                            <span>当前已有 20,156 人完成职业测评鉴定</span>
                          </div>
                        </div>

                        {/* 🌟 1. 测评介绍 (ASSESSMENT INTRO) */}
                        <div className="bg-slate-950/60 rounded-2xl p-4 border border-neutral-900 shadow-sm space-y-3">
                          <div className="flex items-center gap-1.5 border-b border-dashed border-neutral-800 pb-2">
                            <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                            <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest font-sans">测评介绍 • Career Orientation</h3>
                          </div>
                          
                          <div className="text-[11.5px] leading-relaxed text-slate-300 space-y-2">
                            <p>
                              内在职业性格，在很大程度上决定了你适合什么样的工作、在什么样的岗位上能彻底被激活。
                            </p>
                            <p className="font-medium text-slate-300">
                              你是否也常叩问自省：“我到底适合哪种职业类别？我的隐性特质瓶颈是什么？看重薪水，还是追求自我价值在职场中的极致破局？”
                            </p>
                            
                            {/* Blue highlighted text block like competitor */}
                            <div className="bg-blue-950/30 border-l-4 border-blue-500/80 p-2.5 rounded-r-xl select-none text-[10.5px]">
                              <p className="font-black text-blue-300 font-sans tracking-wide">
                                事实上，在波澜壮阔的职业长跑中：
                              </p>
                              <p className="text-blue-200 font-semibold mt-1 font-serif">
                                “做对符合本源性格的选择，往往比盲目的努力更为关键。”
                              </p>
                            </div>

                            <p className="text-[10.5px] text-slate-500 leading-snug">
                              若懂得依凭自身性格优势在最舒适的生态位中成长，便可享受工作本身所带来的无限心流愉感，释放更优秀的自我潜能。
                            </p>
                          </div>
                        </div>

                        {/* 🌟 2. 你将获得 (WHAT YOU WILL GET) */}
                        <div className="bg-slate-950/60 rounded-2xl p-4 border border-neutral-900 shadow-sm space-y-3">
                          <div className="flex items-center gap-1.5 border-b border-dashed border-neutral-800 pb-2">
                            <span className="w-1 h-3.5 bg-rose-500 rounded-full" />
                            <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest font-sans">你将获得 • Core Deliverables</h3>
                          </div>

                          <div className="space-y-3.5 pt-1">
                            {/* Dimensions layout styled exactly as the colorful competitor image boxes */}
                            <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-neutral-800/80">
                              <span className="block text-[10px] font-black text-indigo-300 border-b border-neutral-800 pb-1.5 text-center">
                                【 MBTI 核心四大维度八个方向常模分布 】
                              </span>

                              <div className="grid grid-cols-1 gap-1.5 pt-1 font-sans text-[10px] text-white">
                                {/* Row 1: Energy */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div className="bg-[#3B82F6] hover:bg-blue-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">E</span>
                                    <p className="text-[11px] font-extrabold text-white">E 外向 <span className="text-[7.5px] font-normal text-blue-100">Extrovert</span></p>
                                    <p className="text-[9.5px] text-blue-100 leading-tight mt-0.5 font-medium">从社交场合互动中唤醒能量</p>
                                  </div>
                                  <div className="bg-[#EC4899] hover:bg-pink-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">I</span>
                                    <p className="text-[11px] font-extrabold text-white">I 内向 <span className="text-[7.5px] font-normal text-pink-100 font-medium">Introvert</span></p>
                                    <p className="text-[9.5px] text-pink-100 leading-tight mt-0.5 font-medium">从深度静思独处中汲取心力</p>
                                  </div>
                                </div>

                                {/* Row 2: Sensing vs Intuition */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div className="bg-[#F43F5E] hover:bg-rose-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">S</span>
                                    <p className="text-[11px] font-extrabold text-white">S 实感 <span className="text-[7.5px] font-normal text-rose-100 font-medium">Sensing</span></p>
                                    <p className="text-[9.5px] text-rose-50 leading-tight mt-0.5 font-medium">关注五官实存的客观物理世界</p>
                                  </div>
                                  <div className="bg-[#10B981] hover:bg-emerald-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">N</span>
                                    <p className="text-[11px] font-extrabold text-white">N 直觉 <span className="text-[7.5px] font-normal text-emerald-100">Intuition</span></p>
                                    <p className="text-[9.5px] text-emerald-50 leading-tight mt-0.5 font-medium">看重直觉灵光与概念深层规律</p>
                                  </div>
                                </div>

                                {/* Row 3: Thinking vs Feeling */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div className="bg-[#3B82F6] hover:bg-blue-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">T</span>
                                    <p className="text-2xs font-extrabold text-white">T 思考 <span className="text-[7.5px] font-normal text-blue-100">Thinking</span></p>
                                    <p className="text-[9.5px] text-blue-100 leading-tight mt-0.5 font-medium">讲求数据理智和严格因果事实</p>
                                  </div>
                                  <div className="bg-[#EC4899] hover:bg-pink-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">F</span>
                                    <p className="text-2xs font-extrabold text-white">F 情感 <span className="text-[7.5px] font-normal text-pink-100 font-medium">Feeling</span></p>
                                    <p className="text-[9.5px] text-pink-100 leading-tight mt-0.5 font-medium">根据共同体价值观寻求和谐共鸣</p>
                                  </div>
                                </div>

                                {/* Row 4: Judging vs Perceiving */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div className="bg-[#F43F5E] hover:bg-rose-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">J</span>
                                    <p className="text-2xs font-extrabold text-white">J 判断 <span className="text-[7.5px] font-normal text-rose-100 font-medium">Judging</span></p>
                                    <p className="text-[9.5px] text-rose-50 leading-tight mt-0.5 font-medium">偏好严密规程、条理的终局结论</p>
                                  </div>
                                  <div className="bg-[#10B981] hover:bg-emerald-600 transition-colors rounded-xl p-2.5 shadow-xs relative">
                                    <span className="absolute top-1 right-2 opacity-15 text-lg font-black">P</span>
                                    <p className="text-2xs font-extrabold text-white">P 知觉 <span className="text-[7.5px] font-normal text-emerald-100 font-medium">Perceiving</span></p>
                                    <p className="text-[9.5px] text-emerald-50 leading-tight mt-0.5 font-medium">喜欢保留弹性选项及即兴探寻</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 🌟 PREMIUM GRAPH LEVEL 2: DYNAMIC SVG RADAR CHART PREVIEW */}
                            <div className="p-3 bg-slate-900/50 rounded-xl border border-neutral-800/80 space-y-2 flex flex-col items-center">
                              <div className="text-[10px] font-black text-indigo-300 border-b border-neutral-800 pb-1.5 text-center w-full">
                                【 职业9大维度核心能力雷达评估预览 】
                              </div>
                              <p className="text-[9px] text-slate-500 font-medium self-start">以下为报告样本，测完解锁专属大模型星宿核验百分位常模：</p>
                              
                              <div className="w-full max-w-[220px] h-[220px] relative mt-1 select-none flex items-center justify-center">
                                {/* SVG Radar drawing */}
                                <svg className="w-full h-full" viewBox="-110 -110 220 220">
                                  {/* Concentric hexagonal grid rings */}
                                  {[20, 40, 60, 80, 100].map((r) => {
                                    const points = Array.from({ length: 9 }).map((_, i) => {
                                      const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
                                      return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                                    }).join(" ");
                                    return (
                                      <polygon
                                        key={r}
                                        points={points}
                                        fill="none"
                                        stroke="#334155"
                                        strokeWidth="0.5"
                                        strokeDasharray={r === 100 ? "none" : "1,2"}
                                      />
                                    );
                                  })}

                                  {/* Straight axis lines */}
                                  {Array.from({ length: 9 }).map((_, i) => {
                                    const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
                                    const x = 100 * Math.cos(angle);
                                    const y = 100 * Math.sin(angle);
                                    return (
                                      <line
                                        key={i}
                                        x1="0"
                                        y1="0"
                                        x2={x}
                                        y2={y}
                                        stroke="#334155"
                                        strokeWidth="0.5"
                                      />
                                    );
                                  })}

                                  {/* Actual sample capabilities filled polygon */}
                                  {(() => {
                                    const values = [85, 72, 90, 65, 80, 88, 75, 92, 83];
                                    const points = values.map((val, i) => {
                                      const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
                                      return `${val * Math.cos(angle)},${val * Math.sin(angle)}`;
                                    }).join(" ");
                                    return (
                                      <>
                                        <polygon
                                          points={points}
                                          fill="rgba(244, 63, 94, 0.15)"
                                          stroke="#F43F5E"
                                          strokeWidth="1.5"
                                        />
                                        {/* Poly points */}
                                        {values.map((val, i) => {
                                          const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
                                          const x = val * Math.cos(angle);
                                          const y = val * Math.sin(angle);
                                          return <circle key={i} cx={x} cy={y} r="3" fill="#F43F5E" stroke="#FFF" strokeWidth="1" />;
                                        })}
                                      </>
                                    );
                                  })()}

                                  {/* Text labels for axes */}
                                  {[
                                    "文艺美感", "分析研究", "整理归纳",
                                    "谈判技巧", "人际沟通", "逻辑思考",
                                    "策略拟定", "观察能力", "创意设计"
                                  ].map((label, i) => {
                                    const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
                                    const x = 112 * Math.cos(angle);
                                    const y = 112 * Math.sin(angle);
                                    // Fine-tune text-anchor and alignment
                                    let anchor = "middle";
                                    if (Math.cos(angle) > 0.1) anchor = "start";
                                    if (Math.cos(angle) < -0.1) anchor = "end";
                                    return (
                                      <text
                                        key={i}
                                        x={x}
                                        y={y + 3}
                                        fontSize="8"
                                        fontWeight="bold"
                                        fill="#94A3B8"
                                        textAnchor={anchor}
                                      >
                                        {label}
                                      </text>
                                    );
                                  })}
                                </svg>
                                <span className="absolute bottom-2 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-black text-slate-300 uppercase font-sans">
                                  ▲ 诊断报告部分剖面截图（样本演示） ▲
                                </span>
                              </div>
                            </div>

                            {/* Crisp bullet list */}
                            <div className="space-y-2.5 text-[11.5px] text-slate-300 font-sans leading-relaxed">
                              <p className="flex items-start gap-1.5">
                                <span className="text-red-500 font-mono font-bold">✓ 1.</span>
                                <span><strong>本真性格鉴定：</strong>了解你在16型经典学说模型中最真实的心情图谱；</span>
                              </p>
                              <p className="flex items-start gap-1.5">
                                <span className="text-red-500 font-mono font-bold">✓ 2.</span>
                                <span><strong>职场9维量表：</strong>科学反馈个人在逻辑思考、谈判决策方面的综合战力；</span>
                              </p>
                              <p className="flex items-start gap-1.5">
                                <span className="text-red-500 font-mono font-bold">✓ 3.</span>
                                <span><strong>生态圈层指南：</strong>找出最心仪契合的职业与工作组，建立核心避阻机制；</span>
                              </p>
                              <p className="flex items-start gap-1.5">
                                <span className="text-red-500 font-mono font-bold">✓ 4.</span>
                                <span><strong>AI 专属发展解案：</strong>针对您输入的个性化诉求进行多因子针对性解答。</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 🌟 3. 理论背景 (THEORETICAL BACKGROUND) */}
                        <div className="bg-slate-950/60 rounded-2xl p-4 border border-neutral-900 shadow-sm space-y-2">
                          <div className="flex items-center gap-1.5 border-b border-dashed border-neutral-800 pb-2">
                            <span className="w-1 h-3.5 bg-indigo-600 rounded-full" />
                            <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest font-sans">理论背景 • Theoretical Roots</h3>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 leading-relaxed font-serif">
                            MBTI 是一种基于卡尔·荣格（Carl G. Jung）心理类型学说的性格表评测算工具。通过测算获取性格优势，对齐心流与职场。本工具吸收了迈尔斯-布里格斯（Myers-Briggs）研究，是公认权威的职业和个人关系心理探针。
                          </p>
                        </div>

                        {/* 🌟 4. 测评须知 (PRE-TEST NOTICE) */}
                        <div className="bg-slate-950/60 rounded-2xl p-4 border border-neutral-900 shadow-sm space-y-2 text-slate-300 text-[10.5px]">
                          <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-1.5">
                            <span className="w-1 h-3.5 bg-indigo-950 rounded-full" />
                            <span className="font-bold text-slate-200">测评须知</span>
                          </div>
                          <div className="space-y-1 leading-normal font-sans text-slate-500">
                            <p>1. 本测试共计3道精心提炼的自省考题，平均需消耗1分钟。</p>
                            <p>2. 请在舒畅且无外界严重干扰的氛围中，依凭第一潜意识感觉进行挑选。</p>
                            <p>3. 所有档案信息经行业安全加密体系传输，确保个人信息免于泄露。</p>
                          </div>
                        </div>

                        {/* BOTTOM ACTIONS BAR - Persisted Exactly like Competitor! */}
                        <div className="pt-2 flex flex-col space-y-2 bg-transparent">
                          <AgreementNotice />
                          {/* Main Trigger */}
                          <motion.button
                            type="button"
                            onClick={() => setTestPhase(getAssessmentMode(selectedTest) === "quiz_score" ? "quiz" : "form")}
                            className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs tracking-wider cursor-pointer font-sans shadow-md flex items-center justify-center gap-1.5 border border-rose-400/20 relative overflow-hidden"
                            animate={{
                              scale: [1, 1.03, 1],
                              boxShadow: [
                                "0 4px 12px rgba(244, 63, 94, 0.25)",
                                "0 6px 18px rgba(244, 63, 94, 0.45)",
                                "0 4px 12px rgba(244, 63, 94, 0.25)"
                              ]
                            }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <div className="absolute inset-x-0 top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none animate-sweep" />
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            <span className="text-white text-xs font-black">{selectedTest.detailButtonText || "立即测算"} ➔</span>
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {selectedTest.category === "astrology" && (
                      /* CATEGORY: ASTROLOGY DETAILED LANDING STYLE */
                      <div className="bg-[#05050f] border border-amber-900/30 rounded-2xl p-5 text-left space-y-4 shadow-xl relative overflow-hidden">
                        {/* Upper cosmos glow */}
                        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 blur-[40px]" />
                        
                        <div className="border-b border-amber-950 pb-2 flex items-center justify-between text-[11px] font-sans text-amber-500">
                          <span className="font-bold">⭐ 天玑排盘 • 星占本命命宫</span>
                          <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[9px]">西洋殿堂级本源</span>
                        </div>

                        <div className="flex flex-col items-center py-2 text-center text-slate-300">
                          <Compass className="w-12 h-12 text-amber-500 animate-spin" style={{ animationDuration: "25s" }} />
                          <h3 className="text-sm font-bold font-serif text-amber-100 mt-2.5">【本命星盘太阳/月亮/上升全面剖析】</h3>
                          <p className="text-[10px] text-slate-400 max-w-[90%] mt-1 leading-snug">追溯行星凌日黄道行度，解析您的生辰命轮密码与流年情感走势。</p>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-neutral-900 space-y-2.5">
                          <h4 className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">🌟 深度星盘报告包含：</h4>
                          <span className="block border-t border-neutral-900" />
                          <div className="space-y-2 text-[11px] text-slate-300 font-sans leading-relaxed">
                            <p className="flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5 font-bold">✨</span>
                              <span><strong>本命三位一体：</strong>精准计算您的太阳、月亮和上升星座构成的隐性人格画布；</span>
                            </p>
                            <p className="flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5 font-bold">✨</span>
                              <span><strong>宫位深度透视：</strong>聚焦解读第5宫（恋爱宫）、第7宫（夫妻正缘）、第10宫（事业/名利）；</span>
                            </p>
                            <p className="flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5 font-bold">✨</span>
                              <span><strong>金/火能量星位：</strong>分析您的审美冲动、爱的引力以及潜在两性契合磁场细节。</span>
                            </p>
                          </div>
                        </div>

                    <motion.button
                          type="button"
                          onClick={() => setTestPhase(getAssessmentMode(selectedTest) === "quiz_score" ? "quiz" : "form")}
                          className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs tracking-wider cursor-pointer font-sans flex items-center justify-center gap-2 border border-amber-200/40 shadow-[0_10px_25px_rgba(245,158,11,0.25)] relative overflow-hidden"
                          animate={{
                            scale: [1, 1.03, 1],
                            boxShadow: [
                              "0 8px 20px rgba(245, 158, 11, 0.20)",
                              "0 12px 30px rgba(245, 158, 11, 0.38)",
                              "0 8px 20px rgba(245, 158, 11, 0.20)"
                            ]
                          }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="absolute inset-x-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent -skew-x-12 pointer-events-none animate-sweep" />
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>{selectedTest.detailButtonText || "开始填写资料"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    )}

                    {!["emotion", "mbti", "astrology"].includes(selectedTest.category) && (
                      <div className="bg-slate-950/70 border border-neutral-900 rounded-2xl p-5 text-left space-y-4 shadow-xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-[42px]" style={{ backgroundColor: `${selectedTest.detailThemeColor || "#f59e0b"}22` }} />
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <span className="text-[10px] font-bold tracking-wider text-amber-400">{categoryLabelsChinese[selectedTest.category] || "测算"} · 内容模板</span>
                          <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[9px] text-slate-400">
                            {getAssessmentMode(selectedTest) === "quiz_score" ? "题库计分" : "资料推演"}
                          </span>
                        </div>
                        {selectedTest.detailHeroImage ? (
                          <img src={selectedTest.detailHeroImage} alt={selectedTest.name} className="h-36 w-full rounded-xl object-cover border border-neutral-800" />
                        ) : (
                          <div className="h-32 rounded-xl border border-neutral-800 bg-slate-900/60 flex items-center justify-center">
                            {getCategoryIcon(selectedTest.category)}
                          </div>
                        )}
                        <div className="space-y-2 text-center">
                          <h3 className="text-sm font-bold text-slate-100">{selectedTest.name}</h3>
                          <p className="text-[11px] leading-relaxed text-slate-400">{selectedTest.detailSubtitle || selectedTest.description}</p>
                        </div>
                        <div
                          className="rounded-xl border border-neutral-800 bg-slate-900/50 p-3 text-[11px] leading-relaxed text-slate-300 [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:font-bold [&_ul]:list-disc"
                          dangerouslySetInnerHTML={{
                            __html: selectedTest.detailBody || "系统将基于该测算内容模板，结合题库计分或资料推演结果，生成可解释、可执行的完整测算报告。"
                          }}
                        />
                        <AgreementNotice />
                        <motion.button
                          type="button"
                          onClick={() => setTestPhase(getAssessmentMode(selectedTest) === "quiz_score" ? "quiz" : "form")}
                          className="w-full text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs tracking-wider cursor-pointer font-sans flex items-center justify-center gap-2 border border-white/10 relative overflow-hidden"
                          style={{ backgroundColor: selectedTest.detailThemeColor || "#f59e0b" }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{selectedTest.detailButtonText || (getAssessmentMode(selectedTest) === "quiz_score" ? "开始答题" : "开始填写资料")}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Form action button */}
                {getAssessmentMode(selectedTest) === "quiz_score" && testPhase === "quiz" && (() => {
                  const questionsList = getQuizQuestions(selectedTest);
                  const q = questionsList[currentQuestionIndex];
                  if (!q) return null;
                  
                  const activeValue = quizAnswers[q.id];
                  const totalQ = questionsList.length;
                  const progressValue = Math.round(((currentQuestionIndex + 1) / totalQ) * 100);

                  return (
                    <div className={`p-5 rounded-2xl border text-left space-y-4 animate-fade-in font-sans ${
                      "bg-slate-900/60 border-neutral-800 text-slate-100"
                    }`}>
                      {/* Progressive quiz progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={"text-amber-400 font-bold"}>
                            🎯 答题进度: 问答 {currentQuestionIndex + 1} / {totalQ}
                          </span>
                          <span className={`font-mono ${"text-slate-500"}`}>
                            {progressValue}% 完成
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${"bg-neutral-950"}`}>
                          <motion.div 
                            className={`h-full rounded-full ${
                              selectedTest?.category === "mbti" || selectedTest?.category === "sbti"
                                ? "bg-gradient-to-r from-indigo-500 through-purple-500 to-indigo-600" 
                                : "bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className={`p-4 rounded-xl border mt-4 space-y-4 ${
                        "bg-slate-950/50 border-neutral-850/60"
                      }`}>
                        <p className={`text-[13px] font-bold leading-relaxed ${
                          selectedTest?.category === "mbti" || selectedTest?.category === "sbti" ? "text-indigo-950" : "text-slate-100"
                        }`}>
                          {q.text}
                        </p>
                        <div className="space-y-2.5">
                          {q.options.map((opt) => {
                            const isSelected = activeValue === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setQuizAnswers(prev => ({ ...prev, [q.id]: opt.value }));
                                  // Auto advance delay for physical satisfaction
                                  setTimeout(() => {
                                    if (currentQuestionIndex < totalQ - 1) {
                                      setCurrentQuestionIndex(prev => prev + 1);
                                    } else {
                                      setTestPhase("form");
                                    }
                                  }, 280);
                                }}
                                className={`w-full p-3.5 rounded-xl text-left transition-all flex items-start gap-2.5 border text-xs ${
                                  selectedTest?.category === "mbti" || selectedTest?.category === "sbti"
                                    ? isSelected
                                      ? "bg-indigo-50/50 border-indigo-500 text-indigo-950 font-semibold shadow-xs translate-x-1"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                                    : isSelected
                                      ? "bg-amber-950/60 border-amber-500 text-amber-200 shadow-md shadow-amber-950/40 translate-x-1"
                                      : "bg-slate-950 border-neutral-900 text-slate-400 hover:border-neutral-800 hover:text-slate-300"
                                }`}
                              >
                                <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border ${
                                  selectedTest?.category === "mbti" || selectedTest?.category === "sbti"
                                    ? isSelected
                                      ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                                      : "bg-slate-50 border-slate-200 text-slate-400"
                                    : isSelected
                                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold" 
                                      : "bg-neutral-900 border-neutral-850 text-neutral-500"
                                }`}>
                                  {opt.label}
                                </span>
                                <span className="text-[11px] leading-relaxed">{opt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Previous question button */}
                      {currentQuestionIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                          className={`text-2xs transition-colors flex items-center gap-1 mx-auto pt-2 ${
                            "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          ← 返回上一题
                        </button>
                      )}
                    </div>
                  );
                })()}

                {testPhase === "form" && (
                  <form onSubmit={handleSubmit} className={`space-y-4 text-left p-5 rounded-2xl border animate-fade-in ${
                    "bg-slate-900/60 border-neutral-800 text-slate-100"
                  }`}>
                    {!isQuizScoreForm && (
                      <div className={`border-b pb-2 mb-4 ${"border-slate-800"}`}>
                        <h3 className={`text-xs tracking-wider font-bold ${"text-amber-400"}`}>🎯 请补全您的基本提报信息</h3>
                        <p className={`text-[10px] mt-0.5 ${"text-slate-400"}`}>请填真实可信信息，隐私绝对保密。</p>
                      </div>
                    )}

                    {/* 1. Dynamic User Info */}
                    {activeProfileFields.some(field => field === "userName" || field === "gender") && (
                      <div className={`grid gap-3 ${activeProfileFields.includes("userName") ? "grid-cols-2" : "grid-cols-1"}`}>
                        {activeProfileFields.includes("userName") && (
                          <div>
                            <label className={`block text-xs mb-1.5 font-medium ${"text-amber-200/80"}`}>您的姓名/称呼</label>
                            <input
                              type="text"
                              required
                              placeholder="称呼（如: 逸飞）"
                              value={userName}
                              onChange={(e) => {
                                setUserName(e.target.value);
                                setErrorMsg("");
                              }}
                              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition-all font-sans ${
                                "bg-slate-950 border border-neutral-800 focus:border-amber-500 focus:ring-amber-500 text-slate-200"
                              }`}
                            />
                          </div>
                        )}
                        {activeProfileFields.includes("gender") && (
                          <div>
                            <label className={`block text-xs mb-1.5 font-medium ${"text-amber-200/80"}`}>您的性别</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => setGender("male")}
                                className={`py-2 text-xs rounded-xl font-sans border transition-all ${
                                  selectedTest?.category === "mbti" || selectedTest?.category === "sbti"
                                    ? gender === "male"
                                      ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                    : gender === "male"
                                      ? "bg-amber-950 border-amber-500 text-amber-200"
                                      : "bg-slate-950 border-neutral-850 text-slate-400"
                                }`}
                              >
                                男
                              </button>
                              <button
                                type="button"
                                onClick={() => setGender("female")}
                                className={`py-2 text-xs rounded-xl font-sans border transition-all ${
                                  selectedTest?.category === "mbti" || selectedTest?.category === "sbti"
                                    ? gender === "female"
                                      ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                    : gender === "female"
                                      ? "bg-amber-950 border-amber-500 text-amber-200"
                                      : "bg-slate-950 border-neutral-850 text-slate-400"
                                }`}
                              >
                                女
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedTest && getAssessmentTarget(selectedTest) === "double" && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50 mt-1 animate-fade-in">
                        <div className="col-span-2">
                          <p className="text-[10px] text-pink-400 font-sans font-bold flex items-center gap-1">
                            <span>💑 对方资料</span>
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-amber-200/80 mb-1.5 font-medium font-sans">伴侣姓名/称呼</label>
                          <input
                            type="text"
                            required
                            placeholder="称呼（如: 雨珍）"
                            value={partnerName}
                            onChange={(e) => {
                              setPartnerName(e.target.value);
                              setErrorMsg("");
                            }}
                            className="w-full bg-slate-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-amber-200/80 mb-1.5 font-medium font-sans">伴侣性别</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setPartnerGender("male");
                                setErrorMsg("");
                              }}
                              className={`py-2 text-xs rounded-xl font-sans border transition-all ${
                                partnerGender === "male"
                                  ? "bg-amber-950 border-amber-500 text-amber-200 font-bold"
                                  : "bg-slate-950 border-neutral-850 text-slate-400"
                              }`}
                            >
                                男
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPartnerGender("female");
                                setErrorMsg("");
                              }}
                              className={`py-2 text-xs rounded-xl font-sans border transition-all ${
                                partnerGender === "female"
                                  ? "bg-amber-950 border-amber-500 text-amber-200 font-bold"
                                  : "bg-slate-950 border-neutral-850 text-slate-400"
                              }`}
                            >
                                女
                            </button>
                          </div>
                        </div>
                        {activeProfileFields.includes("birthDate") && (
                          <div>
                            <label className="block text-xs text-amber-200/80 mb-1.5 font-medium font-sans">对方出生日期</label>
                            <input
                              type="date"
                              required
                              value={partnerBirthDate}
                              onChange={(e) => {
                                setPartnerBirthDate(e.target.value);
                                setErrorMsg("");
                              }}
                              className="w-full bg-slate-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                            />
                          </div>
                        )}
                        {activeProfileFields.includes("birthTime") && (
                          <div>
                            <label className="block text-xs text-amber-200/80 mb-1.5 font-medium font-sans">对方出生时间</label>
                            <input
                              type="time"
                              required
                              value={partnerBirthTime}
                              onChange={(e) => {
                                setPartnerBirthTime(e.target.value);
                                setErrorMsg("");
                              }}
                              className="w-full bg-slate-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans text-center"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Birth details for profile-inference templates */}
                    {activeProfileFields.some(field => field === "birthDate" || field === "birthTime") && (
                      <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
                        {activeProfileFields.includes("birthDate") && (
                          <div>
                            <label className="block text-xs text-amber-200/80 mb-1.5 font-medium font-sans">出生日期 (公历)</label>
                            <input
                              type="date"
                              required
                              value={birthDate}
                              onChange={(e) => setBirthDate(e.target.value)}
                              className="w-full bg-slate-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                            />
                          </div>
                        )}
                        {activeProfileFields.includes("birthTime") && (
                          <div>
                            <label className="block text-xs text-amber-200/80 mb-1.5 font-medium font-sans">具体出生时间</label>
                            <input
                              type="time"
                              required
                              value={birthTime}
                              onChange={(e) => setBirthTime(e.target.value)}
                              className="w-full bg-slate-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans text-center"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {activeProfileFields.includes("question") && (
                      <div className="pt-1 animate-fade-in">
                        <label className="block text-xs text-amber-200/80 mb-1.5 font-medium font-sans">当前最想咨询的问题</label>
                        <textarea
                          required
                          rows={3}
                          value={question}
                          onChange={(e) => {
                            setQuestion(e.target.value);
                            setErrorMsg("");
                          }}
                          placeholder="例如：最近总感觉焦虑，不知道该如何做选择..."
                          className="w-full bg-slate-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans text-slate-200 resize-none"
                        />
                      </div>
                    )}

                    {errorMsg && (
                      <p className={`text-2xs p-2 rounded-lg border font-sans ${
                        "bg-red-95/40 text-red-400 border-red-900/30"
                      }`}>
                        ⚠️ {errorMsg}
                      </p>
                    )}

                    <motion.button
                      type="submit"
                      className={`w-full font-bold py-4 px-4 rounded-xl text-xs tracking-widest cursor-pointer font-sans flex items-center justify-center gap-2 mt-5 relative overflow-hidden ${
                        "bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 border border-amber-300/30 text-slate-950"
                      }`}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: selectedTest?.category === 'mbti'
                          ? [
                              "0 15px 25px -3px rgba(79, 70, 229, 0.35), 0 0 0 0px rgba(79, 70, 229, 0.2)",
                              "0 20px 35px -3px rgba(139, 92, 246, 0.55), 0 0 0 10px rgba(79, 70, 229, 0)",
                              "0 15px 25px -3px rgba(79, 70, 229, 0.35), 0 0 0 0px rgba(79, 70, 229, 0.2)"
                            ]
                          : [
                              "0 15px 25px -3px rgba(245, 158, 11, 0.35), 0 0 0 0px rgba(245, 158, 11, 0.2)",
                              "0 20px 35px -3px rgba(239, 68, 68, 0.55), 0 0 0 10px rgba(245, 158, 11, 0)",
                              "0 15px 25px -3px rgba(245, 158, 11, 0.35), 0 0 0 0px rgba(245, 158, 11, 0.2)"
                            ]
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                    >
                      {/* Shimmer Stream */}
                      <div className="absolute inset-x-0 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none animate-sweep" />
                      <Sparkles className={`w-3.5 h-3.5 animate-pulse ${'text-slate-950'}`} />
                      <span className={`font-extrabold ${'text-slate-950'}`}>
                        立即测算
                      </span>
                    </motion.button>

                    <div className="flex justify-center items-center gap-2 mt-1 py-1 text-[10px] text-slate-500 text-center font-sans">
                      <span>🔒 数据传输受金盾加密</span>
                      <span>•</span>
                      <span>🛡️ 2026 承天正理守护</span>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* HOMEPAGE VIEW */
          <div className="animate-fade-in text-left space-y-4">
            {/* 1. Dynamic Slide Carousel (Top Focus Area) */}
            {activeTab === "home" && (
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-neutral-800/40 bg-slate-900">
                <div className="relative h-36 w-full overflow-hidden">
                  {activeTopSlides.map((slide, index) => {
                    if (currentSlide !== index) return null;
                    return (
                      <motion.div 
                        key={slide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient || "from-indigo-950 via-slate-950 to-[#1e1b4b]"} p-4 flex flex-col justify-between cursor-pointer`}
                        onClick={() => openConfiguredTarget(slide.testId, slide.linkUrl, slide.targetSkuId)}
                      >
                        {slide.imageUrl && (
                          <>
                            <img src={slide.imageUrl} alt={slide.name || slide.title} className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/45" />
                          </>
                        )}
                        <div className={`absolute top-2 right-4 text-3.5xl font-mono opacity-15 font-bold ${slide.textGlow || "text-indigo-400"}`}>
                          {tests.find(x => x.id === slide.testId)?.category?.toUpperCase() || "MBTI"}
                        </div>
                        <div className="relative z-10">
                          <div className="flex gap-1.5 font-sans">
                            {slide.tag1 && (
                              <span className="text-[9px] bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700/30 font-bold">
                                {slide.tag1}
                              </span>
                            )}
                            {slide.tag2 && (
                              <span className="text-[9px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-900/30 font-bold">
                                {slide.tag2}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs font-bold text-slate-100 mt-2 font-serif text-[11px]">【{slide.title}】</h3>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-1">{slide.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-amber-400/80 font-mono text-[9px]">{slide.subtitle}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfiguredTarget(slide.testId, slide.linkUrl, slide.targetSkuId);
                            }}
                            className="text-[10px] bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold px-3 py-1 rounded-lg shrink-0 cursor-pointer shadow-md shadow-indigo-950/50 text-[9px]"
                          >
                            {slide.buttonText || "立即评测 ⚡"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Dot Indicators */}
                <div className="absolute right-4 bottom-3 flex gap-1 z-10">
                  {activeTopSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        currentSlide === idx ? "bg-amber-400 w-3" : "bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Service Lists */}
            {activeTab === "home" && (
              <div className="space-y-5 animate-fade-in">
                {/* 2. "金刚区" King Kong Navigation Icons (Quick Category Toggles -> Direct Product Entries) */}
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-neutral-900 shadow-sm">
                <div className="mb-2" />
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[...(shortcuts || [])]
                      .filter((item) => (item.status || "已上架") === "已上架")
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map((item) => {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openConfiguredTarget(item.testId, item.linkUrl, item.targetSkuId)}
                          className="group flex min-w-0 flex-col items-center gap-1.5 rounded-xl p-1 transition-all cursor-pointer border border-transparent hover:border-neutral-800 hover:bg-slate-900/40 active:scale-95"
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold shadow-sm transition-transform group-active:scale-95 overflow-hidden ${getShortcutColor(item.colorTheme)}`}>
                            {isImageIcon(item.icon) ? <img src={item.icon} alt={item.label} className="w-full h-full object-cover" /> : renderShortcutIcon(item.icon || "Brain")}
                          </div>
                          <span className="line-clamp-2 min-h-[22px] w-full text-[10px] font-semibold leading-[1.1] tracking-normal text-slate-400 group-hover:text-amber-300">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. "爆款推荐" Horizontal Cards Display (Curated showcase matching competitor) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs tracking-wider text-amber-400 font-bold flex items-center gap-1">
                      <Flame className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                      <span>必测推荐</span>
                    </h3>
                    <span className="text-[9px] bg-red-950/50 text-rose-450 border border-red-900/30 px-1.5 py-0.5 rounded font-bold">
                      HOT 🔥
                    </span>
                  </div>

                  {/* Horizontal scrolling track */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
                    {activeMiddleSlides.map((item) => {
                      const t = tests.find(x => x.id === item.testId);
                      const visualTheme = getMiddleRecommendationTheme(t?.category === "emotion" ? "rose" : t?.category === "career" ? "amber" : "indigo");
                      return (
                        <div 
                          key={item.id}
                          onClick={() => openConfiguredTarget(item.testId, item.linkUrl, item.targetSkuId)}
                          className={`snap-start shrink-0 w-[140px] bg-gradient-to-b ${visualTheme.cardBg} p-3 rounded-2xl border hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between h-[155px] relative`}
                        >
                          <span className={`absolute top-2 right-2 text-[8px] ${visualTheme.tagBg} font-bold px-1.5 py-0.25 rounded-md`}>
                            {item.tag1 || "推荐"}
                          </span>
                          <div>
                            <div className={`w-12 h-12 rounded-lg ${visualTheme.iconBg} flex items-center justify-center mb-2 border overflow-hidden`}>
                              {item.imageUrl ? <img src={item.imageUrl} alt={item.name || item.title} className="w-full h-full object-cover" /> : getCategoryIcon(t ? t.category : "mbti")}
                            </div>
                            <h4 className="text-[11px] font-sans font-bold text-slate-100 leading-tight line-clamp-1">{item.name || item.title}</h4>
                            <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-snug">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-neutral-800/40 pt-1.5 mt-1">
                            <span className={`text-xs font-bold ${visualTheme.priceColor} font-mono`}>￥{t ? t.price : "19.9"}</span>
                            <span className="text-[9.5px] text-amber-400 font-semibold hover:text-amber-300">分析 ➔</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Core list header */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <h3 className="text-xs tracking-wider text-amber-400 font-bold flex items-center gap-1 font-sans">
                    ✨ {selectedCategory === "all" ? "精品推荐" : `筛选「${
                      selectedCategory === "mbti" ? "MBTI" :
                      selectedCategory === "sbti" ? "SBTI" :
                      selectedCategory === "emotion" ? "情绪关系" :
                      selectedCategory === "personality" ? "核心人格" : "星图分析"
                    }」大类`}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-sans">已有 18k+ 真实反馈</span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {activeHomepageEntries.length > 0 ? (
                    activeHomepageEntries.map(({ config, test: t }) => {
                      const isRecommendationConfig = !!config && "imageUrl" in config;
                      const displayName = config?.name || (isRecommendationConfig ? config.title : undefined) || t.name;
                      const displayDescription = config?.description || t.description;
                      const productSku = getProductSku(config?.targetSkuId, config?.testId || t.id);
                      const displayPrice = productSku?.price ?? (isRecommendationConfig ? t.price : config?.price ?? t.price);
                      const displayOriginalPrice = productSku?.originalPrice ?? (isRecommendationConfig ? t.originalPrice : config?.originalPrice ?? t.originalPrice);
                      const displayBadge = isRecommendationConfig ? config.tag1 || t.tag : config?.badgeText || t.tag;
                      const displayImage = isRecommendationConfig ? config.imageUrl : config?.icon;
                      const displayIcon = displayImage || t.icon || "Brain";
                      return (
                      <div 
                        key={config?.id || t.id}
                        onClick={() => openConfiguredTarget(config?.testId || t.id, config?.targetType === "link" ? config?.linkUrl : undefined, config?.targetSkuId)}
                        className="group bg-slate-950 p-3 rounded-2xl border border-neutral-800/80 hover:border-amber-600/50 shadow transition-all cursor-pointer relative"
                      >
                        {displayBadge && (
                          <span className={`absolute -top-1.5 right-4 text-[9px] px-1.5 py-0.25 font-bold tracking-widest rounded-full uppercase border ${
                            t.tagColor === "red" 
                              ? "bg-red-950/80 text-red-300 border-red-900/50" 
                              : t.tagColor === "amber"
                                ? "bg-amber-950/80 text-amber-300 border-amber-900/50"
                                : t.tagColor === "indigo"
                                  ? "bg-indigo-950/80 text-indigo-300 border-indigo-900/50"
                                  : "bg-emerald-950/80 text-emerald-300 border-emerald-900/50"
                          }`}>
                            {displayBadge}
                          </span>
                        )}

                        <div className="flex gap-3">
                          <div className={`${isRecommendationConfig ? "w-20 h-12" : "w-10 h-10"} rounded-xl bg-neutral-900/80 flex items-center justify-center self-start border border-neutral-800 overflow-hidden shrink-0`}>
                            {isImageIcon(displayIcon) ? <img src={displayIcon} alt={displayName} className="w-full h-full object-cover" /> : renderShortcutIcon(displayIcon)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[13px] font-sans font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors tracking-wide">
                              {displayName}
                            </h4>
                            <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed tracking-normal mt-1.5">
                              {displayDescription}
                            </p>
                            <div className="mt-2.5 flex items-center justify-between">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-bold text-red-400">￥{displayPrice}</span>
                                {displayOriginalPrice !== undefined && <span className="text-[10px] text-slate-500 line-through">￥{displayOriginalPrice}</span>}
                              </div>
                              <span className="text-[10.5px] font-sans text-amber-500/80 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                立即测评 →
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })
                  ) : (
                    <div className="py-12 bg-slate-950 rounded-2xl border border-dashed border-neutral-800 text-center text-xs text-slate-500">
                      所有项目暂在神台调整重连中...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY HISTORY LIST TAP IN PHONE */}
            {activeTab === "history" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-neutral-800 bg-slate-950/80 p-3 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[13px] font-black text-slate-100">
                        {lookupMode === "phone" ? "手机号查询" : "付款订单号查询"}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {lookupMode === "phone" ? "短信验证，查看已付款的测评结果" : "可查看已付款的测评结果"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLookupMode(prev => prev === "phone" ? "order" : "phone");
                        setLookupKeyword("");
                        setBindCode("");
                        setLookupError("");
                        setLookupOrders(null);
                      }}
                      className="text-[10px] text-orange-400 font-bold flex items-center gap-1"
                    >
                      ⇄ {lookupMode === "phone" ? "订单号查询" : "手机号查询"}
                    </button>
                  </div>

                  {lookupMode === "phone" ? (
                    <div className="space-y-2">
                      <label className="flex items-center h-10 rounded-xl border border-neutral-700 bg-slate-900 overflow-hidden focus-within:border-amber-500">
                        <span className="w-16 shrink-0 border-r border-neutral-700 text-center text-[12px] font-bold text-slate-200">手机号:</span>
                        <input
                          value={lookupKeyword}
                          onChange={(e) => {
                            setLookupKeyword(e.target.value);
                            setLookupError("");
                          }}
                          placeholder="输入手机号"
                          className="min-w-0 flex-1 bg-transparent px-3 text-[11px] text-slate-100 outline-none placeholder:text-slate-500"
                        />
                      </label>
                      <label className="flex items-center h-10 rounded-xl border border-neutral-700 bg-slate-900 overflow-hidden focus-within:border-amber-500">
                        <span className="w-16 shrink-0 border-r border-neutral-700 text-center text-[12px] font-bold text-slate-200">验证码:</span>
                        <input
                          value={bindCode}
                          onChange={(e) => setBindCode(e.target.value)}
                          placeholder="输入验证码"
                          className="min-w-0 flex-1 bg-transparent px-3 text-[11px] text-slate-100 outline-none placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={handleSendSmsCode}
                          disabled={smsCountdown > 0}
                          className="shrink-0 px-3 text-[10px] font-bold text-amber-400 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                          {smsCountdown > 0 ? `${smsCountdown}S` : "获取验证码"}
                        </button>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex items-center h-10 rounded-xl border border-neutral-700 bg-slate-900 overflow-hidden focus-within:border-amber-500">
                        <span className="w-16 shrink-0 border-r border-neutral-700 text-center text-[12px] font-bold text-slate-200">订单号:</span>
                        <input
                          value={lookupKeyword}
                          onChange={(e) => {
                            setLookupKeyword(e.target.value);
                            setLookupError("");
                          }}
                          placeholder="输入订单号"
                          className="min-w-0 flex-1 bg-transparent px-3 text-[11px] text-slate-100 outline-none placeholder:text-slate-500"
                        />
                      </label>
                      <p className="px-1 text-[10px] text-slate-500">例如，您可以输入：BDML1628580000000000</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLookupOrders}
                    className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-950/40"
                  >
                    查询
                  </button>

                  {lookupOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        setLookupOrders(null);
                        setLookupKeyword("");
                        setBindCode("");
                        setLookupError("");
                      }}
                      className="text-[10px] text-slate-500 hover:text-amber-400"
                    >
                      清除查询结果，返回当前设备订单
                    </button>
                  )}
                  {lookupError && <p className="text-[10px] text-red-400">{lookupError}</p>}
                </div>

                <div className="flex gap-5 border-b border-neutral-800/70 px-1">
                  {[
                    { key: "all" as const, label: "全部" },
                    { key: "pending" as const, label: "待支付" },
                    { key: "paid" as const, label: "已支付" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setOrderStatusFilter(tab.key)}
                      className={`pb-2 text-sm font-black transition-colors border-b-2 ${
                        orderStatusFilter === tab.key
                          ? "text-orange-400 border-orange-400"
                          : "text-slate-500 border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {visibleHistoryOrders.length === 0 ? (
                  <div className="py-20 text-center bg-slate-950/40 rounded-2xl border border-dashed border-neutral-800">
                    <ClipboardList className="w-8 h-8 text-slate-700 mx-auto mb-2.5" />
                    <p className="text-xs text-slate-500">暂无匹配订单记录</p>
                    <p className="text-[9.5px] text-slate-600 mt-1">可切换查询方式，输入手机号或订单号找回历史报告。</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleHistoryOrders.map((o) => {
                      const isPending = o.status === "pending";
                      const isPaid = o.status === "paid";
                      const canViewReport = (o.status === "paid" || o.status === "refunded") && Boolean(o.resultReport);
                      const orderStatusLabel = o.status === "pending" ? "待支付" : o.status === "paid" ? "已支付" : o.status === "failed" ? "支付失败" : "已退款";
                      return (
                        <div 
                          key={o.id}
                          onClick={() => {
                            if (canViewReport) {
                              const test = tests.find(t => t.id === o.testId);
                              setPaidPopupEligibleOrderId(null);
                              setSelectedTest(test || tests[0] || null);
                              setCalculationResult(o);
                            } else if (isPending) {
                              handlePayOrder(o, { stopPropagation: () => {} } as any);
                            }
                          }}
                          className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 relative overflow-hidden text-left ${
                            isPending 
                              ? "bg-slate-950 border-orange-500/25 hover:border-orange-500/50" 
                              : canViewReport
                                ? "bg-slate-950 border-neutral-800/80 hover:border-amber-900/30 font-sans cursor-pointer"
                                : "bg-slate-950 border-neutral-800/80 font-sans"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500">订单号：{o.id}</span>
                            <span className={`text-[10px] font-sans px-2 py-0.5 rounded-md font-bold ${
                              isPending
                                ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                                : isPaid
                                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                  : o.status === "failed"
                                    ? "text-red-400 bg-red-500/10 border border-red-500/20"
                                    : "text-slate-300 bg-slate-700/40 border border-slate-600/40"
                            }`}>
                              {isPending ? "未支付" : orderStatusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-[58px_1fr] gap-3">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-900/20 border border-orange-500/20 flex items-center justify-center text-2xl">
                              {o.testName.includes("星") ? "✨" : o.testName.includes("情") || o.testName.includes("爱") ? "💞" : "🧠"}
                            </div>
                            <div className="min-w-0 space-y-1.5">
                              <h4 className="text-sm font-black text-slate-100 leading-snug line-clamp-1">
                                {o.testName}
                              </h4>
                              {o.userName && o.userName !== "你" && (
                                <p className="text-[11px] text-slate-400">
                                  姓名：<span className="text-slate-200">{o.userName}</span>
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400">
                                下单时间：<span className="font-mono">{formatTime(o.createdAt)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-neutral-800/80 pt-3 flex items-center justify-around">
                            {isPending ? (
                              <>
                                <button
                                  onClick={(e) => handleDeleteOrder(o.id, e)}
                                  className="flex flex-col items-center gap-1 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                  <span className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                    <Trash2 className="w-4 h-4" />
                                  </span>
                                  <span className="text-[10px]">删除订单</span>
                                </button>
                                <button
                                  onClick={(e) => handlePayOrder(o, e)}
                                  className="flex flex-col items-center gap-1 text-orange-400 transition-colors"
                                >
                                  <span className="w-9 h-9 rounded-full bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4" />
                                  </span>
                                  <span className="text-[10px] font-bold">立即支付</span>
                                </button>
                              </>
                            ) : canViewReport ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const test = tests.find(t => t.id === o.testId);
                                  setPaidPopupEligibleOrderId(null);
                                  setSelectedTest(test || tests[0] || null);
                                  setCalculationResult(o);
                                }}
                                className="w-full rounded-xl border border-amber-700/40 bg-amber-500/10 py-2 text-[11px] font-bold text-amber-300"
                              >
                                查看报告
                              </button>
                            ) : (
                              <span className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2 text-center text-[11px] font-bold text-slate-500">
                                {orderStatusLabel}
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMER SERVICE AND COMPLAINT PAGE */}
            {activeTab === "service" && (
              <div className="flex min-h-full flex-col text-left font-sans pb-16">
                <div className="mb-3 flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("home")}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> 返回首页
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className="rounded-full border border-pink-500/45 bg-pink-500/10 px-3 py-1.5 text-[11px] font-bold text-pink-100"
                  >
                    我的订单
                  </button>
                </div>

                <div className="mb-3 rounded-2xl border border-emerald-500/25 bg-slate-950/80 p-3">
                  <h3 className="flex items-center gap-2 text-sm font-black text-emerald-300">
                    <MessageCircle className="h-4 w-4" /> 投诉
                  </h3>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    可处理订单找回、报告疑问、退款投诉等问题。客服在线时间：9:00-12:00，14:00-18:30。
                  </p>
                </div>

                <div className="flex-1 rounded-2xl border border-neutral-800 bg-slate-950/75 p-3">
                  <div className="mb-4 text-center text-[10px] text-slate-600">暂无更多历史消息</div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-400/35 bg-gradient-to-br from-emerald-500/25 to-cyan-500/15 text-emerald-200">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="max-w-[260px] rounded-2xl rounded-tl-md border border-neutral-800 bg-slate-900/95 p-3 text-[12px] leading-relaxed text-slate-200 shadow-lg shadow-black/20">
                        <p className="font-bold text-emerald-300">您好，我是智能客服小算～</p>
                        <p className="mt-2">请直接描述您的问题，例如报告未生成、订单找不到、退款投诉或支付异常。</p>
                        <p className="mt-2 text-slate-400">
                          如需查询报告，可点击下方“订单找不到”，或进入“我的订单”输入手机号 / 订单号查询。
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-amber-400/35 bg-gradient-to-br from-amber-500/25 to-orange-500/15 text-amber-200">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="max-w-[260px] rounded-2xl rounded-tl-md border border-neutral-800 bg-slate-900/95 p-3 text-[12px] leading-relaxed text-slate-200 shadow-lg shadow-black/20">
                        <p className="font-bold text-amber-300">投诉与退款说明</p>
                        <p className="mt-2">已支付订单支持提交售后申请。正式上线后会接入在线客服与工单系统，退款状态以支付平台处理结果为准。</p>
                      </div>
                    </div>

                    <div className="mx-auto mt-2 w-fit rounded-xl bg-neutral-800/80 px-3 py-1.5 text-[10px] text-slate-400">
                      以上是历史聊天记录
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-neutral-800/80 pt-3">
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {["订单找不到", "退款投诉", "发送图片"].map(item => (
                      <button
                        key={item}
                        type="button"
                        className="shrink-0 rounded-full border border-neutral-800 bg-slate-900 px-3 py-2 text-[11px] font-bold text-slate-200 shadow-sm"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-[1fr_68px] gap-2">
                    <input
                      placeholder="请用一句话描述您的疑问"
                      className="h-11 rounded-xl border border-neutral-800 bg-slate-900 px-3 text-[12px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500/70"
                    />
                    <button
                      type="button"
                      className="h-11 rounded-xl bg-emerald-500 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/30"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MY SETTINGS AND ABOUT PANEL IN PHONE */}
            {activeTab === "my" && (
              <div className="space-y-5 text-left">
                {/* User Card */}
                <div className="bg-gradient-to-tr from-amber-950/60 to-neutral-900 p-4 rounded-2xl border border-amber-900/30 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-900/30 border border-amber-800/50 flex items-center justify-center text-amber-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-bold text-amber-300">测评体验官</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {currentUser?.userId || "guest_loading"}</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-amber-950 px-2 py-0.5 rounded-full text-amber-400 border border-amber-900/30 font-sans">
                    尊贵会员
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-neutral-800 overflow-hidden divide-y divide-neutral-900 text-xs">
                  <div className="p-3.5 flex justify-between items-center hover:bg-neutral-900/40 cursor-pointer">
                    <span className="text-slate-300">💳 优惠券</span>
                    <span className="text-[10px] text-slate-500">暂无可用</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomerService}
                    className="w-full p-3.5 flex justify-between items-center hover:bg-neutral-900/40 cursor-pointer text-left"
                  >
                    <span className="text-slate-300 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      客服与售后
                    </span>
                    <span className="text-[10px] text-emerald-400">在线处理</span>
                  </button>
                  <div className="p-3.5 flex justify-between items-center hover:bg-neutral-900/40 cursor-pointer" onClick={() => alert("关于我们\\n\\n用户协议：查看平台服务条款与付费规则。\\n隐私政策：查看个人信息收集、使用与保护说明。\\n版本号：v2.4.0")}>
                    <span className="text-slate-300">ℹ️ 关于我们</span>
                    <span className="text-[10px] text-slate-500">v2.4.0</span>
                  </div>
                </div>

                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-600 font-sans">探索内心宇宙，寻找无限可能。</p>
                  <p className="text-[9px] text-slate-700 font-mono mt-0.5">© 2026 Tianji Miaosuan Inc.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {selectedTest && !showPaymentGate && !isCalculating && (
        <button
          type="button"
          onClick={handleCustomerService}
          className="absolute right-7 bottom-[154px] z-50 flex items-center gap-1.5 rounded-full border border-emerald-400/55 bg-slate-950/95 px-3 py-2 text-[11px] font-extrabold text-emerald-200 shadow-[0_0_18px_rgba(0,0,0,0.5)]"
          aria-label="投诉"
        >
          <MessageCircle className="w-3.5 h-3.5" /> 投诉
        </button>
      )}

      {showBindPhoneModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm px-8">
          <div className="w-full rounded-2xl border border-neutral-800 bg-slate-950 p-5 text-left shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-100">绑定手机号</h3>
              <button
                type="button"
                onClick={() => {
                  setShowBindPhoneModal(false);
                  setBindPhone("");
                  setBindCode("");
                }}
                className="rounded-lg bg-neutral-800 px-2 py-1 text-xs text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={bindPhone}
                onChange={(e) => setBindPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full rounded-lg border border-neutral-700 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none focus:border-amber-500"
              />
              <div className="grid grid-cols-[1fr_104px] gap-2">
                <input
                  value={bindCode}
                  onChange={(e) => setBindCode(e.target.value)}
                  placeholder="请输入验证码"
                  className="rounded-lg border border-neutral-700 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSendSmsCode}
                  disabled={smsCountdown > 0}
                  className="rounded-lg border border-amber-500/50 bg-amber-500/10 text-xs font-bold text-amber-300 disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-slate-500"
                >
                  {smsCountdown > 0 ? `${smsCountdown}S` : "获取验证码"}
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowBindPhoneModal(false);
                  setBindPhone("");
                  setBindCode("");
                }}
                className="rounded-lg bg-neutral-800 py-3 text-sm font-bold text-slate-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleBindPhone}
                disabled={isBindingPhone}
                className="rounded-lg bg-amber-500 py-3 text-sm font-extrabold text-slate-950 disabled:opacity-60"
              >
                {isBindingPhone ? "绑定中..." : "确认绑定"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeConversionPopupPrimary && !showBindPhoneModal && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-slate-950/78 px-7 backdrop-blur-sm">
          <div className="w-full rounded-2xl border border-amber-500/25 bg-slate-950 p-4 text-left shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-50">
                  {conversionPopupScene === "prepay" ? "别错过限时优惠" : "看完这份，再看看这些"}
                </h4>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
                  {conversionPopupScene === "prepay" ? "限时推荐适合继续了解的测算" : "推荐继续测，补全更多维度"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeConversionPopup}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg leading-none text-slate-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {activeConversionPopupItems.map(({ rule, test }) => {
                const uploadedImage = rule.imageUrl;
                const itemTitle = rule.name || test?.name || "推荐测算";
                const itemDescription = test?.description || (rule.targetType === "link" ? "点击查看详情" : "继续了解更多测算方向");
                const itemCategory = test ? categoryLabelsChinese[test.category] : "链接";
                const itemPrice = test?.price;
                const itemOriginalPrice = test?.originalPrice;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => openConversionPopupItem({ rule, test })}
                    className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-left transition-colors hover:border-amber-500/50 hover:bg-slate-900"
                  >
                    {uploadedImage ? (
                      <div className="flex items-center gap-3">
                        <div className="h-24 w-[72px] shrink-0 overflow-hidden rounded-xl border border-amber-500/15 bg-slate-950">
                          <img src={uploadedImage} alt={itemTitle} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">{itemCategory}</span>
                            <span className="text-[9px] text-slate-500">推荐</span>
                          </div>
                          <p className="line-clamp-1 text-[13px] font-extrabold text-slate-50">{itemTitle}</p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{test?.name || itemDescription}</p>
                        </div>
                        {itemPrice !== undefined && (
                          <div className="shrink-0 text-right">
                            <p className="text-[13px] font-extrabold text-rose-400">¥{itemPrice}</p>
                            {itemOriginalPrice !== undefined && <p className="text-[11px] text-slate-500 line-through">¥{itemOriginalPrice}</p>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-500/15 bg-gradient-to-br from-amber-950/70 to-slate-950 text-[10px] text-amber-200">
                          {test?.detailHeroImage ? (
                            <img src={test.detailHeroImage} alt={test.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="max-w-[44px] truncate text-center">{test?.icon || itemCategory}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">{itemCategory}</span>
                            <span className="text-[9px] text-slate-500">推荐</span>
                          </div>
                          <p className="line-clamp-1 text-[13px] font-extrabold text-slate-50">{itemTitle}</p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{itemDescription}</p>
                        </div>
                        {itemPrice !== undefined && (
                          <div className="shrink-0 text-right">
                            <p className="text-[13px] font-extrabold text-rose-400">¥{itemPrice}</p>
                            {itemOriginalPrice !== undefined && <p className="text-[11px] text-slate-500 line-through">¥{itemOriginalPrice}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={confirmConversionPopup}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-extrabold text-slate-950 shadow-[0_10px_25px_rgba(245,158,11,0.25)]"
              >
                {conversionPopupScene === "prepay" ? "立即解锁" : "继续测算"}
              </button>
              {maxConversionPopupPages > 1 && (
                <p className="mt-2 text-center text-[10px] text-slate-500">
                  {conversionPopupIndex + 1}/{maxConversionPopupPages}，关闭后展示下一组推荐
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* H5 bottom navigation: personal center entry is hidden here only. */}
      <div
        id="phone-nav"
        className="absolute inset-x-0 bottom-0 z-40 border-t border-slate-800/90 bg-slate-950/95 px-6 pb-3 pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.28)] backdrop-blur"
      >
        <div className="grid grid-cols-2">
          <button
            onClick={() => { setSelectedTest(null); setCalculationResult(null); setPaidPopupEligibleOrderId(null); setActiveTab("home"); }}
            className={`relative flex h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
              activeTab === "home"
                ? "text-amber-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className={`absolute top-0 h-0.5 w-8 rounded-full ${activeTab === "home" ? "bg-amber-400" : "bg-transparent"}`} />
            <Sparkles className="h-4 w-4" />
            <span>发现</span>
          </button>

          <button
            onClick={() => { setSelectedTest(null); setCalculationResult(null); setPaidPopupEligibleOrderId(null); setActiveTab("history"); }}
            className={`relative flex h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
              activeTab === "history"
                ? "text-amber-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className={`absolute top-0 h-0.5 w-8 rounded-full ${activeTab === "history" ? "bg-amber-400" : "bg-transparent"}`} />
            <ClipboardList className="h-4 w-4" />
            <span>我的订单</span>
          </button>
        </div>
      </div>

      {/* PAYMENT GATEWAY INTERACTIVE MODAL (Fig 1-3 full process) */}
      {showPaymentGate && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end">
          {/* Click backdrop to close */}
          <div className="absolute inset-0" onClick={requestClosePaymentGate} />
          
          <div className="bg-slate-900 border-t border-neutral-800 rounded-t-[30px] p-5 space-y-4 shadow-2xl animate-fade-in text-left max-h-[90%] flex flex-col z-10">
            {/* Drawer handle indicator */}
            <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto -mt-2 mb-2 shrink-0" />

            <div className="flex justify-between items-center pb-2 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 font-bold" />
                <span className="text-xs font-bold text-slate-200">收银台 • 安全加密托管</span>
              </div>
              <button 
                onClick={requestClosePaymentGate} 
                className="text-slate-500 hover:text-slate-350 text-xs py-1 px-2 font-mono shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Order total amount */}
            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-neutral-850 flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-[9px] text-slate-500 font-sans uppercase tracking-wider">订单商品：</h4>
                <p className="text-[10px] text-slate-200 font-bold mt-0.5 line-clamp-1">{selectedTest.name}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-rose-400 font-black text-sm">￥{selectedSalePrice}</div>
                {selectedOriginalPrice !== undefined && (
                  <div className="text-[8px] text-neutral-500 line-through">原价 ￥{selectedOriginalPrice}</div>
                )}
              </div>
            </div>

            {/* Payment selector */}
            <div className="space-y-2 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-bold tracking-widest pl-1">支付通道选择</span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "wechat", label: "微信支付", color: "border-emerald-500/20 bg-emerald-950/10 text-emerald-400 hover:border-emerald-500/30", selectColor: "border-emerald-500 bg-emerald-900/20 text-emerald-300 ring-2 ring-emerald-500/20", icon: "🟢" },
                  { id: "alipay", label: "支付宝支付", color: "border-blue-500/20 bg-blue-950/10 text-[#60a5fa] hover:border-blue-500/30", selectColor: "border-blue-500 bg-blue-900/20 text-blue-300 ring-2 ring-blue-500/20", icon: "🔵" }
                ].map((pay) => {
                  const isSelected = selectedPayMethod === pay.id;
                  return (
                    <button 
                      key={pay.id}
                      type="button"
                      onClick={() => setSelectedPayMethod(pay.id as "wechat" | "alipay")}
                      className={`p-3 rounded-xl border flex flex-col justify-center items-center text-center text-xs font-sans gap-1 cursor-pointer transition-all ${
                        isSelected ? pay.selectColor : pay.color
                      }`}
                    >
                      <span className="text-lg">{pay.icon}</span>
                      <span className="font-bold text-[10px]">{pay.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fake state processor or action trigger */}
            {isProcessingPayment ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-neutral-850 flex flex-col items-center justify-center text-center space-y-2 shrink-0">
                <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <p className="text-[10px] text-amber-400 font-mono animate-pulse">
                  正在调起安全支付网关，请勿关闭窗口...
                </p>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setIsProcessingPayment(true);
                  // Simulate SSL handshake and callback in 1.8s
                  setTimeout(() => {
                    setIsProcessingPayment(false);
                    setShowPaymentGate(false);
                    triggerCalculatorAPI(formattedQuizAnswers);
                  }, 1800);
                }}
                className="w-full bg-[#10B961] hover:bg-[#0ea554] text-slate-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,97,0.25)] transition-all cursor-pointer shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>立即安全支付 ￥{selectedSalePrice}</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[8.5px] text-slate-500 self-center shrink-0">
              <span>🛡️ 信托级数据安全加密</span>
              <span>•</span>
              <span>隐私盾防护机制</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
