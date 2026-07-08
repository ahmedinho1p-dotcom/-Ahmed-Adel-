import { useState, useEffect } from "react";
import { 
  Sparkles, Search, MessageCircle, Phone, ArrowLeft, Facebook, Instagram, 
  Youtube, Star, CheckCircle, ShieldAlert, Award, ChevronLeft, ChevronRight, Check
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
import { Package, Review, StoreSettings } from "./types";

const getPackageStyle = (packageName: string, darkMode: boolean) => {
  const name = packageName.trim();
  if (name.includes("الفضية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border-neutral-750 hover:border-neutral-500 hover:shadow-lg hover:shadow-neutral-500/5" 
        : "bg-gradient-to-b from-neutral-100/70 to-neutral-200/40 border-neutral-300 hover:border-neutral-400 hover:shadow-md hover:shadow-neutral-400/10",
      accentText: darkMode
        ? "bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 bg-clip-text text-transparent font-black"
        : "bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-700 bg-clip-text text-transparent font-black",
      badgeClass: "bg-neutral-500/10 text-neutral-450 border border-neutral-500/20",
      badgeText: "التميز الفضي 🪙",
      buttonClass: "bg-neutral-800 hover:bg-neutral-700 text-white shadow-sm dark:bg-neutral-900 dark:hover:bg-neutral-800",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-neutral-500/10 via-transparent to-neutral-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("الذهبية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-amber-950/15 via-[#0d0b05] to-[#070603] border-amber-500/30 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10" 
        : "bg-gradient-to-b from-amber-50/40 to-amber-100/20 border-amber-300/80 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/10",
      accentText: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-black",
      badgeClass: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      badgeText: "الذهبي الملكي 👑",
      buttonClass: "bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold hover:opacity-95 shadow-md shadow-amber-500/10",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("البلاتينية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-slate-800/30 via-neutral-950/60 to-black border-slate-700/60 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-400/5" 
        : "bg-gradient-to-b from-slate-100/60 to-slate-200/30 border-slate-300 hover:border-slate-400 hover:shadow-md hover:shadow-slate-400/10",
      accentText: darkMode
        ? "bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 bg-clip-text text-transparent font-black"
        : "bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 bg-clip-text text-transparent font-black",
      badgeClass: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
      badgeText: "البلاتيني الفاخر 💎",
      buttonClass: "bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-900 dark:hover:bg-slate-800",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-slate-500/10 via-transparent to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("الماسية")) {
    return {
      cardClass: darkMode 
        ? "bg-gradient-to-b from-[#081520] via-neutral-950/80 to-[#03080c] border-cyan-500/20 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10" 
        : "bg-gradient-to-b from-cyan-50/50 via-blue-50/30 to-white border-cyan-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/10",
      accentText: "bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent font-black",
      badgeClass: "bg-cyan-500/10 text-cyan-450 border border-cyan-500/20",
      badgeText: "الوهج الماسي ✨",
      buttonClass: "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:opacity-95 shadow-md shadow-cyan-500/10",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  } else if (name.includes("النخبة")) {
    return {
      cardClass: "bg-gradient-to-b from-[#080808] via-neutral-950 to-black border-2 border-amber-500/80 shadow-2xl hover:shadow-amber-500/20 ring-1 ring-amber-500/20 hover:border-amber-400",
      accentText: "bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600 bg-clip-text text-transparent font-black",
      badgeClass: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-amber-400 border border-amber-500/30",
      badgeText: "باقة النخبة VIP 🌟",
      buttonClass: "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-black hover:opacity-95 shadow-md shadow-amber-500/20",
      glowBg: "absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-400/15 via-transparent to-amber-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    };
  }
  return {
    cardClass: darkMode ? "bg-neutral-950 border-neutral-900" : "bg-white border-neutral-200 shadow-md",
    accentText: "text-white",
    badgeClass: "bg-neutral-500/10 text-neutral-450",
    badgeText: "باقة متميزة",
    buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    glowBg: ""
  };
};

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const [currentView, setView] = useState<'home' | 'info' | 'admin'>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/admin") return 'admin';
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
        setView("admin");
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
    setView(view);
    if (typeof window !== "undefined") {
      if (view === 'admin') {
        window.history.pushState({}, "", "/admin");
      } else if (view === 'info') {
        window.history.pushState({}, "", "/info");
      } else {
        window.history.pushState({}, "", "/");
      }
    }
  };

  // Lists
  const [packages, setPackages] = useState<Package[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  
  // Platform filtering (Facebook, Instagram, YouTube, Google Reviews)
  const [selectedPlatform, setSelectedPlatform] = useState<'Facebook' | 'Instagram' | 'YouTube' | 'Google Reviews'>('Instagram');
  const [searchQuery, setSearchQuery] = useState("");

  // Checkout modal
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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

  // Render Platform Icon
  const renderPlatformIcon = (platform: string) => {
    if (platform === "Instagram") return <Instagram className="w-5 h-5 text-pink-500" />;
    if (platform === "Facebook") return <Facebook className="w-5 h-5 text-blue-500" />;
    if (platform === "YouTube") return <Youtube className="w-5 h-5 text-red-500" />;
    return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
  };

  // Filter package cards
  const filteredPackages = packages.filter((p) => {
    const matchesPlatform = p.platform === selectedPlatform;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 antialiased ${
      darkMode ? "bg-[#050505] text-white" : "bg-neutral-50 text-neutral-900"
    }`}>
      
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
                <section className="relative py-20 md:py-28 text-center overflow-hidden border-b border-neutral-800/20 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
                    
                    {/* Glowing Accent Pill */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full shadow-lg shadow-pink-500/10 animate-bounce-slow">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>متجر معتمد وموثوق 100% لتزويد خدمات التواصل</span>
                    </span>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.25] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
                      ضخم حضورك الرقمي مع <br className="hidden sm:inline" />
                      <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                        زودها ZWDHA
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                      الوجهة المثالية في مصر والوطن العربي لتزويد المتابعين، اللايكات، المشتركين والتقييمات بجودة لا مثيل لها وبثقة تامة مع حماية خصوصية حسابك وضمان تعويض مجاني مدى الحياة.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                      <a
                        id="hero-cta-browse"
                        href="#store-section"
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-pink-500/15 text-center transition-all cursor-pointer"
                      >
                        تصفح باقات الخدمات المتاحة
                      </a>
                      <button
                        id="hero-cta-info"
                        onClick={() => setView('info')}
                        className={`w-full sm:w-auto px-8 py-4 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer ${
                          darkMode ? "border-neutral-800 hover:bg-neutral-800 text-white" : "border-neutral-200 hover:bg-neutral-100 text-neutral-900"
                        }`}
                      >
                        تعرّف على سياسة الضمان لدينا
                      </button>
                    </div>

                  </div>

                  {/* Aesthetic Background Orbs */}
                  <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-pink-600/5 blur-3xl pointer-events-none" />
                </section>

                {/* SMM Store Services Section */}
                <section id="store-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  {/* Category Filter and Search */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-neutral-800/15 pb-8">
                    
                    {/* 4 Separate Service Categories tabs (Facebook, Instagram, YouTube, Google Reviews) */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {([
                        { id: 'Instagram', label: 'إنستقرام Instagram' },
                        { id: 'Facebook', label: 'فيسبوك Facebook' },
                        { id: 'YouTube', label: 'يوتيوب YouTube' },
                        { id: 'Google Reviews', label: 'تقييمات جوجلReviews' }
                      ] as const).map((platform) => (
                        <button
                          key={platform.id}
                          id={`platform-filter-tab-${platform.id.replace(' ', '-')}`}
                          onClick={() => { setSelectedPlatform(platform.id); setSearchQuery(""); }}
                          className={`px-5 py-3 text-xs font-black rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                            selectedPlatform === platform.id
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md"
                              : darkMode
                                ? "bg-neutral-950 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-white"
                                : "bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 shadow-sm"
                          }`}
                        >
                          {renderPlatformIcon(platform.id)}
                          <span>{platform.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Live search bar */}
                    <div className="relative w-full md:w-80 shrink-0">
                      <input
                        id="home-search-bar"
                        type="text"
                        placeholder={`ابحث داخل باقات ${selectedPlatform}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full text-xs p-3.5 pr-11 rounded-xl border focus:outline-none focus:border-pink-500 ${
                          darkMode ? "bg-neutral-950 border-neutral-900 text-white" : "bg-white border-neutral-200 text-neutral-900"
                        }`}
                      />
                      <Search className="w-4 h-4 text-neutral-500 absolute top-4 right-4" />
                    </div>

                  </div>

                  {/* Package cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredPackages.length === 0 ? (
                      <div className="col-span-full py-16 text-center text-neutral-500 text-sm font-bold">
                        لا توجد أي باقات متاحة متوافقة مع هذا البحث حالياً.
                      </div>
                    ) : (
                      filteredPackages.map((pack) => {
                        const style = getPackageStyle(pack.name, darkMode);
                        return (
                          <div
                            key={pack.id}
                            className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative group hover:scale-[1.02] overflow-hidden ${style.cardClass}`}
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
                                
                                {/* Followers amount badge with 'متابع Followers' wording */}
                                <div className="flex items-baseline gap-2">
                                  <span className={`text-3xl font-black font-mono tracking-tight ${style.accentText}`}>
                                    {pack.followersCount}
                                  </span>
                                  <span className="text-xs font-bold text-neutral-450">متابع Followers</span>
                                </div>

                                <p className="text-xs text-neutral-450 leading-relaxed min-h-[48px]">{pack.description}</p>
                                
                                {/* Delivery and features */}
                                <div className="space-y-2 border-t border-neutral-800/20 pt-4 text-xs text-neutral-450">
                                  <div className="flex justify-between">
                                    <span>⏱️ وقت البدء والتسليم:</span>
                                    <span className="font-bold text-neutral-300">{pack.deliveryTime}</span>
                                  </div>
                                  
                                  {/* Gift Label */}
                                  {pack.gift && (
                                    <div className="flex justify-between text-[#fcaf45] font-bold">
                                      <span>🎁 الهدية الخاصة:</span>
                                      <span>{pack.gift}</span>
                                    </div>
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

                                <button
                                  id={`pkg-order-btn-${pack.id}`}
                                  onClick={() => setSelectedPackage(pack)}
                                  className={`px-5 py-2.5 rounded-xl font-extrabold text-xs active:scale-95 transition-all cursor-pointer ${style.buttonClass}`}
                                >
                                  اطلب الآن 🚀
                                </button>
                              </div>

                            </div>

                            {/* Glow/reflect premium backgrounds */}
                            <div className={`${style.glowBg}`} />
                          </div>
                        );
                      })
                    )}
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

      {/* Floating social contact parameters - ONLY render if not in admin view */}
      {currentView !== 'admin' && <FloatingButtons />}

      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

    </div>
  );
}
