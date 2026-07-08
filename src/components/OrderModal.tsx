import React, { useState, useEffect } from "react";
import { X, MessageCircle, CreditCard, ShoppingCart, Tag, Check, RefreshCw, Upload, Trash2, AlertCircle, Copy, Wallet, ChevronRight } from "lucide-react";
import { Package } from "../types";

interface OrderModalProps {
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
  }) => Promise<{ success: boolean; message: string; error?: string }>;
  darkMode: boolean;
}

type PaymentPath = 'whatsapp' | 'store';
type StorePaymentMethod = 'vodafone' | 'orange' | 'etisalat' | 'we' | 'instapay';

export default function OrderModal({
  pack,
  currency,
  exchangeRates,
  onClose,
  onSubmitOrder,
  darkMode,
}: OrderModalProps) {
  // Order info states
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Payment Path state
  const [paymentPath, setPaymentPath] = useState<PaymentPath>('store'); // Default to direct checkout!
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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch settings for dynamic wallet/Instapay numbers
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

  // Convert prices dynamically
  const getConvertedPrice = (priceInEGP: number) => {
    let finalBase = priceInEGP;
    // Apply package-specific discount first if any
    if (pack.discount) {
      finalBase = finalBase * (1 - pack.discount / 100);
    }

    let multiplier = 1;
    if (currency === "SAR") multiplier = exchangeRates.SAR;
    if (currency === "USD") multiplier = exchangeRates.USD;

    let converted = finalBase * multiplier;

    // Apply coupon discount if any
    if (appliedCoupon) {
      converted = converted * (1 - appliedCoupon.percent / 100);
    }

    return Math.round(converted * 100) / 100;
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
        setAppliedCoupon({ code: data.code, percent: data.discountPercent });
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

  // Handle image upload and validate
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation (JPG, PNG, WEBP)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("الرجاء اختيار صورة صالحة فقط بصيغة (JPG, PNG, WEBP)");
      return;
    }

    // Size validation (Max 10MB)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError("حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت");
      return;
    }

    // Success - store file and preview
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
      case "orange":
        return storeSettings.orange_cash_number || "01124656914";
      case "etisalat":
        return storeSettings.etisalat_cash_number || "01124656914";
      case "we":
        return storeSettings.we_pay_number || "01124656914";
      case "instapay":
        return storeSettings.instapay_number || "01558676497";
      default:
        return "01124656914";
    }
  };

  const getMethodLabel = () => {
    switch (selectedMethod) {
      case "vodafone": return "فودافون كاش";
      case "orange": return "أورنج كاش";
      case "etisalat": return "اتصالات كاش";
      case "we": return "WE Pay";
      case "instapay": return "إنستا باي (Instapay)";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsappNumber.trim() || !pageUrl.trim()) {
      setSubmitError("الرجاء ملء جميع الحقول المطلوبة لإكمال الطلب");
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
      } else {
        setSubmitError(result.error || "فشل تسجيل طلبك، يرجى المحاولة لاحقاً");
      }
    } catch (err) {
      setSubmitError("حدث خطأ في الشبكة، يرجى إعادة المحاولة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className={`w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl relative my-8 animate-scale-up ${
        darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800/10 flex items-center justify-between bg-gradient-to-r from-purple-900/5 via-pink-900/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/10">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h2 className="text-base font-black">تفاصيل السداد وتأكيد الطلب</h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">ثوانٍ معدودة وينطلق تزويد حسابك!</p>
            </div>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-neutral-800/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {successMsg ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
              <Check className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-green-500">تم استلام طلبك بنجاح!</h3>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto whitespace-pre-line">
                {successMsg}
              </p>
            </div>

            {paymentPath === 'store' ? (
              <div className={`p-4 rounded-2xl border max-w-md mx-auto text-xs space-y-2 text-right ${
                darkMode ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-neutral-50 border-neutral-200 text-neutral-700"
              }`}>
                <span className="font-extrabold text-[#25d366] block">🛡️ عملية آمنة ومراجعة سريعة</span>
                <p className="leading-relaxed">
                  تم حفظ بيانات السداد وإيصال التحويل بنجاح في نظامنا. يقوم فريقنا الآن بمطابقة الحساب، وسيتم تفعيل الباقة فورياً بمجرد المراجعة (عادةً تستغرق من دقيقتين إلى نصف ساعة كحد أقصى).
                </p>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border max-w-md mx-auto text-xs text-right ${
                darkMode ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-neutral-50 border-neutral-200 text-neutral-700"
              }`}>
                <span className="font-extrabold text-[#25d366] block mb-1">💬 تواصل فوري عبر الواتساب</span>
                سيقوم أحد ممثلي زودها بالتواصل معك الآن على الرقم الذي أدخلته لتسهيل عملية الدفع وتفعيل طلبك.
              </div>
            )}

            <button
              id="modal-success-close"
              onClick={onClose}
              className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white font-black text-xs shadow-lg transition-all cursor-pointer"
            >
              موافق، إغلاق النافذة
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            
            {/* Package Summary */}
            <div className={`p-4 rounded-2xl border relative overflow-hidden flex flex-col gap-2 ${
              darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-neutral-50 border-neutral-200"
            }`}>
              <div className="absolute top-0 left-0 bg-pink-500 text-white text-[10px] px-3.5 py-1.5 font-bold rounded-br-xl uppercase">
                {pack.platform}
              </div>
              <h3 className="text-xs font-black text-right ml-16">{pack.name}</h3>
              <p className="text-[11px] text-neutral-400 text-right">
                الكمية المقررة: <span className="font-mono text-pink-500 font-bold">{pack.followersCount}</span> | وقت البدء المتوقع: <span className="text-neutral-200 font-medium">{pack.deliveryTime}</span>
              </p>
              
              {pack.gift && (
                <div className="text-[10px] font-extrabold text-amber-500 dark:text-amber-400 text-right flex items-center gap-1 mt-1">
                  <span>🎁 هدية إضافية لكل الباقات:</span>
                  <span className="underline decoration-amber-500/30">
                    {pack.gift === "Like" ? "لايكات Like إضافية مجانية ❤️" :
                     pack.gift === "Follow" ? "متابعين Follow إضافيين مجاناً 👤" :
                     pack.gift === "Both" ? "متابعين ولايكات مجاناً ✨" :
                     pack.gift}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between border-t border-neutral-800/10 pt-3 mt-1 text-xs">
                <span className="font-bold text-neutral-400">إجمالي المطلوب سداده:</span>
                <div className="flex items-baseline gap-1">
                  {pack.discount && (
                    <span className="text-[10px] text-neutral-500 line-through mr-2">
                      {(pack.price * (currency === "SAR" ? exchangeRates.SAR : currency === "USD" ? exchangeRates.USD : 1)).toFixed(1)} {currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : '$'}
                    </span>
                  )}
                  <span className="text-lg font-black text-pink-500 font-mono">
                    {getConvertedPrice(pack.price)}
                  </span>
                  <span className="font-bold text-neutral-400">{currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : '$'}</span>
                </div>
              </div>
            </div>

            {/* Step 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-r-2 border-pink-500 pr-2">1. معلومات الطلب الأساسية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1.5 text-right">الاسم بالكامل</label>
                  <input
                    id="checkout-input-name"
                    type="text"
                    required
                    placeholder="مثال: أحمد محمود"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition-all ${
                      darkMode ? "bg-neutral-900 border-neutral-800 text-white focus:border-pink-500" : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1.5 text-right">رقم الواتساب الفعال</label>
                  <input
                    id="checkout-input-phone"
                    type="tel"
                    required
                    placeholder="مثال: 01123456789"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition-all font-mono text-left`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1.5 text-right">رابط الحساب أو الصفحة المستهدفة للتزويد</label>
                <input
                  id="checkout-input-url"
                  type="url"
                  required
                  placeholder="https://www.instagram.com/username"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition-all font-mono text-left`}
                  dir="ltr"
                />
              </div>

              {/* Coupon Field */}
              <div className="flex gap-2">
                <input
                  id="checkout-input-coupon"
                  type="text"
                  placeholder="كوبون خصم إضافي؟ أدخله هنا"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none uppercase ${
                    darkMode ? "bg-neutral-900 border-neutral-800 text-white focus:border-pink-500" : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500"
                  }`}
                />
                <button
                  id="checkout-coupon-btn"
                  type="button"
                  onClick={applyCoupon}
                  disabled={validatingCoupon}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold transition-all shrink-0 flex items-center justify-center gap-1 cursor-pointer text-white"
                >
                  {validatingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5 text-pink-500" />}
                  <span>تطبيق</span>
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[11px] text-green-500 text-right font-bold">
                  ✓ تم تطبيق الكوبون {appliedCoupon.code} بنجاح! خصم إضافي {appliedCoupon.percent}%
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-red-400 text-right font-bold">
                  ❌ {couponError}
                </p>
              )}
            </div>

            {/* Step 2: Payment Selector Path */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-r-2 border-pink-500 pr-2">2. تحديد طريقة تأكيد الدفع</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentPath('store')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1.5 ${
                    paymentPath === 'store'
                      ? "border-pink-500 bg-pink-500/5 text-pink-500"
                      : darkMode
                        ? "border-neutral-800 bg-neutral-900/10 text-neutral-400 hover:bg-neutral-900/30"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black">💳 الدفع عبر المتجر</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentPath === 'store' ? "border-pink-500" : "border-neutral-500"}`}>
                      {paymentPath === 'store' && <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 leading-relaxed">
                    تحويل فوري إلى إحدى محافظ الكاش أو إنستا باي برفع إيصال السداد لتفعيل فوري وآمن.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentPath('whatsapp')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1.5 ${
                    paymentPath === 'whatsapp'
                      ? "border-pink-500 bg-pink-500/5 text-pink-500"
                      : darkMode
                        ? "border-neutral-800 bg-neutral-900/10 text-neutral-400 hover:bg-neutral-900/30"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black">💬 تواصل عبر الواتساب</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentPath === 'whatsapp' ? "border-pink-500" : "border-neutral-500"}`}>
                      {paymentPath === 'whatsapp' && <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 leading-relaxed">
                    تسجيل الطلب الآن وسيتواصل معك الدعم الفني فوراً لإرسال بيانات السداد وتأكيد التفعيل يدوياً.
                  </span>
                </button>
              </div>
            </div>

            {/* Direct checkout extra form */}
            {paymentPath === "store" && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-r-2 border-pink-500 pr-2">3. سداد الفاتورة وإثبات التحويل</h3>
                
                {/* Method selector buttons */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-neutral-400 text-right">اختر وسيلة الدفع التي ستقوم بالتحويل إليها:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {([
                      { id: 'vodafone', name: 'فودافون كاش' },
                      { id: 'orange', name: 'أورنج كاش' },
                      { id: 'etisalat', name: 'اتصالات كاش' },
                      { id: 'we', name: 'WE Pay' },
                      { id: 'instapay', name: 'إنستا باي' }
                    ] as const).map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => { setSelectedMethod(method.id); setUploadError(""); }}
                        className={`p-2.5 rounded-xl border text-center font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          selectedMethod === method.id
                            ? "bg-pink-500/10 border-pink-500 text-pink-500"
                            : darkMode
                              ? "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                              : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5 text-pink-500" />
                        <span>{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number card */}
                <div className={`p-4 rounded-2xl border text-right flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  darkMode ? "bg-neutral-900/50 border-neutral-800" : "bg-neutral-50 border-neutral-200"
                }`}>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-extrabold block">الرقم المستهدف لإرسال التحويل المالي:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-pink-500 select-all tracking-wider">{getMethodPhoneNumber()}</span>
                      <span className="text-[10px] bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded-full font-bold">{selectedMethod === 'instapay' ? 'Instapay العنوان' : 'رقم كاش'}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">
                      قم بالتحويل أولاً إلى هذا الرقم بقيمة <span className="font-mono text-pink-500 font-bold">{getConvertedPrice(pack.price)} {currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : '$'}</span> ثم املأ البيانات بالأسفل.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(getMethodPhoneNumber())}
                    className="flex items-center justify-center gap-1.5 self-end sm:self-auto px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[10px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-pink-500" />
                    <span>{copiedText ? "تم النسخ!" : "نسخ العنوان"}</span>
                  </button>
                </div>

                {/* Direct payment confirmation form inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1.5 text-right">رقم الهاتف الذي قمت بالتحويل منه</label>
                    <input
                      type="tel"
                      required={paymentPath === "store"}
                      placeholder="مثال: 01100000000"
                      value={paymentSender}
                      onChange={(e) => setPaymentSender(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border focus:outline-none transition-all font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1.5 text-right">المبلغ الفعلي الذي قمت بتحويله</label>
                    <input
                      type="number"
                      required={paymentPath === "store"}
                      placeholder={`مثال: ${getConvertedPrice(pack.price)}`}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border focus:outline-none transition-all font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* File Upload screenshot input */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-neutral-400 text-right">صورة إيصال التحويل (screenshot)</label>
                  
                  {screenshotPreview ? (
                    <div className="relative border rounded-2xl overflow-hidden group border-pink-500/20 max-w-xs mx-auto">
                      <img
                        src={screenshotPreview}
                        alt="إيصال التحويل"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const fileInput = document.getElementById("screenshot-upload-input");
                            fileInput?.click();
                          }}
                          className="p-2 bg-neutral-900 rounded-xl text-white hover:text-pink-500 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="p-2 bg-neutral-900 rounded-xl text-white hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        const fileInput = document.getElementById("screenshot-upload-input");
                        fileInput?.click();
                      }}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-neutral-800/10 transition-all flex flex-col items-center justify-center gap-2 ${
                        darkMode ? "border-neutral-800 hover:border-pink-500/50" : "border-neutral-300 hover:border-pink-500/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-300">انقر هنا أو اسحب صورة إيصال التحويل لرفعها</p>
                        <p className="text-[10px] text-neutral-500 mt-1">صيغ مقبولة: JPG, PNG, WEBP (بحد أقصى 10 ميجابايت)</p>
                      </div>
                    </div>
                  )}

                  <input
                    id="screenshot-upload-input"
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

            {/* General submit errors */}
            {submitError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-right flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Note about WhatsApp contact / verification */}
            {paymentPath === 'whatsapp' && (
              <div className={`p-4 rounded-2xl border text-right text-xs flex items-start gap-3 ${
                darkMode ? "bg-purple-950/10 border-purple-500/10 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-800"
              }`}>
                <MessageCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="leading-relaxed">
                  <strong>💬 تواصل بالواتساب للتفعيل:</strong> بمجرد نقرك على "تأكيد وإرسال الطلب"، سيقوم فريقنا فورياً بإرسال تفاصيل الدفع عبر الواتساب لتأكيد الدفع يدوياً وتفعيل الخدمة.
                </p>
              </div>
            )}

            {/* Action submit button */}
            <button
              id="checkout-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 active:scale-[0.98] text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الطلب وإرفاق المستندات...</span>
                </>
              ) : paymentPath === 'store' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تأكيد عملية الدفع وإرسال الطلب</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>تأكيد الطلب والمتابعة عبر الواتساب</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
