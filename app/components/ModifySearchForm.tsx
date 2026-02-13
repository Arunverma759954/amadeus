/* eslint-disable */
"use client";

import { useState, useRef, useEffect } from "react";
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaChevronDown, FaExchangeAlt, FaSearch } from "react-icons/fa";
import { searchFlights, FlightSearchParams } from "@/src/lib/flights";

interface ModifySearchFormProps {
    onResults: (data: any, type: 'flight' | 'hotel', params: any) => void;
    onSearchStart: () => void;
    onError: (msg: string) => void;
    initialParams?: any;
    markup?: number;
}

export default function ModifySearchForm({ onResults, onSearchStart, onError, initialParams, markup }: ModifySearchFormProps) {
    const [loading, setLoading] = useState(false);
    const [tripType, setTripType] = useState(initialParams?.tripType || 'round');
    const [showTravellerPicker, setShowTravellerPicker] = useState(false);
    const travellerRef = useRef<HTMLDivElement>(null);

    const [params, setParams] = useState({
        origin: initialParams?.origin || "DEL",
        destination: initialParams?.destination || "BOM",
        departureDate: initialParams?.departureDate || new Date().toISOString().split('T')[0],
        returnDate: initialParams?.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adults: initialParams?.adults || 1,
        children: initialParams?.children || 0,
        infant: initialParams?.infant || 0,
        cabin: initialParams?.cabin || "Economy",
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (travellerRef.current && !travellerRef.current.contains(event.target as Node)) {
                setShowTravellerPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setParams(prev => ({
            ...prev,
            [name]: ["adults", "children", "infant"].includes(name)
                ? parseInt(value) || 0
                : value.toUpperCase()
        }));
    };

    const handleSwap = () => {
        setParams(prev => ({
            ...prev,
            origin: prev.destination,
            destination: prev.origin
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSearchStart();
        setLoading(true);

        try {
            const data = await searchFlights(params as unknown as FlightSearchParams);
            onResults(data, 'flight', params);
        } catch (err: any) {
            onError(err.message || "Search failed");
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white font-sans">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Trip Type & Markup Display */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-2">
                        <div className="relative inline-block">
                            <select
                                value={tripType}
                                onChange={(e) => setTripType(e.target.value)}
                                className="appearance-none bg-transparent pr-8 pl-0 py-1 text-sm font-bold text-[#071C4B] outline-none cursor-pointer border-none uppercase tracking-tighter"
                            >
                                <option value="round">Round Trip</option>
                                <option value="oneway">One Way</option>
                            </select>
                            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {markup !== undefined && (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-0 text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing Control</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-[#071C4B]">Markup: {markup}%</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-[8px] font-black text-green-600 uppercase">Live</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Horizontal Inputs */}
                {/* Main Horizontal Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 lg:gap-2">
                    {/* From */}
                    <div className="relative border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 group hover:border-[#f6405f] transition-all lg:w-[18%]">
                        <FaPlane className="text-gray-400 rotate-90 shrink-0 text-xs" />
                        <div className="flex-1 min-w-0">
                            <label className="block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter">Flying From</label>
                            <input
                                type="text"
                                name="origin"
                                value={params.origin}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none outline-none text-[11px] font-black text-[#071C4B] p-0"
                                placeholder="Origin"
                            />
                        </div>
                        {/* Mobile Swap - Visible only on mobile/tablet between inputs */}
                        <div className="lg:hidden absolute -bottom-4 right-6 z-20">
                            <button
                                type="button"
                                onClick={handleSwap}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#f6405f] hover:bg-white transition-all bg-white shadow-md active:scale-90"
                            >
                                <FaExchangeAlt size={10} className="rotate-90" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Swap Button */}
                    <div className="hidden lg:flex items-center justify-center -mx-4 z-10 shrink-0">
                        <button
                            type="button"
                            onClick={handleSwap}
                            className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all bg-white shadow-sm"
                        >
                            <FaExchangeAlt size={10} />
                        </button>
                    </div>

                    {/* To */}
                    <div className="relative border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 group hover:border-[#f6405f] transition-all lg:w-[18%]">
                        <FaMapMarkerAlt className="text-gray-400 shrink-0 text-xs" />
                        <div className="flex-1 min-w-0">
                            <label className="block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter">Flying To</label>
                            <input
                                type="text"
                                name="destination"
                                value={params.destination}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none outline-none text-[11px] font-black text-[#071C4B] p-0"
                                placeholder="Destination"
                            />
                        </div>
                    </div>

                    {/* Depart Date */}
                    <div className="relative border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 group hover:border-[#f6405f] transition-all lg:w-[15%]">
                        <FaCalendarAlt className="text-gray-400 shrink-0 hidden xl:block text-xs" />
                        <div className="flex-1 min-w-0">
                            <label className="block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter">Depart</label>
                            <input
                                type="date"
                                name="departureDate"
                                value={params.departureDate}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none outline-none text-[10px] font-black text-[#071C4B] p-0"
                            />
                        </div>
                    </div>

                    {/* Return Date */}
                    <div className={`relative border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 group hover:border-[#f6405f] transition-all lg:w-[15%] ${tripType === 'oneway' ? 'opacity-50 grayscale' : ''}`}>
                        <FaCalendarAlt className="text-gray-400 shrink-0 hidden xl:block text-xs" />
                        <div className="flex-1 min-w-0">
                            <label className="block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter">Return</label>
                            <input
                                type="date"
                                name="returnDate"
                                value={params.returnDate}
                                onChange={handleChange}
                                disabled={tripType === 'oneway'}
                                className="w-full bg-transparent border-none outline-none text-[10px] font-black text-[#071C4B] p-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Travellers & Class */}
                    <div className="relative border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 group hover:border-[#f6405f] transition-all lg:w-[18%]" ref={travellerRef}>
                        <FaUserFriends className="text-gray-400 shrink-0 text-xs" />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowTravellerPicker(!showTravellerPicker)}>
                            <label className="block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter">Travellers</label>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#071C4B] truncate">
                                    {params.adults + params.children} Pax, {params.cabin.charAt(0)}
                                </span>
                                <FaChevronDown className="text-[8px] text-gray-300" />
                            </div>
                        </div>

                        {showTravellerPicker && (
                            <div className="absolute top-[calc(100%+12px)] right-0 left-0 sm:left-auto w-auto sm:w-80 bg-white shadow-2xl rounded-2xl p-6 z-[100] border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-4">
                                    {[
                                        { key: 'adults', label: 'Adults', sub: '12+ years' },
                                        { key: 'children', label: 'Children', sub: '2-12 years' },
                                        { key: 'infant', label: 'Infants', sub: '0-2 years' },
                                    ].map((type) => (
                                        <div key={type.key} className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-[#071C4B]">{type.label}</div>
                                                <div className="text-[10px] text-gray-400">{type.sub}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setParams(p => ({ ...p, [type.key]: Math.max(type.key === 'adults' ? 1 : 0, (p[type.key as keyof typeof p] as number) - 1) }))}
                                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#f6405f] hover:text-[#f6405f]"
                                                >-</button>
                                                <span className="text-sm font-bold w-4 text-center">{params[type.key as keyof typeof params] as number}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setParams(p => ({ ...p, [type.key]: (p[type.key as keyof typeof p] as number) + 1 }))}
                                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#f6405f] hover:text-[#f6405f]"
                                                >+</button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 border-t border-gray-50">
                                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2">Cabin Class</label>
                                        <select
                                            name="cabin"
                                            value={params.cabin}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border-none outline-none rounded-lg p-2 text-sm font-bold text-[#071C4B] cursor-pointer"
                                        >
                                            <option>Economy</option>
                                            <option>Premium Economy</option>
                                            <option>Business</option>
                                            <option>First Class</option>
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowTravellerPicker(false)}
                                        className="w-full bg-[#071C4B] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest mt-2 hover:bg-[#f6405f] transition-all"
                                    >Done</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <div className="sm:col-span-2 lg:flex-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#f6405f] text-white hover:bg-black transition-all py-3.5 px-4 rounded-lg font-black text-[11px] uppercase tracking-widest flex items-center justify-center shadow-lg shadow-red-900/10 h-full min-h-[48px]"
                        >
                            {loading ? "..." : <><FaSearch className="mr-2 shrink-0 text-xs" /> Search</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
