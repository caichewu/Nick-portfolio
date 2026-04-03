// 文件路径: d:\zhuomian\geren\geren-website\src\components\FadeInWhenVisible.jsx

import React from "react";
import { motion } from "framer-motion";

const FadeInWhenVisible = ({ children, delay = 0, duration = 0.5, y = 20 }) => {
  const MotionDiv = motion.div;
  return (
    <MotionDiv
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </MotionDiv>
  );
};

export default FadeInWhenVisible;
