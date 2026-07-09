import { Sun, Moon, DollarSign, Menu, X, Landmark, ShieldCheck, Settings } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface HeaderProps {
  currentView: 'home' | 'info' | 'admin';
  setView: (v: 'home' | 'info' | 'admin') => void;
  currency: 'EGP' | 'SAR' | 'USD';
  setCurrency: (c: 'EGP' | 'SAR' | 'USD') => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export default function Header({
  currentView,
  setView,
  currency,
  setCurrency,
  darkMode,
  setDarkMode,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-300 ${
      darkMode ? "bg-black/80 border-neutral-800 text-white" : "bg-white/80 border-neutral-200 text-neutral-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 relative flex items-center justify-between">
        
        {/* Desktop Left / Mobile Left: Navigation & Theme Toggle */}
        <div className="flex items-center gap-4 z-10">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <motion.button
              id="nav-link-home"
              onClick={() => setView('home')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-sm font-bold transition-all relative py-2 cursor-pointer ${
                currentView === 'home' 
                  ? "text-pink-500" 
                  : darkMode ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              المتجر الرئيسي
              {currentView === 'home' && (
                <motion.span 
                  layoutId="activeHeaderTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" 
                />
              )}
            </motion.button>
            
            <motion.button
              id="nav-link-info"
              onClick={() => setView('info')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-sm font-bold transition-all relative py-2 cursor-pointer ${
                currentView === 'info' 
                  ? "text-pink-500" 
                  : darkMode ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              لماذا زودها؟ (من نحن)
              {currentView === 'info' && (
                <motion.span 
                  layoutId="activeHeaderTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" 
                />
              )}
            </motion.button>
          </nav>

          {/* Desktop Theme Toggle */}
          <motion.button
            id="theme-toggle-desktop"
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            className={`hidden md:block p-2 rounded-lg border transition-all ${
              darkMode 
                ? "bg-neutral-900 border-purple-500/30 hover:border-purple-500 text-yellow-400" 
                : "bg-neutral-100 border-pink-500/30 hover:border-pink-500 text-neutral-800"
            }`}
            title={darkMode ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          {/* Mobile Theme Toggle */}
          <div className="flex md:hidden items-center">
            <motion.button
              id="theme-toggle-mobile"
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-lg border ${
                darkMode ? "bg-neutral-900 border-purple-500/30 text-yellow-400" : "bg-neutral-100 border-pink-500/30 text-neutral-800"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Store Name - Perfectly Centered Absolutely with smooth 3D/Hover pop animations */}
        <motion.div 
          onClick={() => { setView('home'); setMobileMenuOpen(false); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3 cursor-pointer select-none group z-0"
        >
          <motion.div 
            onClick={(e) => {
              e.stopPropagation();
              setView('admin');
              setMobileMenuOpen(false);
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/25 cursor-pointer hover:scale-110 transition-transform relative group border border-white/15"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            title="زد للإدارة"
          >
            <svg 
              className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V8C20 8.55228 19.5523 9 19 9H9.41421L17.7071 17.2929C18.0976 17.6834 18.0976 18.3166 17.7071 18.7071L16.2929 20.1213C15.9024 20.5118 15.2692 20.5118 14.8787 20.1213L4.29289 9.53553C3.90237 9.14501 3.90237 8.51184 4.29289 8.12132L4 6Z" 
                fill="url(#zGrad1)" 
              />
              <path 
                d="M20 18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16C4 15.4477 4.44772 15 5 15H14.5858L6.29289 6.70711C5.90237 6.31658 5.90237 5.68342 6.29289 5.29289L7.70711 3.87868C8.09763 3.48816 8.7308 3.48816 9.12132 3.87868L19.7071 14.4645C20.0976 14.855 20.0976 15.4882 19.7071 15.8787L20 18Z" 
                fill="url(#zGrad2)" 
                opacity="0.85"
                style={{ mixBlendMode: 'overlay' as any }}
              />
              <defs>
                <linearGradient id="zGrad1" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                <linearGradient id="zGrad2" x1="20" y1="20" x2="4" y2="4" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          <div className="flex flex-col items-center sm:items-start">
            <motion.span 
              className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% auto" }}
            >
              زودها ZWDHA
            </motion.span>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">STORE</span>
          </div>
        </motion.div>

        {/* Desktop Right / Mobile Right: Currency & Menu Trigger */}
        <div className="flex items-center gap-3 z-10">
          {/* Desktop Currency Selector (Far Right, Reduced Size) */}
          <div className="hidden md:flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-neutral-500" : "text-neutral-400"}`}>العملة:</span>
            <div className={`flex items-center rounded-lg p-0.5 border ${
              darkMode ? "bg-neutral-900 border-purple-500/30" : "bg-neutral-100 border-pink-500/30"
            }`}>
              {(['EGP', 'SAR', 'USD'] as const).map((curr) => (
                <motion.button
                  key={curr}
                  id={`currency-selector-${curr}`}
                  onClick={() => setCurrency(curr)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-2 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    currency === curr
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm"
                      : darkMode 
                        ? "text-neutral-400 hover:text-neutral-200" 
                        : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {curr === 'EGP' ? 'ج.م' : curr === 'SAR' ? 'ر.س' : '$'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-3">
            {/* Fast Mobile Currency Dropdown */}
            <select
              id="mobile-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className={`text-[10px] font-bold py-1 px-1.5 rounded-md border focus:outline-none ${
                darkMode ? "bg-neutral-900 border-purple-500/30 text-white" : "bg-neutral-100 border-pink-500/30 text-neutral-900"
              }`}
            >
              <option value="EGP">ج.م</option>
              <option value="SAR">ر.س</option>
              <option value="USD">$</option>
            </select>

            {/* Hamburger Menu */}
            <motion.button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg border ${
                darkMode ? "bg-neutral-900 border-purple-500/30 text-white" : "bg-neutral-100 border-pink-500/30 text-neutral-900"
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t animate-slide-down ${
          darkMode ? "bg-black/95 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col">
            <motion.button
              id="mobile-nav-home"
              onClick={() => { setView('home'); setMobileMenuOpen(false); }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-xl text-right text-sm font-bold transition-all ${
                currentView === 'home' 
                  ? "bg-pink-500/10 text-pink-500 font-extrabold border-r-4 border-pink-500" 
                  : "hover:bg-neutral-800/50"
              }`}
            >
              المتجر الرئيسي
            </motion.button>
            <motion.button
              id="mobile-nav-info"
              onClick={() => { setView('info'); setMobileMenuOpen(false); }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-xl text-right text-sm font-bold transition-all ${
                currentView === 'info' 
                  ? "bg-pink-500/10 text-pink-500 font-extrabold border-r-4 border-pink-500" 
                  : "hover:bg-neutral-800/50"
              }`}
            >
              لماذا زودها؟ (من نحن)
            </motion.button>
          </div>
        </div>
      )}
    </header>
  );
}
