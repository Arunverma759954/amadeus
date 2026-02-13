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
            const data = await searchFlights(params as any);
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative inline-block">
                            <select
                                value={tripType}
                                onChange={(e) => setTripType(e.target.value)}
                                className="appearance-none bg-transparent pr-8 pl-0 py-1 text-sm font-bold text-[#071C4B] outline-none cursor-pointer border-none"
                            >
                                <option value="round">Round Trip</option>
                                <option value="oneway">One Way</option>
                            </select>
                            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {markup !== undefined && (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col text-right">
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
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
                    {/* From */}
                    <div className="flex-1 min-w-[200px] relative border border-gray-300 rounded-lg p-3 flex items-center gap-3">
                        <FaPlane className="text-gray-400 rotate-90" />
                        <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 font-semibold leading-none mb-1">Flying From</label>
                            <input
                                type="text"
                                name="origin"
                                value={params.origin}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-[#071C4B] p-0"
                                placeholder="Origin"
                            />
                        </div>
                    </div>

                    {/* Swap Button */}
                    <button
                        type="button"
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all -mx-1 z-10 bg-white"
                    >
                        <FaExchangeAlt />
                    </button>

                    {/* To */}
                    <div className="flex-1 min-w-[200px] relative border border-gray-300 rounded-lg p-3 flex items-center gap-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 font-semibold leading-none mb-1">Flying To</label>
                            <input
                                type="text"
                                name="destination"
                                value={params.destination}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-[#071C4B] p-0"
                                placeholder="Destination"
                            />
                        </div>
                    </div>

                    {/* Depart Date */}
                    <div className="flex-1 min-w-[150px] relative border border-gray-300 rounded-lg p-3 flex items-center gap-3">
                        <FaCalendarAlt className="text-gray-400" />
                        <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 font-semibold leading-none mb-1">Depart Date</label>
                            <input
                                type="date"
                                name="departureDate"
                                value={params.departureDate}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-[#071C4B] p-0"
                            />
                        </div>
                    </div>

                    {/* Return Date */}
                    <div className={`flex-1 min-w-[150px] relative border border-gray-300 rounded-lg p-3 flex items-center gap-3 ${tripType === 'oneway' ? 'opacity-50 grayscale' : ''}`}>
                        <FaCalendarAlt className="text-gray-400" />
                        <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 font-semibold leading-none mb-1">Return Date</label>
                            <input
                                type="date"
                                name="returnDate"
                                value={params.returnDate}
                                onChange={handleChange}
                                disabled={tripType === 'oneway'}
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-[#071C4B] p-0"
                            />
                        </div>
                    </div>

                    {/* Travellers & Class */}
                    <div className="flex-1 min-w-[220px] relative border border-gray-300 rounded-lg p-3 flex items-center gap-3 group" ref={travellerRef}>
                        <FaUserFriends className="text-gray-400" />
                        <div className="flex-1" onClick={() => setShowTravellerPicker(!showTravellerPicker)}>
                            <label className="block text-[10px] text-gray-400 font-semibold leading-none mb-1">Travellers & Class</label>
                            <div className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-bold text-[#071C4B] truncate">
                                    {params.adults + params.children + params.infant} Travellers, {params.cabin}
                                </span>
                                <FaChevronDown className="text-[10px] text-gray-300" />
                            </div>
                        </div>

                        {showTravellerPicker && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-80 bg-white shadow-2xl rounded-2xl p-6 z-[100] border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
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
                                                    onClick={() => setParams(p => ({ ...p, [type.key as any]: Math.max(type.key === 'adults' ? 1 : 0, p[type.key as 'adults' | 'children' | 'infant'] - 1) }))}
                                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#f6405f] hover:text-[#f6405f]"
                                                >-</button>
                                                <span className="text-sm font-bold w-4 text-center">{params[type.key as 'adults' | 'children' | 'infant']}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setParams(p => ({ ...p, [type.key as any]: p[type.key as 'adults' | 'children' | 'infant'] + 1 }))}
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
                                            className="w-full bg-gray-50 border-none outline-none rounded-lg p-2 text-sm font-bold text-[#071C4B]"
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
                                        className="w-full bg-[#071C4B] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest mt-2"
                                    >Done</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#f6405f] text-white hover:bg-black transition-all px-10 py-4 rounded-lg font-black text-sm uppercase tracking-widest flex items-center justify-center min-w-[140px] shadow-lg shadow-red-900/10"
                    >
                        {loading ? "..." : "Search"}
                    </button>
                </div>
            </form>
        </div>
    );
}
