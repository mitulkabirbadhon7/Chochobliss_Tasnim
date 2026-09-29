"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

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

  // Draw frame to canvas edge-to-edge without letterbox borders
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

    if (width === 0 || height === 0) return;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Edge-to-edge cover fit: fills full screen with no side borders
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Subtle luxury dark vignette overlay for depth
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.85
    );
    gradient.addColorStop(0, "rgba(28, 20, 13, 0.1)");
    gradient.addColorStop(1, "rgba(28, 20, 13, 0.65)");
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

  // 3. Scroll position -> animation frame via requestAnimationFrame
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

  // Opacities:
  // Title at the start fades out as user scrolls
  const titleOpacity = Math.max(0, Math.min(1, 1 - scrollProgress * 3.5));
  // Shop Now button at the end of animation fades in
  const shopNowOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.72) * 3.6));

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isReducedMotion ? "h-screen" : "h-[260vh]"} bg-[#1C140D]`}
      aria-label="Artisanal chocolate crafting visual journey"
    >
      {/* Sticky Canvas Container: full viewport edge-to-edge */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block object-cover"
          aria-hidden="true"
        />

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

        {/* 1. START OVERLAY: Only "Chocobliss by Tasnim" in front of animation */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none transition-opacity duration-300 z-10"
          style={{ opacity: isReducedMotion ? 1 : titleOpacity }}
        >
          <div className="max-w-4xl">
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-[#F5EDE4] tracking-tight leading-[1.05] drop-shadow-2xl select-none">
              Chocobliss
              <span className="block text-base sm:text-xl md:text-2xl font-sans tracking-[0.28em] text-[#D4A853] uppercase font-medium mt-3 sm:mt-4">
                by Tasnim
              </span>
            </h1>
          </div>
        </div>

        {/* 2. END OF ANIMATION OVERLAY: "Shop Now" button (positioned lower) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-opacity duration-500 z-20 ${
            scrollProgress > 0.7 ? "pointer-events-auto" : "pointer-events-none"
          }`}
          style={{
            opacity: isReducedMotion ? 1 : shopNowOpacity,
          }}
        >
          <div className="transform translate-y-28 sm:translate-y-36">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-full text-base sm:text-lg font-semibold tracking-wide transition-all shadow-2xl hover:shadow-[#C45A3C]/40 hover:scale-105 active:scale-95 duration-200"
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
