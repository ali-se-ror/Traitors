import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SuspicionBarProps {
  percentage: number;
  delay?: number;
}

export function SuspicionBar({ percentage, delay = 0 }: SuspicionBarProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="bg-background rounded-lg p-2">
      <motion.div 
        className="suspicion-bar h-3 rounded-md"
        initial={{ width: "0%" }}
        animate={{ width: `${animatedPercentage}%` }}
        transition={{ 
          duration: 1,
          ease: "easeOut",
          delay: delay
        }}
        data-testid="suspicion-bar"
      />
    </div>
  );
}
