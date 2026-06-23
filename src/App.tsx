/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Cpu, Smartphone, LayoutGrid, HelpCircle, AlertCircle, Terminal } from "lucide-react";
import PhoneSimulator from "./components/PhoneSimulator";
import AdminDashboard from "./components/AdminDashboard";
import { TestItem, CalculationOrder, DashboardStats, BannerSlide, ShortcutItem, MiddleRecommendation, HomepageProduct, CurrentUser, ConversionRecommendation, ProductSku } from "./types";

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 3001,
    name: "MBTI 标准潜能顶部推荐",
    displayPosition: "首页顶部",
    linkUrl: "",
    sortOrder: 1,
    status: "已上架",
    tag1: "专业解析",
    tag2: "潜能探究",
    title: "16型人格标准潜能报告",
    description: "全面系统解析你的认知功能优势与短板",
    subtitle: "金盾级隐私保护 • 匿名测评",
    buttonText: "立即评测 ⚡",
    testId: "mbti-standard",
    bgGradient: "from-indigo-950 via-slate-950 to-[#1e1b4b]",
    textGlow: "text-indigo-400"
  },
  {
    id: 3002,
    name: "搞钱天赋顶部推荐",
    displayPosition: "首页顶部",
    linkUrl: "",
    sortOrder: 2,
    status: "已上架",
    tag1: "天命指南",
    tag2: "爆款首选",
    title: "盖洛普优势定位：测测你的搞钱天赋",
    description: "抛弃无用焦虑，发掘你与生俱来的变现能力和核心财富杠杆",
    subtitle: "发掘变现核心机能",
    buttonText: "开启探秘 ➔",
    testId: "career-gallup",
    bgGradient: "from-amber-950 via-slate-950 to-[#292524]",
    textGlow: "text-amber-450"
  },
  {
    id: 3003,
    name: "依恋盲区顶部推荐",
    displayPosition: "首页顶部",
    linkUrl: "",
    sortOrder: 3,
    status: "已上架",
    tag1: "专业治愈",
    tag2: "亲密关系",
    title: "成人依恋类型与恋爱盲区测试",
    description: "安全、焦虑还是回避？破解恋爱中的魔咒",
    subtitle: "打破相处隔阂障碍，获悉红线密码",
    buttonText: "开启情评 💖",
    testId: "relationship-attachment",
    bgGradient: "from-rose-950 via-slate-950 to-[#4c0519]",
    textGlow: "text-rose-450"
  }
];

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  { id: "4001", testId: "mbti-standard", targetSkuId: "sku-mbti-standard-standard", label: "16型潜能", icon: "Brain", colorTheme: "indigo", sortOrder: 1 },
  { id: "4002", testId: "astrology-sun-moon", targetSkuId: "sku-astrology-sun-moon-standard", label: "三主星盘", icon: "Compass", colorTheme: "amber", sortOrder: 2 },
  { id: "4003", testId: "personality-bigfive", targetSkuId: "sku-personality-bigfive-standard", label: "核心动机", icon: "Award", colorTheme: "pink", sortOrder: 3 },
  { id: "4004", testId: "career-gallup", targetSkuId: "sku-career-gallup-standard", label: "搞钱天赋", icon: "Briefcase", colorTheme: "purple", sortOrder: 4 },
  { id: "4005", testId: "relationship-attachment", targetSkuId: "sku-relationship-attachment-standard", label: "依恋盲区", icon: "Heart", colorTheme: "emerald", sortOrder: 5 },
];

const DEFAULT_MID_RECS: MiddleRecommendation[] = [
  {
    id: "m1",
    testId: "relationship-attachment",
    title: "爱情心理契合图腾",
    description: "分析伴侣情感默契、依恋偏好与高效亲密沟通策略",
    tagText: "契合",
    theme: "rose",
    sortOrder: 1,
  },
  {
    id: "m2",
    testId: "mbti-standard",
    title: "高情商特质评估",
    description: "深度透视你的言行决策情境商，指导事业飞跃",
    tagText: "情商",
    theme: "purple",
    sortOrder: 2,
  },
  {
    id: "m3",
    testId: "personality-bigfive",
    title: "九型人格基础评测",
    description: "通过多因子交互，解读在逆境下的自我防卫面纱",
    tagText: "常模",
    theme: "emerald",
    sortOrder: 3,
  }
];

