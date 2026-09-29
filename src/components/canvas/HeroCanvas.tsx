"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowDown } from "lucide-react";

interface HeroCanvasProps {
  totalFrames?: number;
  framePrefix?: string;
  frameExtension?: string;
}

export function HeroCanvas({
  totalFrames = 120,
  framePrefix = "/frames/ezgif-frame-",
  frameExtension = ".jpg",
}: HeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const rafIdRef = useRef<number | null>(null);
  const currentFrameRef = useRef<number>(1);
  const isRenderingRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Helper to format frame path with 3-digit padding (e.g. 001, 042, 120)
  const getFramePath = useCallback(
    (index: number) => {
      const padded = String(index).padStart(3, "0");
      return `${framePrefix}${padded}${frameExtension}`;
    },
    [framePrefix, frameExtension]
  );

  // Draw a specific frame to canvas with aspect-ratio-preserving cover logic
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current.get(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Cover fit calculation
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Subtle luxury dark vignette overlay for typography legibility
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.3,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.8
    );
    gradient.addColorStop(0, "rgba(28, 20, 13, 0.2)");
    gradient.addColorStop(1, "rgba(28, 20, 13, 0.7)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }, []);

  // 1. Initial Setup: Check reduced motion & preload initial frame
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);

    // Always load frame 1 immediately
    const firstImg = new Image();
    firstImg.decoding = "async";
    firstImg.src = getFramePath(1);
    firstImg.onload = () => {
      imagesRef.current.set(1, firstImg);
      drawFrame(1);
      setIsLoading(false);
    };

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [drawFrame, getFramePath]);

  // 2. Preload frame sequence with mobile optimization
  useEffect(() => {
    if (isReducedMotion) return;

    let isMounted = true;
    const isMobile = window.innerWidth < 640;
    // On mobile: load every 2nd frame to halve network payload and GPU memory
    const step = isMobile ? 2 : 1;

    const frameIndices: number[] = [];
    for (let i = 1; i <= totalFrames; i += step) {
      frameIndices.push(i);
    }
    // Ensure final frame is included
    if (!frameIndices.includes(totalFrames)) {
      frameIndices.push(totalFrames);
    }

    let loadedCount = 0;
    const totalToLoad = frameIndices.length;

    frameIndices.forEach((frameIdx) => {
      if (imagesRef.current.has(frameIdx)) {
        loadedCount++;
        return;
      }

      const img = new Image();
      img.decoding = "async";
      img.src = getFramePath(frameIdx);

      img.onload = () => {
        if (!isMounted) return;
        imagesRef.current.set(frameIdx, img);
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / totalToLoad) * 100));

        // If this matches the current required frame, draw it immediately
        if (currentFrameRef.current === frameIdx) {
          drawFrame(frameIdx);
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [isReducedMotion, totalFrames, getFramePath, drawFrame]);

  // 3. Scroll position → animation frame via requestAnimationFrame
  useEffect(() => {
    if (isReducedMotion) return;

    const handleScroll = () => {
      if (!containerRef.current || isRenderingRef.current) return;

      isRenderingRef.current = true;

      rafIdRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) {
          isRenderingRef.current = false;
          return;
        }

        const rect = container.getBoundingClientRect();
        const scrollDistance = rect.height - window.innerHeight;

        if (scrollDistance <= 0) {
          isRenderingRef.current = false;
          return;
        }

        const currentOffset = -rect.top;
        const progress = Math.min(1, Math.max(0, currentOffset / scrollDistance));
        setScrollProgress(progress);

        // Map progress to frame index [1 .. totalFrames]
        const targetFrame = Math.min(
          totalFrames,
          Math.max(1, Math.floor(progress * (totalFrames - 1)) + 1)
        );

        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          // Find exact or closest available loaded frame (supports mobile downsampling)
          let frameToDraw = targetFrame;
          if (!imagesRef.current.has(frameToDraw)) {
            // Pick closest loaded neighbor
            let closest = 1;
            let minDiff = Infinity;
            imagesRef.current.forEach((_, key) => {
              const diff = Math.abs(key - targetFrame);
              if (diff < minDiff) {
                minDiff = diff;
                closest = key;
              }
            });
            frameToDraw = closest;
          }
          drawFrame(frameToDraw);
        }

        isRenderingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isReducedMotion, totalFrames, drawFrame]);

  // Redraw on window resize
  useEffect(() => {
    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Calculate text panel opacities based on scroll progress
  // Panel 1: 0% - 30%
  const panel1Opacity = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.1) * 5));
  // Panel 2: 35% - 65%
  const panel2Opacity =
    scrollProgress >= 0.25 && scrollProgress <= 0.7
      ? Math.sin(((scrollProgress - 0.25) / 0.45) * Math.PI)
      : 0;
  // Panel 3: 70% - 100%
  const panel3Opacity = Math.max(0, Math.min(1, (scrollProgress - 0.65) * 4));

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isReducedMotion ? "h-screen" : "h-[260vh]"} bg-[#1C140D]`}
      aria-label="Artisanal chocolate crafting visual journey"
    >
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />

        {/* Fallback Static Visual for Reduced Motion */}
        {isReducedMotion && (
          <div className="absolute inset-0 bg-[#1C140D]/40 backdrop-blur-xs flex items-center justify-center pointer-events-none" />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#1C140D] flex flex-col items-center justify-center text-center p-6 z-20 transition-opacity duration-500">
            <Sparkles className="w-8 h-8 text-[#D4A853] animate-spin mb-4" />
            <h3 className="font-serif text-2xl font-bold text-[#F5EDE4] mb-1">
              Chocobliss by Tasnim
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#E8DCCF]/70 font-semibold mb-3">
              Preparing Artisanal Craft Journey...
            </p>
            {loadProgress > 0 && (
              <div className="w-48 bg-[#634E3F]/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D4A853] h-full transition-all duration-200 rounded-full"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Text Story Panels Overlaid on the Canvas */}

        {/* PANEL 1: Brand Introduction (Initial View) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none transition-opacity duration-300"
          style={{ opacity: isReducedMotion ? 1 : panel1Opacity }}
        >
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C140D]/80 border border-[#D4A853]/40 text-xs font-semibold text-[#D4A853] tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Artisanal Small-Batch Confectionery</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-[#F5EDE4] tracking-tight leading-[1.1] drop-shadow-md">
              Chocobliss
              <span className="block text-xl sm:text-2xl font-sans tracking-[0.25em] text-[#D4A853] uppercase font-semibold mt-2">
                By Tasnim
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#F5EDE4]/90 max-w-xl mx-auto font-light leading-relaxed drop-shadow-xs">
              Handcrafted, single-origin chocolate bars and velvet truffles crafted with rare terroir beans.
            </p>

            {!isReducedMotion && (
              <div className="pt-8 flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-[#D4A853] font-semibold animate-bounce">
                <span>Scroll to Witness the Craft</span>
                <ArrowDown className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* PANEL 2: The Sourcing Story (Mid Scroll) */}
        {!isReducedMotion && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none transition-opacity duration-300"
            style={{ opacity: panel2Opacity }}
          >
            <div className="max-w-2xl space-y-4 bg-[#1C140D]/60 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-[#E8DCCF]/20 shadow-2xl">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4A853] font-bold block">
                Ethical Terroir & Micro-Roasting
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F5EDE4] leading-tight">
                Single-Origin Purity
              </h2>
              <p className="text-sm sm:text-base text-[#E8DCCF]/90 leading-relaxed font-light">
                Directly sourced from Madagascar, Ecuador, and Colombia. Stone-ground for 72 hours to awaken natural floral nuances and raspberry brightness.
              </p>
            </div>
          </div>
        )}

        {/* PANEL 3: Call to Action (Final Scroll Position) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 ${
            isReducedMotion ? "hidden" : ""
          } transition-opacity duration-300 ${panel3Opacity > 0.4 ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ opacity: isReducedMotion ? 0 : panel3Opacity }}
        >
          <div className="max-w-2xl space-y-6 bg-[#1C140D]/75 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-[#D4A853]/30 shadow-2xl">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4A853] font-bold block">
              Tempered to Perfection
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F5EDE4] leading-tight">
              Ready to Experience Chocobliss?
            </h2>
            <p className="text-sm sm:text-base text-[#E8DCCF]/90 max-w-lg mx-auto leading-relaxed">
              Explore our fresh seasonal batches, silky ganache collections, and gift sets curated by Tasnim.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Shop The Boutique <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/story"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#D4A853]/60 bg-[#1C140D]/80 hover:bg-[#1C140D] text-[#F5EDE4] rounded-full text-sm font-semibold transition-all"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
