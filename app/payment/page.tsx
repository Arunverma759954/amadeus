"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../components/Header";
import { FaLock, FaPlane, FaArrowLeft, FaCreditCard, FaRegQuestionCircle, FaShieldAlt, FaSuitcaseRolling } from "react-icons/fa";
import { formatCurrency } from "@/src/lib/currency";
import { useDisplayCurrency } from "@/src/contexts/CurrencyContext";

export default function PaymentPage() {
    const router = useRouter();
    const { displayCurrency } = useDisplayCurrency();
    const [selectedFlight, setSelectedFlight] = useState<any>(null);

    useEffect(() => {
        const data = localStorage.getItem("selectedFlight");
        if (data) {
            try {
                setSelectedFlight(JSON.parse(data));
            } catch (e) {
                console.error("Error parsing flight data", e);
            }
        }
    }, []);

    const handlePayNow = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/booking-success");
    };

    if (!selectedFlight) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#071C4B]"></div>
                </div>
            </div>
        );
    }

    const offer = selectedFlight.offer;
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    const priceCurrency = offer.price?.currency || "AUD";
    const baseFare = parseFloat(offer.price.total);
    const taxes = baseFare * 0.265;
    const total = baseFare + taxes;

    const depDate = new Date(firstSegment.departure.at);
    const arrDate = new Date(lastSegment.arrival.at);
    const depTime = depDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const arrTime = arrDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const depDateStr = depDate.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
    const arrDateStr = arrDate.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

    const segments = itinerary.segments;
    const isNonStop = segments.length === 1;

    const formatDuration = (iso: string) => iso.replace("PT", "").toLowerCase().replace("h", "h ").replace("m", "m");

    return (
        <main className="min-h-screen bg-[#F1F5F9] font-sans pb-10">
            <Header />

            {/* Same horizontal width as results page (w-full + px-4/sm:px-6/lg:px-8) */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#071C4B] font-bold mb-4 hover:text-[#C41E22] transition-colors uppercase text-[10px] tracking-widest"
                >
                    <FaArrowLeft size={10} /> Back to results
                </button>

                {/* Top summary strip – matches results page width */}
                <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(7,28,75,0.06)] border border-gray-100 px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#071C4B]/5 flex items-center justify-center text-[#071C4B]">
                            <FaPlane />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[#071C4B] uppercase tracking-[0.2em]">
                                Review &amp; Pay
                            </p>
                            <p className="text-sm md:text-base font-semibold text-gray-700">
                                {firstSegment.departure.iataCode} → {lastSegment.arrival.iataCode} · {isNonStop ? "Non‑stop" : `${segments.length - 1} stop(s)`} · {formatDuration(itinerary.duration)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Fare</p>
                            <p className="text-xl md:text-2xl font-black text-[#071C4B] tracking-tight">
                                {formatCurrency(total, priceCurrency, displayCurrency)}
                            </p>
                        </div>
                        <div className="hidden md:flex flex-col items-end text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Secure Checkout
                            </span>
                            <span className="text-gray-400 mt-1 flex items-center gap-1">
                                <FaLock size={8} /> 256‑bit SSL
                            </span>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT: Trip details + payment */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Trip details card */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <div>
                                    <h1 className="text-base md:text-lg font-black text-gray-800">Your Trip Details</h1>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {firstSegment.departure.iataCode} → {lastSegment.arrival.iataCode} · {isNonStop ? "Non-stop" : `${segments.length - 1} Stop(s)`} · {formatDuration(itinerary.duration)}
                                    </p>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <Image src="/logo.png" alt="Airline" width={32} height={32} className="object-contain" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                                            {offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode} • {segments[0].carrierCode} {segments[0].number}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {isNonStop ? "Non-Stop" : `${segments.length - 1} stop(s)`} · {formatDuration(itinerary.duration)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-xs font-semibold text-gray-700">
                                    <div className="text-center md:text-left">
                                        <p className="text-lg font-black text-gray-900">{depTime}</p>
                                        <p className="uppercase tracking-widest text-[10px] text-gray-500 mt-0.5">{firstSegment.departure.iataCode}</p>
                                        <p className="text-[11px] text-gray-500 mt-1">{depDateStr}</p>
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative">
                                        <span className="absolute left-1/2 -translate-x-1/2 -top-2 text-[9px] font-bold text-gray-500 bg-white px-2 rounded-full border border-gray-200">
                                            {formatDuration(itinerary.duration)}
                                        </span>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-lg font-black text-gray-900">{arrTime}</p>
                                        <p className="uppercase tracking-widest text-[10px] text-gray-500 mt-0.5">{lastSegment.arrival.iataCode}</p>
                                        <p className="text-[11px] text-gray-500 mt-1">{arrDateStr}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Simple accordions like the reference UI */}
                            <div className="divide-y divide-gray-100 bg-white">
                                {[
                                    {
                                        title: "Secure Your Trips",
                                        icon: <FaShieldAlt className="text-gray-400" />,
                                        content: "Add travel insurance to protect against cancellations, medical emergencies, and more."
                                    },
                                    {
                                        title: "Your Booking Details",
                                        icon: <FaSuitcaseRolling className="text-gray-400" />,
                                        content: "Review traveller names, passport details, and contact information carefully before paying."
                                    },
                                    {
                                        title: "Comfort On Your Trip",
                                        icon: <FaPlane className="text-gray-400" />,
                                        content: "Extra legroom, seat selection and baggage may be available on the next step depending on airline."
                                    }
                                ].map((section, idx) => (
                                    <details key={idx} className="group">
                                        <summary className="flex items-center justify-between px-6 py-3.5 cursor-pointer select-none hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                    {section.icon}
                                                </div>
                                                <span className="text-xs md:text-sm font-semibold text-gray-800">{section.title}</span>
                                            </div>
                                            <span className="text-xs text-[#C41E22] font-bold uppercase tracking-widest">
                                                View
                                            </span>
                                        </summary>
                                        <div className="px-6 pb-4 text-xs md:text-sm text-gray-600 bg-gray-50/80">
                                            {section.content}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>

                        {/* Payment form */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-[#C41E22]">
                                        <FaCreditCard size={14} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-[#071C4B] uppercase tracking-tight">Secure Payment</h2>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Pay securely using your credit or debit card.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handlePayNow} className="px-6 py-5 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cardholder Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] placeholder:text-gray-300"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Card Number</label>
                                    <div className="relative group">
                                        <input
                                            required
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] tracking-widest placeholder:tracking-normal placeholder:text-gray-300"
                                        />
                                        <FaCreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                                            CVV
                                            <FaRegQuestionCircle className="text-gray-300" />
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="123"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer group py-1">
                                    <input type="checkbox" defaultChecked className="accent-[#071C4B]" />
                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 uppercase">Billing address same as contact</span>
                                </label>

                                <div className="pt-3 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        className="w-full bg-[#C41E22] hover:bg-[#A0181B] text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-widest flex items-center justify-center gap-3 text-xs md:text-sm"
                                    >
                                        PAY {formatCurrency(total, priceCurrency, displayCurrency)}
                                    </button>
                                    <div className="flex items-center justify-center gap-1.5 mt-3 opacity-60">
                                        <FaLock size={8} className="text-[#071C4B]" />
                                        <span className="text-[8px] font-black text-[#071C4B] uppercase tracking-widest">SSL Encrypted Transaction</span>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* RIGHT: Fare summary + promo codes */}
                    <aside className="lg:col-span-4 space-y-4">
                        {/* Fare Summary */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Fare Summary</h2>
                                <button className="text-[10px] font-bold text-[#C41E22] uppercase tracking-widest hover:underline">
                                    View Fare Rules
                                </button>
                            </div>
                            <div className="px-5 py-4 space-y-2 text-xs font-semibold text-gray-600">
                                <div className="flex justify-between">
                                    <span>Base Fare (1 Traveller)</span>
                                    <span>{formatCurrency(baseFare, priceCurrency, displayCurrency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Fee &amp; Surcharges</span>
                                    <span>{formatCurrency(taxes, priceCurrency, displayCurrency)}</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Total Amount</span>
                                    <span className="text-lg font-black text-[#071C4B]">
                                        {formatCurrency(total, priceCurrency, displayCurrency)}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Promo Codes */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Promo Codes</h2>
                            </div>

                            <div className="px-5 py-4 space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Coupon Code"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#071C4B] focus:border-[#071C4B]"
                                    />
                                    <button className="px-3 py-2 bg-[#071C4B] text-white text-xs font-bold rounded-lg uppercase tracking-widest">
                                        Apply
                                    </button>
                                </div>

                                <div className="flex text-[10px] font-bold border-b border-gray-100 pb-2">
                                    <button className="flex-1 text-[#071C4B] border-b-2 border-[#071C4B] pb-1 uppercase tracking-widest">
                                        All Offers
                                    </button>
                                    <button className="flex-1 text-gray-400 pb-1 uppercase tracking-widest">
                                        Bank Offers
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
                                    {[
                                        {
                                            code: "YATRARBL",
                                            bank: "RBL Bank Credit Card",
                                            save: "₹799",
                                        },
                                        {
                                            code: "YRSBCEMI",
                                            bank: "SBI Credit Card EMI",
                                            save: "₹751",
                                        },
                                        {
                                            code: "YATRAHSBC",
                                            bank: "HSBC Credit Cards",
                                            save: "₹500",
                                        },
                                    ].map((offerItem) => (
                                        <div
                                            key={offerItem.code}
                                            className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 hover:border-[#071C4B]/40 hover:bg-gray-50 transition-colors"
                                        >
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{offerItem.code}</p>
                                                <p className="text-[11px] text-gray-600 mt-0.5">
                                                    Save {offerItem.save} on {offerItem.bank}.
                                                </p>
                                            </div>
                                            <button className="text-[10px] font-bold text-[#C41E22] uppercase tracking-widest hover:underline">
                                                Apply
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}
