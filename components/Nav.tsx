'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getProfile, StudentProfile } from '@/lib/storage';
import { Brain, LayoutDashboard, PenTool, MessageSquare, Compass, User, Moon, Sun } from 'lucide-react';

export default function Nav() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Monitor profile status changes via event dispatching or simple intervals/effects
  useEffect(() => {
    const checkProfile = () => {
      const p = getProfile();
      setProfile(p);
    };

    checkProfile();
    // Add custom event listener for profile updates
    window.addEventListener('profileUpdated', checkProfile);
    return () => {
      window.removeEventListener('profileUpdated', checkProfile);
    };
  }, [pathname]);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/journal', label: 'Daily Journal', icon: PenTool },
    { href: '/chat', label: 'Companion Chat', icon: MessageSquare },
    { href: '/mindfulness', label: 'Mindfulness', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7ec8a4] to-[#b8a9d9] shadow-lg shadow-[#7ec8a4]/10 transition-transform group-hover:scale-105">
            <Brain className="h-5.5 w-5.5 text-[#0a0f1e]" />
          </div>
          <span className="serif-display text-xl font-bold tracking-wide text-white transition-colors group-hover:text-[#7ec8a4]">
            Serenity
          </span>
        </Link>

        {/* Navigation Links */}
        {profile && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#7ec8a4]/10 text-[#7ec8a4] border border-[#7ec8a4]/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Profile indicator & Mobile Nav */}
        <div className="flex items-center gap-3">
          {profile ? (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5">
              <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#b8a9d9]/20">
                <User className="h-3.5 w-3.5 text-[#b8a9d9]" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold leading-none text-slate-200">{profile.name}</p>
                <p className="text-[10px] leading-none text-[#7ec8a4] mt-0.5">{profile.examType}</p>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic hidden sm:inline">Aspirant Wellness Hub</span>
          )}
        </div>
      </div>

      {/* Mobile navigation bottom bar for quick access */}
      {profile && (
        <nav className="flex md:hidden items-center justify-around border-t border-white/5 bg-[#0a0f1e]/90 backdrop-blur-lg px-2 py-2.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  isActive ? 'text-[#7ec8a4]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
