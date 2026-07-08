import React, { useState } from "react";
import { Star, MessageSquarePlus, MessageSquare, Check } from "lucide-react";
import { Review } from "../types";

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'isApproved' | 'createdAt'>) => Promise<boolean>;
  darkMode: boolean;
}

export default function ReviewSection({ reviews, onAddReview, darkMode }: ReviewSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError("الرجاء كتابة الاسم ونص التقييم أولاً");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const ok = await onAddReview({
        customerName: name,
        rating,
        content,
      });

      if (ok) {
        setSuccess(true);
        setName("");
        setContent("");
        setRating(5);
        setTimeout(() => {
          setSuccess(false);
          setFormOpen(false);
        }, 3000);
      } else {
        setError("حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً");
      }
    } catch (err) {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews-section" className={`py-16 transition-colors duration-300 ${
      darkMode ? "bg-neutral-950" : "bg-white"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full">
              تقييمات عملائنا الكرام
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black mt-3 ${darkMode ? "text-white" : "text-neutral-900"}`}>
              آراء وتقييمات حقيقية من عملائنا في مصر والوطن العربي
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              نصنع النجاح سوياً مع شركائنا في قطاع الأعمال وصنّاع المحتوى. ثقة حقيقية بلا تضخيم.
            </p>
          </div>

          <button
            id="btn-open-review-form"
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-pink-500/10 text-sm shrink-0 transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>أضف تقييمك للموقع</span>
          </button>
        </div>

        {/* Expandable Review Form */}
        {formOpen && (
          <div className={`p-6 rounded-2xl border mb-12 animate-slide-down max-w-xl mx-auto ${
            darkMode ? "bg-neutral-900/50 border-neutral-800" : "bg-neutral-50 border-neutral-200 shadow-sm"
          }`}>
            <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-neutral-900"}`}>
              <MessageSquare className="w-5 h-5 text-pink-500" />
              يسعدنا سماع رأيك الثمين في خدماتنا!
            </h3>

            {success ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-center flex flex-col items-center justify-center gap-2 py-8">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold">تم إرسال تقييمك ونشره بنجاح!</p>
                <p className="text-xs text-neutral-400">نشكرك على مشاركة تجربتك معنا.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-right">
                    ⚠️ {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">اسمك الكريم أو اسم مشروعك</label>
                  <input
                    id="review-input-name"
                    type="text"
                    required
                    maxLength={50}
                    placeholder="مثال: أحمد علي (مسوق إلكتروني)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                      darkMode 
                        ? "bg-neutral-950 border-neutral-800 text-white focus:border-pink-500" 
                        : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">تقييمك بالنجوم</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        id={`review-star-btn-${star}`}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform active:scale-90 hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${
                          star <= rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">ملاحظاتك وتقييمك الصادق للخدمة</label>
                  <textarea
                    id="review-input-content"
                    required
                    rows={3}
                    maxLength={250}
                    placeholder="اكتب تفاصيل تجربتك هنا... السرعة، جودة المتابعين، دعم العملاء"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full text-sm p-3 rounded-xl border focus:outline-none transition-all resize-none ${
                      darkMode 
                        ? "bg-neutral-950 border-neutral-800 text-white focus:border-pink-500" 
                        : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500"
                    }`}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    id="review-btn-cancel"
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      darkMode ? "border-neutral-800 hover:bg-neutral-800 text-neutral-400" : "border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    إلغاء
                  </button>
                  <button
                    id="review-btn-submit"
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? "جاري الإرسال..." : "نشر التقييم فوراً"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews Horizontal scroll / Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-500 text-sm">
              لا توجد تقييمات منشورة بعد. كن أول من يكتب تقييماً!
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                  darkMode 
                    ? "bg-neutral-900/40 border-neutral-900 hover:border-neutral-800 text-white" 
                    : "bg-neutral-50 border-neutral-100 hover:border-neutral-200 text-neutral-900 shadow-sm"
                }`}
              >
                {/* Review Body */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-300 font-medium">
                    "{rev.content}"
                  </p>
                </div>

                {/* Customer Details */}
                <div className="mt-5 pt-4 border-t border-neutral-800/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">{rev.customerName}</span>
                  <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
                    ✓ عميل موثق
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
