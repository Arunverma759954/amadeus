"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaPlane,
  FaChevronLeft,
  FaChevronRight,
  FaWhatsapp,
  FaPhoneAlt,
  FaCheckCircle,
} from "react-icons/fa";

const slides = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"];

export default function HeroSlider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[700px] sm:h-[720px] md:h-[750px] lg:h-[800px] font-sans">
      {/* Slides Container - This handles the overflow for transitions */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((src, index) => {
          // Calculate position classes for sliding effect
          let slideClass = "translate-x-full opacity-0 z-10"; // Default: off-screen right
          if (index === currentSlide) {
            slideClass = "translate-x-0 opacity-100 z-20"; // Active: on-screen
          } else if (
            index ===
            (currentSlide - 1 + slides.length) % slides.length
          ) {
            slideClass = "-translate-x-full opacity-0 z-10"; // Previous: off-screen left
          }

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${slideClass}`}
            >
              <div className="absolute inset-0 bg-transparent z-10"></div>
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          );
        })}

        {/* Mobile Overlay - Moved inside hidden overflow to keep visual consistency */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071C4B] via-[#071C4B]/60 to-transparent md:hidden z-20"></div>

        {/* Left Blue Curve Overlay (Desktop only) */}
        <div
          className="absolute top-0 left-0 w-full md:w-[75%] h-full z-20 hidden md:block"
          style={{
            display: "none",
            background: "#071C4B",
            clipPath: "path('M 0 0 L 85% 0 Q 60% 50% 85% 100% L 0 100% Z')",
          }}
        ></div>
      </div>

      {/* Content Layer (Typography) - Outside slide overflow to allow flex layout */}
      <div className="absolute inset-0 z-30 flex flex-col justify-start md:justify-center w-full max-w-7xl mx-auto px-6 pointer-events-none pt-20 md:pt-0">
        <div className="flex flex-col md:flex-row items-center justify-between w-full">
          {/* Left Text Content */}
          <div className="flex flex-col items-start max-w-2xl">
            <h1 className="text-white font-black leading-[1.05]">
              <span className="block text-[45px] sm:text-[60px] md:text-[70px] lg:text-[90px] uppercase tracking-tighter">
                TICKETS
              </span>
              <span className="block text-[40px] sm:text-[50px] md:text-[60px] lg:text-[75px] uppercase tracking-tighter mt-[-5px] md:mt-[-10px]">
                JUST FOR
              </span>
              <span className="block text-[16px] sm:text-[20px] md:text-[28px] lg:text-[32px] uppercase tracking-[0.2em] bg-white text-[#071C4B] px-3 md:px-4 py-1.5 md:py-2 mt-3 md:mt-2">
                BUDGET FRIENDLY
              </span>
            </h1>
          </div>

          {/* Right Circular Badge (Desktop) */}
          <div className="hidden md:flex relative group mt-[-80px]">
            <div className="w-56 h-56 lg:w-72 lg:h-72 bg-white rounded-full flex flex-col items-center justify-center p-8 shadow-2xl relative z-20 border-[6px] border-[#071C4B]">
              <div className="relative w-full h-24 mb-2">
                <Image
                  src="/logo.png"
                  alt="HiFi Travels"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="h-px w-2/3 bg-gray-200 mb-2"></div>
              <p className="text-[10px] lg:text-[12px] font-black text-[#C41E22] tracking-widest uppercase text-center leading-tight">
                FAST. SAFE. UNMATCHED
              </p>
            </div>
            <div className="absolute inset-0 bg-white/20 rounded-full scale-110 animate-pulse z-10"></div>
            <div className="absolute inset-0 bg-white/10 rounded-full scale-125 animate-pulse delay-700 z-0"></div>
          </div>
        </div>

        {/* Floating Decorative Elements (Desktop) */}
        <div className="absolute top-0 right-0 w-1/3 h-full hidden md:block">
          <div className="absolute top-1/2 right-[-10%] translate-y-[-50%] w-[500px] h-[500px] bg-[#071C4B]/20 rounded-full border-40 border-white/5"></div>
          <div className="absolute top-[20%] left-[10%] grid grid-cols-6 gap-2 opacity-40">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
            ))}
          </div>
          <div className="absolute bottom-[10%] left-[20%] w-24 h-24 border-2 border-white/20 rounded-full animate-bounce-slow"></div>
        </div>
      </div>

      {/* Controls & Navigation */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-1.5 md:left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 md:p-3 rounded-full z-40 transition-colors touch-manipulation hidden sm:block"
      >
        
        <FaChevronLeft size={18} className="md:block" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-1.5 md:right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 md:p-3 rounded-full z-40 transition-colors touch-manipulation hidden sm:block"
      >
        <FaChevronRight size={18} className="md:block" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-40 md:hidden bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 touch-manipulation ${
              i === currentSlide ? "w-6 h-1 bg-white" : "w-1.5 h-1 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Search Form Layer - Outside slide overflow to prevent clipping */}
      {children && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-start pointer-events-none pt-12 sm:pt-16 md:pt-40 lg:pt-24">
          <div className="w-full pointer-events-auto px-4 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );

}