const DEFAULT_HOMEPAGE_PRODUCTS: HomepageProduct[] = [
  { id: "hp1", testId: "mbti-standard", targetType: "product", targetSkuId: "sku-mbti-standard-standard", name: "16型人格标准潜能报告", description: "全面系统解析你的认知功能优势与短板", icon: "Brain", originalPrice: 99, price: 19.9, sortOrder: 1 },
  { id: "hp2", testId: "astrology-sun-moon", targetType: "product", targetSkuId: "sku-astrology-sun-moon-standard", name: "三主星深度星盘报告", description: "揭秘太阳、月亮与上升的命运纠葛", icon: "Compass", originalPrice: 158, price: 29.9, sortOrder: 2 },
  { id: "hp3", testId: "personality-bigfive", targetType: "product", targetSkuId: "sku-personality-bigfive-standard", name: "九型/大五人格核心动机", description: "探究行为背后的核心驱动力", icon: "Award", originalPrice: 199, price: 39.9, sortOrder: 3 },
  { id: "hp4", testId: "career-gallup", targetType: "product", targetSkuId: "sku-career-gallup-standard", name: "盖洛普搞钱天赋", description: "发掘与生俱来的变现能力", icon: "Briefcase", originalPrice: 149, price: 29.9, sortOrder: 4 },
  { id: "hp5", testId: "relationship-attachment", targetType: "product", targetSkuId: "sku-relationship-attachment-standard", name: "成人依恋与恋爱盲区", description: "破解恋爱中的吸渣或推离模式", icon: "Heart", originalPrice: 169, price: 29.9, sortOrder: 5 },
];

const DEFAULT_CONVERSION_RECS: ConversionRecommendation[] = [
  {
    id: "5001",
    name: "继续测搞钱天赋",
    scene: "prepay",
    targetType: "product",
    targetTestId: "career-gallup",
    targetSkuId: "sku-career-gallup-standard",
    imageUrl: "",
    sortOrder: 1,
    startAt: "2026-06-01T00:00",
    endAt: "2026-12-31T23:59"
  },
  {
    id: "6001",
    name: "情感电量加购推荐",
    scene: "paid",
    targetType: "product",
    targetTestId: "relationship-lovelang",
    targetSkuId: "sku-relationship-lovelang-standard",
    imageUrl: "",
    sortOrder: 2,
    startAt: "2026-06-01T00:00",
    endAt: "2026-12-31T23:59"
  },
  {
    id: "6002",
    name: "亲密关系延展推荐",
    scene: "paid",
    targetType: "product",
    targetTestId: "relationship-attachment",
    targetSkuId: "sku-relationship-attachment-standard",
    imageUrl: "",
    sortOrder: 3,
    startAt: "2026-06-01T00:00",
    endAt: "2026-12-31T23:59"
  }
];

const STORAGE_KEYS = {
  slides: "homepage_banner_slides",
  shortcuts: "homepage_shortcuts_v2",
  middleRecs: "homepage_middle_recs_v2",
  homepageProducts: "homepage_products_v3",
  productSkus: "admin_product_skus_v1",
  conversionRecs: "conversion_recommendations_v4",
  recommendationsMerged: "homepage_recommendations_merged_v1",
};

const getStableRecommendationId = (source: string, offset: number) =>
  offset + Array.from(source).reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getRecommendationIdSegment = (position?: string) => {
  if (position === "首页中部") return 1000;
  if (position === "商品列表") return 2000;
  return 3000;
};

