import { useEffect, useState } from "react";
import { ShoppingBag, Star, Users } from "lucide-react";

interface StatsCounterProps {
  completedOrders?: number;
  customerReviews?: number;
  averageRating?: number;
  darkMode: boolean;
}

function AnimatedNumber({ value, duration = 1500, formatter }: { value: number; duration?: number; formatter?: (v: number) => string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCurrent(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{formatter ? formatter(current) : current.toString()}</span>;
}

export default function StatsCounter({
  completedOrders = 33567,
  customerReviews = 8742,
  averageRating = 4.9,
  darkMode,
}: StatsCounterProps) {
  return (
    <section className={`py-12 md:py-16 transition-colors duration-300 ${
      darkMode ? "bg-black" : "bg-neutral-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full">
            أرقام وإنجازات تفخر بها
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mt-3 ${darkMode ? "text-white" : "text-neutral-900"}`}>
            الخيار الأول للشركات والمؤثرين في الوطن العربي
          </h2>
          <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
            نسعى دائماً لتقديم خدمات موثوقة ومضمونة وبأفضل الأسعار المنافسة لنضمن تفوق حساباتك الرقمية.
          </p>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Completed Orders Counter */}
          <div className={`p-8 rounded-2xl border text-center transition-all hover:scale-[1.02] duration-300 relative overflow-hidden ${
            darkMode 
              ? "bg-neutral-900/40 border-neutral-800 text-white" 
              : "bg-white border-neutral-200 text-neutral-900 shadow-sm"
          }`}>
            <div className="w-14 h-14 mx-auto rounded-xl bg-purple-500/10 flex items-center justify-center mb-5 text-purple-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              <AnimatedNumber value={completedOrders} />+
            </div>
            <h3 className="text-sm font-bold text-neutral-400 mt-3">طلب مكتمل بنجاح</h3>
            <p className="text-xs text-neutral-500 mt-1">توصيل دقيق وحسب المتفق عليه فورياً</p>
          </div>

          {/* Customer Reviews Counter */}
          <div className={`p-8 rounded-2xl border text-center transition-all hover:scale-[1.02] duration-300 relative overflow-hidden ${
            darkMode 
              ? "bg-neutral-900/40 border-neutral-800 text-white" 
              : "bg-white border-neutral-200 text-neutral-900 shadow-sm"
          }`}>
            <div className="w-14 h-14 mx-auto rounded-xl bg-pink-500/10 flex items-center justify-center mb-5 text-pink-500">
              <Users className="w-8 h-8" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              <AnimatedNumber value={customerReviews} />+
            </div>
            <h3 className="text-sm font-bold text-neutral-400 mt-3">عميل ومقيّم سعيد</h3>
            <p className="text-xs text-neutral-500 mt-1">تفاعل متبادل ونسب رضاء تقارب الكمال</p>
          </div>

          {/* Average Rating Counter */}
          <div className={`p-8 rounded-2xl border text-center transition-all hover:scale-[1.02] duration-300 relative overflow-hidden ${
            darkMode 
              ? "bg-neutral-900/40 border-neutral-800 text-white" 
              : "bg-white border-neutral-200 text-neutral-900 shadow-sm"
          }`}>
            <div className="w-14 h-14 mx-auto rounded-xl bg-orange-500/10 flex items-center justify-center mb-5 text-orange-500">
              <Star className="w-8 h-8 fill-orange-500" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center gap-1">
              <span>4.9</span>
              <span className="text-lg">/ 5.0</span>
            </div>

            {/* 5-star rating with the last star 80% filled */}
            <div className="flex items-center justify-center gap-1 mt-2.5">
              {[1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
              <div className="relative inline-block w-5 h-5">
                <Star className={`w-5 h-5 absolute top-0 left-0 ${darkMode ? "text-neutral-700 fill-neutral-800" : "text-neutral-300 fill-neutral-200"}`} />
                <div className="absolute top-0 left-0 overflow-hidden h-full" style={{ width: '80%' }}>
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 max-none" />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-neutral-400 mt-3">التقييم العام للموقع</h3>
            <p className="text-xs text-neutral-500 mt-1">
              بناءً على <span className="font-extrabold text-orange-500 font-mono"><AnimatedNumber value={customerReviews} />+</span> تقييم من عملائنا
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
