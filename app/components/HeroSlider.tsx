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

      {/* Content Layer - circular logo removed (logo remains in header top-left) */}
      <div className="absolute inset-0 z-30 flex flex-col justify-start md:justify-center w-full max-w-7xl mx-auto px-6 pointer-events-none pt-20 md:pt-0">
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
