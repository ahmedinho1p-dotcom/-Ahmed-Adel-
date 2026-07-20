import React, { useState, useEffect } from "react";
import { 
  ArrowRight, MessageCircle, CreditCard, ShoppingCart, Tag, Check, 
  RefreshCw, Upload, Trash2, AlertCircle, Copy, Wallet, ChevronLeft, 
  ShieldCheck, Zap, Sparkles, Award, Star, Facebook, Instagram, Youtube,
  User, Link2, CheckCircle2, ChevronRight
} from "lucide-react";
import { TiktokIcon } from "./TiktokIcon";
import { Package } from "../types";

interface CheckoutPageProps {
  pack: Package;
  currency: 'EGP' | 'SAR' | 'USD';
  exchangeRates: { SAR: number; USD: number };
  onClose: () => void;
  onSubmitOrder: (orderDetails: {
    customerName: string;
    whatsappNumber: string;
    pageUrl: string;
    packageId: string;
    couponCode?: string;
    paymentMethod?: string;
    paymentSender?: string;
    paymentAmount?: number;
    paymentScreenshot?: string;
  }) => Promise<{ success: boolean; message: string; order?: any; generatedCoupon?: any; error?: string }>;
  darkMode: boolean;
}

type PaymentPath = 'whatsapp' | 'store' | null;
type StorePaymentMethod = 'vodafone' | 'instapay';

