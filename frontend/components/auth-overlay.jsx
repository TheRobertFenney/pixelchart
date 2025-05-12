'use client';

import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, SignedOut } from '@clerk/nextjs';

export function AuthOverlay({ className, children }) {
  return (
    <SignedOut>
      <div className={cn(
        "absolute inset-0 backdrop-blur-[1px] bg-black/10 z-40",
        "flex flex-col items-center justify-center gap-4",
        "text-white text-center p-6",
        className
      )}>
        <h3 className="text-xl font-semibold">Sign in to Draw</h3>
        <p className="text-sm text-gray-200">Create an account or sign in to start drawing</p>
        <div className="flex gap-4">
          <SignInButton mode="modal">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100" />
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20" />
              <button className="relative px-6 py-2 bg-white text-black font-medium rounded-lg transition-all cursor-pointer">
                Sign In
              </button>
            </div>
          </SignInButton>
          <SignUpButton mode="modal">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100" />
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20" />
              <button className="relative px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium rounded-lg transition-all cursor-pointer">
                Sign Up
              </button>
            </div>
          </SignUpButton>
        </div>
      </div>
    </SignedOut>
  );
} 