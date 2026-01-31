import { FaPlane, FaClock } from "react-icons/fa";
import { MdFlightClass } from "react-icons/md";

interface FlightSegment {
    departure: {
        iataCode: string;
        at: string;
    };
    arrival: {
        iataCode: string;
        at: string;
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
}

interface FlightCardProps {
    offer: FlightOffer;
    dictionaries?: any;
    onViewDetails: (offer: FlightOffer, tab: 'seats' | 'meals') => void;
}

export default function FlightCard({ offer, dictionaries, onViewDetails }: FlightCardProps) {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    // Resolve Carrier Name
    const carrierCode = offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode;
    const carrierName = dictionaries?.carriers?.[carrierCode] || `${carrierCode} Airlines`;

    // Format time (e.g. 10:30 AM)
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format duration (PT2H30M -> 2h 30m) - Simple parser for display
    const formatDuration = (isoDuration: string) => {
        return isoDuration.replace("PT", "").toLowerCase();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-5 flex flex-col md:flex-row justify-between items-center gap-6 group">

            {/* Flight Info */}
            <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <FaPlane className="text-xl" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{carrierName}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Flight {firstSegment.carrierCode} {firstSegment.number}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-gray-700">
                    {/* Departure */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatTime(firstSegment.departure.at)}</div>
                        <div className="text-sm font-medium text-gray-500">{firstSegment.departure.iataCode}</div>
                    </div>

                    {/* Dotted Line / Duration */}
                    <div className="flex-1 px-4 flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <FaClock size={10} /> {formatDuration(itinerary.duration)}
                        </span>
                        <div className="w-full h-px bg-gray-300 relative group-hover:bg-blue-200 transition-colors">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">
                            {itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop(s)` : "Direct"}
                        </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatTime(lastSegment.arrival.at)}</div>
                        <div className="text-sm font-medium text-gray-500">{lastSegment.arrival.iataCode}</div>
                    </div>
                </div>
            </div>

            {/* Price & Action */}
            <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto gap-4 md:border-l md:pl-6 border-gray-100 min-w-[140px]">
                <div className="text-right w-full md:w-auto">
                    <div className="text-xs text-gray-400">Total Price</div>
                    <div className="text-2xl font-extrabold text-blue-600">
                        {offer.price.currency} {offer.price.total}
                    </div>
                </div>

                <div className="flex flex-col w-full gap-2">
                    <button
                        onClick={() => onViewDetails(offer, 'seats')}
                        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm active:translate-y-0.5"
                    >
                        Select Flight
                    </button>
                    <button
                        onClick={() => onViewDetails(offer, 'meals')}
                        className="w-full px-4 py-2 bg-white border border-blue-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <MdFlightClass /> View Extras
                    </button>
                </div>
            </div>

        </div>
    );
}
