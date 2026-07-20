import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Clock, Sparkles, X, CheckCircle, AlertCircle, RefreshCw, User, Link2, MessageCircle } from "lucide-react";

interface DailyGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  whatsappNumber?: string;
}

export default function DailyGiftModal({ isOpen, onClose, darkMode, whatsappNumber = "01124656914" }: DailyGiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [status, setStatus] = useState<{
    canClaim: boolean;
    timeLeftSeconds: number;
    giftConfig?: {
      type: string;
      qty: number;
      platform: string;
      active: boolean;
    };
  } | null>(null);

  const [targetAccount, setTargetAccount] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [claimedGift, setClaimedGift] = useState<{
    type: string;
    qty: number;
    platform: string;
    account: string;
  } | null>(null);

  const getGiftWhatsAppLink = (giftType: string, giftQty: number, giftPlatform: string, account: string) => {
    const giftFormatted = giftType === "Like" ? "لايكات Like إضافية مجانية ❤️" :
                          giftType === "Follow" ? "متابعين Follow إضافيين مجاناً 👤" :
                          giftType === "Both" ? "متابعين ولايكات مجاناً ✨" :
                          giftType;

    const messageText = 
      `🎁 *طلب استلام الهدية اليومية المجانية* 🎁\n\n` +
      `أهلاً بك يا فريق *Zawdha*، لقد قمت بطلب استلام الهدية المجانية اليومية بنجاح! 🎉\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *تفاصيل الهدية المطلوبة:*\n` +
      `• *نوع الهدية:* ${giftQty} ${giftFormatted}\n` +
      `• *المنصة:* ${giftPlatform}\n` +
      `• *الحساب / الرابط المستهدف:* ${account}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `⏳ *الحالة الحالية:*\n` +
      `• تم تقديم الطلب بنجاح في النظام وجاري تفعيله وتزويد الهدية مجاناً خلال دقائق معدودة.\n\n` +
      `شكراً جزيلاً لمتجر *Zawdha* الرائع! يسعدني دائماً التعامل معكم والاستفادة من عروضكم الممتازة. 🚀`;

    const encodedText = encodeURIComponent(messageText);
    const cleanPhone = whatsappNumber.trim();
    const targetPhone = cleanPhone.startsWith("0") && cleanPhone.length === 11 ? "2" + cleanPhone : cleanPhone;
    return `https://wa.me/${targetPhone}?text=${encodedText}`;
  };

  // Fetch gift status
  const fetchStatus = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/daily-gift/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setSecondsLeft(data.timeLeftSeconds);
      } else {
        setErrorMsg("فشل تحميل معلومات الهدية اليومية.");
      }
    } catch (err) {
      setErrorMsg("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setSuccessMsg("");
      setTargetAccount("");
      setClaimedGift(null);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Refresh status when timer finishes
          fetchStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Formatter for countdown
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  // Claim Gift
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount.trim()) {
      setErrorMsg("يرجى إدخال رابط الحساب أو اسم المستخدم");
      return;
    }

    setClaimLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/daily-gift/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAccount: targetAccount.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        if (status?.giftConfig) {
          const currentClaimed = {
            type: status.giftConfig.type,
            qty: status.giftConfig.qty,
            platform: status.giftConfig.platform,
            account: targetAccount.trim()
          };
          setClaimedGift(currentClaimed);

          // Auto-redirect to WhatsApp
          try {
            const waLink = getGiftWhatsAppLink(
              currentClaimed.type,
              currentClaimed.qty,
              currentClaimed.platform,
              currentClaimed.account
            );
            setTimeout(() => {
              window.location.href = waLink;
            }, 800);
          } catch (err) {
            console.error("Auto-redirect failed:", err);
          }
        }
        // Refresh status to initiate countdown
        fetchStatus();
      } else {
        setErrorMsg(data.error || "حدث خطأ أثناء طلب الهدية.");
        if (data.timeLeftSeconds !== undefined) {
          setSecondsLeft(data.timeLeftSeconds);
        }
      }
    } catch (err) {
      setErrorMsg("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setClaimLoading(false);
    }
  };

  const timeFormatted = formatTime(secondsLeft);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl text-right ${
            darkMode ? "bg-neutral-900 border-purple-500/30 text-white" : "bg-white border-pink-500/20 text-neutral-900"
          }`}
        >
          {/* Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 left-4 p-2 rounded-full transition-all cursor-pointer ${
              darkMode ? "hover:bg-neutral-800 text-neutral-400 hover:text-white" : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-600/10 to-pink-600/10 border border-pink-500/20 text-pink-500 animate-bounce">
                <Gift className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                الهدية اليومية المجانية 🎁
              </h2>
              <p className={`text-xs max-w-sm leading-relaxed ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                تقديرًا لعملائنا الكرام، نقدم لكم هدية مجانية يومية بدون أي رسوم لزيادة تفاعل حساباتكم! قم بزيارتنا كل 24 ساعة واستلم هديتك.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
                <span className="text-xs text-neutral-400">جاري التحقق من حالة الهدية اليومية...</span>
              </div>
            ) : claimedGift ? (
              <div className="space-y-6">
                {/* Beautiful Receipt Card */}
                <div className={`p-5 rounded-3xl border text-right space-y-4 relative overflow-hidden ${
                  darkMode ? "bg-neutral-950 border-purple-500/20 text-neutral-300" : "bg-neutral-50 border-pink-500/15 text-neutral-700"
                }`}>
                  <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-purple-600 via-pink-600 to-orange-500" />
                  <div className="flex items-center justify-between border-b border-neutral-800/10 pb-2.5">
                    <span className="font-extrabold text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <span>🎁 إيصال استلام الهدية اليومية</span>
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-green-500/10 text-green-500 rounded-md font-black animate-pulse">جاري التفعيل يدوياً</span>
                  </div>
                  
                  <div className="space-y-3.5 text-xs font-medium">
                    <div>
                      <span className="text-neutral-400 block text-[10px] mb-0.5">الهدية المستلمة:</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-black text-base">
                        {claimedGift.qty} {
                          claimedGift.type === "Like" ? "لايكات Like إضافية مجانية ❤️" :
                          claimedGift.type === "Follow" ? "متابعين Follow إضافيين مجاناً 👤" :
                          claimedGift.type === "Both" ? "متابعين ولايكات مجاناً ✨" :
                          claimedGift.type
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] mb-0.5">المنصة المستهدفة:</span>
                      <span className="text-neutral-200 font-extrabold px-2.5 py-0.5 rounded-full bg-neutral-800/60 border border-neutral-700/50 text-[10px] inline-block">{claimedGift.platform}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/50 text-neutral-300 font-mono text-[11px] break-all text-left">
                      <span className="text-neutral-400 block text-[10px] font-sans mb-1 text-right">الرابط أو الحساب المزود:</span>
                      {claimedGift.account}
                    </div>
                  </div>
                </div>

                {/* Glowing Redirect CTA */}
                <div className="space-y-4 max-w-sm mx-auto text-center pt-2">
                  <a
                    href={getGiftWhatsAppLink(claimedGift.type, claimedGift.qty, claimedGift.platform, claimedGift.account)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-2xl bg-[#22c55e] hover:bg-[#1eb052] text-white font-extrabold text-xs shadow-lg shadow-green-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 animate-bounce"
                  >
                    <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                    <span>تأكيد استلام الهدية عبر واتساب</span>
                  </a>
                  <span className="text-[10px] text-neutral-400 block animate-pulse">
                    ⚡ جاري تحويلك تلقائياً للواتساب لتأكيد وتسجيل هديتك...
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl font-black text-xs transition-all border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer text-center"
                >
                  إغلاق النافذة
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-4 rounded-2xl border bg-red-500/10 border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <div className="p-4 rounded-2xl border bg-green-500/10 border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {status?.giftConfig && (
                  <>
                    {!status.giftConfig.active ? (
                      <div className="space-y-4">
                        <div className={`p-6 rounded-2xl border text-center space-y-4 ${
                          darkMode ? "bg-neutral-950 border-amber-500/20 text-neutral-300" : "bg-neutral-50 border-amber-500/10 text-neutral-700"
                        }`}>
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                            <span className="font-extrabold text-sm text-amber-500">قسم الهدايا غير متاح الآن!</span>
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto font-bold">
                            عذراً، لقد تم إيقاف قسم الهدايا اليومية المجانية مؤقتاً. سنقوم بإعادة تفعيله وإتاحته للجميع قريباً جداً!
                          </p>
                        </div>

                        <button
                          onClick={onClose}
                          className="w-full py-3.5 rounded-2xl font-black text-xs transition-all border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer text-center"
                        >
                          إغلاق النافذة
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Gift Info Card */}
                        <div className={`p-5 rounded-2xl border text-center space-y-2 relative overflow-hidden ${
                          darkMode ? "bg-neutral-950 border-purple-500/20" : "bg-pink-50/50 border-pink-500/10"
                        }`}>
                          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-pink-500/5 blur-xl pointer-events-none" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-pink-500">هدية اليوم الحالية</span>
                          <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                            {status.giftConfig.qty} {status.giftConfig.type} مجاناً!
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center justify-center gap-1.5 font-bold">
                            <span>منصة التشغيل:</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-[10px] text-pink-400 border border-pink-500/15">
                              {status.giftConfig.platform}
                            </span>
                          </div>
                        </div>

                    {/* Claimed Countdown state */}
                    {!status.canClaim ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                          darkMode ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50 border-neutral-200"
                        }`}>
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-500">
                            <Clock className="w-4 h-4 animate-pulse" />
                            <span>عذراً، لقد استلمت الهدية المجانية بالفعل!</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                            يرجى الانتظار حتى انتهاء مقتضى وقت الانتظار أدناه لتتمكن من استلام الهدية مرة أخرى بنجاح.
                          </p>

                          {/* Countdown clock visual */}
                          <div className="pt-2">
                            <span className="text-[10px] text-neutral-400 block mb-2 font-bold">يمكنك استلام هديتك التالية بعد:</span>
                            <div className="flex items-center justify-center gap-3 dir-ltr">
                              <div className="flex flex-col items-center">
                                <div className={`w-12 py-2 rounded-xl text-lg font-black font-mono shadow-md ${
                                  darkMode ? "bg-neutral-900 text-pink-400" : "bg-white text-pink-600 border border-neutral-200"
                                }`}>
                                  {timeFormatted.seconds}
                                </div>
                                <span className="text-[9px] text-neutral-400 mt-1">ثانية</span>
                              </div>
                              <span className="text-lg font-black text-pink-500">:</span>
                              <div className="flex flex-col items-center">
                                <div className={`w-12 py-2 rounded-xl text-lg font-black font-mono shadow-md ${
                                  darkMode ? "bg-neutral-900 text-pink-400" : "bg-white text-pink-600 border border-neutral-200"
                                }`}>
                                  {timeFormatted.minutes}
                                </div>
                                <span className="text-[9px] text-neutral-400 mt-1">دقيقة</span>
                              </div>
                              <span className="text-lg font-black text-pink-500">:</span>
                              <div className="flex flex-col items-center">
                                <div className={`w-12 py-2 rounded-xl text-lg font-black font-mono shadow-md ${
                                  darkMode ? "bg-neutral-900 text-pink-400" : "bg-white text-pink-600 border border-neutral-200"
                                }`}>
                                  {timeFormatted.hours}
                                </div>
                                <span className="text-[9px] text-neutral-400 mt-1">ساعة</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={onClose}
                          className="w-full py-3.5 rounded-2xl font-black text-xs transition-all border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer text-center"
                        >
                          حسناً، سأعود لاحقاً
                        </button>
                      </div>
                    ) : (
                      /* Form to Claim */
                      <form onSubmit={handleClaim} className="space-y-4">
                        <div className="space-y-3">
                          {status?.giftConfig && (() => {
                            const giftTypeLower = (status.giftConfig.type || "").toLowerCase();
                            const isLikesOrViews = giftTypeLower.includes("like") || giftTypeLower.includes("view") || giftTypeLower.includes("لايك") || giftTypeLower.includes("مشاهد");
                            
                            return (
                              <>
                                <label className="block text-xs font-black text-neutral-400 text-right flex items-center justify-between">
                                  {isLikesOrViews ? (
                                    <span className="text-pink-500 font-extrabold flex items-center gap-1">
                                      <span>🔗 رابط الصورة، الفيديو أو البوست المستهدف:</span>
                                    </span>
                                  ) : (
                                    <span className="text-blue-400 font-extrabold flex items-center gap-1">
                                      <span>👤 رابط حسابك أو اسم المستخدم على {status.giftConfig.platform}:</span>
                                    </span>
                                  )}
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-500 font-extrabold">مطلوب للهدية</span>
                                </label>

                                <div className="relative">
                                  <input
                                    type="text"
                                    required
                                    placeholder={
                                      isLikesOrViews
                                        ? `الصق رابط البوست/الصورة/الفيديو من ${status.giftConfig.platform} هنا...`
                                        : `مثال: رابط حسابك أو اسم المستخدم الخاص بك...`
                                    }
                                    value={targetAccount}
                                    onChange={(e) => setTargetAccount(e.target.value)}
                                    className={`w-full text-xs p-4 pr-11 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-pink-500/45 text-right font-medium transition-all ${
                                      darkMode 
                                        ? "bg-neutral-950 border-purple-500/25 text-white focus:border-pink-500" 
                                        : "bg-white border-pink-500/20 text-neutral-900 focus:border-pink-500"
                                    }`}
                                  />
                                  <Link2 className="w-4 h-4 text-neutral-400 absolute top-4 right-4" />
                                </div>

                                {/* Dynamic alert box inside the gift modal */}
                                {isLikesOrViews ? (
                                  <div className={`p-4 rounded-2xl border text-right relative overflow-hidden ${
                                    darkMode ? "bg-pink-500/5 border-pink-500/20" : "bg-pink-50/50 border-pink-200"
                                  }`}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />
                                    <div className="text-[11px] text-neutral-400 leading-relaxed font-semibold">
                                      ⚠️ <strong className="text-pink-500">ملاحظة هامة جداً:</strong> تأكد من وضع رابط <strong className="text-neutral-200 underline decoration-pink-500">منشور أو بوست معين</strong> وليس رابط الحساب العام، لكي نتمكن من إرسال اللايكات أو التفاعل إليه بنجاح وتلقائياً!
                                    </div>
                                  </div>
                                ) : (
                                  <div className={`p-4 rounded-2xl border text-right relative overflow-hidden ${
                                    darkMode ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50/50 border-blue-200"
                                  }`}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                    <div className="text-[11px] text-neutral-400 leading-relaxed font-semibold">
                                      🔒 <strong className="text-blue-400">شرط أساسي وجوهري:</strong> تأكد تماماً أن حسابك <strong className="text-white underline decoration-blue-400">عام وليس خاص (Public)</strong> لتصلك هدية المتابعين المجانية فوراً وتفادي الإلغاء التلقائي للطلب.
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        <button
                          type="submit"
                          disabled={claimLoading}
                          className="w-full py-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-pink-500/10"
                        >
                          {claimLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          <span>استلام الهدية المجانية فوراً</span>
                        </button>
                      </form>
                    )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
