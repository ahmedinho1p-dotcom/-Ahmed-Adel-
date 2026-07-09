import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Clock, Sparkles, X, CheckCircle, AlertCircle, RefreshCw, User, Link2 } from "lucide-react";

interface DailyGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function DailyGiftModal({ isOpen, onClose, darkMode }: DailyGiftModalProps) {
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
                            <span>عذراً، لقد استلمت هديتك اليومية من هذا الجهاز بالفعل!</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                            قوانين المنصة تمنح هدية واحدة فقط لكل جهاز كل 24 ساعة لضمان وصول الهدايا للجميع بالتساوي.
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
                        <div className="space-y-2">
                          <label className="block text-xs font-black text-neutral-400 text-right">
                            رابط حسابك على {status.giftConfig.platform} أو اسم المستخدم:
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="مثال: https://instagram.com/username أو @username"
                              value={targetAccount}
                              onChange={(e) => setTargetAccount(e.target.value)}
                              className={`w-full text-xs p-4 pr-11 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-pink-500/45 text-right ${
                                darkMode ? "bg-neutral-950 border-purple-500/25 text-white" : "bg-white border-pink-500/20 text-neutral-900"
                              }`}
                            />
                            <User className="w-4 h-4 text-neutral-400 absolute top-4 right-4" />
                          </div>
                          <span className="text-[10px] text-neutral-400 leading-relaxed block text-right">
                            ⚠️ تأكد من أن حسابك **عام وليس خاص (Public)** حتى يتم تنفيذ الهدية بنجاح وتفادي الإلغاء.
                          </span >
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
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
