"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Slider from '@/components/Slider';
import EnterPage from '@/components/EnterPage';
import { PINTAARA_CONFIG, ENTER_PAGE_CONFIG } from '@/config/slides';
import { safeStorage, safeSessionStorage } from '@/lib/storage';
import api from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [justEntered, setJustEntered] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollToSlideRef = useRef(null);

  const triggerEnterTransition = () => {
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

  useEffect(() => {
    const handleUnlocked = () => {
      triggerEnterTransition();
    };

    window.addEventListener("pintaara_unlocked", handleUnlocked);
    return () => window.removeEventListener("pintaara_unlocked", handleUnlocked);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      // Explicit enter page trigger: ?enter=1 or ?enter=true
      if (urlParams.get('enter') === '1' || urlParams.get('enter') === 'true') {
        safeSessionStorage.removeItem('pintaara_entered');
        safeStorage.removeItem('pintaara_entered');
        setHasEntered(false);
        return;
      }

      // Disable automatic scroll restoration so page always starts at top
      try {
        window.history.scrollRestoration = 'manual';
      } catch (e) {}

      // Once user entered password, NEVER show the Enter page again
      const isUnlocked =
        safeStorage.getItem("pintaara_unlocked") === "1" &&
        Number(safeStorage.getItem("pintaara_unlocked_expires_at") || "0") > Date.now();

      const entered =
        safeSessionStorage.getItem('pintaara_entered') === 'true' ||
        safeStorage.getItem('pintaara_entered') === 'true';

      if (isUnlocked || entered) {
        setHasEntered(true);
      }
    }
  }, []);

  const handleEnter = async () => {
    try {
      const statusRes = await api.getStorefrontPasscodeStatus();
      if (statusRes && statusRes.enabled === false) {
        safeStorage.setItem("pintaara_unlocked", "1");
        triggerEnterTransition();
        return;
      }
    } catch (e) {}

    const unlocked = safeStorage.getItem("pintaara_unlocked");
    const expiresAt = Number(safeStorage.getItem("pintaara_unlocked_expires_at") || "0");
    const isUnlocked = unlocked === "1" && expiresAt > Date.now();

    if (!isUnlocked) {
      router.push("/password");
      return;
    }

    triggerEnterTransition();
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
