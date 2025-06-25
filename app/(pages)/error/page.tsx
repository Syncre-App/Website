"use client";

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

function ErrorDisplay() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error') || 'Ismeretlen hiba történt.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <motion.div 
        className="w-full max-w-lg bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl p-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-5xl font-bold mb-3">Error</h1>
        <div className="w-24 h-1 bg-white rounded-full mx-auto mb-8"></div>
        
        <p className="text-lg text-gray-300">{errorMessage}</p>
      </motion.div>
    </div>
  );
}

const ErrorPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ErrorDisplay />
    </Suspense>
  );
};

export default ErrorPage;