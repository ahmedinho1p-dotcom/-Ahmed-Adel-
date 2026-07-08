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
                ? "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-yellow-400" 
                : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200 text-neutral-800"
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
                darkMode ? "bg-neutral-900 border-neutral-800 text-yellow-400" : "bg-neutral-100 border-neutral-200 text-neutral-800"
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
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-md shadow-purple-900/30 cursor-pointer hover:scale-110 transition-transform"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            title="زد للإدارة"
          >
            <span className="text-white font-black text-base sm:text-lg font-sans select-none">زد</span>
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
              darkMode ? "bg-neutral-900 border-neutral-800" : "bg-neutral-100 border-neutral-200"
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
          <div className="flex md:hidden items-center gap-2">
            {/* Fast Mobile Currency Dropdown */}
            <select
              id="mobile-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className={`text-[10px] font-bold py-1 px-1.5 rounded-md border focus:outline-none ${
                darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-neutral-100 border-neutral-200 text-neutral-900"
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
                darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-neutral-100 border-neutral-200 text-neutral-900"
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
