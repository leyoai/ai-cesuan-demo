/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TestItem {
  id: string;
  name: string;
  category: "mbti" | "sbti" | "emotion" | "career" | "personality" | "astrology";
  assessmentMode?: "quiz_score" | "profile_inference";
  assessmentTarget?: "single" | "double";
  profileFields?: Array<"userName" | "gender" | "birthDate" | "birthTime" | "birthPlace" | "question">;
  description: string;
  detailHeroImage?: string;
  detailSubtitle?: string;
  detailBody?: string;
  detailDisclaimerText?: string;
  detailButtonText?: string;
  detailThemeColor?: string;
  price: number;
  originalPrice: number;
  icon: string;
  tag: string;
  tagColor: string;
  isActive: boolean;
  questionBankIds?: string[];
  freeReportThemeId?: string;
  promptSourceTestId?: string;
  promptTemplateId?: string;
  promptTemplate: string;
  calculateCount: number;
  successRate: number;
  createdAt?: string;
}

export interface ProductSku {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  price: number;
  originalPrice?: number;
  status: "已上架" | "已下架";
  createdAt?: string;
}

export interface CalculationOrder {
  id: string;
  testId: string;
  testName: string;
  userId?: string;
  userNickname?: string;
  phone?: string;
  userName: string;
  gender: "male" | "female" | "other";
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  birthPlace?: string;
  partnerName?: string; // for relationship assessments
  partnerGender?: "male" | "female" | "other"; // for relationship assessments
  partnerBirthDate?: string; // YYYY-MM-DD
  partnerBirthTime?: string; // HH:MM
  quizAnswers?: string; // summary of answered questions for quiz-based assessments
  scoreSummary?: string; // structured scores for quiz-based assessments
  traditionalSummary?: string; // deterministic traditional summary before AI enrichment
  freeReportThemeId?: string;
  freeReportTemplateVersion?: string;
  freeReportText?: string; // algorithm-generated free preview text shown before payment
  question: string;
  price: number;
  paymentMethod?: "wechat" | "alipay";
  refundReason?: string;
  status: "pending" | "paid" | "failed" | "refunded";
  resultReport?: string;
  popupShown?: boolean;
  createdAt: string; // ISO String
}

export interface CurrentUser {
  userId: string;
  userNickname: string;
  phone?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number; // e.g., 68.5%
  activeUsers: number;
  testBreakdown: { name: string; value: number; color: string }[];
  funnelStages: { stage: string; count: number; percentage: number }[];
  weeklyRevenue: { date: string; amount: number; orderCount: number }[];
}

export interface BannerSlide {
  id: number;
  name?: string;
  displayPosition?: "首页顶部" | "首页中部" | "商品列表" | string;
  targetType?: "product" | "link";
  targetSkuId?: string;
  linkUrl?: string;
  imageUrl?: string;
  sortOrder?: number;
  status?: "已上架" | "已下架";
  tag1: string;
  tag2: string;
  title: string;
  description: string;
  subtitle: string;
  buttonText: string;
  testId: string;
  bgGradient: string;
  textGlow: string;
}

export interface ShortcutItem {
  id: string;
  testId: string;
  targetSkuId?: string;
  label: string;
  targetType?: "product" | "link";
  linkUrl?: string;
  icon?: string;
  sortOrder?: number;
  status?: "已上架" | "已下架";
  colorTheme: "indigo" | "amber" | "pink" | "purple" | "emerald" | "rose" | "teal";
}

export interface MiddleRecommendation {
  id: string;
  testId: string;
  targetType?: "product" | "link";
  linkUrl?: string;
  icon?: string;
  sortOrder?: number;
  priceVal?: number;
  title: string;
  description: string;
  tagText: string;
  theme: "rose" | "purple" | "emerald" | "indigo" | "amber" | "teal" | "red";
}

export interface HomepageProduct {
  id: string;
  testId: string;
  targetType?: "product" | "link";
  targetSkuId?: string;
  linkUrl?: string;
  name?: string;
  description?: string;
  icon?: string;
  badgeText?: string;
  originalPrice?: number;
  price?: number;
  sortOrder?: number;
}

export interface ConversionRecommendation {
  id: string;
  name: string;
  scene: "prepay" | "paid";
  targetType: "product" | "link";
  targetTestId: string;
  targetSkuId?: string;
  linkUrl?: string;
  imageUrl?: string;
  sortOrder: number;
  status?: "已上架" | "已下架";
  startAt: string;
  endAt: string;
}
