import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  blur?: boolean;
  scale?: boolean;
  staggerChildren?: number;
  className?: string;
  id?: string;
  key?: React.Key;
}

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 35,
  blur = true,
  scale = true,
  staggerChildren = 0,
  className = "",
  id,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Trigger transition when element is 80px inside the viewport
  const isInView = useInView(ref, { once: true, margin: "-80px 0px -80px 0px" });

  // Safely detect reduced motion to adhere to accessibility guidelines
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false;

  if (prefersReducedMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  // Directional transformations
  const getDirectionOffset = () => {
    switch (direction) {
      case "up": return { y: distance };
      case "down": return { y: -distance };
      case "left": return { x: distance };
      case "right": return { x: -distance };
      default: return {};
    }
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...getDirectionOffset(),
      ...(scale ? { scale: 0.95 } : {}),
      ...(blur ? { filter: "blur(10px)" } : {}),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: duration,
        delay: delay,
        // Apple/Linear style custom Cubic Bezier curve (easeOutExpo equivalent for premium response)
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: staggerChildren,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      id={id}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
