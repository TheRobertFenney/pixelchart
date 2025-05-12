'use client';

import { Zap, Shield, Cpu, Network } from 'lucide-react';
import { Ticker } from './ticker';

export function ProjectDescription() {
  return (
    <>
      {/* Project Description Gradient */}
      <div className="h-24 bg-gradient-to-b from-[#151515] from-0% via-[#181818] via-50% to-[#1a1a1a] to-100%" />
      <section className="bg-[#1a1a1a]">
        <Ticker />
        
        <div className="container mx-auto px-4 max-w-6xl py-8 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            {/* Top Left - Project Description */}
            <div className="flex flex-col justify-center">
              <div className="max-w-lg mx-auto md:mx-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight text-center md:text-left">
                  Real-Time Pixel Canvas
                </h2>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed text-center md:text-left">
                  A simple tech demo showcasing SpacetimeDB's real-time capabilities. 
                  Place pixels, watch others do the same, and see how effortlessly 
                  everything stays in sync.
                </p>
              </div>
            </div>

            {/* Top Right - Features */}
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col items-center bg-white/5 rounded-lg p-4 hover:bg-white/10 hover:scale-105 transition-all duration-300" aria-label="Real-Time Sync Feature">
                  <Zap className="w-8 h-8 text-green-400 mb-2" strokeWidth={2} />
                  <span className="text-sm font-medium text-white text-center">Real-Time Sync</span>
                </div>
                <div className="flex flex-col items-center bg-white/5 rounded-lg p-4 hover:bg-white/10 hover:scale-105 transition-all duration-300" aria-label="Global State Feature">
                  <Network className="w-8 h-8 text-blue-400 mb-2" strokeWidth={2} />
                  <span className="text-sm font-medium text-white text-center">Global State</span>
                </div>
                <div className="flex flex-col items-center bg-white/5 rounded-lg p-4 hover:bg-white/10 hover:scale-105 transition-all duration-300" aria-label="Conflict Free Feature">
                  <Shield className="w-8 h-8 text-purple-400 mb-2" strokeWidth={2} />
                  <span className="text-sm font-medium text-white text-center">Conflict Free</span>
                </div>
                <div className="flex flex-col items-center bg-white/5 rounded-lg p-4 hover:bg-white/10 hover:scale-105 transition-all duration-300" aria-label="Edge Computing Feature">
                  <Cpu className="w-8 h-8 text-pink-400 mb-2" strokeWidth={2} />
                  <span className="text-sm font-medium text-white text-center">Edge Computing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 