"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
  FaLock,
  FaWallet,
  FaChevronDown,
  FaSync,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full font-sans relative">
      {/* Top Strip - Features */}
      <div className="bg-[#002166] text-white py-2 px-4 border-b border-white/5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex gap-6 md:justify-center lg:justify-between items-center text-[10px] md:text-[11px] font-bold tracking-wider min-w-max md:min-w-0">
          <div className="flex items-center gap-2 transition-colors cursor-default">
            <span className="text-blue-400">🌐</span>
            <span>Global Links: AU NZ</span>
          </div>
          <div className="flex items-center gap-2 transition-colors cursor-default">
            <FaLock className="text-yellow-400 text-[10px]" />
            <span>Fare Lock</span>
          </div>
          <div className="flex items-center gap-2 transition-colors cursor-default">
            <FaSync className="text-yellow-400 text-[10px]" />
            <span>Free Exchange</span>
          </div>
          <div className="flex items-center gap-2 transition-colors cursor-default">
            <span className="text-yellow-400 text-[12px]">■</span>
            <span>Book Now - Pay Later!</span>
          </div>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="bg-[#00308F] text-white py-1.5 px-4 shadow-lg border-b border-white/5 relative z-1001">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-2 text-[10px] md:text-[12px]">
          <div className="flex items-center gap-3 md:gap-12 overflow-x-auto no-scrollbar">
            <a
              href="mailto:info@hifitravels.com.au"
              className="flex items-center gap-1.5 hover:text-white group transition-all duration-300 shrink-0"
            >
              <FaEnvelope
                className="text-white/80 group-hover:text-white transition-colors shrink-0"
                size={10}
              />
              <span className="font-medium tracking-tight">
                info@hifitravels.com.au
              </span>
            </a>
            <div className="h-3 w-px bg-white/20 shrink-0"></div>
            <a
              href="tel:+61730678999"
              className="flex items-center gap-1.5 hover:text-white group transition-all duration-300 shrink-0"
            >
              <FaPhoneAlt
                className="text-white/80 group-hover:text-white transition-colors shrink-0"
                size={10}
              />
              <span className="font-bold tracking-widest">
                BNE: +61 7 3067 8999
              </span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span className="opacity-60 font-medium uppercase tracking-widest text-[9px]">
              Your Trusted Travel Partner
            </span>
            <div className="flex items-center gap-4 ml-4">
              <a
                href="#"
                className="text-white/80 hover:text-white transition-all duration-300 hover:scale-125"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-all duration-300 hover:scale-125"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white px-2 md:px-4 shadow-sm border-b border-gray-100 sticky top-0 z-1000 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 md:h-20 lg:h-22 min-h-[4rem]">
          {/* Logo - top left, always visible */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative w-40 md:w-48 lg:w-52 h-10 md:h-12 lg:h-14 min-h-[2.5rem] transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/logo.png"
                  alt="HiFi Travels - Fast, Safe, Unmatched"
                  fill
                  className="object-contain object-left"
                  priority
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 208px"
                />
              </div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <a
              href="tel:+61730678999"
              className="bg-[#C41E22] text-white p-2 rounded-none shadow-lg text-[13px]"
            >
              <FaPhoneAlt size={12} />
            </a>
            <button
              className="text-[#00308F] p-2 hover:bg-gray-100 rounded-none transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={22} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 font-bold text-[12px] lg:text-[13px]">
            <a
              href="/"
              className="bg-[#C41E22] text-white px-3 lg:px-5 py-3.5 rounded-none hover:bg-[#A3181C] transition-all uppercase tracking-tight shadow-sm"
            >
              Home
            </a>
            <Link
              href="/about"
              className="px-3 lg:px-5 py-3.5 rounded-none text-[#071C4B] hover:bg-[#C41E22] hover:text-white transition-all whitespace-nowrap uppercase tracking-tight"
            >
              About Us
            </Link>
            <Link
              href="/deals"
              className="px-3 lg:px-5 py-3.5 rounded-none text-[#071C4B] hover:bg-[#C41E22] hover:text-white transition-all whitespace-nowrap uppercase tracking-tight"
            >
              Deals & Promotions
            </Link>
            <Link
              href="/holidays"
              className="px-3 lg:px-5 py-3.5 rounded-none text-[#071C4B] hover:bg-[#C41E22] hover:text-white transition-all whitespace-nowrap uppercase tracking-tight"
            >
              Holidays
            </Link>
            <div className="relative group">
              <button className="px-3 lg:px-5 py-3.5 rounded-none text-[#071C4B] group-hover:bg-[#C41E22] group-hover:text-white transition-all gap-1 cursor-pointer whitespace-nowrap uppercase tracking-tight flex items-center">
                Special Offers{" "}
                <FaChevronDown
                  size={8}
                  className="group-hover:rotate-180 transition-transform"
                />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-72 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 transition-all duration-300 z-1100 border-t-4 border-[#C41E22] rounded-none overflow-hidden">
                <Link
                  href="/group-travel"
                  className="block px-8 py-4 text-[#071C4B] hover:bg-gray-50 hover:text-[#C41E22] font-bold transition-all border-b border-gray-100 uppercase text-[11px] tracking-widest"
                >
                  Group Travel
                </Link>
                <Link
                  href="/senior-travel"
                  className="block px-8 py-4 text-[#071C4B] hover:bg-gray-50 hover:text-[#C41E22] font-bold transition-all border-b border-gray-100 uppercase text-[11px] tracking-widest"
                >
                  Senior Travel
                </Link>
                <Link
                  href="/student-travel"
                  className="block px-8 py-4 text-[#071C4B] hover:bg-gray-50 hover:text-[#C41E22] font-bold transition-all border-b border-gray-100 uppercase text-[11px] tracking-widest"
                >
                  Student Travel
                </Link>
                <Link
                  href="/last-minute"
                  className="block px-8 py-4 text-[#071C4B] hover:bg-gray-50 hover:text-[#C41E22] font-bold transition-all uppercase text-[11px] tracking-widest"
                >
                  Last Minute Travel
                </Link>
              </div>
            </div>
            <Link
              href="/insurance"
              className="px-3 lg:px-5 py-3.5 rounded-none text-[#071C4B] hover:bg-[#C41E22] hover:text-white transition-all whitespace-nowrap uppercase tracking-tight"
            >
              Travel Insurance
            </Link>
            <Link
              href="/contact"
              className="px-3 lg:px-5 py-3.5 rounded-none text-[#071C4B] hover:bg-[#C41E22] hover:text-white transition-all whitespace-nowrap uppercase tracking-tight"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Drawer - MOVED to top level of Header for proper layering */}
      <div
        className={`fixed inset-0 bg-white z-5000 flex flex-col transition-all duration-500 ease-in-out ${isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"} md:hidden`}
      >
        {/* Drawer Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative w-44 h-12">
            <a href="/" onClick={() => setIsMenuOpen(false)} className="block">
              <Image
                src="/logo.png"
                alt="HiFi Travels"
                fill
                className="object-contain object-left cursor-pointer"
              />
            </a>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-[#00308F] p-3 bg-gray-50 rounded-full hover:rotate-90 transition-all duration-500"
          >
            <FaTimes size={28} />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex flex-col py-6 overflow-y-auto bg-white flex-1 relative z-0">
          <a
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="px-8 py-5 text-[#00308F] text-xl font-black border-b border-gray-100 hover:bg-[#C41E22] hover:text-white transition-all uppercase shadow-sm m-2 rounded-xl bg-gray-50"
          >
            Home
          </a>
          <Link
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="px-8 py-5 text-[#00308F] text-lg font-black border-b border-gray-100 hover:bg-gray-100 transition-all uppercase"
          >
            About Us
          </Link>
          <Link
            href="/deals"
            onClick={() => setIsMenuOpen(false)}
            className="px-8 py-5 text-[#00308F] text-lg font-black border-b border-gray-100 hover:bg-gray-100 transition-all uppercase"
          >
            Deals & Promotions
          </Link>
          <Link
            href="/holidays"
            onClick={() => setIsMenuOpen(false)}
            className="px-8 py-5 text-[#00308F] text-lg font-black border-b border-gray-100 hover:bg-gray-100 transition-all uppercase"
          >
            Holidays
          </Link>

          <div className="p-6 mx-2 my-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-4 block">
              Special Offers
            </span>
            <div className="flex flex-col gap-3">
              <Link
                href="/group-travel"
                onClick={() => setIsMenuOpen(false)}
                className="p-4 bg-white rounded-xl text-[#00308F] text-base font-black hover:bg-[#00308F] hover:text-white transition-all uppercase border border-gray-100"
              >
                Group Travel
              </Link>
              <Link
                href="/senior-travel"
                onClick={() => setIsMenuOpen(false)}
                className="p-4 bg-white rounded-xl text-[#00308F] text-base font-black hover:bg-[#00308F] hover:text-white transition-all uppercase border border-gray-100"
              >
                Senior Travel
              </Link>
              <Link
                href="/student-travel"
                onClick={() => setIsMenuOpen(false)}
                className="p-4 bg-white rounded-xl text-[#00308F] text-base font-black hover:bg-[#00308F] hover:text-white transition-all uppercase border border-gray-100"
              >
                Student Travel
              </Link>
            </div>
          </div>

          <Link
            href="/insurance"
            onClick={() => setIsMenuOpen(false)}
            className="px-8 py-5 text-[#00308F] text-lg font-black border-b border-gray-100 hover:bg-gray-100 transition-all uppercase"
          >
            Travel Insurance
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="px-8 py-5 text-[#00308F] text-lg font-black hover:bg-gray-100 transition-all uppercase"
          >
            Contact
          </Link>
        </nav>

        {/* Drawer Footer */}
        <div className="mt-auto p-8 bg-[#00308F] flex flex-col gap-6 rounded-t-[2.5rem] shadow-2xl relative z-10">
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#C41E22] transition-all">
              <FaPhoneAlt className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-[10px] uppercase font-black tracking-widest">
                Call Us Now
              </span>
              <span className="text-white font-bold text-xl tracking-tighter uppercase">
                +61 7 3067 8999
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#C41E22] transition-all">
              <FaEnvelope className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-[10px] uppercase font-black tracking-widest">
                Email Us
              </span>
              <span className="text-white font-bold text-lg lowercase">
                info@hifitravels.com.au
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
