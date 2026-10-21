"use client";

import React, { useState, useRef, useEffect } from 'react';
import Slider from '@/components/Slider';
import EnterPage from '@/components/EnterPage';
import { PINTAARA_CONFIG, ENTER_PAGE_CONFIG } from '@/config/slides';
import { safeSessionStorage } from '@/lib/storage';

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
        safeSessionStorage.removeItem('pintaara_entered');
        setHasEntered(false);
        return;
      }

      // If user refreshes (F5), show enter page for immediate testing
      let isReload = false;
      try {
        const navEntries = performance.getEntriesByType('navigation');
        isReload = navEntries.length > 0 && navEntries[0].type === 'reload';
      } catch (e) {
        // performance API not available in some sandboxed environments
      }
      if (isReload) {
        safeSessionStorage.removeItem('pintaara_entered');
        setHasEntered(false);
        return;
      }

      // Disable automatic scroll restoration so page always starts at top
      try {
        window.history.scrollRestoration = 'manual';
      } catch (e) {}

      // If already entered in this session (e.g. returning from subpages)
      if (safeSessionStorage.getItem('pintaara_entered') === 'true') {
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
