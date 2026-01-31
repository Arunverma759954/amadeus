"use client";

import { useState } from "react";
import { searchFlights, FlightSearchParams } from "@/src/lib/flights";
import { searchHotels, HotelSearchParams } from "@/src/lib/hotels";
import {
    FaPlane, FaHotel, FaHome, FaUmbrellaBeach, FaTrain, FaBus, FaTaxi,
    FaMoneyBillAlt, FaShieldAlt, FaExchangeAlt, FaChevronDown
} from "react-icons/fa";

interface SearchFormProps {
    onResults: (data: any, type: 'flight' | 'hotel') => void;
    onSearchStart: () => void;
    onError: (msg: string) => void;
}

export default function SearchForm({ onResults, onSearchStart, onError }: SearchFormProps) {
    const [activeTab, setActiveTab] = useState<'flight' | 'hotel'>('flight');
    const [loading, setLoading] = useState(false);
    const [tripType, setTripType] = useState('oneway'); // oneway, round, multicity
    const [specialFare, setSpecialFare] = useState('regular'); // regular, student, senior, etc.

    // Flight State
    const [flightParams, setFlightParams] = useState<FlightSearchParams>({
        origin: "DEL",
        destination: "BOM",
        departureDate: new Date().toISOString().split('T')[0],
        adults: 1,
    });

    // Hotel State
    const [hotelParams, setHotelParams] = useState<HotelSearchParams>({
        cityCode: "GOI",
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guests: 2,
    });

    const handleFlightChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFlightParams((prev) => ({
            ...prev,
            [name]: name === "adults" ? parseInt(value) || 1 : value,
        }));
    };

    const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHotelParams((prev) => ({
            ...prev,
            [name]: name === "guests" ? parseInt(value) || 1 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        onSearchStart();

        try {
            if (activeTab === 'flight') {
                if (!flightParams.origin || !flightParams.destination || !flightParams.departureDate) {
                    throw new Error("Please fill in all flight fields");
                }
                const data = await searchFlights(flightParams);
                onResults(data, 'flight');
            } else {
                if (!hotelParams.cityCode || !hotelParams.checkInDate || !hotelParams.checkOutDate) {
                    throw new Error("Please fill in all hotel fields");
                }
                const data = await searchHotels(hotelParams);
                onResults(data, 'hotel');
            }
        } catch (err: any) {
            onError(err.message || "An error occurred while searching");
        } finally {
            setLoading(false);
        }
    };

    // Nav Items Configuration
    const navItems = [
        { id: 'flight', icon: FaPlane, label: 'Flights' },
        { id: 'hotel', icon: FaHotel, label: 'Hotels' },
        { id: 'villas', icon: FaHome, label: 'Homestays & Villas' },
        { id: 'packages', icon: FaUmbrellaBeach, label: 'Holiday Packages' },
        { id: 'trains', icon: FaTrain, label: 'Trains' },
        { id: 'buses', icon: FaBus, label: 'Buses' },
        { id: 'cabs', icon: FaTaxi, label: 'Cabs' },
        { id: 'forex', icon: FaMoneyBillAlt, label: 'Forex' },
        { id: 'insurance', icon: FaShieldAlt, label: 'Travel Insurance' },
    ];

    // Special Fares Configuration
    const specialFares = [
        { id: 'regular', label: 'Regular', sub: 'Regular fares' },
        { id: 'student', label: 'Student', sub: 'Extra discounts/baggage' },
        { id: 'senior', label: 'Senior Citizen', sub: 'Up to ₹600 off' },
        { id: 'armed', label: 'Armed Forces', sub: 'Up to ₹600 off' },
        { id: 'doctor', label: 'Doctors & Nurses', sub: 'Up to ₹600 off' },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto relative z-20 font-sans">

            {/* 1. Header Navigation Icons (Floating above card) */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 mb-4 md:mb-8 shadow-md flex flex-wrap justify-between md:justify-center gap-2 md:gap-8 overflow-x-auto no-scrollbar border border-white/50">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id || (item.id === 'flight' && activeTab === 'flight');
                    // Note: We only have 'flight' and 'hotel' functional, others map to flight visually or disabled.
                    // For logic simplicity, 'flight' is default active.

                    return (
                        <button
                            key={item.id}
                            onClick={() => (item.id === 'flight' || item.id === 'hotel') && setActiveTab(item.id as any)}
                            className={`flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group transition-all duration-300 relative px-2 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                                }`}
                        >
                            <span className={`text-2xl mb-1 transition-transform group-hover:-translate-y-1 ${isActive ? 'scale-110' : ''}`}>
                                <item.icon />
                            </span>
                            <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wide`}>
                                {item.label}
                            </span>
                            {/* Blue Underline for Active */}
                            {isActive && (
                                <span className="absolute -bottom-4 w-full h-1 bg-blue-600 rounded-t-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 2. Main Search Card */}
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 pt-8 pb-16 relative border border-gray-100 min-h-[400px]">
                <form onSubmit={handleSubmit}>

                    {/* Flight Type Radio Buttons */}
                    {activeTab === 'flight' && (
                        <div className="flex items-center gap-6 mb-8 text-sm font-semibold text-gray-600">
                            {[
                                { id: 'oneway', label: 'One Way' },
                                { id: 'round', label: 'Round Trip' },
                                { id: 'multi', label: 'Multi City' }
                            ].map((type) => (
                                <label key={type.id} className="flex items-center gap-2 cursor-pointer hover:text-gray-900 group">
                                    <input
                                        type="radio"
                                        name="tripType"
                                        checked={tripType === type.id}
                                        onChange={() => setTripType(type.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className={`${tripType === type.id ? 'text-gray-900' : ''}`}>{type.label}</span>
                                </label>
                            ))}
                            <span className="text-gray-400 text-xs font-normal ml-auto hidden md:block">Book International and Domestic Flights</span>
                        </div>
                    )}

                    {/* MAIN INPUTS GRID */}
                    {activeTab === 'flight' ? (
                        /* FLIGHTS GRID */
                        <div className="grid grid-cols-1 md:grid-cols-12 border border-gray-200 rounded-xl relative shadow-sm hover:shadow-md transition-shadow">

                            {/* FROM */}
                            <div className="md:col-span-3 p-4 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-blue-50/30 transition-colors cursor-text group relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From</label>
                                <input
                                    type="text"
                                    name="origin"
                                    value={flightParams.origin}
                                    onChange={handleFlightChange}
                                    className="block w-full text-3xl font-black text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 leading-tight uppercase"
                                    placeholder="DEL"
                                />
                                <p className="text-xs text-black truncate overflow-hidden">
                                    Airport, India
                                </p>
                            </div>

                            {/* SWAP ICON */}
                            <div className="absolute top-[25%] left-[50%] md:top-[35%] md:left-[25%] -translate-x-1/2 z-10 hidden md:flex">
                                <div className="w-8 h-8 bg-white rounded-full shadow border border-blue-100 flex items-center justify-center text-blue-600 cursor-pointer hover:rotate-180 transition-transform duration-300">
                                    <FaExchangeAlt size={12} />
                                </div>
                            </div>

                            {/* TO */}
                            <div className="md:col-span-3 p-4 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-blue-50/30 transition-colors cursor-text group">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={flightParams.destination}
                                    onChange={handleFlightChange}
                                    className="block w-full text-3xl font-black text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 leading-tight uppercase"
                                    placeholder="BOM"
                                />
                                <p className="text-xs text-black truncate overflow-hidden">
                                    Airport, India
                                </p>
                            </div>

                            {/* DEPARTURE */}
                            <div className="md:col-span-3 p-4 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 group-hover:text-blue-600">Departure</label>
                                    <FaChevronDown className="text-[10px] text-blue-600 mb-1" />
                                </div>
                                <div className="relative">
                                    {/* Date Logic Display */}
                                    <input
                                        type="date"
                                        name="departureDate"
                                        value={flightParams.departureDate}
                                        onChange={handleFlightChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-gray-900 leading-tight">
                                            {flightParams.departureDate ? new Date(flightParams.departureDate).getDate() : 'DD'}
                                            <span className="text-lg font-bold ml-1 align-top relative top-1">
                                                {flightParams.departureDate ? new Date(flightParams.departureDate).toLocaleString('default', { month: 'short' }) : 'MM'} '{flightParams.departureDate ? new Date(flightParams.departureDate).getFullYear().toString().slice(-2) : 'YY'}
                                            </span>
                                        </span>
                                        <span className="text-xs text-black">
                                            {flightParams.departureDate ? new Date(flightParams.departureDate).toLocaleString('default', { weekday: 'long' }) : 'Select Date'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* TRAVELLERS */}
                            <div className="md:col-span-3 p-4 hover:bg-blue-50/30 transition-colors cursor-pointer group h-full flex flex-col justify-center">
                                <div className="flex items-center gap-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 group-hover:text-blue-600">Travellers & Class</label>
                                    <FaChevronDown className="text-[10px] text-blue-600 mb-1" />
                                </div>
                                <div className="relative">
                                    <span className="text-3xl font-black text-gray-900 leading-tight">
                                        {flightParams.adults}
                                        <span className="text-lg font-bold ml-1 align-top relative top-1">
                                            Traveller
                                        </span>
                                    </span>
                                    <p className="text-xs text-black">Economy/Premium Economy</p>

                                    {/* Hidden standard input for functionality */}
                                    <input
                                        type="number"
                                        name="adults"
                                        value={flightParams.adults}
                                        onChange={handleFlightChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        min="1"
                                        max="9"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* HOTEL GRID (Simplified version of Flight Grid style) */
                        <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 rounded-xl relative shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 border-r border-gray-200 hover:bg-blue-50/30">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City / Hotel / Area</label>
                                <input
                                    type="text"
                                    name="cityCode"
                                    value={hotelParams.cityCode}
                                    onChange={handleHotelChange}
                                    className="block w-full text-2xl font-black text-gray-900 border-none p-0 focus:ring-0 uppercase placeholder-gray-300"
                                    placeholder="PAR"
                                />
                                <p className="text-xs text-gray-500">IATA Code</p>
                            </div>
                            <div className="p-4 border-r border-gray-200 hover:bg-blue-50/30 relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in</label>
                                <input
                                    type="date"
                                    name="checkInDate"
                                    value={hotelParams.checkInDate}
                                    onChange={handleHotelChange}
                                    className="block w-full text-xl font-bold text-gray-900 border-none p-0 focus:ring-0"
                                />
                                <span className="text-xs text-black">
                                    {hotelParams.checkInDate ? new Date(hotelParams.checkInDate).toLocaleString('default', { weekday: 'long' }) : '-'}
                                </span>
                            </div>
                            <div className="p-4 border-r border-gray-200 hover:bg-blue-50/30 relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out</label>
                                <input
                                    type="date"
                                    name="checkOutDate"
                                    value={hotelParams.checkOutDate}
                                    onChange={handleHotelChange}
                                    className="block w-full text-xl font-bold text-gray-900 border-none p-0 focus:ring-0"
                                />
                                <span className="text-xs text-black">
                                    {hotelParams.checkOutDate ? new Date(hotelParams.checkOutDate).toLocaleString('default', { weekday: 'long' }) : '-'}
                                </span>
                            </div>
                            <div className="p-4 hover:bg-blue-50/30">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rooms & Guests</label>
                                <div className="text-xl font-bold text-gray-900">
                                    1 Room, <input type="number" name="guests" value={hotelParams.guests} onChange={handleHotelChange} className="w-12 bg-transparent border-none focus:ring-0 p-0 text-xl font-bold" min="1" max="5" /> Guests
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Special Fares (Flights Only) */}
                    {activeTab === 'flight' && (
                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <span className="text-xs font-bold text-gray-500 mr-2">SPECIAL FARES</span>
                            {specialFares.map((fare) => (
                                <button
                                    key={fare.id}
                                    type="button"
                                    onClick={() => setSpecialFare(fare.id)}
                                    className={`
                                        bg-white border rounded-full px-3 py-1 flex flex-col items-start transition-all relative overflow-hidden group
                                        ${specialFare === fare.id
                                            ? 'border-blue-600 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                                        }
                                    `}
                                >
                                    <span className={`text-[10px] font-bold ${specialFare === fare.id ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {fare.label}
                                    </span>
                                    {specialFare === fare.id && (
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-bl-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* MAIN SEARCH BUTTON */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl font-bold uppercase py-3 px-16 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-4 border-white active:scale-95"
                        >
                            {loading ? "SEARCHING..." : "SEARCH"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
