"use client";

import { useEffect, useState } from "react";
import { getFlightAncillaries, getFlightSeatmaps } from "@/src/lib/flights";
import { FaChair, FaUtensils, FaTimes, FaCheck } from "react-icons/fa";
import { GiMeal } from "react-icons/gi";
import SeatMap from "./SeatMap";

interface FlightExtrasProps {
    flight: any;
    initialTab?: 'seats' | 'meals';
    onClose?: () => void;
}

export default function FlightExtras({ flight, initialTab = 'seats', onClose }: FlightExtrasProps) {
    const [activeTab, setActiveTab] = useState<'seats' | 'meals'>(initialTab);
    const [seatmap, setSeatmap] = useState<any>(null);
    const [ancillaries, setAncillaries] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Selections
    const [selectedSeat, setSelectedSeat] = useState<any>(null);
    const [selectedMeal, setSelectedMeal] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [seats, anc] = await Promise.all([
                    getFlightSeatmaps(flight),
                    getFlightAncillaries(flight)
                ]);
                setSeatmap(seats);
                setAncillaries(anc);
            } catch (e) {
                console.error("Failed to fetch details", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [flight]);

    return (
        <div className="flex flex-col h-full bg-gray-50/30">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('seats')}
                    className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'seats' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <FaChair /> Aircraft Seating
                    {activeTab === 'seats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('meals')}
                    className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'meals' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <FaUtensils /> Meal Plans
                    {activeTab === 'meals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 animate-pulse">Initializing booking options...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'seats' && (
                            <div className="animate-fade-in-up">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Select Your Seat</h3>
                                        <p className="text-sm text-gray-500">Choose your preferred spot on the aircraft.</p>
                                    </div>
                                    {selectedSeat && (
                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold animate-bounce-in">
                                            Selected: {selectedSeat.number}
                                        </div>
                                    )}
                                </div>

                                {seatmap && seatmap.data && seatmap.data.length > 0 ? (
                                    <SeatMap
                                        data={seatmap}
                                        onSeatSelect={setSelectedSeat}
                                    />
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <FaChair className="mx-auto text-4xl text-gray-300 mb-2" />
                                        <p className="text-gray-500">Seat selection is unavailable for this flight.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'meals' && (
                            <div className="animate-fade-in-up">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">In-Flight Dining</h3>

                                {ancillaries ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Mock list for UI demo */}
                                        {['Vegetarian Hindu Meal', 'Gluten Free Meal', 'Kosher Meal', 'Muslim Meal'].map((meal, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedMeal(meal)}
                                                className={`
                                                flex items-center gap-4 p-4 rounded-xl border transition-all text-left group
                                                ${selectedMeal === meal
                                                        ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500'
                                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
                                                    }
                                            `}
                                            >
                                                <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 transition-colors
                                                ${selectedMeal === meal ? 'bg-blue-500 text-white' : 'bg-orange-100 text-orange-500 group-hover:bg-blue-100 group-hover:text-blue-500'}
                                            `}>
                                                    <GiMeal />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-bold ${selectedMeal === meal ? 'text-blue-900' : 'text-gray-800'}`}>{meal}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">Special dietary option</p>
                                                </div>
                                                {selectedMeal === meal && <FaCheck className="text-blue-600" />}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500">No meal plans available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {onClose && (
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center sticky bottom-0 z-10">
                    <div className="text-sm text-gray-500">
                        {(selectedSeat || selectedMeal) ? (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <FaCheck /> Changes saved locally
                            </span>
                        ) : (
                            <span>No extras selected</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-all shadow-lg shadow-gray-200 transform active:scale-95"
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}
