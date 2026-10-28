/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, ArrowRight, Shield, BookOpen, Users, Compass, Calendar, Award } from 'lucide-react';
import { UserRole } from '../types';

interface CommandMenuProps {
  onNavigate: (tabId: string) => void;
  onRoleSwitch: (role: UserRole) => void;
  currentRole: UserRole;
  availableTabs: { id: string; label: string; icon: React.ReactNode }[];
  isAdmin: boolean;
}

export default function CommandMenu({ onNavigate, onRoleSwitch, currentRole, availableTabs, isAdmin }: CommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // List of all possible commands
  const allCommands = [
    // Navigation Tabs based on role
    ...availableTabs.map((tab) => ({
      id: `tab-${tab.id}`,
      title: `Go to ${tab.label}`,
      category: 'Navigation',
      action: () => onNavigate(tab.id),
      icon: <Compass className="w-4 h-4 text-indigo-400" />
    })),
    // Role Switching (Restricted to admins only)
    ...(isAdmin ? [
      {
        id: 'role-admin',
        title: 'Switch to Super Admin Portal',
        category: 'System Roles',
        action: () => onRoleSwitch('admin'),
        icon: <Shield className="w-4 h-4 text-rose-400" />
      },
      {
        id: 'role-staff',
        title: 'Switch to Staff / Professor Portal',
        category: 'System Roles',
        action: () => onRoleSwitch('staff'),
        icon: <Users className="w-4 h-4 text-emerald-400" />
      },
      {
        id: 'role-student',
        title: 'Switch to Student Portal',
        category: 'System Roles',
        action: () => onRoleSwitch('student'),
        icon: <Award className="w-4 h-4 text-amber-400" />
      },
      {
        id: 'role-parent',
        title: 'Switch to Parent Portal',
        category: 'System Roles',
        action: () => onRoleSwitch('parent'),
        icon: <BookOpen className="w-4 h-4 text-sky-400" />
      }
    ] : []),
    // Quick Actions
    {
      id: 'action-theme',
      title: 'Toggle Color Theme (Dark / Light)',
      category: 'Preferences',
      action: () => {
        const doc = document.documentElement;
        if (doc.classList.contains('dark')) {
          doc.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        } else {
          doc.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        }
        // dispatch custom event to update App.tsx state
        window.dispatchEvent(new Event('theme-change'));
      },
      icon: <Terminal className="w-4 h-4 text-gray-400" />
    }
  ];

  const filteredCommands = allCommands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Quick Search Shortcut Bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-full md:w-64 px-3 py-1.5 text-xs text-[#5C6B73] dark:text-[#90A4AE] bg-[#F4F8FA] dark:bg-[#05111D] hover:bg-[#D3E1ED] dark:hover:bg-[#0A1C2C] rounded-none border border-[#CADBE8] dark:border-[#0D1C29] transition-all outline-hidden cursor-pointer"
        id="omni-search-trigger"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#0F5B8F] dark:text-[#38BDF8]" />
          <span className="font-mono">Search command menu...</span>
        </div>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#F4F8FA] dark:bg-[#05111D] border border-[#CADBE8] dark:border-[#0D1C29] rounded-none shadow-xs">
          ⌘K
        </kbd>
      </button>

      {/* Floating Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" id="omni-search-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg bg-[#F4F8FA] dark:bg-[#05111D] border border-[#CADBE8] dark:border-[#0D1C29] rounded-none shadow-2xl overflow-hidden mx-4"
            >
              {/* Search input header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#CADBE8] dark:border-[#0D1C29]">
                <Search className="w-5 h-5 text-[#0F5B8F] dark:text-[#38BDF8] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or jump to page..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm text-[#1E2022] dark:text-white bg-transparent border-0 outline-hidden focus:ring-0 placeholder-[#A19B8E]"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-mono text-[#5C6B73] dark:text-[#90A4AE] bg-[#F4F8FA] dark:bg-[#05111D] px-1.5 py-0.5 rounded-none border border-[#CADBE8] dark:border-[#0D1C29]"
                >
                  ESC
                </button>
              </div>

              {/* Commands List */}
              <div className="max-h-[350px] overflow-y-auto p-2" id="omni-search-results">
                {filteredCommands.length > 0 ? (
                  (() => {
                    // Group commands by category
                    const categories = Array.from(new Set(filteredCommands.map((c) => c.category)));
                    return categories.map((cat) => (
                      <div key={cat} className="mb-2">
                        <div className="text-[10px] font-bold text-[#5C6B73] dark:text-[#90A4AE] tracking-wider uppercase px-3 py-1">
                          {cat}
                        </div>
                        <div className="space-y-0.5 mt-1">
                          {filteredCommands
                              .filter((c) => c.category === cat)
                              .map((cmd) => (
                                <button
                                  key={cmd.id}
                                  onClick={() => {
                                    cmd.action();
                                    setIsOpen(false);
                                    setSearch('');
                                  }}
                                  className="flex items-center justify-between w-full text-left px-3 py-2 text-xs rounded-none text-[#1E2022] dark:text-white hover:bg-[#D3E1ED] dark:hover:bg-[#0A1C2C]/80 hover:text-[#0F5B8F] dark:hover:text-[#38BDF8] transition-colors group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {cmd.icon}
                                    <span>{cmd.title}</span>
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#5C6B73] group-hover:text-[#0F5B8F] dark:group-hover:text-[#38BDF8] transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                                </button>
                              ))}
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <div className="text-center py-6 text-xs text-[#5C6B73] dark:text-[#90A4AE]">
                    No matching commands or portals found. Try searching "Switch" or "Go to".
                  </div>
                )}
              </div>

              {/* Keyboard Footer */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#D3E1ED] dark:bg-[#05111D] border-t border-[#CADBE8] dark:border-[#0D1C29] text-[10px] text-[#5C6B73] dark:text-[#90A4AE]">
                <div className="flex items-center gap-2">
                  <span>Press <kbd className="font-mono bg-white dark:bg-[#05111D] border px-1 rounded-none shadow-2xs">⇅</kbd> to navigate</span>
                  <span>•</span>
                  <span><kbd className="font-mono bg-white dark:bg-[#05111D] border px-1 rounded-none shadow-2xs">↵</kbd> to select</span>
                </div>
                <div className="font-medium">
                  Active role: <span className="capitalize text-[#0F5B8F] dark:text-[#38BDF8] font-semibold">{currentRole}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
