/* eslint-disable */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
    const [originDisplay, setOriginDisplay] = useState<string>(params.origin);
    const [destDisplay, setDestDisplay] = useState<string>(params.destination);

    // Local airport autocomplete state for origin/destination
    const [originOptions, setOriginOptions] = useState<any[]>([]);
    const [destOptions, setDestOptions] = useState<any[]>([]);
    const [originOpen, setOriginOpen] = useState(false);
    const [destOpen, setDestOpen] = useState(false);
    const [originLoading, setOriginLoading] = useState(false);
    const [destLoading, setDestLoading] = useState(false);
    const [originHighlight, setOriginHighlight] = useState(-1);
    const [destHighlight, setDestHighlight] = useState(-1);
    const originRef = useRef<HTMLDivElement | null>(null);
    const destRef = useRef<HTMLDivElement | null>(null);
    const originDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const destDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (travellerRef.current && !travellerRef.current.contains(event.target as Node)) {
                setShowTravellerPicker(false);
            }
            if (originRef.current && !originRef.current.contains(event.target as Node)) {
                setOriginOpen(false);
            }
            if (destRef.current && !destRef.current.contains(event.target as Node)) {
                setDestOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchAirportSuggestions = useCallback(async (keyword: string) => {
        if (!keyword || keyword.trim().length < 1) return [];
        const term = keyword.trim().toLowerCase();
        try {
            const res = await fetch(`/api/airport-search?keyword=${encodeURIComponent(keyword.trim())}`);
            const json = await res.json();
            if (res.ok && Array.isArray(json.data) && json.data.length > 0) return json.data;
        } catch {
            // ignore errors – we'll fall back to static list
        }
        // Same static list as main SearchForm – basic popular airports
        const STATIC_AIRPORTS = [
            // A – examples
            { iataCode: "AMD", name: "Sardar Vallabhbhai Patel Intl.", cityName: "Ahmedabad", countryName: "India", countryCode: "IN" },
            { iataCode: "ATQ", name: "Sri Guru Ram Dass Jee Intl.", cityName: "Amritsar", countryName: "India", countryCode: "IN" },
            { iataCode: "AUH", name: "Abu Dhabi Intl.", cityName: "Abu Dhabi", countryName: "United Arab Emirates", countryCode: "AE" },
            { iataCode: "AMS", name: "Schiphol", cityName: "Amsterdam", countryName: "Netherlands", countryCode: "NL" },
            { iataCode: "ATL", name: "Hartsfield–Jackson", cityName: "Atlanta", countryName: "United States", countryCode: "US" },
            { iataCode: "AKL", name: "Auckland Intl.", cityName: "Auckland", countryName: "New Zealand", countryCode: "NZ" },
            // Existing sample network
            { iataCode: "DEL", name: "Indira Gandhi Intl.", cityName: "Delhi", countryName: "India", countryCode: "IN" },
            { iataCode: "BOM", name: "Chhatrapati Shivaji Intl.", cityName: "Mumbai", countryName: "India", countryCode: "IN" },
            { iataCode: "BLR", name: "Kempegowda Intl.", cityName: "Bengaluru", countryName: "India", countryCode: "IN" },
            { iataCode: "HYD", name: "Rajiv Gandhi Intl.", cityName: "Hyderabad", countryName: "India", countryCode: "IN" },
            { iataCode: "MAA", name: "Chennai Intl.", cityName: "Chennai", countryName: "India", countryCode: "IN" },
            { iataCode: "DXB", name: "Dubai Intl.", cityName: "Dubai", countryName: "United Arab Emirates", countryCode: "AE" },
            { iataCode: "SIN", name: "Changi", cityName: "Singapore", countryName: "Singapore", countryCode: "SG" },
            { iataCode: "LHR", name: "Heathrow", cityName: "London", countryName: "United Kingdom", countryCode: "GB" },
            { iataCode: "LGW", name: "Gatwick", cityName: "London", countryName: "United Kingdom", countryCode: "GB" },
            { iataCode: "SYD", name: "Kingsford Smith", cityName: "Sydney", countryName: "Australia", countryCode: "AU" },
            { iataCode: "MEL", name: "Tullamarine", cityName: "Melbourne", countryName: "Australia", countryCode: "AU" },
            { iataCode: "JFK", name: "John F. Kennedy Intl.", cityName: "New York", countryName: "United States", countryCode: "US" },
            { iataCode: "LAX", name: "Los Angeles Intl.", cityName: "Los Angeles", countryName: "United States", countryCode: "US" },
        ];
        return STATIC_AIRPORTS.filter((a) => {
            const code = a.iataCode.toLowerCase();
            const name = a.name.toLowerCase();
            const city = a.cityName.toLowerCase();
            // Match ONLY from start, so 's' => SYD/SIN… not AMD (Sardar…)
            return code.startsWith(term) || name.startsWith(term) || city.startsWith(term);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "origin") setOriginDisplay(value);
        if (name === "destination") setDestDisplay(value);
        setParams(prev => ({
            ...prev,
            [name]: ["adults", "children", "infant"].includes(name)
                ? parseInt(value) || 0
                : value.toUpperCase()
        }));

        if (name === "origin") {
            if (originDebounce.current) clearTimeout(originDebounce.current);
            originDebounce.current = setTimeout(async () => {
                setOriginLoading(true);
                const data = await fetchAirportSuggestions(value);
                setOriginOptions(data);
                setOriginOpen(data.length > 0);
                setOriginHighlight(data.length > 0 ? 0 : -1);
                setOriginLoading(false);
            }, 300);
        } else if (name === "destination") {
            if (destDebounce.current) clearTimeout(destDebounce.current);
            destDebounce.current = setTimeout(async () => {
                setDestLoading(true);
                const data = await fetchAirportSuggestions(value);
                setDestOptions(data);
                setDestOpen(data.length > 0);
                setDestHighlight(data.length > 0 ? 0 : -1);
                setDestLoading(false);
            }, 300);
        }
    };

    const handleSwap = () => {
        setParams(prev => ({
            ...prev,
            origin: prev.destination,
            destination: prev.origin
        }));
        // close any open dropdowns
        setOriginOpen(false);
        setDestOpen(false);
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
                    <div ref={originRef} className="relative border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 group hover:border-[#f6405f] transition-all lg:w-[18%]">
                        <FaPlane className="text-gray-400 rotate-90 shrink-0 text-xs" />
                        <div className="flex-1 min-w-0">
                            <label className="block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter">Flying From</label>
                            <input
                                type="text"
                                name="origin"
                                value={originDisplay}
                                onChange={handleChange}
                                onFocus={() => originOptions.length > 0 && setOriginOpen(true)}
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

                        {originOpen && (
                            <ul className="absolute top-[calc(100%+12px)] left-0 right-0 min-w-[min(100%,420px)] w-full max-w-[420px] max-h-[min(70vh,480px)] bg-white border-2 border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(7,28,75,0.2)] overflow-y-auto z-[100] py-3 text-left">
                                {originLoading && originOptions.length === 0 ? (
                                    <li className="px-6 py-5 text-base font-medium text-gray-500">Searching airports…</li>
                                ) : (
                                    originOptions.map((opt: any, idx: number) => {
                                        const primaryCity = opt.cityName || opt.name;
                                        const primary = primaryCity
                                            ? `${primaryCity} ${opt.iataCode ? `(${opt.iataCode.toUpperCase()})` : ""}`.trim()
                                            : (opt.iataCode || "").toUpperCase();
                                        const secondary = opt.name && opt.name !== primaryCity ? opt.name : "";
                                        const country = opt.countryName || "";
                                        const flag = opt.countryCode
                                            ? String.fromCodePoint(
                                                ...opt.countryCode.toUpperCase().split("").map((ch: string) => 0x1F1E6 - 65 + ch.charCodeAt(0))
                                            )
                                            : null;
                                        return (
                                            <li
                                                key={`${opt.iataCode}-${idx}`}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    const code = opt.iataCode.toUpperCase();
                                                    const label = primary;
                                                    setOriginDisplay(label);
                                                    setParams(p => ({ ...p, origin: code }));
                                                    setOriginOpen(false);
                                                }}
                                                onMouseEnter={() => setOriginHighlight(idx)}
                                                className={`px-6 py-4 cursor-pointer flex items-center gap-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                                                    idx === originHighlight ? "bg-[#071C4B]/10" : "hover:bg-[#F3F5FB]"
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-base md:text-lg font-bold text-[#071C4B] truncate">
                                                            {primary}
                                                        </span>
                                                        {(country || flag) && (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {country && (
                                                                    <span className="text-sm font-semibold text-gray-600 hidden sm:inline">
                                                                        {country}
                                                                    </span>
                                                                )}
                                                                {flag && (
                                                                    <span className="text-xl leading-none">
                                                                        {flag}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {secondary && (
                                                        <span className="text-sm text-gray-500 leading-snug block mt-1 truncate">
                                                            {secondary}
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        )}
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
                    <div ref={destRef} className="relative border border-gray-300 rounded-lg p-2.5 flex items-center gap-2 group hover:border-[#f6405f] transition-all lg:w-[18%]">
                        <FaMapMarkerAlt className="text-gray-400 shrink-0 text-xs" />
                        <div className="flex-1 min-w-0">
                            <label className="block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter">Flying To</label>
                            <input
                                type="text"
                                name="destination"
                                value={destDisplay}
                                onChange={handleChange}
                                onFocus={() => destOptions.length > 0 && setDestOpen(true)}
                                className="w-full bg-transparent border-none outline-none text-[11px] font-black text-[#071C4B] p-0"
                                placeholder="Destination"
                            />
                        </div>

                        {destOpen && (
                            <ul className="absolute top-[calc(100%+12px)] left-0 right-0 min-w-[min(100%,420px)] w-full max-w-[420px] max-h-[min(70vh,480px)] bg-white border-2 border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(7,28,75,0.2)] overflow-y-auto z-[100] py-3 text-left">
                                {destLoading && destOptions.length === 0 ? (
                                    <li className="px-6 py-5 text-base font-medium text-gray-500">Searching airports…</li>
                                ) : (
                                    destOptions.map((opt: any, idx: number) => {
                                        const primaryCity = opt.cityName || opt.name;
                                        const primary = primaryCity
                                            ? `${primaryCity} ${opt.iataCode ? `(${opt.iataCode.toUpperCase()})` : ""}`.trim()
                                            : (opt.iataCode || "").toUpperCase();
                                        const secondary = opt.name && opt.name !== primaryCity ? opt.name : "";
                                        const country = opt.countryName || "";
                                        const flag = opt.countryCode
                                            ? String.fromCodePoint(
                                                ...opt.countryCode.toUpperCase().split("").map((ch: string) => 0x1F1E6 - 65 + ch.charCodeAt(0))
                                            )
                                            : null;
                                        return (
                                            <li
                                                key={`${opt.iataCode}-${idx}`}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    const code = opt.iataCode.toUpperCase();
                                                    const label = primary;
                                                    setDestDisplay(label);
                                                    setParams(p => ({ ...p, destination: code }));
                                                    setDestOpen(false);
                                                }}
                                                onMouseEnter={() => setDestHighlight(idx)}
                                                className={`px-6 py-4 cursor-pointer flex items-center gap-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                                                    idx === destHighlight ? "bg-[#071C4B]/10" : "hover:bg-[#F3F5FB]"
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-base md:text-lg font-bold text-[#071C4B] truncate">
                                                            {primary}
                                                        </span>
                                                        {(country || flag) && (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {country && (
                                                                    <span className="text-sm font-semibold text-gray-600 hidden sm:inline">
                                                                        {country}
                                                                    </span>
                                                                )}
                                                                {flag && (
                                                                    <span className="text-xl leading-none">
                                                                        {flag}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {secondary && (
                                                        <span className="text-sm text-gray-500 leading-snug block mt-1 truncate">
                                                            {secondary}
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        )}
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
