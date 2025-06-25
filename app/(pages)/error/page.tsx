"use client";

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

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
        <FiAlertTriangle className="text-red-500 text-7xl mx-auto mb-4" />
        <h1 className="text-3xl font-semibold mb-4">Hiba történt</h1>
        <p className="text-gray-300 mb-8 break-words">
          {errorMessage}
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-x-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300"
        >
            <FiArrowLeft />
            <span>Vissza a főoldalra</span>
        </Link>
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