export default function CheckoutPage({
  pack,
  currency,
  exchangeRates,
  onClose,
  onSubmitOrder,
  darkMode,
}: CheckoutPageProps) {
  // Wizard Step State
  // Step 1: التواصل (customerName, whatsappNumber)
  // Step 2: الحساب المستهدف (pageUrl + Coupon)
  // Step 3: الدفع والتفعيل (paymentPath, paymentSender, paymentAmount, screenshot)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Order info states
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Payment Path state
  const [paymentPath, setPaymentPath] = useState<PaymentPath>(null); 
  const [selectedMethod, setSelectedMethod] = useState<StorePaymentMethod>('vodafone');

  // Direct checkout confirmation states
  const [paymentSender, setPaymentSender] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // Settings fetched from backend
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Coupon Validation states
  const [appliedCoupon, setAppliedCoupon] = useState<{ 
    code: string; 
    type: string; 
    value: number; 
    percent: number; 
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [generatedCoupon, setGeneratedCoupon] = useState<any | null>(null);

  // Load store settings
  useEffect(() => {
    setLoadingSettings(true);
    fetch("/api/settings")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load settings");
      })
      .then((data) => setStoreSettings(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingSettings(false));
  }, []);

  // Cleanup object URLs to prevent leaks
  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  // Scroll to top on mount, package change or step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStep, pack.id]);

  // Convert prices dynamically
  const getConvertedPrice = (priceInEGP: number) => {
    let finalBase = priceInEGP;
    if (pack.discount) {
      finalBase = finalBase * (1 - pack.discount / 100);
    }

    if (appliedCoupon) {
      if (appliedCoupon.type === "FIXED") {
        finalBase = Math.max(0, finalBase - appliedCoupon.value);
      } else {
        finalBase = finalBase * (1 - appliedCoupon.percent / 100);
      }
    }

    let multiplier = 1;
    if (currency === "SAR") multiplier = exchangeRates.SAR;
    if (currency === "USD") multiplier = exchangeRates.USD;

    let converted = finalBase * multiplier;

    return Math.round(converted * 100) / 100;
  };

  const getSuccessWhatsAppLink = (order: any) => {
    if (!order) return "";
    const isPaidOnSite = order.paymentMethod ? true : false;
    
    const giftFormatted = pack.gift ? (
      pack.gift === "Like" ? "لايكات Like إضافية مجانية ❤️" :
      pack.gift === "Follow" ? "متابعين Follow إضافيين مجاناً 👤" :
      pack.gift === "Both" ? "متابعين ولايكات مجاناً ✨" :
      pack.gift
    ) : null;

    const giftSection = giftFormatted ? `• *الهدية المرفقة مجاناً:* 🎁 ${giftFormatted}\n` : "";

    let messageText = "";
    if (isPaidOnSite) {
      messageText = 
        `🌟 *إشعار اكتمال عملية الدفع وتأكيد الطلب* 🌟\n\n` +
        `أهلاً بك، لقد قمت بسداد قيمة الطلب وتأكيده بنجاح من متجر *Zawdha*! 🎉\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📋 *تفاصيل الطلب الفنية:*\n` +
        `• *كود الطلب (ID):* \`${order.id.slice(0, 8).toUpperCase()}\`\n` +
        `• *اسم العميل:* ${order.customerName}\n` +
        `• *رقم الهاتف:* ${order.whatsappNumber}\n` +
        `• *الخدمة المطلوبة:* ${order.packageName} (${order.platform})\n` +
        giftSection +
        `• *رابط الصفحة المستهدفة:* ${order.pageUrl}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `💳 *تفاصيل السداد والتحويل المالي:*\n` +
        `• *طريقة الدفع:* ${order.paymentMethod}\n` +
        `• *رقم المحول منه:* ${order.paymentSender || "غير محدد"}\n` +
        `• *المبلغ المحول:* ${order.paymentAmount} ${order.currency}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `⏳ *الحالة الحالية:*\n` +
        `• تم تسجيل إيصال السداد بنجاح في النظام وجاري مراجعته وتفعيل الباقة فورياً خلال دقائق معدودة.\n\n` +
        `شكراً لاختيارك متجر *Zawdha*! يسعدنا دائماً خدمتك بأفضل جودة وأسرع تنفيذ. 🚀`;
    } else {
      messageText = 
        `👋 *طلب جديد بانتظار إتمام السداد* 👋\n\n` +
        `أهلاً بك، لقد قمت بتسجيل طلب جديد عبر متجر *Zawdha* وأرغب في تفعيله الآن! 💫\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📋 *تفاصيل الطلب الفنية:*\n` +
        `• *كود الطلب (ID):* \`${order.id.slice(0, 8).toUpperCase()}\`\n` +
        `• *اسم العميل:* ${order.customerName}\n` +
        `• *رقم الهاتف:* ${order.whatsappNumber}\n` +
        `• *الخدمة المطلوبة:* ${order.packageName} (${order.platform})\n` +
        giftSection +
        `• *رابط الصفحة المستهدفة:* ${order.pageUrl}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `💡 *الخطوة التالية:*\n` +
        `• الرجاء تزويدي ببيانات السداد لإرسال قيمة الطلب والبدء الفوري بالتفعيل يدوياً.\n\n` +
        `شكراً لاختيارك متجر *Zawdha*! يسعدنا دائماً خدمتك بأفضل جودة وأسرع تنفيذ. 🚀`;
    }

    const encodedText = encodeURIComponent(messageText);
    const rawPhone = storeSettings.whatsapp_number || "01124656914";
    const cleanPhone = rawPhone.trim();
    const targetPhone = cleanPhone.startsWith("0") && cleanPhone.length === 11 ? "2" + cleanPhone : cleanPhone;
    return `https://wa.me/${targetPhone}?text=${encodedText}`;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedCoupon({ 
          code: data.code, 
          type: data.discountType || "PERCENT",
          value: data.discountValue || 0,
          percent: data.discountPercent || 0 
        });
        setCouponError("");
      } else {
        setCouponError(data.error || "كود الخصم غير صحيح أو منتهي الصلاحية");
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError("خطأ في الاتصال بالخادم للتحقق من الكوبون");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Convert File to Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("الرجاء اختيار صورة صالحة فقط بصيغة (JPG, PNG, WEBP)");
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError("حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت");
      return;
    }

    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setUploadError("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getMethodPhoneNumber = () => {
    switch (selectedMethod) {
      case "vodafone":
        return storeSettings.vodafone_cash_number || "01124656914";
      case "instapay":
        return storeSettings.instapay_number || "01558676497";
      default:
        return "01124656914";
    }
  };

  const getMethodLabel = () => {
    switch (selectedMethod) {
      case "vodafone": return "فودافون كاش";
      case "instapay": return "إنستا باي (Instapay)";
    }
  };

  const handleStep1Next = () => {
    if (!customerName.trim() || !whatsappNumber.trim()) {
      setSubmitError("الرجاء إدخال اسمك ورقم الواتساب للتواصل قبل الانتقال للخطوة التالية.");
      return;
    }
    if (!pageUrl.trim()) {
      setSubmitError("الرجاء إدخال رابط الصفحة أو المنشور المستهدف لتلقي الخدمة.");
      return;
    }
    setSubmitError("");
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsappNumber.trim() || !pageUrl.trim()) {
      setSubmitError("الرجاء التأكد من ملء جميع الخطوات السابقة بالكامل");
      return;
    }

    if (!paymentPath) {
      setSubmitError("الرجاء تحديد طريقة تأكيد الدفع قبل إرسال الطلب");
      return;
    }

    if (paymentPath === "store") {
      if (!paymentSender.trim()) {
        setSubmitError("الرجاء إدخال رقم الهاتف الذي قمت بالتحويل منه");
        return;
      }
      if (!paymentAmount.trim()) {
        setSubmitError("الرجاء إدخال المبلغ المحوّل الفعلي");
        return;
      }
      if (!screenshotFile) {
        setSubmitError("الرجاء رفع صورة إيصال التحويل لتأكيد الطلب");
        return;
      }
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      let payload: any = {
        customerName,
        whatsappNumber,
        pageUrl,
        packageId: pack.id,
        couponCode: appliedCoupon?.code || undefined,
      };

      if (paymentPath === "store" && screenshotFile) {
        const base64Screenshot = await convertToBase64(screenshotFile);
        payload = {
          ...payload,
          paymentMethod: getMethodLabel(),
          paymentSender,
          paymentAmount: parseFloat(paymentAmount),
          paymentScreenshot: base64Screenshot,
        };
      }

      const result = await onSubmitOrder(payload);

      if (result.success) {
        setSuccessMsg(result.message);
        setCreatedOrder(result.order);
        setGeneratedCoupon(result.generatedCoupon);
      } else {
        setSubmitError(result.error || "فشل تسجيل طلبك، يرجى المحاولة لاحقاً");
      }
    } catch (err) {
      setSubmitError("حدث خطأ في الشبكة، يرجى إعادة المحاولة");
    } finally {
      setSubmitting(false);
    }
  };

  // Premium design gradient styles for selected package
  const getPackageStyle = () => {
    const name = pack.name.trim();
    if (name.includes("الفضية")) {
      return {
        cardBg: darkMode 
          ? "from-neutral-900 to-neutral-950 border-purple-500/20" 
          : "from-neutral-50 to-neutral-105 border-pink-500/20",
        badgeText: "التميز الفضي 🪙",
        accentColor: "text-purple-400"
      };
    } else if (name.includes("الذهبية")) {
      return {
        cardBg: darkMode 
          ? "from-amber-950/20 via-neutral-900 to-neutral-950 border-amber-500/30" 
          : "from-amber-50/50 via-white to-amber-50/10 border-amber-300",
        badgeText: "الذهبي الملكي 👑",
        accentColor: "text-amber-500"
      };
    } else if (name.includes("البلاتينية")) {
      return {
        cardBg: darkMode 
          ? "from-slate-900 via-neutral-950 to-black border-purple-500/20" 
          : "from-slate-100 to-white border-pink-500/20",
        badgeText: "البلاتيني الفاخر 💎",
        accentColor: "text-slate-400"
      };
    } else if (name.includes("الماسية")) {
      return {
        cardBg: darkMode 
          ? "from-[#081520] via-neutral-900 to-neutral-950 border-[#00f2fe]/30" 
          : "from-cyan-50/40 via-white to-neutral-50 border-cyan-200",
        badgeText: "الوهج الماسي ✨",
        accentColor: "text-cyan-400"
      };
    } else if (name.includes("النخبة")) {
      return {
        cardBg: darkMode 
          ? "from-purple-950/10 via-neutral-900 to-neutral-950 border-purple-500 shadow-purple-500/5 shadow-lg" 
          : "from-pink-50/40 via-white to-neutral-50 border-pink-500 shadow-pink-500/5 shadow-lg",
        badgeText: "باقة النخبة VIP 🌟",
        accentColor: "text-purple-500"
      };
    }
    return {
      cardBg: darkMode ? "from-neutral-900 to-neutral-950 border-purple-500/20" : "from-white to-neutral-50 border-neutral-200",
      badgeText: "باقة متميزة",
      accentColor: "text-pink-500"
    };
  };

  const packStyle = getPackageStyle();

  const renderPlatformIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    if (platform === "Instagram") return <Instagram className={`${iconClass} text-pink-500`} />;
    if (platform === "Facebook") return <Facebook className={`${iconClass} text-blue-500`} />;
    if (platform === "YouTube") return <Youtube className={`${iconClass} text-red-500`} />;
    if (platform === "TikTok") return <TiktokIcon className={`${iconClass} text-[#00f2fe]`} />;
    return <Star className={`${iconClass} text-yellow-500 fill-yellow-500`} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" dir="rtl">
      
      {/* Upper Navigation Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-neutral-850/10">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="hover:text-pink-500 transition-colors cursor-pointer" onClick={onClose}>الرئيسية</span>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>تأكيد السداد وتفعيل الباقة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent mt-1">
            بوابة الدفع الآمنة والذكية 🛡️
          </h1>
          <p className="text-xs text-neutral-400">تأكيد طلب الباقة خطوة بخطوة للحفاظ على سهولة وتنسيق الطلب.</p>
        </div>

        <button
          onClick={onClose}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
            darkMode 
              ? "bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200" 
              : "bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 shadow-sm"
          }`}
        >
          <ArrowRight className="w-4 h-4 text-pink-500" />
          <span>الرجوع للباقات الرئيسية</span>
        </button>
      </div>

      {successMsg ? (
        /* SUCCESS RECEIPT PAGE VIEW */
        <div className={`max-w-2xl mx-auto p-8 rounded-3xl border text-center space-y-6 shadow-2xl relative overflow-hidden ${
          darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}>
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />
          
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
            <Check className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-green-500">تم تسجيل طلبك بنجاح! 🎉</h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
              {successMsg}
            </p>
          </div>

          {createdOrder && (
            <div className={`p-6 rounded-2xl border text-right space-y-4 max-w-lg mx-auto relative overflow-hidden ${
              darkMode ? "bg-neutral-900/50 border-neutral-800/80 text-neutral-300" : "bg-neutral-50 border-neutral-200 text-neutral-700"
            }`}>
              <div className="absolute top-0 right-0 w-1.5 h-full bg-green-500" />
              <div className="flex items-center justify-between border-b border-neutral-800/10 pb-3">
                <span className="font-extrabold text-xs text-neutral-400 flex items-center gap-1">🧾 فاتورة تأكيد الخدمة الإلكترونية</span>
                <span className="text-[10px] px-2.5 py-1 bg-green-500/10 text-green-500 rounded-full font-bold">بانتظار المراجعة الفورية</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] mb-0.5">رقم تتبع الطلب (ID):</span>
                  <span className="font-mono text-pink-500 font-black tracking-wider text-sm">#{createdOrder.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] mb-0.5">العميل:</span>
                  <span className="text-neutral-200 dark:text-white font-bold">{createdOrder.customerName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-400 block text-[10px] mb-0.5">الخدمة المطلوبة:</span>
                  <span className="text-neutral-200 dark:text-white font-bold">{createdOrder.packageName} ({createdOrder.platform})</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] mb-0.5">المبلغ المحدد:</span>
                  <span className="text-pink-500 font-black font-mono">{createdOrder.price} {createdOrder.currency}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] mb-0.5">طريقة تأكيد الدفع:</span>
                  <span className="text-neutral-200 dark:text-white font-mono font-bold">{createdOrder.paymentMethod || "تحويل تواصل مباشر"}</span>
                </div>
              </div>
            </div>
          )}

          {generatedCoupon && (
            <div className={`p-6 rounded-2xl border text-center space-y-4 max-w-lg mx-auto relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent border-amber-500/30 shadow-lg`}>
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full mb-1">
                  هدية شكر وتقدير بقيمة الباقة 🎉
                </span>
                <h3 className="text-sm font-black text-amber-500 dark:text-amber-400">
                  كوبون خصم مخصص لطلبك القادم! 🎁
                </h3>
                <p className="text-[11px] text-neutral-400 max-w-sm leading-relaxed">
                  تقديراً لثقتك بنا، إليك كوبون خصم خاص بصفحتك صالح للاستخدام مرة واحدة فقط في أي عملية شراء قادمة.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2 border-y border-neutral-800/15">
                <div className="text-right sm:text-center">
                  <span className="text-[10px] text-neutral-400 block">قيمة الخصم:</span>
                  <span className="text-xl font-black text-amber-500 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    {generatedCoupon.discountValue} ج.م
                  </span>
                  {currency !== "EGP" && (
                    <span className="text-[9px] text-neutral-400 block">
                      (ما يعادل {Math.round(generatedCoupon.discountValue * (currency === "SAR" ? exchangeRates.SAR : exchangeRates.USD) * 100) / 100} {currency})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-2 pl-3 select-all">
                  <span className="font-mono font-black text-xs tracking-wider text-yellow-500">
                    {generatedCoupon.code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCoupon.code);
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                    title="نسخ الكود"
                  >
                    {copiedText ? (
                      <span className="text-[10px] font-bold text-green-500 px-1">تم النسخ!</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[9px] text-neutral-400">
                ⚠️ الكوبون صالح للاستخدام لمرة واحدة فقط ومربوط بحسابك الحالي. يرجى حفظ الكود لاستخدامه في الباقة القادمة.
              </div>
            </div>
          )}

          {createdOrder && (
            <div className="space-y-4 max-w-sm mx-auto">
              <a
                href={getSuccessWhatsAppLink(createdOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-[#22c55e] hover:bg-[#1eb052] text-white font-extrabold text-xs shadow-lg shadow-green-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>تأكيد عملية الدفع والمتابعة عبر واتساب</span>
              </a>
              <span className="text-[10px] text-neutral-400 block">
                ⚡ يرجى الضغط على الزر أعلاه لمتابعة تفعيل طلبك وتأكيد السداد عبر الواتساب الخاص بنا...
              </span>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer transition-all active:scale-95"
            >
              موافق، الرجوع للموقع الرئيسي
            </button>
          </div>
        </div>
      ) : (
        /* CENTERED 2-STEP CHECKOUT FORM */
        <div className="max-w-2xl mx-auto w-full space-y-6">
            
            {/* Elegant visual Stepper Progress indicator */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-2 overflow-x-auto ${
              darkMode ? "bg-neutral-900/40 border-neutral-800/80" : "bg-neutral-50/50 border-neutral-200 shadow-sm"
            }`}>
              
              {/* Step 1 Indicator */}
              <div 
                onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
                className={`flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                  currentStep === 1 ? "text-pink-500 scale-[1.02]" : "text-neutral-450 hover:text-neutral-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  currentStep === 1 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-pink-500/10" 
                    : "bg-green-500/20 text-green-500"
                }`}>
                  {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3px]" /> : "1"}
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-neutral-400">الخطوة الأولى</span>
                  <span className="text-xs font-extrabold block">بيانات الطلب والتواصل</span>
                </div>
              </div>

              <div className="h-0.5 flex-1 bg-neutral-200 dark:bg-neutral-850" />

              {/* Step 2 Indicator */}
              <div 
                className={`flex items-center gap-2 shrink-0 transition-all ${
                  currentStep === 2 ? "text-pink-500 scale-[1.02]" : "text-neutral-450"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  currentStep === 2 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-pink-500/10" 
                    : "bg-neutral-800 text-neutral-500"
                }`}>
                  2
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-neutral-400">الخطوة الثانية والأخيرة</span>
                  <span className="text-xs font-extrabold block">الدفع والتفعيل</span>
                </div>
              </div>

            </div>

            {/* Form Steps Card Container */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 relative overflow-hidden ${
              darkMode ? "bg-neutral-900/25 border-neutral-800/80" : "bg-white border-neutral-200/80 shadow-md"
            }`}>

              {/* STEP 1: CONTACT DETAILS VIEW */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in text-right">
                  <div className="border-b border-neutral-850/10 pb-3">
                    <span className="text-xs font-black text-pink-500 bg-pink-500/5 px-3 py-1 rounded-full">الخطوة 1 من 2</span>
                    <h3 className="text-base font-black mt-2">معلومات التواصل وبيانات الطلب</h3>
                    <p className="text-[11px] text-neutral-400 mt-1">يرجى ملء البيانات التالية بدقة لمتابعة طلبك وتفعيله فوراً.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-neutral-350 dark:text-neutral-250 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-pink-500" />
                        <span>الاسم بالكامل</span>
                      </label>
                      <input
                        id="checkout-input-name"
                        type="text"
                        required
                        placeholder="اكتب اسمك الكريم هنا"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`w-full text-xs py-3.5 px-4 rounded-2xl transition-all duration-200 focus:outline-none placeholder:text-neutral-400 placeholder:font-bold ${
                          darkMode 
                            ? "glowing-animated-border-dark text-white" 
                            : "glowing-animated-border-light text-neutral-900"
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-neutral-350 dark:text-neutral-250 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-green-500 fill-green-500/10" />
                        <span>رقم الواتساب للتواصل</span>
                      </label>
                      <input
                        id="checkout-input-phone"
                        type="tel"
                        required
                        placeholder="مثال: 01124656914"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className={`w-full text-xs py-3.5 px-4 rounded-2xl transition-all duration-200 focus:outline-none font-mono text-left placeholder:text-neutral-400 placeholder:font-bold ${
                          darkMode 
                            ? "glowing-animated-border-dark text-white" 
                            : "glowing-animated-border-light text-neutral-900"
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Target URL field directly in Step 1 with robust classifications */}
                  {(() => {
                    const nameLower = pack.name.toLowerCase();
                    
                    // Keywords indicating Likes, Views, Comments, Reactions, Shares
                    const likesViewsKeywords = [
                      "like", "view", "comment", "share", "reaction", "reach", "save", "vote", "poll", "engagement", "retweet",
                      "لايك", "لايكات", "مشاهد", "مشاهدات", "تعليق", "تعليقات", "تفاعل", "تفاعلات", "اعجاب", "إعجاب", "مشاركة", "بوست", "منشور", "فيديو", "ريلز", "تصويت", "ريتويت"
                    ];
                    
                    // Keywords indicating followers/subscribers
                    const followersKeywords = [
                      "follower", "subscriber", "member", "join", "group", "page", "friend", "متابع", "متابعين", "مشترك", "مشتركين", "عضو", "أعضاء", "اصدقاء", "أصدقاء", "قروب", "جروب"
                    ];

                    const hasFollowersInName = followersKeywords.some(kw => nameLower.includes(kw));
                    const isLikesOrViews = !hasFollowersInName && likesViewsKeywords.some(kw => nameLower.includes(kw));

                    return (
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-neutral-350 dark:text-neutral-250 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-black text-white">
                            <Link2 className="w-4 h-4 text-pink-500" />
                            {isLikesOrViews ? (
                              <span>رابط المنشور أو الفيديو المستهدف</span>
                            ) : (
                              <span>رابط الحساب أو الصفحة المستهدفة</span>
                            )}
                          </span>
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full font-bold">عام (Public)</span>
                        </label>
                        <input
                          id="checkout-input-url"
                          type="text"
                          required
                          placeholder="ضع رابط حسابك أو الصفحة المستهدفة هنا..."
                          value={pageUrl}
                          onChange={(e) => setPageUrl(e.target.value)}
                          className={`w-full text-xs py-4 px-4 rounded-2xl transition-all duration-200 focus:outline-none ${
                            pageUrl ? "text-left font-mono font-bold" : "text-right font-extrabold"
                          } placeholder:text-right placeholder:text-pink-500/90 dark:placeholder:text-pink-400 placeholder:font-black placeholder:text-xs ${
                            darkMode 
                              ? "glowing-animated-border-dark text-white" 
                              : "glowing-animated-border-light text-neutral-900"
                          }`}
                          dir={pageUrl ? "ltr" : "rtl"}
                        />
                      </div>
                    );
                  })()}

                  {/* Coupon validation sub-section integrated beautifully */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    darkMode ? "bg-neutral-950/40 border-neutral-800" : "bg-neutral-50/50 border-neutral-200"
                  }`}>
                    <label className="block text-xs font-extrabold text-neutral-350 dark:text-neutral-250">هل تمتلك كود خصم (كوبون)؟</label>
                    <div className="flex gap-2">
                      <input
                        id="checkout-input-coupon"
                        type="text"
                        placeholder="أدخل كود الكوبون إن وجد"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className={`w-full text-xs py-3.5 px-4 rounded-2xl transition-all duration-200 focus:outline-none uppercase placeholder:text-neutral-400 placeholder:font-bold ${
                          darkMode 
                            ? "glowing-animated-border-dark text-white" 
                            : "glowing-animated-border-light text-neutral-900"
                        }`}
                      />
                      <button
                        id="checkout-coupon-btn"
                        type="button"
                        onClick={applyCoupon}
                        disabled={validatingCoupon}
                        className="px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-extrabold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {validatingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5 text-pink-500" />}
                        <span>تطبيق</span>
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-[11px] text-green-500 font-extrabold flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>كوبون ({appliedCoupon.code}) فعّال! تم تطبيق الخصم ({appliedCoupon.percent}%) فورياً.</span>
                      </p>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-red-400 font-bold">
                        ❌ {couponError}
                      </p>
                    )}
                  </div>

                  {/* Account Public status warning */}
                  <div className={`p-3.5 rounded-2xl border text-right relative overflow-hidden ${
                    darkMode ? "bg-amber-500/5 border-amber-500/10 text-neutral-300" : "bg-amber-50/50 border-amber-200 text-neutral-700"
                  }`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <p className="text-[11px] leading-relaxed font-semibold text-amber-500">
                      ⚠️ تنبيه هام: تأكد تماماً من أن الحساب عام (Public) وليس خاصاً (Private) لتجنب أي تعليق أو تأخير للخدمة.
                    </p>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-500/5 border border-red-500/15 text-red-400 rounded-xl text-[11px] font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleStep1Next}
                      disabled={!customerName.trim() || !whatsappNumber.trim() || !pageUrl.trim()}
                      className="px-6 py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-lg shadow-pink-500/15"
                    >
                      <span>الانتقال لطريقة الدفع</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT PATHS & CONFIRMATION */}
              {currentStep === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in text-right">
                  <div className="border-b border-neutral-800/10 pb-3">
                    <span className="text-xs font-black text-pink-500 bg-pink-500/5 px-3 py-1 rounded-full">الخطوة 2 من 2</span>
                    <h3 className="text-base font-black mt-2">اختيار طريقة السداد المناسبة وتفعيل الباقة</h3>
                    <p className="text-[11px] text-neutral-400 mt-1">يمكنك الدفع وتأكيد السداد فورياً عبر المتجر للحصول على أعلى أولوية تشغيل، أو الدفع والتنسيق مع الدعم الفني يدوياً.</p>
                  </div>

                  {/* Selected Package and Price Summary Banner */}
                  <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    darkMode ? "bg-pink-500/5 border-pink-500/15" : "bg-pink-50/70 border-pink-100 shadow-sm"
                  }`}>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block font-bold">الباقة التي تم اختيارها:</span>
                      <span className="text-xs sm:text-sm font-black text-neutral-800 dark:text-neutral-200">{pack.name} ({pack.platform})</span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[10px] text-neutral-400 block font-bold text-right">المبلغ المطلوب سداده:</span>
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-xl sm:text-2xl font-black text-pink-500">{getConvertedPrice(pack.price)}</span>
                        <span className="text-xs font-black text-neutral-400">{currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : '$'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentPath('store')}
                      className={`p-5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                        paymentPath === 'store'
                          ? "border-pink-500 bg-pink-500/5 text-pink-500 shadow-md"
                          : darkMode
                            ? "border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:bg-neutral-900"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {paymentPath === 'store' && <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500" />}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-pink-500" />
                          <span>💳 الدفع الفوري وتأكيد التحويل</span>
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentPath === 'store' ? "border-pink-500" : "border-neutral-500"}`}>
                          {paymentPath === 'store' && <div className="w-2 h-2 rounded-full bg-pink-500" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 leading-relaxed">
                        قم بالتحويل إلى فودافون كاش أو إنستا باي، وارفع صورة لقطة الشاشة وسنقوم بتفعيل الباقة فورياً.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentPath('whatsapp')}
                      className={`p-5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                        paymentPath === 'whatsapp'
                          ? "border-pink-500 bg-pink-500/5 text-pink-500 shadow-md"
                          : darkMode
                            ? "border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:bg-neutral-900"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {paymentPath === 'whatsapp' && <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500" />}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-green-500 fill-green-500/10" />
                          <span>💬 الدفع والتنسيق عبر الواتساب</span>
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentPath === 'whatsapp' ? "border-pink-500" : "border-neutral-500"}`}>
                          {paymentPath === 'whatsapp' && <div className="w-2 h-2 rounded-full bg-pink-500" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 leading-relaxed">
                        تسجيل طلب الباقة في النظام بشكل مبدئي، وتوجيهك فوراً لإرسال بيانات السداد للدعم الفني للتشغيل اليدوي.
                      </span>
                    </button>
                  </div>

                  {/* Sub-form for Direct payment receipt */}
                  {paymentPath === "store" && (
                    <div className="space-y-4 pt-4 border-t border-neutral-800/10 animate-fade-in">
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-neutral-350 dark:text-neutral-250">1. اختر جهة السداد التي قمت بالتحويل إليها:</label>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { id: 'vodafone', name: 'فودافون كاش (Vodafone)' },
                            { id: 'instapay', name: 'إنستا باي (Instapay Address)' }
                          ] as const).map((method) => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => { setSelectedMethod(method.id); setUploadError(""); }}
                              className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                selectedMethod === method.id
                                  ? "bg-pink-500/10 border-pink-500 text-pink-500 shadow-sm"
                                  : darkMode
                                    ? "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900"
                                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              <Wallet className="w-4 h-4 text-pink-500 shrink-0" />
                              <span>{method.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Targeted Phone or Instapay Address box */}
                      <div className={`p-4 sm:p-5 rounded-2xl border text-right flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                        darkMode ? "bg-neutral-950/60 border-neutral-850" : "bg-neutral-50 border-neutral-200"
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-400 font-extrabold block">عنوان أو رقم الحساب المستلم الخاص بـ Zawdha:</span>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-base sm:text-lg font-black text-pink-500 select-all tracking-wider">{getMethodPhoneNumber()}</span>
                            <span className="text-[9px] bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded-full font-bold">
                              {selectedMethod === 'instapay' ? 'Instapay Address' : 'محفظة كاش'}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">
                            قم بتحويل مبلغ وقدره <strong className="text-pink-500 font-mono font-black text-xs">{getConvertedPrice(pack.price)} {currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : '$'}</strong> بدقة إلى هذا العنوان.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(getMethodPhoneNumber())}
                          className="flex items-center justify-center gap-1.5 self-end sm:self-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer transition-all active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5 text-pink-500" />
                          <span>{copiedText ? "تم النسخ!" : "نسخ العنوان المالي"}</span>
                        </button>
                      </div>

                      {/* Inputs for sender number and amount */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-extrabold text-neutral-350 dark:text-neutral-250 text-right">رقم المحفظة / حسابك المحوِّل منه</label>
                          <input
                            type="tel"
                            required={paymentPath === "store"}
                            placeholder="مثال: 01101234567"
                            value={paymentSender}
                            onChange={(e) => setPaymentSender(e.target.value)}
                            className={`w-full text-xs py-3.5 px-4 rounded-2xl transition-all duration-200 focus:outline-none font-mono text-left placeholder:text-neutral-400 placeholder:font-bold ${
                              darkMode 
                                ? "glowing-animated-border-dark text-white" 
                                : "glowing-animated-border-light text-neutral-900"
                            }`}
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-extrabold text-neutral-350 dark:text-neutral-250 text-right">المبلغ الفعلي المحوَّل بالكامل</label>
                          <input
                            type="number"
                            required={paymentPath === "store"}
                            placeholder={`مثال: ${getConvertedPrice(pack.price)}`}
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className={`w-full text-xs py-3.5 px-4 rounded-2xl transition-all duration-200 focus:outline-none font-mono text-left placeholder:text-neutral-400 placeholder:font-bold ${
                              darkMode 
                                ? "glowing-animated-border-dark text-white" 
                                : "glowing-animated-border-light text-neutral-900"
                            }`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Receipt upload box */}
                      <div className="space-y-2.5">
                        <label className="block text-[11px] font-bold text-neutral-400 text-right">صورة أو لقطة شاشة إيصال التحويل الناجح (Screenshot)</label>
                        
                        {screenshotPreview ? (
                          <div className="relative border rounded-2xl overflow-hidden group border-pink-500/20 max-w-xs mx-auto shadow-lg">
                            <img
                              src={screenshotPreview}
                              alt="إيصال التحويل"
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const fileInput = document.getElementById("screenshot-upload-input-wizard");
                                  fileInput?.click();
                                }}
                                className="p-3 bg-neutral-900 rounded-xl text-white hover:text-pink-500 transition-colors cursor-pointer"
                                title="تغيير الصورة"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={removeImage}
                                className="p-3 bg-neutral-900 rounded-xl text-white hover:text-red-500 transition-colors cursor-pointer"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              const fileInput = document.getElementById("screenshot-upload-input-wizard");
                              fileInput?.click();
                            }}
                            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer hover:bg-neutral-800/10 transition-all flex flex-col items-center justify-center gap-3 ${
                              darkMode 
                                ? "border-neutral-800 hover:border-pink-500/40 bg-neutral-950/20" 
                                : "border-neutral-300 hover:border-pink-500/40 bg-neutral-50/50"
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/10">
                              <Upload className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-300 dark:text-neutral-200">انقر هنا لرفع أو إلقاء صورة الإيصال</p>
                              <p className="text-[10px] text-neutral-550 mt-1">امتدادات مدعومة: JPG, PNG, WEBP (حجم أقصى 10 ميجابايت)</p>
                            </div>
                          </div>
                        )}

                        <input
                          id="screenshot-upload-input-wizard"
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          onChange={handleImageChange}
                        />

                        {uploadError && (
                          <p className="text-[11px] text-red-400 text-right font-bold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{uploadError}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission and path information */}
                  {paymentPath === 'whatsapp' && (
                    <div className={`p-4 rounded-2xl border text-right text-xs flex items-start gap-3 ${
                      darkMode ? "bg-purple-950/15 border-purple-500/10 text-purple-450" : "bg-purple-50 border-purple-200 text-purple-850"
                    }`}>
                      <MessageCircle className="w-5 h-5 text-green-500 shrink-0 fill-green-500/5 animate-pulse" />
                      <p className="leading-relaxed">
                        <strong>💬 المتابعة وتأكيد السداد بالواتساب:</strong> عند تأكيد طلب الباقة، سيقوم النظام تلقائياً بتوليد رسالة مجهزة بالتفاصيل الفنية وتوجيهك فوراً لتطبيق الواتساب لمراسلة الدعم وتأكيد السداد بسرعة متناهية.
                      </p>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-450 rounded-2xl text-xs font-bold text-right flex items-center gap-2.5">
                      <AlertCircle className="w-4.5 h-4.5 text-red-550 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between gap-4 border-t border-neutral-850/10">
                    <button
                      type="button"
                      onClick={() => { setSubmitError(""); setCurrentStep(1); }}
                      className="px-5 py-3.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-300 text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      <ChevronRight className="w-4 h-4 text-pink-500" />
                      <span>رجوع للسابق</span>
                    </button>

                    <button
                      id="checkout-submit-btn"
                      type="submit"
                      disabled={submitting || !paymentPath}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] shadow-xl shadow-pink-600/10"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري تسجيل طلبك بنجاح...</span>
                        </>
                      ) : paymentPath === 'store' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تأكيد التحويل وإرسال طلب تفعيل الباقة</span>
                        </>
                      ) : paymentPath === 'whatsapp' ? (
                        <>
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>تأكيد الطلب وتوجيهي للواتساب فوراً</span>
                        </>
                      ) : (
                        <span>تأكيد وإرسال طلب الباقة</span>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>
        )}

    </div>
  );
}
