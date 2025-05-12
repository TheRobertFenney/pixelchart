'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export function Ticker() {
  const [contentWidth, setContentWidth] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(4); // Default count
  const contentRef = useRef(null);
  const SPACING = 128;

  useEffect(() => {
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth;
      setContentWidth(width);
      // Calculate duplicates needed based on viewport width
      const count = Math.ceil(window.innerWidth / (width || 1)) + 1;
      setDuplicateCount(count);
    }
  }, []);

  const tickerContent = (
    <div className="flex items-center" style={{ padding: `0 ${SPACING/2}px` }}>
      <Image
        src="/next.svg"
        alt="Next.js Logo"
        width={120}
        height={30}
        className="h-[30px] w-auto object-contain invert"
      />
      <Image
        src="/spacetimeDB.svg"
        alt="SpacetimeDB Logo"
        width={476}
        height={120}
        className="h-[52px] w-auto object-contain ml-[128px]"
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-xl text-white-400">Powered by</h3>
      <div className="bg-[#232323] py-4 border-y border-white/5 relative w-full">
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-[#232323] to-transparent z-10" />
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[#232323] to-transparent z-10" />
        <div className="overflow-hidden relative">
          <div className="ticker-container whitespace-nowrap">
            <div ref={contentRef} className="ticker-content inline-flex">
              {[...Array(duplicateCount)].map((_, i) => (
                <div key={i} className="ticker-item inline-flex min-w-max">
                  {tickerContent}
                </div>
              ))}
            </div>
            <div className="ticker-content inline-flex" aria-hidden="true">
              {[...Array(duplicateCount)].map((_, i) => (
                <div key={`dup-${i}`} className="ticker-item inline-flex min-w-max">
                  {tickerContent}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ticker-container {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
        }

        .ticker-content {
          display: inline-flex;
          animation: ticker 40s linear infinite;
          will-change: transform;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-content {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
} 