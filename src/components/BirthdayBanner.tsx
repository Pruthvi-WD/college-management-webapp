/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X, Sparkles, Award } from 'lucide-react';
import { User } from '../types';
import { CURRENT_BIRTHDAY_KEY } from '../data';

interface BirthdayBannerProps {
  user: User;
}

export default function BirthdayBanner({ user }: BirthdayBannerProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isBirthday = user.birthday === CURRENT_BIRTHDAY_KEY;

  if (!isBirthday || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-[#B45309] dark:bg-[#78350F] text-[#FAF8F5] p-4 shadow-sm border-b border-[#FAF8F5]/10 overflow-hidden"
        id="birthday-banner-container"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 border border-[#FAF8F5]/30 bg-[#FAF8F5]/10 rounded-none shrink-0">
              <Gift className="w-5 h-5 text-[#FAF8F5]" id="bday-gift-icon" />
            </div>
            <div>
              <h4 className="font-serif italic text-lg flex items-center gap-2">
                Honoured Birthday Felicitation, {user.name}
              </h4>
              <p className="text-[10px] tracking-wider uppercase text-[#FAF8F5]/90 font-mono mt-1">
                The Academic Senate celebrating your leadership, dedication, and academic brilliance today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 border border-[#FAF8F5]/20 hover:bg-[#FAF8F5]/10 rounded-none transition-colors cursor-pointer"
              aria-label="Dismiss Birthday Banner"
              id="close-birthday-banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
