import { useEffect, useState, useRef } from "react";
import { ShoppingBag, Star, Users } from "lucide-react";
import { useInView } from "motion/react";
import ScrollReveal from "./ScrollReveal";

interface StatsCounterProps {
  completedOrders?: number;
  customerReviews?: number;
  averageRating?: number;
  darkMode: boolean;
}

function AnimatedNumber({ 
  value, 
  duration = 1600, 
  formatter,
  trigger = false
}: { 
  value: number; 
  duration?: number; 
  formatter?: (v: number) => string;
  trigger?: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Dynamic easing for counting animation (easeOutQuad style)
      const easeProgress = progress * (2 - progress);
      setCurrent(Math.floor(easeProgress * value));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCurrent(value);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration, trigger]);

  return <span>{formatter ? formatter(current) : current.toLocaleString('en-US')}</span>;
}

export default function StatsCounter({
  completedOrders = 33567,
  customerReviews = 8742,
  averageRating = 4.9,
  darkMode,
}: StatsCounterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className={`py-16 md:py-24 transition-colors duration-500 relative overflow-hidden ${
        darkMode ? "bg-[#030303]" : "bg-neutral-50"
      }`}
    >
      {/* Decorative premium background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-600/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with premium ScrollReveal */}
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16" delay={0.1}>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-500/10 shadow-sm">
            📈 أرقام وإنجازات تفخر بها
          </span>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-4 leading-tight ${
            darkMode ? "text-white" : "text-neutral-900"
          }`}>
            الخيار الأول للشركات والمؤثرين في الوطن العربي
          </h2>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
            نسعى دائماً لتقديم خدمات موثوقة ومضمونة وبأفضل الأسعار المنافسة لنضمن تفوق حساباتك الرقمية.
          </p>
        </ScrollReveal>

        {/* Counters Grid with staggered items using ScrollReveal parent */}
        <ScrollReveal 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8" 
          delay={0.2}
          direction="none" // Parent container does not offset itself
          blur={false}
          scale={false}
        >
          
          {/* Completed Orders Counter */}
          <ScrollReveal
            delay={0.1}
            direction="up"
            distance={40}
            className={`p-8 rounded-3xl border text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group ${
              darkMode 
                ? "bg-[#0b0b0c]/90 border-neutral-800/80 text-white hover:border-purple-500/40 hover:shadow-purple-500/5" 
                : "bg-white border-neutral-200/80 text-neutral-900 shadow-sm hover:border-pink-500/30 hover:shadow-pink-500/10"
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-5 text-purple-500 transition-transform duration-300 group-hover:scale-110">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              <AnimatedNumber value={completedOrders} trigger={isInView} />+
            </div>
            <h3 className="text-sm font-extrabold text-neutral-300 dark:text-neutral-200 mt-4">طلب مكتمل بنجاح</h3>
            <p className="text-xs text-neutral-500 mt-1">توصيل دقيق وحسب المتفق عليه فورياً</p>
          </ScrollReveal>

          {/* Customer Reviews Counter */}
          <ScrollReveal
            delay={0.2}
            direction="up"
            distance={40}
            className={`p-8 rounded-3xl border text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group ${
              darkMode 
                ? "bg-[#0b0b0c]/90 border-neutral-800/80 text-white hover:border-pink-500/40 hover:shadow-pink-500/5" 
                : "bg-white border-neutral-200/80 text-neutral-900 shadow-sm hover:border-pink-500/30 hover:shadow-pink-500/10"
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/10 flex items-center justify-center mb-5 text-pink-500 transition-transform duration-300 group-hover:scale-110">
              <Users className="w-7 h-7" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              <AnimatedNumber value={customerReviews} trigger={isInView} />+
            </div>
            <h3 className="text-sm font-extrabold text-neutral-300 dark:text-neutral-200 mt-4">عميل ومقيّم سعيد</h3>
            <p className="text-xs text-neutral-500 mt-1">تفاعل متبادل ونسب رضاء تقارب الكمال</p>
          </ScrollReveal>

          {/* Average Rating Counter */}
          <ScrollReveal
            delay={0.3}
            direction="up"
            distance={40}
            className={`p-8 rounded-3xl border text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group ${
              darkMode 
                ? "bg-[#0b0b0c]/90 border-neutral-800/80 text-white hover:border-orange-500/40 hover:shadow-orange-500/5" 
                : "bg-white border-neutral-200/80 text-neutral-900 shadow-sm hover:border-pink-500/30 hover:shadow-pink-500/10"
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center mb-5 text-orange-500 transition-transform duration-300 group-hover:scale-110">
              <Star className="w-7 h-7 fill-orange-500" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center gap-1.5">
              <span>4.9</span>
              <span className="text-lg md:text-xl text-neutral-450">/ 5.0</span>
            </div>

            {/* 5-star rating with the last star 80% filled */}
            <div className="flex items-center justify-center gap-1 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-5 h-5 text-yellow-450 fill-yellow-450 transition-transform duration-300 group-hover:scale-110" />
              ))}
              <div className="relative inline-block w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                <Star className={`w-5 h-5 absolute top-0 left-0 ${darkMode ? "text-neutral-700 fill-neutral-800" : "text-neutral-300 fill-neutral-200"}`} />
                <div className="absolute top-0 left-0 overflow-hidden h-full" style={{ width: '80%' }}>
                  <Star className="w-5 h-5 text-yellow-450 fill-yellow-450 max-none" />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-extrabold text-neutral-300 dark:text-neutral-200 mt-4">التقييم العام للموقع</h3>
            <p className="text-xs text-neutral-500 mt-1">
              بناءً على <span className="font-extrabold text-orange-500 font-mono"><AnimatedNumber value={customerReviews} trigger={isInView} />+</span> تقييم من عملائنا
            </p>
          </ScrollReveal>

        </ScrollReveal>

      </div>
    </section>
  );
}
