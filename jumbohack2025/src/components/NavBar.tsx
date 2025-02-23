"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { useTheme } from "next-themes";
import { UserButton, useUser } from "@clerk/nextjs";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { isSignedIn } = useUser();

  const navItems = [
    { label: 'Create An Event', href: '/events/create' },
    { label: 'My Events', href: '/events/display'}
  ];

  const protectedNavItems = [
    { label: 'Admin_demo', href: '/admin/send-invitations' },
  ];

  // Combine nav items based on auth state
  const currentNavItems = isSignedIn 
    ? [...navItems, ...protectedNavItems]
    : navItems;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-[#2971AC] dark:[#B2DFFF] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                alt="JumboMap Logo"
                width={140}
                height={40}
                className="h-8 w-auto md:h-12 md:w-auto"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {currentNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white hover:text-gray-200 md:text-lg"
              >
                {item.label}
              </Link>
            ))}
            
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link href="/sign-in">
                <Button variant="ghost" className="text-white hover:text-gray-200">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn(
        "md:hidden",
        isMobileMenuOpen ? "block" : "hidden"
      )}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {currentNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-3 py-2 text-white hover:text-gray-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {isSignedIn ? (
            <div className="px-3 py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="block px-3 py-2 text-white hover:text-gray-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;