'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-blob rounded-full bg-orange-400/20 blur-3xl"></div>
        <div className="animation-delay-2000 absolute right-1/4 top-1/3 h-96 w-96 animate-blob rounded-full bg-orange-500/15 blur-3xl"></div>
        <div className="animation-delay-4000 absolute bottom-1/4 left-1/3 h-96 w-96 animate-blob rounded-full bg-orange-300/25 blur-3xl"></div>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-24">
        <div className="w-full max-w-6xl">
          {/* Main content */}
          <div className="animate-fade-in space-y-6 md:space-y-10">
            {/* Logo/Brand - Professional glass card like login page */}
            <div className="flex justify-center">
              <div className="relative inline-block">
                {/* Glowing backdrop */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#5CBBF6]/20 to-[#FF9933]/20 rounded-2xl blur-2xl"
                  style={{ transform: 'scale(1.2)' }}
                />
                {/* Premium glass card for logo */}
                <div
                  className="relative px-8 py-6 md:px-12 md:py-8 rounded-2xl md:rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <img
                    src="/sabpaisa-logo.png"
                    alt="SabPaisa"
                    decoding="async"
                    width="320"
                    height="80"
                    className="h-12 md:h-16 lg:h-20 w-auto relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Welcome message */}
            <div className="space-y-4 md:space-y-6 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl leading-[1.1]" style={{ letterSpacing: '-0.02em' }}>
                Welcome to{' '}
                <span className="bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] bg-clip-text text-transparent">
                  modern
                </span>
                {' '}
                <span className="bg-gradient-to-r from-[#FF9933] to-[#FF7A00] bg-clip-text text-transparent">
                  payments
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl lg:text-2xl leading-relaxed font-light" style={{ letterSpacing: '-0.01em' }}>
                Experience the next generation of payment processing with unmatched security and simplicity.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center items-center pt-6 md:pt-8">
              <Link href="/login">
                <button
                  className="min-h-[52px] w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] text-white rounded-2xl font-semibold text-base md:text-lg shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  style={{
                    boxShadow: '0 20px 40px -10px rgba(92, 187, 246, 0.5), 0 4px 14px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Get Started →
                </button>
              </Link>
              <Link href="/dashboard">
                <button
                  className="min-h-[52px] w-full sm:w-auto px-10 py-4 bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-gray-300 rounded-2xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl hover:border-[#5CBBF6] hover:text-[#5CBBF6] hover:bg-white transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  View Dashboard
                </button>
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid gap-4 md:gap-6 pt-8 md:pt-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200 p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-[#5CBBF6]/5 to-transparent rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#5CBBF6]/10 to-[#5CBBF6]/5">
                    <svg
                      className="h-6 w-6 text-[#5CBBF6]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg md:text-xl font-semibold text-gray-900">
                    Lightning Fast
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    Built with Next.js 14 and optimized for exceptional performance
                  </p>
                </div>
              </div>

              <div className="group relative rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200 p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933]/5 to-transparent rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9933]/10 to-[#FF9933]/5">
                    <svg
                      className="h-6 w-6 text-[#FF9933]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg md:text-xl font-semibold text-gray-900">
                    Mobile First
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    Responsive design optimized for mobile devices and tablets
                  </p>
                </div>
              </div>

              <div className="group relative rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200 p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-900/10 to-gray-900/5">
                    <svg
                      className="h-6 w-6 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg md:text-xl font-semibold text-gray-900">
                    Secure & Type-Safe
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    Built with TypeScript and modern security best practices
                  </p>
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="pt-6 md:pt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 md:gap-3 rounded-full border-2 border-green-500 bg-white shadow-lg px-4 md:px-6 py-2.5 md:py-3">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                <span className="text-sm md:text-base font-semibold text-gray-900">System Online & Ready</span>
              </div>
            </div>

            {/* Tech stack badge */}
            <div className="pt-4 md:pt-6 flex justify-center">
              <div className="inline-flex flex-wrap justify-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600 font-medium">
                <span className="px-3 py-1.5 bg-white/80 backdrop-blur-xl rounded-full border border-gray-200">Next.js 14</span>
                <span className="px-3 py-1.5 bg-white/80 backdrop-blur-xl rounded-full border border-gray-200">React 18</span>
                <span className="px-3 py-1.5 bg-white/80 backdrop-blur-xl rounded-full border border-gray-200">TypeScript 5</span>
                <span className="px-3 py-1.5 bg-white/80 backdrop-blur-xl rounded-full border border-gray-200">Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
