import { FaClock, FaChevronDown } from "react-icons/fa";

interface FlightSegment {
    departure: {
        iataCode: string;
        at: string;
        terminal?: string;
    };
    arrival: {
        iataCode: string;
        at: string;
        terminal?: string;
    };
    carrierCode: string;
    number: string;
    duration: string;
}

interface FlightItinerary {
    duration: string;
    segments: FlightSegment[];
}

interface FlightPrice {
    currency: string;
    total: string;
}

export interface FlightOffer {
    id: string;
    itineraries: FlightItinerary[];
    price: FlightPrice;
    validatingAirlineCodes: string[];
    travelerPricings?: any[];
}

interface FlightCardProps {
    offer: FlightOffer;
    dictionaries?: any;
    onViewDetails: (offer: FlightOffer, tab: 'details' | 'seats' | 'meals') => void;
}

export default function FlightCard({ offer, dictionaries, onViewDetails }: FlightCardProps) {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    // Resolve Carrier Name
    const carrierCode = offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode;
    const carrierName = dictionaries?.carriers?.[carrierCode] || `${carrierCode} Airlines`;

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDuration = (isoDuration: string) => {
        return isoDuration.replace("PT", "").toLowerCase().replace("h", "h ").replace("m", "m");
    };

    const basePrice = parseFloat(offer.price.total);

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row mb-6 hover:shadow-md transition-shadow">
            {/* Left: Flight Details */}
            <div className="flex-[1.5] p-5 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    {/* Departure */}
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-black text-[#071C4B]">{formatTime(firstSegment.departure.at)}</span>
                        <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{firstSegment.departure.iataCode}</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">Term {firstSegment.departure.terminal || '1'}</span>
                    </div>

                    {/* Path */}
                    <div className="flex-1 px-4 md:px-8 flex flex-col items-center relative">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter">{formatDuration(itinerary.duration)}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-100 flex items-center justify-center">
                                <div className="w-0.5 h-0.5 rounded-full bg-blue-600"></div>
                            </div>
                        </div>
                        <div className="w-full h-px bg-gray-200 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-gray-200 bg-white rounded-full"></div>
                        </div>
                    </div>

                    {/* Arrival */}
                    <div className="flex flex-col text-right">
                        <span className="text-xl md:text-2xl font-black text-[#071C4B]">{formatTime(lastSegment.arrival.at)}</span>
                        <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{lastSegment.arrival.iataCode}</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">Term {lastSegment.arrival.terminal || '1'}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-gray-500 font-bold">
                        <FaClock size={10} className="text-blue-600" />
                        <span>{formatDuration(itinerary.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-gray-500 font-bold">
                        <span className="text-green-600">✓</span>
                        <span>{carrierName}</span>
                    </div>
                    <div
                        onClick={() => onViewDetails(offer, 'details')}
                        className="text-[9px] md:text-[10px] text-blue-600 font-black cursor-pointer hover:underline uppercase tracking-widest"
                    >
                        + Details
                    </div>
                </div>
            </div>

            {/* Right: Price & Action */}
            <div className="w-full md:w-64 flex flex-col bg-[#F8FAFC] p-5 md:p-6 justify-center items-center">
                <div className="flex flex-row md:flex-col items-baseline md:items-center justify-between md:justify-center w-full gap-4">
                    <div className="flex flex-col items-start md:items-center">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Price</span>
                        {(offer as any).adjustment !== 0 && (offer as any).basePrice && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] text-gray-400 font-bold line-through">
                                    {offer.price.currency} {(offer as any).basePrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                    +{(offer as any).adjustment}%
                                </span>
                            </div>
                        )}
                        <div className="text-xl md:text-2xl font-black text-[#071C4B]">
                            {offer.price.currency} {basePrice.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <button
                        onClick={() => onViewDetails(offer, 'details')}
                        className="flex-1 md:w-full bg-[#071C4B] text-white font-black py-3 md:py-3.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-blue-900/10 text-[10px] md:text-xs uppercase tracking-[0.2em]"
                    >
                        Select
                    </button>
                </div>

                <div className="hidden md:flex mt-4 items-center justify-center gap-4 w-full">
                    <div
                        onClick={() => onViewDetails(offer, 'seats')}
                        className="text-[9px] font-black text-blue-600 cursor-pointer hover:underline uppercase tracking-widest"
                    >
                        + Extras (Bags/Seats)
                    </div>
                </div>
            </div>
        </div>
    );
}
