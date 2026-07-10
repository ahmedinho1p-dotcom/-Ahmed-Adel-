import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import { 
  Sparkles, Search, MessageCircle, Phone, ArrowLeft, Facebook, Instagram, 
  Youtube, Star, CheckCircle, ShieldAlert, Award, ChevronLeft, ChevronRight, Check,
  Clock, CreditCard, RefreshCw, AlertCircle, Gift, Music
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import StatsCounter from "./components/StatsCounter";
import ReviewSection from "./components/ReviewSection";
import OrderModal from "./components/OrderModal";
import CompanyInfo from "./components/CompanyInfo";
import AdminPanel from "./components/AdminPanel";
import SplashScreen from "./components/SplashScreen";
import DailyGiftModal from "./components/DailyGiftModal";
import ScrollReveal from "./components/ScrollReveal";
import { Package, Review, StoreSettings } from "./types";

const getPackageStyle = (packageName: string, darkMode: boolean) => {
  const name = packageName.trim();
  if (name.includes("الفضية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border-purple-500/20 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/5" 
        : "bg-gradient-to-b from-neutral-100/70 to-neutral-200/40 border-pink-500/20 hover:border-pink-500 hover:shadow-md hover:shadow-pink-500/10",
      accentText: darkMode
        ? "bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 bg-clip-text text-transparent font-black"
        : "bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-700 bg-clip-text text-transparent font-black",
      badgeClass: "bg-pink-500/5 text-pink-500 dark:text-purple-400 border border-pink-500/30 dark:border-purple-500/30",
      badgeText: "التميز الفضي 🪙",
      buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm hover:opacity-90",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("الذهبية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-amber-950/15 via-[#0d0b05] to-[#070603] border-purple-500/20 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10" 
        : "bg-gradient-to-b from-amber-50/40 to-amber-100/20 border-pink-500/20 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10",
      accentText: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-black",
      badgeClass: "bg-pink-500/5 text-amber-500 border border-pink-500/30 dark:border-purple-500/30",
      badgeText: "الذهبي الملكي 👑",
      buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold hover:opacity-95 shadow-md shadow-pink-500/10",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("البلاتينية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-slate-800/30 via-neutral-950/60 to-black border-purple-500/20 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/5" 
        : "bg-gradient-to-b from-slate-100/60 to-slate-200/30 border-pink-500/20 hover:border-pink-500 hover:shadow-md hover:shadow-pink-500/10",
      accentText: darkMode
        ? "bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 bg-clip-text text-transparent font-black"
        : "bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 bg-clip-text text-transparent font-black",
      badgeClass: "bg-pink-500/5 text-slate-400 border border-pink-500/30 dark:border-purple-500/30",
      badgeText: "البلاتيني الفاخر 💎",
      buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm hover:opacity-90",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("الماسية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-[#081520] via-neutral-950/80 to-[#03080c] border-purple-500/20 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10" 
        : "bg-gradient-to-b from-cyan-50/50 via-blue-50/30 to-white border-pink-500/20 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10",
      accentText: "bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent font-black",
      badgeClass: "bg-pink-500/5 text-cyan-450 border border-pink-500/30 dark:border-purple-500/30",
      badgeText: "الوهج الماسي ✨",
      buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-95 shadow-md shadow-pink-500/10",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("النخبة")) {
    return {
      cardClass: darkMode
        ? "bg-gradient-to-b from-[#080808] via-neutral-950 to-black border-2 border-purple-500/80 shadow-2xl hover:shadow-purple-500/20 ring-1 ring-purple-500/20 hover:border-purple-400"
        : "bg-gradient-to-b from-yellow-50/10 to-white border-2 border-pink-500 shadow-2xl hover:shadow-pink-500/20 ring-1 ring-pink-500/20 hover:border-pink-400",
      accentText: "bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600 bg-clip-text text-transparent font-black",
      badgeClass: "bg-pink-500/5 text-amber-400 border border-pink-500/30 dark:border-purple-500/30",
      badgeText: "باقة النخبة VIP 🌟",
      buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black hover:opacity-95 shadow-md",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-400/15 via-transparent to-pink-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  }
  return {
    cardClass: darkMode 
      ? "bg-neutral-950 border border-purple-500/20 hover:border-purple-500" 
      : "bg-white border border-pink-500/20 hover:border-pink-500 shadow-md",
    accentText: "text-white",
    badgeClass: "bg-pink-500/5 text-pink-500 dark:text-purple-400 border border-pink-500/20 dark:border-purple-500/20",
    badgeText: "باقة متميزة",
    buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    glowBg: ""
  };
};

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Scroll tracking for luxury progress indicator and parallax orbs
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const orb1Y = useTransform(scrollY, [0, 1000], [0, -120]);
  const orb2Y = useTransform(scrollY, [0, 1000], [0, 120]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const [currentView, setView] = useState<'home' | 'info' | 'admin'>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/admin") {
        const hasToken = localStorage.getItem("zwdha_admin_token");
        if (hasToken) return 'admin';
        // Prevent direct unauthenticated URL access - redirect to home
        window.history.replaceState({}, "", "/");
        return 'home';
      }
      if (path === "/info") return 'info';
    }
    return 'home';
  });
  const [currency, setCurrency] = useState<'EGP' | 'SAR' | 'USD'>('EGP');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Handle browser back/forward button clicks (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/admin") {
        const hasToken = localStorage.getItem("zwdha_admin_token");
        if (hasToken) {
          setView("admin");
        } else {
          window.history.replaceState({}, "", "/");
          setView("home");
        }
      } else if (path === "/info") {
        setView("info");
      } else {
        setView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSetView = (view: 'home' | 'info' | 'admin') => {
    if (view === 'admin') {
      const hasToken = localStorage.getItem("zwdha_admin_token");
      // Allow going to admin if we navigated via direct interaction (e.g., clicking 'زد')
      setView('admin');
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/admin");
      }
    } else {
      setView(view);
      if (typeof window !== "undefined") {
        if (view === 'info') {
          window.history.pushState({}, "", "/info");
        } else {
          window.history.pushState({}, "", "/");
        }
      }
    }
  };

  // Lists
  const [packages, setPackages] = useState<Package[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  
  // Platform filtering (Facebook, Instagram, YouTube, Google Reviews, TikTok)
  const [selectedPlatform, setSelectedPlatform] = useState<'Facebook' | 'Instagram' | 'YouTube' | 'Google Reviews' | 'TikTok'>('Instagram');
  const [searchQuery, setSearchQuery] = useState("");

  // Tracking state
  const [trackUrl, setTrackUrl] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");

  const handleTrackOrder = async (urlStr: string) => {
    const url = urlStr.trim();
    if (!url) {
      setTrackError("الرجاء إدخال رابط الحساب أو الصفحة لتتبع الطلب");
      setTrackedOrder(null);
      return;
    }

    setTrackLoading(true);
    setTrackError("");
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageUrl: url })
      });
      if (res.ok) {
        const data = await res.json();
        setTrackedOrder(data);
      } else {
        const errData = await res.json();
        setTrackError(errData.error || "لم يتم العثور على أي طلبات مرتبطة برابط هذا الحساب أو الصفحة");
        setTrackedOrder(null);
      }
    } catch (error) {
      setTrackError("حدث خطأ أثناء الاتصال بالخادم. الرجاء المحاولة مجدداً.");
      setTrackedOrder(null);
    } finally {
      setTrackLoading(false);
    }
  };

  // Checkout modal
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadInitialData = async () => {
    try {
      const pRes = await fetch("/api/packages");
      if (pRes.ok) {
        const pData = await pRes.json();
        setPackages(pData);
      }

      const rRes = await fetch("/api/reviews");
      if (rRes.ok) {
        const rData = await rRes.json();
        setReviews(rData);
      }

      const sRes = await fetch("/api/settings");
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(sData);
      }
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Save/retrieve dark mode preferences
  useEffect(() => {
    const savedMode = localStorage.getItem("zwdha_dark_mode");
    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
    } else {
      setDarkMode(true); // Default theme is dark mode
    }
  }, []);

  const handleSetDarkMode = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("zwdha_dark_mode", val.toString());
  };

  // Submit Order callback
  const handleSubmitOrder = async (orderDetails: {
    customerName: string;
    whatsappNumber: string;
    pageUrl: string;
    packageId: string;
    couponCode?: string;
    paymentMethod?: string;
    paymentSender?: string;
    paymentAmount?: number;
    paymentScreenshot?: string;
  }) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh orders inside any active admin console
        return { success: true, message: data.message };
      } else {
        return { success: false, message: "", error: data.error };
      }
    } catch (e) {
      return { success: false, message: "", error: "فشل الاتصال بالخادم، يرجى المحاولة لاحقاً" };
    }
  };

  // Submit Review callback
  const handleAddReview = async (reviewDetails: Omit<Review, 'id' | 'isApproved' | 'createdAt'>) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewDetails),
      });
      if (res.ok) {
        loadInitialData(); // Reload review lists
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Exchange rate definitions based on database settings (EGP to target currency multiplier)
  const exchangeRates = {
    SAR: 1 / (parseFloat(settings.rate_sar || "13.0") || 13.0),
    USD: 1 / (parseFloat(settings.rate_usd || "49.0") || 49.0),
  };

  // Converted price helper for display on homepage
  const getConvertedPriceText = (priceInEGP: number, discountPercent?: number | null) => {
    let finalBase = priceInEGP;
    if (discountPercent) {
      finalBase = finalBase * (1 - discountPercent / 100);
    }

    let val = finalBase;
    let symbol = "ج.م";

    if (currency === "SAR") {
      val = finalBase * exchangeRates.SAR;
      symbol = "ر.س";
    } else if (currency === "USD") {
      val = finalBase * exchangeRates.USD;
      symbol = "USD";
    }

    return `${Math.round(val * 100) / 100} ${symbol}`;
  };

  // Converted service label based on package name or description to fit all services dynamically
  const getServiceLabel = (pack: Package) => {
    const name = pack.name.toLowerCase();
    const desc = pack.description.toLowerCase();
    const platform = pack.platform;

    if (platform === "Google Reviews" || name.includes("تقييم") || desc.includes("تقييم")) {
      return "تقييم Reviews";
    }
    if (
      name.includes("لايك على تعليق") || 
      desc.includes("لايك على تعليق") || 
      name.includes("لايكات تعليق") || 
      name.includes("لايكات على تعليق") || 
      name.includes("تعليق") || 
      name.includes("comment like")
    ) {
      return "لايك على تعليق Comment Likes";
    }
    if (name.includes("لايك") || desc.includes("لايك") || name.includes("إعجاب") || name.includes("like")) {
      return "لايك Likes";
    }
    if (name.includes("مشاهد") || desc.includes("مشاهد") || name.includes("view")) {
      return "مشاهدة Views";
    }
    return "متابع Followers";
  };

  // Render Platform Icon with dynamic pulsating and hover rotation animations
  const renderPlatformIcon = (platform: string) => {
    const iconClass = "w-5 h-5 transition-transform duration-300";
    let icon = <Star className={`${iconClass} text-yellow-500 fill-yellow-500`} />;
    if (platform === "Instagram") icon = <Instagram className={`${iconClass} text-pink-500`} />;
    if (platform === "Facebook") icon = <Facebook className={`${iconClass} text-blue-500`} />;
    if (platform === "YouTube") icon = <Youtube className={`${iconClass} text-red-500`} />;
    if (platform === "TikTok") icon = <Music className={`${iconClass} text-[#00f2fe]`} />;

    return (
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ rotate: 18, scale: 1.25 }}
        whileTap={{ scale: 0.85 }}
        className="flex items-center justify-center inline-block cursor-pointer"
      >
        {icon}
      </motion.div>
    );
  };

  // Filter package cards
  const filteredPackages = packages.filter((p) => {
    return p.platform === selectedPlatform;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 antialiased ${
      darkMode ? "bg-[#050505] text-white" : "bg-neutral-50 text-neutral-900"
    }`}>
      
      {/* Premium scroll progress bar - RTL aligned */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 z-[9999] origin-right pointer-events-none"
        style={{ scaleX }}
      />
      
      {/* Global Navigation Header - ONLY render if not in admin view */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          setView={handleSetView}
          currency={currency}
          setCurrency={setCurrency}
          darkMode={darkMode}
          setDarkMode={handleSetDarkMode}
        />
      )}

      {/* Main Body view */}
      <main className="flex-1">
        
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-t-pink-500 border-neutral-800 rounded-full animate-spin" />
            <p className="text-sm text-neutral-400 font-bold">جاري تشغيل وتحميل سيرفر زودها...</p>
          </div>
        ) : (
          <>
            {/* 1. STORE HOMEPAGE VIEW */}
            {currentView === 'home' && (
              <div className="animate-fade-in">
                
                {/* Hero Section */}
                <section className="relative py-10 md:py-16 text-center overflow-hidden border-b border-neutral-800/20 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
                    
                    {/* Glowing Accent Pill */}
                    <ScrollReveal delay={0.05} direction="down" duration={0.8} distance={15} className="inline-block">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 rounded-full shadow-lg shadow-pink-500/10 animate-bounce-slow">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>متجر معتمد وموثوق 100% لتزويد خدمات التواصل</span>
                      </span>
                    </ScrollReveal>

                    <ScrollReveal delay={0.15} direction="up" duration={0.9} blur={true} scale={true}>
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.25] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
                        ضخم حضورك الرقمي مع <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                          زودها ZWDHA
                        </span>
                      </h1>
                    </ScrollReveal>

                    <ScrollReveal delay={0.25} direction="up" duration={0.9} blur={true} scale={true}>
                      <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                        الوجهة المثالية في مصر والوطن العربي لتزويد المتابعين، اللايكات، المشتركين والتقييمات بجودة لا مثيل لها وبثقة تامة مع حماية خصوصية حسابك وضمان تعويض مجاني مدى الحياة.
                      </p>
                    </ScrollReveal>

                    {/* CTA buttons */}
                    <ScrollReveal delay={0.35} direction="up" duration={0.9} blur={true} scale={true}>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <motion.a
                          id="hero-cta-browse"
                          href="#store-section"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 text-white font-extrabold text-xs shadow-xl shadow-pink-500/15 text-center transition-all cursor-pointer"
                        >
                          تصفح باقات الخدمات المتاحة
                        </motion.a>
                        <motion.button
                          id="hero-cta-info"
                          onClick={() => setView('info')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full sm:w-auto px-6 py-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                            darkMode ? "border-neutral-800 hover:bg-neutral-800 text-white" : "border-neutral-200 hover:bg-neutral-100 text-neutral-900"
                          }`}
                        >
                          تعرّف على سياسة الضمان لدينا
                        </motion.button>
                      </div>
                    </ScrollReveal>

                    {/* Daily Free Gift Button */}
                    <ScrollReveal delay={0.45} direction="up" duration={0.9} blur={true} scale={true} className="mt-4 flex justify-center">
                      <motion.button
                        id="hero-cta-daily-gift"
                        onClick={() => setIsGiftModalOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:opacity-95 cursor-pointer shadow-lg shadow-orange-500/10 border border-amber-400/20"
                      >
                        <Gift className="w-4 h-4 text-white animate-bounce" />
                        <span>🎁 هدايا يومية مجانية (لايكات ومتابعين)</span>
                      </motion.button>
                    </ScrollReveal>

                  </div>

                  {/* Aesthetic Background Orbs with luxury parallax */}
                  <motion.div 
                    style={{ y: orb1Y }}
                    className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" 
                  />
                  <motion.div 
                    style={{ y: orb2Y }}
                    className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-pink-600/5 blur-3xl pointer-events-none" 
                  />
                </section>

                {/* SMM Store Services Section */}
                <section id="store-section" className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  {/* Category Filter and Search */}
                  <ScrollReveal delay={0.1} direction="up" distance={20} className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6 border-b border-neutral-800/15 pb-4">
                    
                    {/* 5 Separate Service Categories tabs (Facebook, Instagram, YouTube, TikTok, Google Reviews) */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      {([
                        { id: 'Instagram', label: 'إنستقرام Instagram' },
                        { id: 'Facebook', label: 'فيسبوك Facebook' },
                        { id: 'YouTube', label: 'يوتيوب YouTube' },
                        { id: 'TikTok', label: 'تيك توك TikTok' },
                        { id: 'Google Reviews', label: 'تقييمات جوجل Google' }
                      ] as const).map((platform) => (
                        <motion.button
                          key={platform.id}
                          id={`platform-filter-tab-${platform.id.replace(' ', '-')}`}
                          onClick={() => { setSelectedPlatform(platform.id); setSearchQuery(""); }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-5 py-3 text-xs font-black rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                            selectedPlatform === platform.id
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md"
                              : darkMode
                                ? "bg-neutral-950 border-purple-500/30 hover:border-purple-500 text-neutral-400 hover:text-white"
                                : "bg-white border-pink-500/30 hover:border-pink-500 text-neutral-600 hover:text-neutral-900 shadow-sm"
                          }`}
                        >
                          {renderPlatformIcon(platform.id)}
                          <span>{platform.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Order Tracking widget */}
                    <div className="w-full lg:w-[420px] shrink-0 space-y-2">
                      <div className="text-right">
                        <label className={`text-[11px] font-black leading-relaxed block ${darkMode ? "text-purple-300" : "text-pink-600"}`}>
                          💡 أدخل رابط حسابك أو الصفحة لتتبع طلبك لحظياً:
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            id="order-track-input"
                            type="text"
                            placeholder="مثال: https://instagram.com/username"
                            value={trackUrl}
                            onChange={(e) => setTrackUrl(e.target.value)}
                            className={`w-full text-xs p-3.5 pr-11 text-right rounded-xl border focus:outline-none focus:border-pink-500 ${
                              darkMode ? "bg-neutral-950 border-purple-500/30 text-white" : "bg-white border-pink-500/30 text-neutral-900"
                            }`}
                          />
                          <Search className="w-4 h-4 text-neutral-400 absolute top-3.5 right-4" />
                        </div>
                        <button
                          onClick={() => handleTrackOrder(trackUrl)}
                          disabled={trackLoading}
                          className="px-5 py-3 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shrink-0 cursor-pointer"
                        >
                          {trackLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          <span>تتبع طلبك</span>
                        </button>
                      </div>
                    </div>

                  </ScrollReveal>

                  {/* Tracking Results or Errors panel */}
                  <AnimatePresence>
                    {(trackedOrder || trackError) && (
                      <motion.div
                        initial={{ opacity: 0, y: -15, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -15, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8 overflow-hidden"
                      >
                        {trackError ? (
                          <div className={`p-4 rounded-xl border flex items-center gap-2 text-right text-xs font-bold ${
                            darkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
                          }`}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{trackError}</span>
                          </div>
                        ) : (
                          <div className={`p-5 rounded-2xl border text-right space-y-4 relative ${
                            darkMode ? "bg-neutral-900/95 border-purple-500/40 text-white" : "bg-white border-pink-500/25 text-neutral-900 shadow-lg"
                          }`}>
                            {/* Header row with a glowing Live tag and clear button */}
                            <div className="flex items-center justify-between border-b border-neutral-800/15 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">تحديثات الطلب لحظة بلحظة</h4>
                              </div>
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleTrackOrder(trackUrl)}
                                  className="text-[10px] text-pink-500 hover:text-pink-400 flex items-center gap-1 font-bold"
                                >
                                  <RefreshCw className={`w-3 h-3 ${trackLoading ? 'animate-spin' : ''}`} />
                                  <span>تحديث فوري</span>
                                </button>
                                <button 
                                  onClick={() => { setTrackedOrder(null); setTrackError(""); setTrackUrl(""); }}
                                  className="text-[10px] text-neutral-500 hover:text-neutral-400 font-bold"
                                >
                                  إغلاق [✕]
                                </button>
                              </div>
                            </div>

                            {/* Data grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-405 block">صاحب الطلب:</span>
                                <span className="font-bold text-neutral-200">{trackedOrder.customerName}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-405 block">الباقة المشتراة والمنصة:</span>
                                <span className="font-extrabold text-pink-500">{trackedOrder.packageName} ({trackedOrder.platform})</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-405 block">حالة الطلب في المتجر:</span>
                                <div>
                                  {trackedOrder.status === 'New' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20">
                                      <Clock className="w-3 h-3" /> جديد / قيد المراجعة 🔔
                                    </span>
                                  )}
                                  {trackedOrder.status === 'Contacted' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                      <MessageCircle className="w-3 h-3 text-blue-400" /> جاري التحضير والتجهيز 💬
                                    </span>
                                  )}
                                  {trackedOrder.status === 'Completed' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-500/10 text-green-400 border border-green-500/20">
                                      <CheckCircle className="w-3 h-3 text-green-400" /> مكتمل وجاهز ✓
                                    </span>
                                  )}
                                  {trackedOrder.status === 'Cancelled' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                                      ملغي ✕
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-405 block">حالة عملية التحويل المالي:</span>
                                <div>
                                  {trackedOrder.paymentStatus === 'مدفوع' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-500/10 text-green-400 border border-green-500/20">
                                      <CreditCard className="w-3 h-3 text-green-400" /> تم تأكيد الدفع بنجاح 💳
                                    </span>
                                  ) : trackedOrder.paymentStatus === 'مرفوض' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20">
                                      <ShieldAlert className="w-3 h-3 text-red-400" /> تم رفض التحويل ✕
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                      <Clock className="w-3 h-3" /> بانتظار تأكيد التحويل ⏳
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-405 block">طريقة التحويل والمبلغ:</span>
                                <span className="font-bold text-neutral-200">
                                  {trackedOrder.paymentMethod === 'vodafone' ? 'فودافون كاش' : trackedOrder.paymentMethod === 'instapay' ? 'إنستا باي' : 'تواصل عبر واتساب'} - {trackedOrder.price} {trackedOrder.currency}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-405 block">تاريخ الطلب:</span>
                                <span className="text-neutral-400 font-mono">
                                  {new Date(trackedOrder.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Package cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <AnimatePresence mode="popLayout">
                      {filteredPackages.length === 0 ? (
                        <motion.div 
                          key="no-packages"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="col-span-full py-16 text-center text-neutral-500 text-sm font-bold"
                        >
                          لا توجد أي باقات متاحة متوافقة مع هذا البحث حالياً.
                        </motion.div>
                      ) : (
                        filteredPackages.map((pack, index) => {
                          const style = getPackageStyle(pack.name, darkMode);
                          return (
                            <ScrollReveal
                              key={pack.id}
                              delay={(index % 3) * 0.08}
                              direction="up"
                              distance={30}
                              className="h-full"
                            >
                              <motion.div
                                whileHover={{ y: -8, scale: 1.015 }}
                                whileTap={{ scale: 0.985 }}
                                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden h-full ${style.cardClass}`}
                              >
                                {/* Inner body wrapper to allow custom layouts */}
                                <div className="w-full h-full flex flex-col justify-between relative z-10">
                                  
                                  <div className="space-y-4">
                                    {/* Header (Badge + Platform) */}
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
                                        {renderPlatformIcon(pack.platform)}
                                        {pack.platform}
                                      </span>
                                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${style.badgeClass}`}>
                                        {style.badgeText}
                                      </span>
                                    </div>

                                    {/* Package title */}
                                    <h3 className={`text-base font-black leading-snug ${darkMode ? "text-white" : "text-neutral-900"}`}>{pack.name}</h3>
                                    
                                    {/* Followers amount badge with dynamic service wording */}
                                    <div className="flex items-baseline gap-2">
                                      <span className={`text-3xl font-black font-mono tracking-tight ${style.accentText}`}>
                                        {pack.followersCount}
                                      </span>
                                      <span className="text-xs font-bold text-neutral-450">{getServiceLabel(pack)}</span>
                                    </div>

                                    <p className="text-xs text-neutral-450 leading-relaxed min-h-[48px]">{pack.description}</p>
                                    
                                    {/* Delivery and features */}
                                    <div className="space-y-2 border-t border-neutral-800/20 pt-4 text-xs text-neutral-450">
                                      <div className="flex justify-between">
                                        <span>⏱️ وقت البدء والتسليم:</span>
                                        <span className="font-bold text-neutral-300">{pack.deliveryTime}</span>
                                      </div>
                                      
                                      {/* Beautiful Interactive Gift Pill Button */}
                                      {pack.gift && (
                                        <motion.div
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 shadow-lg shadow-amber-500/5 select-none"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">🎁</span>
                                            <span className="text-xs font-bold text-amber-500 dark:text-amber-400">هدية إضافية:</span>
                                          </div>
                                          <span className="text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-300 bg-clip-text text-transparent flex items-center gap-1">
                                            {pack.gift === "Like" ? "زيادة لايكات Like ❤️" :
                                             pack.gift === "Follow" ? "زيادة متابعين Follow 👤" :
                                             pack.gift === "Both" ? "لايكات ومتابعين Like & Follow ✨" :
                                             pack.gift}
                                          </span>
                                        </motion.div>
                                      )}

                                      {/* Discount percentage tag */}
                                      {pack.discount && (
                                        <div className="flex justify-between text-green-500 font-bold">
                                          <span>🔥 خصم فوري:</span>
                                          <span>وفر {pack.discount}% خصم اليوم!</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Price block & button */}
                                  <div className="mt-6 pt-4 border-t border-neutral-800/15 flex items-center justify-between gap-4">
                                    <div className="flex flex-col">
                                      {pack.discount && (
                                        <span className="text-[10px] text-neutral-500 line-through font-mono">
                                          {getConvertedPriceText(pack.price)}
                                        </span>
                                      )}
                                      <span className="text-lg font-black font-mono text-pink-500">
                                        {getConvertedPriceText(pack.price, pack.discount)}
                                      </span>
                                    </div>

                                    <motion.button
                                      id={`pkg-order-btn-${pack.id}`}
                                      onClick={() => setSelectedPackage(pack)}
                                      whileHover={{ scale: 1.06, filter: "hue-rotate(8deg) brightness(1.15) contrast(1.05)" }}
                                      whileTap={{ scale: 0.93, filter: "brightness(0.95)" }}
                                      transition={{ type: "spring", stiffness: 450, damping: 15 }}
                                      className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 cursor-pointer touch-manipulation active:scale-95 ${style.buttonClass}`}
                                    >
                                      اطلب الآن 🚀
                                    </motion.button>
                                  </div>

                                </div>

                                {/* Glow/reflect premium backgrounds */}
                                <div className={`${style.glowBg}`} />
                              </motion.div>
                            </ScrollReveal>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>

                </section>

                {/* Animated metrics statistics section */}
                <StatsCounter
                  completedOrders={parseInt(settings.stat_completed_orders || "33567")}
                  customerReviews={parseInt(settings.stat_customer_reviews || "8742")}
                  averageRating={parseFloat(settings.stat_average_rating || "4.9")}
                  darkMode={darkMode}
                />

                {/* Egyptian Customer reviews block */}
                <ReviewSection
                  reviews={reviews}
                  onAddReview={handleAddReview}
                  darkMode={darkMode}
                />

              </div>
            )}

            {/* 2. COMPANY INFORMATION PAGE VIEW */}
            {currentView === 'info' && (
              <div className="animate-fade-in">
                <CompanyInfo darkMode={darkMode} />
              </div>
            )}

            {/* 3. ADMINISTRATIVE DASHBOARD PANEL VIEW */}
            {currentView === 'admin' && (
              <div className="animate-fade-in">
                <AdminPanel 
                  darkMode={darkMode} 
                  currency={currency} 
                  onSettingsUpdated={loadInitialData}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Global Footer - ONLY render if not in admin view */}
      {currentView !== 'admin' && (
        <Footer setView={handleSetView} darkMode={darkMode} />
      )}

      {/* Checkout Forms Popup Modal */}
      {selectedPackage && (
        <OrderModal
          pack={selectedPackage}
          currency={currency}
          exchangeRates={exchangeRates}
          onClose={() => setSelectedPackage(null)}
          onSubmitOrder={handleSubmitOrder}
          darkMode={darkMode}
        />
      )}

      {/* Daily Free Gift Popup Modal */}
      <DailyGiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        darkMode={darkMode}
      />

      {/* Floating social contact parameters - ONLY render if not in admin view */}
      {currentView !== 'admin' && <FloatingButtons />}

      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

    </div>
  );
}
