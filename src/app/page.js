"use client";

import React, { useState, useRef, useEffect } from 'react';
import Slider from '@/components/Slider';
import EnterPage from '@/components/EnterPage';
import { PINTAARA_CONFIG, ENTER_PAGE_CONFIG } from '@/config/slides';
import { safeStorage, safeSessionStorage } from '@/lib/storage';

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [justEntered, setJustEntered] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollToSlideRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      // Explicit enter page trigger: ?enter=1 or ?enter=true
      if (urlParams.get('enter') === '1' || urlParams.get('enter') === 'true') {
        safeStorage.removeItem('pintaara_entered');
        safeSessionStorage.removeItem('pintaara_entered');
        setHasEntered(false);
        return;
      }

      // Disable automatic scroll restoration so page always starts at top
      try {
        window.history.scrollRestoration = 'manual';
      } catch (e) {}

      // If already entered or unlocked via passcode, do not show enter page when going back to home
      const entered =
        safeStorage.getItem('pintaara_entered') === 'true' ||
        safeSessionStorage.getItem('pintaara_entered') === 'true' ||
        safeStorage.getItem('pintaara_unlocked') === '1';

      if (entered) {
        setHasEntered(true);
      }
    }
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setJustEntered(true);
    if (scrollToSlideRef.current) {
      scrollToSlideRef.current(0);
    }
    safeStorage.setItem('pintaara_entered', 'true');
    safeSessionStorage.setItem('pintaara_entered', 'true');
    setTimeout(() => {
      setHasEntered(true);
      setIsExiting(false);
    }, 1100);

    setTimeout(() => {
      setJustEntered(false);
    }, 3200);
  };

  return (
    <>
      {!hasEntered && (
        <EnterPage
          config={ENTER_PAGE_CONFIG}
          onEnter={handleEnter}
          isExiting={isExiting}
        />
      )}
      <Slider
        slidesConfig={PINTAARA_CONFIG.slides}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        scrollToSlideRef={scrollToSlideRef}
        justEntered={justEntered}
      />
    </>
  );
}
