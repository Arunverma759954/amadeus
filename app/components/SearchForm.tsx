"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchFlights, FlightSearchParams } from "@/src/lib/flights";
import { searchHotels, HotelSearchParams } from "@/src/lib/hotels";
import {
  FaPlane,
  FaHotel,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaWhatsapp,
  FaPhoneAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { supabase } from "@/src/lib/supabase";

interface SearchFormProps {
  onResults: (data: any, type: "flight" | "hotel", params: any) => void;
  onSearchStart: () => void;
  onError: (msg: string) => void;
  autoSearchDate?: string;
}

export default function SearchForm({
  onResults,
  onSearchStart,
  onError,
  autoSearchDate,
}: SearchFormProps) {
  // Ensure default dates are always today and future (no back dates)
  const todayIso = new Date().toISOString().split("T")[0];
  const defaultReturnIso = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [activeTab, setActiveTab] = useState<"flight" | "hotel" | "insurance">(
    "flight",
  );
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType] = useState("round");

  // Flight State
  const [flightParams, setFlightParams] = useState<
    FlightSearchParams & {
      returnDate: string;
      children: number;
      infant: number;
      cabin: string;
      name: string;
      email: string;
      phone: string;
    }
  >({
    origin: "DEL",
    destination: "BOM",
    departureDate: todayIso,
    returnDate: defaultReturnIso,
    adults: 1,
    children: 0,
    infant: 0,
    cabin: "Economy",
    name: "Arun",
    email: "arun@example.com",
    phone: "1234567890",
  });

  // Custom Date Picker State
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const departureRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        departureRef.current &&
        !departureRef.current.contains(event.target as Node)
      )
        setShowDeparturePicker(false);
      if (
        returnRef.current &&
        !returnRef.current.contains(event.target as Node)
      )
        setShowReturnPicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger search from external prop (e.g. Date Slider)
  useEffect(() => {
    if (autoSearchDate && autoSearchDate !== flightParams.departureDate) {
      setFlightParams((prev) => ({ ...prev, departureDate: autoSearchDate }));
      // We use a small timeout to let state update before triggering submit logic
      setTimeout(() => {
        const btn = document.getElementById(
          "search-submit-btn",
        ) as HTMLButtonElement;
        if (btn && !btn.disabled) btn.click();
      }, 100);
    }
  }, [autoSearchDate]);

  const handleFlightChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFlightParams((prev) => ({
      ...prev,
      [name]: ["adults", "children", "infant"].includes(name)
        ? parseInt(value) || 0
        : ["origin", "destination"].includes(name)
          ? value.toUpperCase()
          : value,
    }));
  };

  const handleDateSelect = (date: string, type: "departure" | "return") => {
    setFlightParams((prev) => ({
      ...prev,
      [type === "departure" ? "departureDate" : "returnDate"]: date,
    }));
    if (type === "departure") setShowDeparturePicker(false);
    else setShowReturnPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSearchStart();
    setLoading(true);

    try {
      if (activeTab === "flight") {
        if (
          !flightParams.origin ||
          !flightParams.destination ||
          !flightParams.departureDate
        ) {
          throw new Error("Please fill in all required flight fields");
        }
        const data = await searchFlights(flightParams);

        // Real-time Analytics: Log search event
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          await supabase.from("search_logs").insert({
            user_id: user?.id || null,
            search_params: {
              origin: flightParams.origin,
              destination: flightParams.destination,
              departureDate: flightParams.departureDate,
              tripType: tripType,
              adults: flightParams.adults,
            },
          });
        } catch (logErr) {
          console.error("Failed to log search", logErr);
        }

        onResults(data, "flight", { ...flightParams, tripType });
      } else {
        onError("Hotel search is currently being updated.");
        setLoading(false);
      }
    } catch (err: any) {
      onError(err.message || "An error occurred while searching");
      setLoading(false);
    }
  };

  const tabs = [
    { id: "flight", label: "FLIGHTS", icon: <FaPlane /> },
    { id: "hotel", label: "HOTELS", icon: <FaHotel /> },
    { id: "insurance", label: "TRAVEL INSURANCE", icon: <FaShieldAlt /> },
  ];

  // Button enable condition – only core search fields required
  const isFormValid = !!(
    flightParams.origin &&
    flightParams.destination &&
    flightParams.departureDate &&
    (tripType === "round" ? flightParams.returnDate : true)
  );

  return (
    <>
      <div className="w-full max-w-6xl mx-auto font-sans relative">
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-hidden rounded-t-2xl bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-2 md:px-8 py-3 md:py-5 text-[9px] sm:text-[10px] md:text-sm font-black tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all
                                ${activeTab === tab.id
                    ? "bg-[#C41E22] text-white"
                    : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <span className="text-sm md:text-lg">{tab.icon}</span>
                <span className="uppercase whitespace-nowrap tracking-wider font-bold">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Form Container */}
          <div className="bg-white px-3 sm:px-5 md:px-10 pt-3 pb-3 md:pt-6 md:pb-8 rounded-b-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
              {/* Trip Type */}
              <div className="flex items-center justify-start gap-5 md:gap-8 text-gray-800 text-sm font-semibold overflow-x-auto no-scrollbar pb-1 mt-1">
                {["round", "oneway"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1.5 md:gap-3 cursor-pointer group shrink-0"
                  >
                    <div
                      className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border flex items-center justify-center transition-all ${tripType === type ? "border-[#C41E22]" : "border-gray-300 group-hover:border-gray-400"}`}
                    >
                      {tripType === type && (
                        <div className="w-1.5 h-1.5 bg-[#C41E22] rounded-full"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      checked={tripType === type}
                      onChange={() => setTripType(type)}
                    />
                    <span className="uppercase tracking-wide text-[9px] md:text-xs font-bold text-gray-600">
                      {type === "round" ? "Round Trip" : "One Way"}
                    </span>
                  </label>
                ))}
              </div>

              {/* Inputs Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <div className="relative">
                  <InputField
                    icon={<FaMapMarkerAlt />}
                    placeholder="FROM: Origin"
                    name="origin"
                    value={flightParams.origin}
                    onChange={handleFlightChange}
                    required={!flightParams.origin}
                    enableAirportAutocomplete
                  />
                </div>
                <div className="relative">
                  <InputField
                    icon={<FaMapMarkerAlt />}
                    placeholder="TO: Destination"
                    name="destination"
                    value={flightParams.destination}
                    onChange={handleFlightChange}
                    enableAirportAutocomplete
                  />
                </div>

                {/* Custom Date Inputs */}
                <div className="relative" ref={departureRef}>
                  <div
                    onClick={() => setShowDeparturePicker(!showDeparturePicker)}
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-white text-gray-800 border border-gray-200 rounded-md text-xs md:text-sm cursor-pointer flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="truncate">
                        {flightParams.departureDate || "Departure"}
                      </span>
                    </div>
                    <FaChevronDown className="text-gray-300 text-[10px]" />
                  </div>
                  {showDeparturePicker && (
                    <CalendarOverlay
                      onSelect={(d) => handleDateSelect(d, "departure")}
                      selected={flightParams.departureDate}
                      minDate={todayIso}
                      onClose={() => setShowDeparturePicker(false)}
                    />
                  )}
                </div>

                <div className="relative" ref={returnRef}>
                  <div
                    onClick={() =>
                      tripType === "round" &&
                      setShowReturnPicker(!showReturnPicker)
                    }
                    className={`w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-white text-gray-800 border border-gray-200 rounded-md text-xs md:text-sm flex items-center justify-between shadow-lg ${tripType === "oneway" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="truncate">
                        {flightParams.returnDate || "Return"}
                      </span>
                    </div>
                    <FaChevronDown className="text-gray-300 text-[10px]" />
                  </div>
                  {showReturnPicker && (
                    <CalendarOverlay
                      onSelect={(d) => handleDateSelect(d, "return")}
                      selected={flightParams.returnDate}
                      minDate={flightParams.departureDate}
                      onClose={() => setShowReturnPicker(false)}
                    />
                  )}
                </div>
              </div>

              {/* Inputs Row 2: Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SelectField
                  name="adults"
                  icon={<FaUserFriends />}
                  label="Adult"
                  value={flightParams.adults}
                  onChange={handleFlightChange}
                  options={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                />
                <SelectField
                  name="children"
                  icon={<FaUserFriends />}
                  label="Children"
                  value={flightParams.children}
                  onChange={handleFlightChange}
                  options={[0, 1, 2, 3, 4, 5]}
                />
                <SelectField
                  name="infant"
                  icon={<FaUserFriends size={12} />}
                  label="Infants"
                  value={flightParams.infant}
                  onChange={handleFlightChange}
                  options={[0, 1, 2]}
                />
                <SelectField
                  name="cabin"
                  icon={<FaPlane />}
                  label="Economy"
                  value={flightParams.cabin}
                  onChange={handleFlightChange}
                  options={[
                    "Economy",
                    "Premium Economy",
                    "Business",
                    "First Class",
                  ]}
                />
              </div>

              {/* Contact Info (hidden in compact UI but kept for logic) */}
              <div className="hidden">
                <input
                  name="name"
                  value={flightParams.name}
                  onChange={handleFlightChange}
                />
                <input
                  name="email"
                  value={flightParams.email}
                  onChange={handleFlightChange}
                />
                <input
                  name="phone"
                  value={flightParams.phone}
                  onChange={handleFlightChange}
                />
              </div>

              <div className="flex justify-center sm:justify-end pt-1 sm:pt-3">
                <button
                  id="search-submit-btn"
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`w-full sm:w-auto px-10 md:px-14 py-3 md:py-4 rounded-full text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all
                                    ${loading || !isFormValid
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : "bg-linear-to-r from-[#f6405f] to-[#ff6b81] hover:shadow-2xl hover:scale-105 text-white"
                    }`}
                >
                  {loading ? "Searching..." : "Find a Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// Lightweight airport suggestion type for inline dropdown
interface AirportSuggestion {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  countryCode?: string;
}

// Fallback static list – so dropdown works even if Amadeus API/env not configured
const STATIC_AIRPORTS: AirportSuggestion[] = [
  // A – examples
  {
    iataCode: "AMD",
    name: "Sardar Vallabhbhai Patel Intl.",
    cityName: "Ahmedabad",
    countryName: "India",
    countryCode: "IN",
  },
  {
    iataCode: "ATQ",
    name: "Sri Guru Ram Dass Jee Intl.",
    cityName: "Amritsar",
    countryName: "India",
    countryCode: "IN",
  },
  {
    iataCode: "AUH",
    name: "Abu Dhabi Intl.",
    cityName: "Abu Dhabi",
    countryName: "United Arab Emirates",
    countryCode: "AE",
  },
  {
    iataCode: "AMS",
    name: "Schiphol",
    cityName: "Amsterdam",
    countryName: "Netherlands",
    countryCode: "NL",
  },
  {
    iataCode: "ATL",
    name: "Hartsfield–Jackson",
    cityName: "Atlanta",
    countryName: "United States",
    countryCode: "US",
  },
  {
    iataCode: "AKL",
    name: "Auckland Intl.",
    cityName: "Auckland",
    countryName: "New Zealand",
    countryCode: "NZ",
  },
  // Existing sample network
  {
    iataCode: "DEL",
    name: "Indira Gandhi Intl.",
    cityName: "Delhi",
    countryName: "India",
    countryCode: "IN",
  },
  {
    iataCode: "BOM",
    name: "Chhatrapati Shivaji Intl.",
    cityName: "Mumbai",
    countryName: "India",
    countryCode: "IN",
  },
  {
    iataCode: "BLR",
    name: "Kempegowda Intl.",
    cityName: "Bengaluru",
    countryName: "India",
    countryCode: "IN",
  },
  {
    iataCode: "HYD",
    name: "Rajiv Gandhi Intl.",
    cityName: "Hyderabad",
    countryName: "India",
    countryCode: "IN",
  },
  {
    iataCode: "MAA",
    name: "Chennai Intl.",
    cityName: "Chennai",
    countryName: "India",
    countryCode: "IN",
  },
  {
    iataCode: "DXB",
    name: "Dubai Intl.",
    cityName: "Dubai",
    countryName: "United Arab Emirates",
    countryCode: "AE",
  },
  {
    iataCode: "SIN",
    name: "Changi",
    cityName: "Singapore",
    countryName: "Singapore",
    countryCode: "SG",
  },
  {
    iataCode: "LHR",
    name: "Heathrow",
    cityName: "London",
    countryName: "United Kingdom",
    countryCode: "GB",
  },
  {
    iataCode: "LGW",
    name: "Gatwick",
    cityName: "London",
    countryName: "United Kingdom",
    countryCode: "GB",
  },
  {
    iataCode: "SYD",
    name: "Kingsford Smith",
    cityName: "Sydney",
    countryName: "Australia",
    countryCode: "AU",
  },
  {
    iataCode: "MEL",
    name: "Tullamarine",
    cityName: "Melbourne",
    countryName: "Australia",
    countryCode: "AU",
  },
  {
    iataCode: "JFK",
    name: "John F. Kennedy Intl.",
    cityName: "New York",
    countryName: "United States",
    countryCode: "US",
  },
  {
    iataCode: "LAX",
    name: "Los Angeles Intl.",
    cityName: "Los Angeles",
    countryName: "United States",
    countryCode: "US",
  },
];

const countryCodeToFlag = (code?: string): string | null => {
  if (!code || code.length !== 2) return null;
  const upper = code.toUpperCase();
  const points = [...upper].map((ch) => 0x1f1e6 - 65 + ch.charCodeAt(0));
  return String.fromCodePoint(...points);
};

const fetchAirportSuggestions = async (
  keyword: string,
): Promise<AirportSuggestion[]> => {
  if (!keyword || keyword.trim().length < 1) return [];
  const term = keyword.trim().toLowerCase();

  // Try live Amadeus-powered search first (if env is set)
  try {
    const res = await fetch(
      `/api/airport-search?keyword=${encodeURIComponent(keyword.trim())}`,
    );
    const json = await res.json();
    if (res.ok && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch {
    // ignore – will use static fallback below
  }

  // Fallback: filter static list so user still sees dropdown.
  // IMPORTANT: we only match from the START of code/city/name,
  // so typing "S" shows S* airports – not A* ones.
  return STATIC_AIRPORTS.filter((a) => {
    const code = a.iataCode.toLowerCase();
    const name = a.name.toLowerCase();
    const city = a.cityName.toLowerCase();
    return (
      code.startsWith(term) || name.startsWith(term) || city.startsWith(term)
    );
  });
};

function InputField({
  icon,
  placeholder,
  name,
  value,
  onChange,
  required,
  enableAirportAutocomplete = false,
}: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<AirportSuggestion[]>([]);
  const [highlight, setHighlight] = useState(-1);
  const [displayValue, setDisplayValue] = useState<string>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSearch = useCallback(
    async (term: string) => {
      if (!enableAirportAutocomplete) return;
      if (!term || term.trim().length < 1) {
        setOptions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      const data = await fetchAirportSuggestions(term);
      setOptions(data);
      setOpen(data.length > 0);
      setHighlight(data.length > 0 ? 0 : -1);
      setLoading(false);
    },
    [enableAirportAutocomplete],
  );

  // Keep displayValue initialised from outside only when it is empty
  useEffect(() => {
    if (!displayValue && value) {
      setDisplayValue(value);
    }
  }, [value, displayValue]);

  useEffect(() => {
    if (!enableAirportAutocomplete) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerSearch(displayValue);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [displayValue, enableAirportAutocomplete, triggerSearch]);

  useEffect(() => {
    if (!enableAirportAutocomplete) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enableAirportAutocomplete]);

  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    onChange(e);
    if (!enableAirportAutocomplete) return;
    // value-change debounce handled by effect above through displayValue
  };

  const handleSelect = (opt: AirportSuggestion) => {
    const code = opt.iataCode.toUpperCase();
    const primaryCity = opt.cityName || opt.name;
    const label = primaryCity
      ? `${primaryCity} ${code ? `(${code})` : ""}`.trim()
      : code;
    setDisplayValue(label);
    const event = {
      target: { name, value: code },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!enableAirportAutocomplete || !open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h < options.length - 1 ? h + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h > 0 ? h - 1 : options.length - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      handleSelect(options[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10">
        {icon}
      </div>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInternalChange}
        onFocus={() =>
          enableAirportAutocomplete && options.length > 0 && setOpen(true)
        }
        onKeyDown={handleKeyDown}
        className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 shadow-lg outline-none font-bold text-sm uppercase placeholder:text-gray-300 focus:ring-4 focus:ring-black/5"
      />
      {required && (
        <span className="absolute -bottom-5 left-0 text-[9px] text-white/60 font-black uppercase">
          Required Field
        </span>
      )}

      {enableAirportAutocomplete && (open || loading) && (
        <ul className="absolute top-full left-0 right-0 mt-2 min-w-[min(100%,450px)] w-full bg-white border border-gray-100 rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] overflow-y-auto z-200 py-2 text-left">
          {loading && options.length === 0 ? (
            <li className="px-6 py-4 text-sm font-medium text-gray-400">
              Searching...
            </li>
          ) : (
            options.map((opt, idx) => {
              const primaryCity = opt.cityName || opt.name;
              const code = (opt.iataCode || "").toUpperCase();
              const country = opt.countryName || "";
              const flag = countryCodeToFlag(opt.countryCode);
              return (
                <li
                  key={`${opt.iataCode}-${idx}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`px-5 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors ${idx === highlight ? "bg-[#f6405f]/5" : "hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm md:text-base font-black text-gray-900">
                      {primaryCity} ({code})
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {country} {flag}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate">
                    {opt.name}
                  </p>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

function SelectField({ name, icon, label, value, onChange, options }: any) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none">
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-10 py-4 bg-white text-gray-900 shadow-lg outline-none font-bold text-sm uppercase appearance-none cursor-pointer focus:ring-4 focus:ring-black/5"
      >
        {options.map((opt: any) => (
          <option key={opt} value={opt}>
            {opt} {typeof opt === "number" ? label : ""}
          </option>
        ))}
      </select>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 pointer-events-none text-gray-400">
        <FaChevronDown size={12} />
      </div>
    </div>
  );
}

function CalendarOverlay({
  onSelect,
  selected,
  minDate,
  onClose,
}: {
  onSelect: (d: string) => void;
  selected: string;
  minDate?: string;
  onClose: () => void;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDay = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };

  const renderDays = () => {
    const totalDays = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDay(currentMonth, currentYear);
    const dayElements = [];

    for (let i = 0; i < firstDay; i++) {
      dayElements.push(<div key={`blank-${i}`} className="h-12 w-12"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isSelected = selected === dateStr;
      const isToday = today.toISOString().split("T")[0] === dateStr;
      const isPast = new Date(dateStr) < new Date(today.setHours(0, 0, 0, 0));
      const isBeforeMin = minDate && new Date(dateStr) < new Date(minDate);

      dayElements.push(
        <div
          key={d}
          onClick={(e) => {
            e.stopPropagation();
            if (!isPast && !isBeforeMin) onSelect(dateStr);
          }}
          className={`h-12 w-12 flex items-center justify-center text-sm font-extrabold cursor-pointer transition-all duration-200 border-2 rounded-lg m-0.5
                        ${isSelected ? "bg-[#071C4B] text-white border-[#071C4B] shadow-lg scale-110 z-10" : "bg-transparent text-gray-700 hover:bg-gray-100 border-transparent"}
                        ${isToday && !isSelected ? "text-[#C41E22] border-[#C41E22]/20" : ""}
                        ${isPast || isBeforeMin ? "opacity-10 cursor-not-allowed grayscale" : ""}
                    `}
        >
          {d}
        </div>,
      );
    }
    return dayElements;
  };

  return (
    <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] z-100 w-[calc(100vw-40px)] sm:w-[380px] border border-gray-100 p-4 sm:p-6 animate-in fade-in slide-in-from-top-4 duration-300 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
        >
          <FaChevronLeft size={14} />
        </button>
        <div className="text-base font-black uppercase text-[#071C4B] tracking-[0.2em]">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      {/* Days Weekday */}
      <div className="grid grid-cols-7 mb-4 text-center">
        {days.map((d) => (
          <div
            key={d}
            className={`text-[11px] font-black uppercase tracking-wider ${d === "Sun" ? "text-red-400" : "text-gray-400"}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center">{renderDays()}</div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center group">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect("");
            }}
            className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(today.toISOString().split("T")[0]);
            }}
            className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors"
          >
            Today
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="bg-[#071C4B] text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#0A2665] transition-all"
        >
          Done
        </button>
      </div>

      {/* Pointer Arrow */}
      <div className="absolute -top-2 left-10 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45"></div>
    </div>
  );
}
