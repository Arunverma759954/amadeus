"use client";

import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm";
import FlightCard, { FlightOffer } from "./components/FlightCard";
import HotelCard from "./components/HotelCard";
import DetailsModal from "./components/DetailsModal";
import { HotelOffer, getHotelOffers } from "@/src/lib/hotels";
import { FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

// Skeleton Components
const FlightSkeleton = () => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row gap-6 animate-pulse">
        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="flex justify-between px-8">
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded mt-1"></div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
        </div>
        <div className="w-32 h-24 bg-gray-200 rounded-lg"></div>
    </div>
);

const HotelSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 flex flex-col md:flex-row h-56 animate-pulse overflow-hidden">
        <div className="w-full md:w-72 bg-gray-200 h-full"></div>
        <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
                <div className="w-48 h-6 bg-gray-200 rounded"></div>
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between items-end">
                <div className="w-48 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

export default function Home() {
    const [results, setResults] = useState<any[] | null>(null);
    const [resultType, setResultType] = useState<'flight' | 'hotel'>('flight');
    const [filter, setFilter] = useState("");
    const [selectedFlight, setSelectedFlight] = useState<{ offer: FlightOffer, tab: 'seats' | 'meals' } | null>(null);

    // States for UX polish
    const [loading, setLoading] = useState(false);
    const [errorToast, setErrorToast] = useState<string | null>(null);
    const [offers, setOffers] = useState<any[] | null>(null);

    useEffect(() => {
        // Fetch generic offers on mount
        getHotelOffers().then(data => {
            if (data && data.data) {
                setOffers(data.data.slice(0, 3)); // Show top 3 offers
            }
        });
    }, []);

    // Clear toast after 5s
    useEffect(() => {
        if (errorToast) {
            const timer = setTimeout(() => setErrorToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorToast]);

    const handleSearchStart = () => {
        setLoading(true);
        setResults(null);
        setErrorToast(null);
    };

    const [dictionaries, setDictionaries] = useState<any>(null);

    const handleResults = (data: any, type: 'flight' | 'hotel') => {
        // Normalizing data structure which might be { data: [...] } or [...]
        const offers = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);

        setResults(offers);
        setDictionaries(data?.dictionaries || null);
        setResultType(type);
        setFilter(""); // Reset filter on new search
        setLoading(false);

        // Check for empty results to prompt suggestions
        if (offers.length === 0) {
            // We could set a specific 'no results' state, but existing logic handles list rendering.
        }
    };

    const handleError = (msg: string) => {
        setLoading(false);
        setErrorToast(msg);
    };

    const filteredResults = Array.isArray(results) ? results.filter((item) => {
        if (!filter) return true;
        const filterLower = filter.toLowerCase();

        if (resultType === 'flight') {
            const offer = item as FlightOffer;
            // Check Carrier
            const carrier = offer.validatingAirlineCodes?.[0]?.toLowerCase() || "";
            // Check Price
            const price = offer.price?.total?.toString().toLowerCase() || "";
            return carrier.includes(filterLower) || price.includes(filterLower);
        } else {
            const offer = item as HotelOffer;
            // Check Hotel Name
            const name = offer.hotel.name?.toLowerCase() || "";
            // Check Price (if available in this view)
            const price = offer.offers?.[0]?.price?.total?.toString().toLowerCase() || "";
            return name.includes(filterLower) || price.includes(filterLower);
        }
    }) : [];

    return (
        <main className="min-h-screen bg-gray-50 relative">

            {/* Hero Background Section */}
            <div className="absolute top-0 left-0 w-full h-[550px] bg-cover bg-center bg-no-repeat z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop")',
                }}
            >
                {/* Dark Overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center pt-16 md:pt-24 px-4 w-full max-w-7xl mx-auto">

                {/* Brand Logo Area (Simulated) */}
                <div className="w-full flex justify-between items-center mb-8 px-4 text-white">
                    <div className="text-2xl font-black tracking-tighter italic">
                        AMADEUS <span className="text-blue-400">TRIP</span>
                    </div>
                    <div className="hidden md:flex gap-4 text-xs font-bold uppercase tracking-wide">
                        <span className="cursor-pointer hover:text-blue-300">List Your Property</span>
                        <span className="cursor-pointer hover:text-blue-300">My Trips</span>
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1 rounded-full cursor-pointer shadow-lg border border-white/20">Login / Signup</span>
                    </div>
                </div>

                {/* Search Layout */}
                <SearchForm
                    onResults={handleResults}
                    onSearchStart={handleSearchStart}
                    onError={handleError}
                />
            </div>

            {/* Results Section */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mt-20 pb-20">

                {loading ? (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-gray-400 font-medium mb-4">Searching best deals for you...</h3>
                        {[1, 2, 3].map(i => resultType === 'flight' ? <FlightSkeleton key={i} /> : <HotelSkeleton key={i} />)}
                    </div>
                ) : results ? (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {filteredResults.length} {resultType === 'flight' ? 'Flight' : 'Hotel'}{filteredResults.length !== 1 ? 's' : ''} Found
                            </h2>
                            {/* Filter Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    placeholder={`Filter by ${resultType === 'flight' ? 'Airline' : 'Hotel Name'}...`}
                                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64 text-sm"
                                />
                                <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((item, index) => (
                                    resultType === 'flight' ? (
                                        <FlightCard
                                            key={(item as FlightOffer).id}
                                            offer={item as FlightOffer}
                                            dictionaries={dictionaries}
                                            onViewDetails={(offer, tab) => setSelectedFlight({ offer, tab })}
                                        />
                                    ) : (
                                        <HotelCard
                                            key={(item as HotelOffer).hotel.hotelId + index}
                                            offer={item as HotelOffer}
                                        />
                                    )
                                ))
                            ) : (
                                <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200">
                                    <p className="text-gray-500 text-lg">No {resultType}s match your filter.</p>
                                    <button
                                        onClick={() => setFilter("")}
                                        className="mt-4 text-blue-600 font-semibold hover:underline"
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Initial State / Offers Section */
                    <div className="mt-8 animate-fade-in">
                        {offers && offers.length > 0 ? (
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <FaInfoCircle className="text-blue-600" />
                                    <h3 className="text-xl font-bold text-gray-800">Trending Hotel Deals</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {offers.map((offer, idx) => (
                                        <HotelCard key={idx} offer={offer} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-10">
                                Start searching above to explore offers.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Flight Details Modal */}
            {selectedFlight && (
                <DetailsModal
                    flight={selectedFlight.offer}
                    initialTab={selectedFlight.tab}
                    onClose={() => setSelectedFlight(null)}
                />
            )}
        </main>
    );
}
// Helper icon for Toast
function FaTimes() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" viewBox="0 0 24 24" className="w-4 h-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    )
}
