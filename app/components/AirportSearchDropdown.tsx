"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export interface AirportOption {
    iataCode: string;
    name: string;
    detailedName?: string;
    cityName: string;
    countryName: string;
    subType: string;
}

interface AirportSearchDropdownProps {
    label: string;
    name: string;
    value: string;
    /** Optional display text (e.g. "DEL - INDIRA GANDHI INTL.") when value is IATA code */
    displayValue?: string;
    onChange: (name: string, iataCode: string, displayText?: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    /** Compact style for ModifySearchForm (smaller labels/inputs) */
    compact?: boolean;
    className?: string;
}

const DEBOUNCE_MS = 350;
const MIN_KEYWORD_LENGTH = 2;

export default function AirportSearchDropdown({
    label,
    name,
    value,
    displayValue,
    onChange,
    placeholder = "Search city or airport",
    icon,
    compact = false,
    className = "",
}: AirportSearchDropdownProps) {
    const [inputText, setInputText] = useState(displayValue || value || "");
    const [options, setOptions] = useState<AirportOption[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchOptions = useCallback(async (keyword: string) => {
        if (keyword.length < MIN_KEYWORD_LENGTH) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/airport-search?keyword=${encodeURIComponent(keyword)}`);
            const json = await res.json();
            if (res.ok && Array.isArray(json.data)) {
                setOptions(json.data);
                setSelectedIndex(0);
            } else {
                setOptions([]);
            }
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setInputText(displayValue || value || "");
    }, [value, displayValue]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!inputText.trim()) {
            setOptions([]);
            setOpen(false);
            return;
        }
        debounceRef.current = setTimeout(() => {
            setOpen(true);
            fetchOptions(inputText.trim());
        }, DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [inputText, fetchOptions]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open || options.length === 0) return;
        const el = listRef.current?.children[selectedIndex] as HTMLElement;
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [selectedIndex, open, options.length]);

    const handleSelect = (opt: AirportOption) => {
        const code = opt.iataCode.toUpperCase();
        const display = `${code} - ${opt.name}`;
        setInputText(display);
        onChange(name, code, display);
        setOpen(false);
        setOptions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open || options.length === 0) {
            if (e.key === "Escape") setOpen(false);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => (i < options.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => (i > 0 ? i - 1 : options.length - 1));
        } else if (e.key === "Enter" && selectedIndex >= 0 && options[selectedIndex]) {
            e.preventDefault();
            handleSelect(options[selectedIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const labelClass = compact
        ? "block text-[8px] text-gray-400 font-bold leading-none mb-0.5 uppercase tracking-tighter"
        : "block text-[10px] text-gray-500 font-bold leading-none mb-1 uppercase tracking-tighter";
    const inputClass = compact
        ? "w-full bg-transparent border-none outline-none text-[11px] font-black text-[#071C4B] p-0"
        : "w-full pl-12 pr-4 py-4 bg-white text-gray-900 shadow-lg outline-none font-bold text-sm uppercase placeholder:text-gray-300 focus:ring-4 focus:ring-black/5";

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div
                className={`flex items-center gap-2 group hover:border-[#f6405f] transition-all ${
                    compact
                        ? "border border-gray-300 rounded-lg p-2.5"
                        : "border border-gray-200 rounded-md"
                }`}
            >
                {icon && (
                    <span className="text-gray-400 shrink-0 text-xs flex items-center">
                        {icon}
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <label className={labelClass}>{label}</label>
                    <input
                        type="text"
                        name={name}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onFocus={() => inputText.length >= MIN_KEYWORD_LENGTH && options.length > 0 && setOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoComplete="off"
                        className={inputClass}
                    />
                </div>
            </div>

            {open && (options.length > 0 || loading) && (
                <ul
                    ref={listRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.12)] max-h-64 overflow-y-auto z-[100] py-1"
                >
                    {loading ? (
                        <li className="px-4 py-3 text-gray-500 text-sm">Searching...</li>
                    ) : (
                        options.map((opt, i) => {
                            const primary = `${opt.iataCode} - ${opt.name}`.toUpperCase();
                            const secondary = [opt.cityName, opt.countryName].filter(Boolean).join(", ");
                            return (
                                <li
                                    key={`${opt.iataCode}-${i}`}
                                    onClick={() => handleSelect(opt)}
                                    onMouseEnter={() => setSelectedIndex(i)}
                                    className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                        i === selectedIndex ? "bg-[#071C4B]/5" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <FaMapMarkerAlt className="text-gray-400 mt-0.5 shrink-0 text-xs" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[11px] font-black text-[#071C4B] uppercase tracking-tight">
                                            {primary}
                                        </div>
                                        {secondary && (
                                            <div className="text-[10px] text-gray-500 mt-0.5">
                                                {secondary}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
}
