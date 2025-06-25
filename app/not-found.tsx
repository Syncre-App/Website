"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <motion.div
        className="w-full max-w-lg bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl p-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
         <FiAlertTriangle className="text-red-500 text-7xl mx-auto mb-4" />
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-x-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300"
        >
            <FiArrowLeft />
            <span>Go back to Home</span>
        </Link>
      </motion.div>
    </div>
  );
}