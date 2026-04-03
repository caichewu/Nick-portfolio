import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingTexts = [
  "Initializing system...",
  "Loading modules...",
  "Decompressing assets...",
  "Establishing connection...",
  "Authenticating user...",
  "Welcome, user_2077"
];

const GooeyBall = ({ className }) => (
  <div className={`absolute top-0 w-24 h-24 rounded-full ${className}`}>
    <div className="absolute inset-0 rounded-full bg-cyber-green"></div>
    <div className="absolute inset-4 rounded-full bg-green-200 opacity-80 blur-lg"></div>
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/30 rounded-full blur-md"></div>
  </div>
);

const InteractiveSplash = ({ onEntered }) => {
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const MotionDiv = motion.div;

  useEffect(() => {
    if (loadingIndex < loadingTexts.length - 1) {
      const timeout = setTimeout(() => {
        setLoadingIndex(loadingIndex + 1);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      const finalTimeout = setTimeout(() => {
        setIsLoaded(true);
      }, 500);
      return () => clearTimeout(finalTimeout);
    }
  }, [loadingIndex]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onEntered();
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 text-white font-mono">
      <AnimatePresence>
        {!isLoaded ? (
          <MotionDiv
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-2xl text-green-400"
          >
            {loadingTexts[loadingIndex]}
          </MotionDiv>
        ) : (
          <MotionDiv
            key="drag-prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-3xl mb-8 text-gray-400">HOLD & DRAG TO ENTER</h2>
            
            <div className="relative w-64 h-24" style={{ filter: 'url(#gooey-effect)' }}>
              <GooeyBall className="left-0 animate-pulse-glow" />
              
              <MotionDiv
                drag="x"
                dragConstraints={{ left: 0, right: 130 }}
                onDragEnd={handleDragEnd}
                className="absolute left-0 top-0 w-24 h-24 rounded-full cursor-grab active:cursor-grabbing"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <GooeyBall />
              </MotionDiv>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveSplash;
