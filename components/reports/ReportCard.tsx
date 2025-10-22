'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  href: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
  delay?: number;
}

export default function ReportCard({
  title,
  description,
  icon: Icon,
  gradient,
  href,
  stats,
  delay = 0,
}: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link
        href={href}
        className="block group"
      >
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {/* Gradient Background */}
          <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5 ${gradient}`} />

          {/* Icon */}
          <div className={`inline-flex items-center justify-center rounded-lg p-3 ${gradient} mb-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>

          {/* Content */}
          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {description}
            </p>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Arrow Icon */}
          <div className="absolute top-6 right-6 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
