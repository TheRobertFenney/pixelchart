'use client';

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Avatar, AvatarImage, AvatarFallback } from "@/frontend/components/ui/avatar";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import {   
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/frontend/components/ui/navigation-menu";

// Update the gradient class to have smooth animation
const gradientClass = "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient bg-[length:200%_100%]";
const buttonGradientClass = "relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-pink-500 before:animate-gradient before:bg-[length:200%_100%] before:rounded-lg overflow-hidden";

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>
  );
}

function NavSkeleton() {
  return (
    <div className="flex gap-1" role="menubar">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-20 rounded-md" />
      ))}
    </div>
  );
}

function AuthButtonsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-[84px] rounded-lg" />
      <Skeleton className="h-9 w-[84px] rounded-lg" />
    </div>
  );
}

export function Navbar() {
  const { user, isLoaded } = useUser();
  
  return (
    <header className="w-full border-b border-white/10 backdrop-blur-sm bg-[#121212]/80 sticky top-0 z-50">
      <nav 
        className="container mx-auto px-4" 
        role="navigation" 
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link 
            href="/" 
            className="flex-shrink-0 flex items-center gap-2 w-[150px]"
            aria-label="PixelChart Home"
          >
            <Image
              src="/pixelchart.png"
              alt="PixelChart Logo"
              width={32}
              height={32}
              className="rounded h-auto"
              priority
            />
            <span 
              className={`text-xl font-bold ${gradientClass} bg-clip-text text-transparent`}
              aria-hidden="true"
            >
              PixelChart
            </span>
          </Link>

          {/* Navigation */}
          {!isLoaded ? <NavSkeleton /> : (
            <NavigationMenu className="mx-auto">
              <NavigationMenuList className="space-x-1" role="menubar">
                <NavigationMenuItem role="none">
                  <NavigationMenuTrigger 
                    className="min-w-[80px] bg-transparent text-gray-300 hover:text-white hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-white transition-colors cursor-pointer"
                    aria-label="Learn Menu"
                    role="menuitem"
                  >
                    Learn
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#1a1a1a] border border-white/10 rounded-md animate-in fade-in-0 zoom-in-95">
                    <Link 
                      href="/getting-started"
                      className="w-[200px] p-4 hover:bg-white/5 block text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Getting Started
                    </Link>
                    <Link 
                      href="https://spacetimedb.com/docs"
                      className="w-[200px] p-4 hover:bg-white/5 block text-gray-300 hover:text-white transition-colors cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SpacetimeDB Docs
                    </Link>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem role="none">
                  <NavigationMenuTrigger 
                    className="min-w-[80px] bg-transparent text-gray-300 hover:text-white hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-white transition-colors cursor-pointer"
                    aria-label="Resources Menu"
                    role="menuitem"
                  >
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#1a1a1a] border border-white/10 rounded-md animate-in fade-in-0 zoom-in-95">
                    <Link 
                      href="https://github.com/TheRobertFenney/pixelchart"
                      className="w-[200px] p-4 hover:bg-white/5 block text-gray-300 hover:text-white transition-colors cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PixelChart Repo
                    </Link>
                    <Link 
                      href="https://github.com/clockworklabs/SpacetimeDB"
                      className="w-[200px] p-4 hover:bg-white/5 block text-gray-300 hover:text-white transition-colors cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SpacetimeDB Repo
                    </Link>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem role="none">
                  <NavigationMenuTrigger 
                    className="min-w-[80px] bg-transparent text-gray-300 hover:text-white hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-white transition-colors cursor-pointer"
                    aria-label="About Menu"
                    role="menuitem"
                  >
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#1a1a1a] border border-white/10 rounded-md animate-in fade-in-0 zoom-in-95">
                    <Link 
                      href="/about"
                      className="w-[200px] p-4 hover:bg-white/5 block text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      About PixelChart
                    </Link>
                    <Link 
                      href="/how-it-works"
                      className="w-[200px] p-4 hover:bg-white/5 block text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      How It Works
                    </Link>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 w-[180px] justify-end">
            <SignedOut>
              {!isLoaded ? <AuthButtonsSkeleton /> : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <div className="relative group">
                      <div className={`absolute -inset-1 rounded-lg ${gradientClass} opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100`} />
                      <div className={`absolute -inset-1 rounded-lg ${gradientClass} opacity-0 group-hover:opacity-20`} />
                      <button className="relative h-9 w-[84px] text-sm font-medium text-black bg-white hover:bg-white/90 rounded-lg transition-all cursor-pointer">
                        Sign In
                      </button>
                    </div>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <div className="relative group">
                      <div className={`absolute -inset-1 rounded-lg ${gradientClass} opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100`} />
                      <div className={`absolute -inset-1 rounded-lg ${gradientClass} opacity-0 group-hover:opacity-20`} />
                      <button className={`relative h-9 w-[84px] text-sm font-medium text-white ${gradientClass} rounded-lg transition-all cursor-pointer`}>
                        Sign Up
                      </button>
                    </div>
                  </SignUpButton>
                </div>
              )}
            </SignedOut>
            <SignedIn>
              {!isLoaded ? (
                <UserSkeleton />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-white">
                      {user?.fullName || user?.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8",
                        userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-white/20 rounded-full"
                      }
                    }}
                  />
                </div>
              )}
            </SignedIn>
          </div>
        </div>
      </nav>
    </header>
  );
}