const normalizeRecommendationIds = (items: BannerSlide[]) => {
  const usedIds = new Set<number>();
  return items.map((item, index) => {
    const segment = getRecommendationIdSegment(item.displayPosition || "首页顶部");
    const rawId = Number(item.id);
    const isInSegment = rawId >= segment && rawId < segment + 1000;
    let nextId = Number.isFinite(rawId) && isInSegment ? rawId : segment + Number(item.sortOrder || index + 1);
    while (usedIds.has(nextId)) nextId += 1;
    usedIds.add(nextId);
    return nextId === item.id ? item : { ...item, id: nextId };
  });
};

const normalizeShortcutIds = (items: ShortcutItem[]) => {
  const segment = 4000;
  const usedIds = new Set<string>();
  return items.map((item, index) => {
    const rawId = Number(item.id);
    const isInSegment = Number.isFinite(rawId) && rawId >= segment && rawId < segment + 1000;
    let nextId = isInSegment ? rawId : segment + Number(item.sortOrder || index + 1);
    while (usedIds.has(String(nextId))) nextId += 1;
    usedIds.add(String(nextId));
    return String(nextId) === item.id ? item : { ...item, id: String(nextId) };
  });
};

const getConversionIdSegment = (scene: ConversionRecommendation["scene"]) => scene === "prepay" ? 5000 : 6000;

const normalizeConversionIds = (items: ConversionRecommendation[]) => {
  const usedIds = new Set<string>();
  return items.map((item, index) => {
    const segment = getConversionIdSegment(item.scene);
    const rawId = Number(item.id);
    const isInSegment = Number.isFinite(rawId) && rawId >= segment && rawId < segment + 1000;
    let nextId = isInSegment ? rawId : segment + Number(item.sortOrder || index + 1);
    while (usedIds.has(String(nextId))) nextId += 1;
    usedIds.add(String(nextId));
    return String(nextId) === item.id ? item : { ...item, id: String(nextId) };
  });
};

const toEightDigitId = (seed: string) => {
  if (/^\d{8}$/.test(seed)) return seed;
  if (/^\d+$/.test(seed)) return seed.length > 8 ? seed.slice(-8) : seed.padStart(8, "0");
  const hash = seed.split("").reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 90000000, 10000000);
  return String(hash).padStart(8, "0");
};

const createDefaultProductSkus = (tests: TestItem[]): ProductSku[] =>
  tests.filter((test) => !/^\d{8}$/.test(test.id)).map((test) => ({
    id: toEightDigitId(`sku-${test.id}-standard`),
    name: `${test.name} 标准售卖SKU`,
    projectId: test.id,
    projectName: test.name,
    price: test.price,
    originalPrice: test.originalPrice,
    status: test.isActive ? "已上架" : "已下架",
    createdAt: test.createdAt || "2026-06-18"
  }));

