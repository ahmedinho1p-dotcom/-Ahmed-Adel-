import React, { useState, useEffect } from "react";
import { X, MessageCircle, CreditCard, ShoppingCart, Tag, Check, RefreshCw } from "lucide-react";
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
  }) => Promise<{ success: boolean; message: string; error?: string }>;
  darkMode: boolean;
}

export default function OrderModal({
  pack,
  currency,
  exchangeRates,
  onClose,
  onSubmitOrder,
  darkMode,
}: OrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");
  
  // Coupon Validation states
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const getCurrencyLabel = () => {
    if (currency === "EGP") return "جنيهاً مصرياً";
    if (currency === "SAR") return "ريالاً سعودياً";
    return "دولار أمريكي";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsappNumber.trim() || !pageUrl.trim()) {
      setSubmitError("الرجاء ملء جميع الحقول المطلوبة لإكمال الطلب");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const result = await onSubmitOrder({
        customerName,
        whatsappNumber,
        pageUrl,
        packageId: pack.id,
        couponCode: appliedCoupon?.code || undefined,
      });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl relative animate-scale-up ${
        darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
      }`}>
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800/20 flex items-center justify-between bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-right">مراجعة وتأكيد طلبك</h2>
              <p className="text-[10px] text-neutral-400 text-right mt-0.5">خطوة واحدة ويكون طلبك جاهز للتنفيذ!</p>
            </div>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800/20 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {successMsg ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
              <Check className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-green-500">تم تسجيل طلبك بنجاح باهر!</h3>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-sm mx-auto">
                {successMsg}
              </p>
            </div>
            <div className={`p-4 rounded-xl border max-w-sm mx-auto text-xs ${
              darkMode ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-neutral-50 border-neutral-200 text-neutral-700"
            }`}>
              <span className="font-extrabold text-[#25d366] block mb-1">💬 ما الخطوة القادمة؟</span>
              سيقوم أحد ممثلي زودها بالتواصل معك الآن على رقم الواتساب الذي أدخلته لتأكيد التفعيل وطرق السداد المتاحة.
            </div>
            <button
              id="modal-success-close"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              حسناً، فهمت
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
            
            {/* Package Summary Box */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2 relative overflow-hidden ${
              darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-neutral-50 border-neutral-200"
            }`}>
              <div className="absolute top-0 left-0 bg-pink-500 text-white text-[10px] px-3 py-1 font-bold rounded-br-lg">
                {pack.platform}
              </div>
              <h3 className="text-sm font-bold text-right ml-12">{pack.name}</h3>
              <p className="text-xs text-neutral-400 text-right">الكمية المقررة: <span className="font-mono text-pink-500 font-bold">{pack.followersCount}</span> | وقت التسليم المتوقع: <span className="text-neutral-200 font-medium">{pack.deliveryTime}</span></p>
              
              <div className="flex items-center justify-between border-t border-neutral-800/10 pt-3 mt-1">
                <span className="text-xs font-bold text-neutral-400">إجمالي السعر:</span>
                <div className="flex items-baseline gap-1.5">
                  {pack.discount && (
                    <span className="text-xs text-neutral-500 line-through">
                      {(pack.price * (currency === "SAR" ? exchangeRates.SAR : currency === "USD" ? exchangeRates.USD : 1)).toFixed(1)} {currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : '$'}
                    </span>
                  )}
                  <span className="text-lg font-black text-pink-500 font-mono">
                    {getConvertedPrice(pack.price)}
                  </span>
                  <span className="text-xs font-bold text-neutral-400">{currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : '$'}</span>
                </div>
              </div>
            </div>

            {/* Error alerts */}
            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-right">
                ⚠️ {submitError}
              </div>
            )}

            {/* Input fields */}
            <div className="space-y-3.5">
              
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">الاسم بالكامل (أو اسم الشهرة)</label>
                <input
                  id="checkout-input-name"
                  type="text"
                  required
                  placeholder="مثال: أحمد مصطفى"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                    darkMode 
                      ? "bg-neutral-900 border-neutral-800 text-white focus:border-pink-500" 
                      : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500"
                  }`}
                />
              </div>

              {/* WhatsApp Phone Number */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">رقم الواتساب الفعال (للتواصل معك ومتابعة طلبك)</label>
                <input
                  id="checkout-input-phone"
                  type="tel"
                  required
                  placeholder="مثال: 01558676497"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className={`w-full text-sm p-3 rounded-xl border focus:outline-none text-left transition-all ${
                    darkMode 
                      ? "bg-neutral-900 border-neutral-800 text-white focus:border-pink-500 font-mono" 
                      : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500 font-mono"
                  }`}
                  dir="ltr"
                />
              </div>

              {/* Page/Profile URL Link */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">رابط الحساب أو الصفحة المستهدفة للتزويد</label>
                <input
                  id="checkout-input-url"
                  type="url"
                  required
                  placeholder="مثال: https://www.instagram.com/yourpage"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className={`w-full text-sm p-3 rounded-xl border focus:outline-none text-left transition-all ${
                    darkMode 
                      ? "bg-neutral-900 border-neutral-800 text-white focus:border-pink-500 font-mono" 
                      : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500 font-mono"
                  }`}
                  dir="ltr"
                />
              </div>

              {/* Coupon Field */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">هل لديك كوبون خصم؟</label>
                <div className="flex gap-2">
                  <input
                    id="checkout-input-coupon"
                    type="text"
                    placeholder="رمز الكوبون (مثال: ZWDHA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`w-full text-sm p-2.5 rounded-xl border focus:outline-none transition-all ${
                      darkMode 
                        ? "bg-neutral-900 border-neutral-800 text-white focus:border-pink-500 uppercase" 
                        : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500 uppercase"
                    }`}
                  />
                  <button
                    id="checkout-coupon-btn"
                    type="button"
                    onClick={applyCoupon}
                    disabled={validatingCoupon}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 text-neutral-200 cursor-pointer"
                  >
                    {validatingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5 text-pink-500" />}
                    <span>تطبيق</span>
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-500 text-right mt-1.5 font-bold flex items-center gap-1">
                    ✓ تم تطبيق كود الخصم {appliedCoupon.code} بنجاح! خصم إضافي بقيمة {appliedCoupon.percent}%
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-400 text-right mt-1.5 font-bold">
                    ❌ {couponError}
                  </p>
                )}
              </div>

            </div>

            {/* Note about WhatsApp contact */}
            <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
              darkMode ? "bg-purple-950/10 border-purple-500/10 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-800"
            }`}>
              <MessageCircle className="w-5 h-5 text-green-500 shrink-0" />
              <p>
                <strong>تنبيه الدفع:</strong> بمجرد نقرك على "تأكيد وإرسال الطلب"، سيقوم فريقنا فورياً بإرسال تفاصيل الدفع (Vodafone Cash، Instapay، أو حوالة بنكية) عبر الواتساب لتفعيل الخدمة.
              </p>
            </div>

            {/* Confirm Submission Button */}
            <button
              id="checkout-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl shadow-purple-900/10 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل طلبك وتوليد الفاتورة...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>تأكيد وإرسال الطلب ومتابعة واتساب</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
