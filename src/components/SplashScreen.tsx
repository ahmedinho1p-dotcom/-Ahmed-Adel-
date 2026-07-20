import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash for custom duration (default 2s), then trigger exit
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          id="splash-screen-container"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303] overflow-hidden select-none"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
          style={{ perspective: 1200 }}
        >
          {/* Animated Ambient 3D Glowing Lights in Background */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px]"
            animate={{
              scale: [1, 1.3, 0.9, 1.1],
              x: [-40, 40, -20, 20],
              y: [-25, 25, -40, 40],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full bg-pink-600/10 blur-[100px]"
            animate={{
              scale: [1.2, 0.9, 1.15, 1],
              x: [30, -30, 40, -40],
              y: [40, -40, -20, 20],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Golden Grid Overlay for depth perspective */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

          {/* Main 3D Card Container */}
          <motion.div
            id="splash-3d-card"
            className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border border-white/5 bg-neutral-950/40 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.15)]"
            initial={{ 
              opacity: 0, 
              scale: 0.6,
              rotateX: 45,
              rotateY: -35,
              z: -200
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotateX: 0,
              rotateY: 0,
              z: 0
            }}
            transition={{ 
              type: "spring",
              stiffness: 70,
              damping: 15,
              mass: 1.2,
              duration: 1
            }}
          >
            {/* Reflective shine element sweeping across */}
            <motion.div 
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ delay: 0.2, duration: 1.2, ease: "easeInOut" }}
            />

            {/* Sparkle top indicator */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="mb-2 text-purple-400 bg-purple-500/10 p-2.5 rounded-full border border-purple-500/20"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </motion.div>

            {/* Main Brand Typography with 3D shadow depth */}
            <div className="text-center relative select-none">
              <motion.h1 
                className="text-3xl sm:text-5xl font-medium tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                Zawdha
              </motion.h1>

              <motion.div
                className="mt-2.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-400 tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                <span>الوجهة الأولى لتزويد الخدمات الرقمية</span>
              </motion.div>
            </div>

            {/* Premium Gold Frame Accents on Card Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/30 rounded-tl-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-3xl pointer-events-none" />
          </motion.div>

          {/* Interactive touch tilt simulation (Mouse follow effect can be heavy, but custom CSS 3D style completes the look) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
            ZAWDHA PREMIUM • LOADING EXPERIENCE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