export default function App() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [orders, setOrders] = useState<CalculationOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeLayout, setActiveLayout] = useState<"side-by-side" | "simulator" | "admin" >("side-by-side");
  const [isSyncing, setIsSyncing] = useState(false);

  const [slides, setSlides] = useState<BannerSlide[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.slides);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SLIDES;
  });

  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.shortcuts);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SHORTCUTS;
  });

  const [middleRecs, setMiddleRecs] = useState<MiddleRecommendation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.middleRecs);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_MID_RECS;
  });

  const [homepageProducts, setHomepageProducts] = useState<HomepageProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.homepageProducts);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_HOMEPAGE_PRODUCTS;
  });

  const [productSkus, setProductSkus] = useState<ProductSku[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.productSkus);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [conversionRecs, setConversionRecs] = useState<ConversionRecommendation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.conversionRecs);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isValidNewSchema = Array.isArray(parsed) && parsed.every((item) =>
          typeof item?.id === "string" &&
          typeof item?.name === "string" &&
          (item?.scene === "prepay" || item?.scene === "paid") &&
          (item?.targetType === "product" || item?.targetType === "link") &&
          typeof item?.targetTestId === "string" &&
          typeof item?.startAt === "string" &&
          typeof item?.endAt === "string"
        );
        if (isValidNewSchema) return normalizeConversionIds(parsed);
        localStorage.setItem(STORAGE_KEYS.conversionRecs, JSON.stringify(DEFAULT_CONVERSION_RECS));
      } catch (e) {}
    }
    return DEFAULT_CONVERSION_RECS;
  });

  const handleUpdateSlides = (newSlides: BannerSlide[]) => {
    const normalizedSlides = normalizeRecommendationIds(newSlides);
    setSlides(normalizedSlides);
    localStorage.setItem(STORAGE_KEYS.slides, JSON.stringify(normalizedSlides));
  };

  const handleUpdateShortcuts = (newShortcuts: ShortcutItem[]) => {
    const normalizedShortcuts = normalizeShortcutIds(newShortcuts);
    setShortcuts(normalizedShortcuts);
    localStorage.setItem(STORAGE_KEYS.shortcuts, JSON.stringify(normalizedShortcuts));
  };

  const handleUpdateMiddleRecs = (newRecs: MiddleRecommendation[]) => {
    setMiddleRecs(newRecs);
    localStorage.setItem(STORAGE_KEYS.middleRecs, JSON.stringify(newRecs));
  };

  const handleUpdateHomepageProducts = (newProducts: HomepageProduct[]) => {
    setHomepageProducts(newProducts);
    localStorage.setItem(STORAGE_KEYS.homepageProducts, JSON.stringify(newProducts));
  };

  const handleUpdateProductSkus = (newProductSkus: ProductSku[]) => {
    setProductSkus(newProductSkus);
    localStorage.setItem(STORAGE_KEYS.productSkus, JSON.stringify(newProductSkus));
  };

  const handleUpdateConversionRecs = (newRecs: ConversionRecommendation[]) => {
    const normalizedRecs = normalizeConversionIds(newRecs);
    setConversionRecs(normalizedRecs);
    localStorage.setItem(STORAGE_KEYS.conversionRecs, JSON.stringify(normalizedRecs));
  };

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.recommendationsMerged)) return;

    const migratedMiddleSlides: BannerSlide[] = (middleRecs || []).map((item, index) => ({
      id: getStableRecommendationId(item.id, 100000),
      name: item.title,
      displayPosition: "首页中部",
      targetType: item.targetType || (item.linkUrl ? "link" : "product"),
      targetSkuId: item.targetType === "link" || item.linkUrl ? undefined : `sku-${item.testId}-standard`,
      linkUrl: item.targetType === "link" || item.linkUrl ? item.linkUrl || "" : "",
      imageUrl: item.icon && /^(data:image|blob:|https?:\/\/)/.test(item.icon) ? item.icon : "",
      sortOrder: item.sortOrder ?? index + 1,
      status: "已上架",
      tag1: item.tagText || "推荐",
      tag2: "中部推荐",
      title: item.title,
      description: item.description,
      subtitle: "金盾级隐私保护 • 匿名测评",
      buttonText: "立即评测",
      testId: item.testId,
      bgGradient: "from-rose-950 via-slate-950 to-[#4c0519]",
      textGlow: "text-rose-400"
    }));

    const migratedProductSlides: BannerSlide[] = (homepageProducts || []).map((item, index) => ({
      id: getStableRecommendationId(item.id, 200000),
      name: item.name || "商品展示入口",
      displayPosition: "商品列表",
      targetType: item.targetType || (item.linkUrl ? "link" : "product"),
      targetSkuId: item.targetSkuId,
      linkUrl: item.targetType === "link" || item.linkUrl ? item.linkUrl || "" : "",
      imageUrl: item.icon && /^(data:image|blob:|https?:\/\/)/.test(item.icon) ? item.icon : "",
      sortOrder: item.sortOrder ?? index + 1,
      status: "已上架",
      tag1: item.badgeText || "推荐",
      tag2: "商品列表",
      title: item.name || "商品展示入口",
      description: item.description || "点击查看测算详情",
      subtitle: "金盾级隐私保护 • 匿名测评",
      buttonText: "立即测评",
      testId: item.testId,
      bgGradient: "from-amber-950 via-slate-950 to-[#292524]",
      textGlow: "text-amber-400"
    }));

    const existingIds = new Set((slides || []).map((item) => item.id));
    const mergedSlides = normalizeRecommendationIds([
      ...(slides || []),
      ...migratedMiddleSlides,
      ...migratedProductSlides
    ].filter((item, index, list) => !existingIds.has(item.id) || list.findIndex((next) => next.id === item.id) === index));

    setSlides(mergedSlides);
    localStorage.setItem(STORAGE_KEYS.slides, JSON.stringify(mergedSlides));
    localStorage.setItem(STORAGE_KEYS.recommendationsMerged, "true");
  }, []);

  useEffect(() => {
    const normalizedSlides = normalizeRecommendationIds(slides);
    const changed = normalizedSlides.some((item, index) => item.id !== slides[index]?.id);
    if (!changed) return;
    setSlides(normalizedSlides);
    localStorage.setItem(STORAGE_KEYS.slides, JSON.stringify(normalizedSlides));
  }, [slides]);

  useEffect(() => {
    const normalizedShortcuts = normalizeShortcutIds(shortcuts);
    const changed = normalizedShortcuts.some((item, index) => item.id !== shortcuts[index]?.id);
    if (!changed) return;
    setShortcuts(normalizedShortcuts);
    localStorage.setItem(STORAGE_KEYS.shortcuts, JSON.stringify(normalizedShortcuts));
  }, [shortcuts]);

  useEffect(() => {
    const isValidNewSchema = conversionRecs.every((item) =>
      typeof item?.id === "string" &&
      typeof item?.name === "string" &&
      (item?.scene === "prepay" || item?.scene === "paid") &&
      (item?.targetType === "product" || item?.targetType === "link") &&
      typeof item?.targetTestId === "string" &&
      typeof item?.startAt === "string" &&
      typeof item?.endAt === "string"
    );
    if (!isValidNewSchema) {
      setConversionRecs(DEFAULT_CONVERSION_RECS);
      localStorage.setItem(STORAGE_KEYS.conversionRecs, JSON.stringify(DEFAULT_CONVERSION_RECS));
    }
  }, [conversionRecs]);

  useEffect(() => {
    const normalizedRecs = normalizeConversionIds(conversionRecs);
    const changed = normalizedRecs.some((item, index) => item.id !== conversionRecs[index]?.id);
    if (!changed) return;
    setConversionRecs(normalizedRecs);
    localStorage.setItem(STORAGE_KEYS.conversionRecs, JSON.stringify(normalizedRecs));
  }, [conversionRecs]);

  // Sync all databases from server
  const fetchAllData = async () => {
    setIsSyncing(true);
    try {
      const [sessionRes, testsRes, ordersRes, statsRes] = await Promise.all([
        fetch("/api/session"),
        fetch("/api/tests"),
        fetch("/api/orders"),
        fetch("/api/stats")
      ]);

      if (sessionRes.ok && testsRes.ok && ordersRes.ok && statsRes.ok) {
        const sessionData = await sessionRes.json();
        const testsData = await testsRes.json();
        const ordersData = await ordersRes.json();
        const statsData = await statsRes.json();

        setCurrentUser(sessionData);
        setTests(testsData);
        setOrders(ordersData);
        setStats(statsData);
      }
    } catch (err) {
      console.error("数据云同步失败:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Live poll order status changes or statistic spikes periodically
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tests.length === 0 || productSkus.length > 0) return;
    const defaultProductSkus = createDefaultProductSkus(tests);
    if (defaultProductSkus.length > 0) {
      handleUpdateProductSkus(defaultProductSkus);
    }
  }, [tests, productSkus.length]);

  // Update Test Item Configuration (e.g. price change or template update)
  const handleUpdateTest = async (updatedTest: TestItem) => {
    setTests(prev => {
      const exists = prev.some(test => test.id === updatedTest.id);
      return exists
        ? prev.map(test => test.id === updatedTest.id ? { ...test, ...updatedTest } : test)
        : [updatedTest, ...prev];
    });
    try {
      const response = await fetch("/api/tests/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTest)
      });
      if (response.ok) {
        fetchAllData(); // Sync up
      } else {
        console.error("更新配置失败:", await response.text());
      }
    } catch (err) {
      console.error("更新配置失败:", err);
    }
  };

  const handleDeleteTest = (testId: string) => {
    setTests(prev => prev.filter(test => test.id !== testId));
    setHomepageProducts(prev => prev.filter(product => product.testId !== testId));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans select-text select-text antialiased">
      
      {/* Platform Upper Command Header */}
      <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800/80 px-6 flex items-center justify-between z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 font-serif font-extrabold text-slate-950 select-none shadow">
            ✨
          </div>
          <div className="text-left">
            <h1 className="text-sm font-bold tracking-wider text-amber-100 font-serif flex items-center gap-1.5">
              AI测算小程序及后台交互稿
            </h1>
            <p className="text-[10px] text-slate-400 font-sans">
              整合「萨提亚早期依恋与MBTI机制」与「西洋现代心理星图映射」，打造大模型心理自省落地解决方案
            </p>
          </div>
        </div>

        {/* View Layout Toggles (Side-by-side or singular viewports) */}
        <div className="flex items-center gap-2">
          {isSyncing && (
            <span className="text-[10px] text-amber-500/80 font-mono flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              数据同步中...
            </span>
          )}

          <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveLayout("side-by-side")}
              className={`px-3 py-1 text-2xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                activeLayout === "side-by-side"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 双屏联动设计 (推荐)
            </button>
            <button
              onClick={() => setActiveLayout("simulator")}
              className={`px-3 py-1 text-2xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                activeLayout === "simulator"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> H5演示
            </button>
            <button
              onClick={() => setActiveLayout("admin")}
              className={`px-3 py-1 text-2xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                activeLayout === "admin"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> 管理后台纯览
            </button>
          </div>
        </div>
      </header>

      {/* Main Sandbox workspace */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        
        {/* Background cosmic glow layout decoration */}
        <div className="absolute top-1/4 left-1/4 -translate-y-12 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 translate-y-12 w-96 h-96 rounded-full bg-red-500/5 blur-[120px] pointer-events-none z-0" />

        {activeLayout === "side-by-side" && (
          <div className="flex min-w-0 flex-1 gap-5 items-center justify-center z-10 w-full">
            
            {/* Left Column: Phone frame containing calculations program */}
            <div className="w-[390px] shrink-0 text-center flex flex-col justify-center">
              <div className="mb-2 text-2xs font-serif font-semibold text-amber-200/50 flex items-center justify-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> 
                H5演示
              </div>
              <PhoneSimulator 
                tests={tests}
                orders={orders}
                currentUser={currentUser}
                onOrderCreated={fetchAllData}
                slides={slides}
                shortcuts={shortcuts}
                middleRecs={middleRecs}
                homepageProducts={homepageProducts}
                conversionRecs={conversionRecs}
                productSkus={productSkus}
              />
            </div>

            {/* Right Column: Full-scale statistics & item parameters management console */}
            <div className="flex h-[min(800px,calc(100vh-9rem))] min-h-[680px] min-w-0 flex-1 flex-col justify-center">
              <div className="mb-2 text-2xs font-serif font-semibold text-amber-200/50 flex items-center justify-start gap-1">
                <Cpu className="w-3.5 h-3.5" /> 
                云端可视化管理后台 (多功能参数配置与分析)
              </div>
              {stats ? (
                <AdminDashboard 
                  tests={tests}
                  orders={orders}
                  onRefresh={fetchAllData}
	                  onUpdateTest={handleUpdateTest}
	                  onDeleteTest={handleDeleteTest}
                  slides={slides}
                  onUpdateSlides={handleUpdateSlides}
                  shortcuts={shortcuts}
                  onUpdateShortcuts={handleUpdateShortcuts}
                  middleRecs={middleRecs}
                  onUpdateMiddleRecs={handleUpdateMiddleRecs}
                  homepageProducts={homepageProducts}
                  onUpdateHomepageProducts={handleUpdateHomepageProducts}
                  conversionRecs={conversionRecs}
                  onUpdateConversionRecs={handleUpdateConversionRecs}
                  productSkus={productSkus}
                  onUpdateProductSkus={handleUpdateProductSkus}
                />
              ) : (
                <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
                  <span className="animate-spin text-amber-500 text-xl font-bold mb-3">☯️</span>
                  正在连通承天大盘数据通道，请稍后...
                </div>
              )}
            </div>

          </div>
        )}

        {activeLayout === "simulator" && (
          <div className="flex-1 flex items-center justify-center z-10 py-4">
            <div className="w-[390px] shrink-0">
              <div className="mb-3 text-xs font-serif font-semibold text-amber-300 flex items-center justify-center gap-1">
                <Smartphone className="w-4 h-4 text-amber-500" />
                H5演示
              </div>
              <PhoneSimulator 
                tests={tests}
                orders={orders}
                currentUser={currentUser}
                onOrderCreated={fetchAllData}
                slides={slides}
                shortcuts={shortcuts}
                middleRecs={middleRecs}
                homepageProducts={homepageProducts}
                conversionRecs={conversionRecs}
                productSkus={productSkus}
              />
            </div>
          </div>
        )}

        {activeLayout === "admin" && (
          <div className="flex-1 w-full max-w-[min(1680px,calc(100vw-3rem))] mx-auto flex h-[calc(100vh-8rem)] min-h-[720px] items-center justify-center z-10">
            <div className="w-full h-full flex flex-col justify-center">
              <div className="mb-3 text-xs font-mono font-semibold text-indigo-300 flex items-center justify-start gap-1">
                <Cpu className="w-4 h-4 text-[#4F46E5] animate-pulse" />
                后台管理面板全开视窗 • 支持实时品类、报告模板、价格参数调优
              </div>
              {stats ? (
                <AdminDashboard 
                  tests={tests}
                  orders={orders}
                  onRefresh={fetchAllData}
	                  onUpdateTest={handleUpdateTest}
	                  onDeleteTest={handleDeleteTest}
                  slides={slides}
                  onUpdateSlides={handleUpdateSlides}
                  shortcuts={shortcuts}
                  onUpdateShortcuts={handleUpdateShortcuts}
                  middleRecs={middleRecs}
                  onUpdateMiddleRecs={handleUpdateMiddleRecs}
                  homepageProducts={homepageProducts}
                  onUpdateHomepageProducts={handleUpdateHomepageProducts}
                  conversionRecs={conversionRecs}
                  onUpdateConversionRecs={handleUpdateConversionRecs}
                  productSkus={productSkus}
                  onUpdateProductSkus={handleUpdateProductSkus}
                />
              ) : (
                <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
                  <span className="animate-spin text-amber-500 text-xl font-bold mb-3">☯️</span>
                  数据通道重连中...
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Floating guidelines panel to prevent over-engineering notice */}
      <footer className="h-10 shrink-0 bg-slate-950 border-t border-slate-900 px-6 flex items-center justify-between text-slate-600 text-2xs select-none">
        <span>天玑智能易学算命及商业化后台管理集成框架</span>
        <span className="font-mono">Secure Core Connection | powered by gemini-3.5-flash | 2026</span>
      </footer>

    </div>
  );
}
