"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const AnimatedSection = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.section>
);
