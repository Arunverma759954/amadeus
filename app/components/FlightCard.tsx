import { formatCurrency } from "@/src/lib/currency";
import type { DisplayCurrency } from "@/src/lib/currency";

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
    badge?: 'cheapest' | 'fastest' | 'recommended';
    variant?: 'default' | 'alt';
    /** Display prices in this currency (AUD/INR/USD) based on user location */
    displayCurrency?: DisplayCurrency;
}

// Airline logo URL by IATA carrier code (e.g. from Amadeus response). Fallback handled in UI.
const getAirlineLogoUrl = (carrierCode: string) =>
    `https://images.kiwi.com/airlines/64/${carrierCode}.png`;

// Full city/airport names when API dictionary doesn't have them (show full form instead of only code)
const AIRPORT_FULL_NAMES: Record<string, string> = {
    SYD: "Sydney", SIN: "Singapore", MEL: "Melbourne", BOM: "Mumbai", DEL: "Delhi", BLR: "Bengaluru",
    MAA: "Chennai", HYD: "Hyderabad", CCU: "Kolkata", AMD: "Ahmedabad", COK: "Kochi", GOI: "Goa",
    LHR: "London", DXB: "Dubai", AUH: "Abu Dhabi", BKK: "Bangkok", KUL: "Kuala Lumpur", HKG: "Hong Kong",
    DOH: "Doha",
    NRT: "Tokyo", ICN: "Seoul", PVG: "Shanghai", PEK: "Beijing", JFK: "New York", LAX: "Los Angeles",
    SFO: "San Francisco", ORD: "Chicago", FRA: "Frankfurt", CDG: "Paris", AMS: "Amsterdam", AKL: "Auckland",
    PER: "Perth", BNE: "Brisbane", ADL: "Adelaide", CNS: "Cairns", CBR: "Canberra", DRW: "Darwin",
    ATQ: "Amritsar", LKO: "Lucknow", JAI: "Jaipur", GAU: "Guwahati", IXC: "Chandigarh", VNS: "Varanasi",
};

export default function FlightCard({ offer, dictionaries, onViewDetails, badge, variant = 'default', displayCurrency = 'AUD' }: FlightCardProps) {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    // Resolve Carrier Name (from API dictionaries)
    const carrierCode = offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode;
    const carrierName = dictionaries?.carriers?.[carrierCode] || `${carrierCode} Airlines`;

    const findLocationByIata = (code: string) => {
        const locs = dictionaries?.locations;
        if (!locs) return null;
        return (Object.values(locs) as any[]).find((loc) => loc.iataCode === code) || null;
    };

    const originLoc = findLocationByIata(firstSegment.departure.iataCode);
    const destLoc = findLocationByIata(lastSegment.arrival.iataCode);

    const formatPlace = (loc: any, code: string) => {
        const city =
            loc?.cityName
            || loc?.name
            || (loc?.address && (loc.address.cityName || loc.address.countryName))
            || loc?.detailedName
            || loc?.cityCode
            || AIRPORT_FULL_NAMES[code]
            || code;
        const country = loc?.countryName || loc?.countryCode || (loc?.address?.countryCode ?? "") || "";
        return { city, country };
    };

    const originPlace = formatPlace(originLoc, firstSegment.departure.iataCode);
    const destPlace = formatPlace(destLoc, lastSegment.arrival.iataCode);

    const depDate = new Date(firstSegment.departure.at);
    const arrDate = new Date(lastSegment.arrival.at);
    const sameDay = depDate.toDateString() === arrDate.toDateString();

    const stopsCount = itinerary.segments.length - 1;
    const stopsLabel =
        stopsCount === 0 ? "Non-stop" : `${stopsCount} stop${stopsCount > 1 ? "s" : ""}`;

    // For connecting flights, show which cities are used as stopovers (e.g. DEL → BOM via JAI).
    const stopCodes =
        stopsCount > 0
            ? itinerary.segments.slice(0, -1).map((seg) => seg.arrival.iataCode)
            : [];
    const stopCities =
        stopCodes.length > 0
            ? stopCodes.map((code) => {
                  const loc = findLocationByIata(code);
                  const place = formatPlace(loc, code);
                  return `${place.city} (${code})`;
              })
            : [];
    const stopsDetailLabel =
        stopCities.length === 0
            ? null
            : stopCities.length === 1
            ? `Via ${stopCities[0]}`
            : `Via ${stopCities.join(", ")}`;

    const hasBaggage = (() => {
        const tp = offer.travelerPricings?.[0];
        const fares = tp?.fareDetailsBySegment || [];
        return fares.some(
            (f: any) =>
                f.includedCheckedBags &&
                ((f.includedCheckedBags.quantity ?? 0) > 0 ||
                    (f.includedCheckedBags.weight ?? 0) > 0)
        );
    })();

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

    const badgeLabel = badge === 'cheapest' ? 'Cheapest' : badge === 'fastest' ? 'Fastest' : badge === 'recommended' ? 'Recommended' : null;

    return (
        <div className={`group rounded-2xl md:rounded-[1.25rem] overflow-hidden flex flex-col md:flex-row transition-all duration-300 mb-5 bg-white border border-gray-100 ${badge ? 'shadow-[0_4px_20px_rgba(7,28,75,0.1)] ring-1 ring-[#071C4B]/10' : 'shadow-[0_2px_12px_rgba(7,28,75,0.06)]'} hover:shadow-[0_12px_40px_rgba(7,28,75,0.12)] hover:border-[#071C4B]/10`}>
            {/* Left: Flight Details - badge lives here so it never overlaps the price panel */}
            <div className={`flex-[1.6] p-5 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100/80 relative ${badgeLabel ? 'pt-10 pr-20 md:pt-12 md:pr-6' : ''}`}>
                {badgeLabel && (
                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-[#071C4B] text-white text-[9px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
                        {badgeLabel}
                    </div>
                )}
                {/* Airline row + times - extra top margin when badge so 19:35/BOM don't stick to badge; right padding so times don't sit under badge */}
                <div className={`flex items-start justify-between gap-4 mb-4 ${badgeLabel ? 'mt-1 pr-16 md:mt-0 md:pr-0' : ''}`}>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                            <img
                                src={getAirlineLogoUrl(carrierCode)}
                                alt=""
                                className="w-7 h-7 md:w-8 md:h-8 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm font-bold text-[#071C4B] leading-tight">{carrierName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{stopsLabel} • {formatDuration(itinerary.duration)}</p>
                        </div>
                    </div>
                    {/* Departure / Path / Arrival */}
                    <div className="flex items-center flex-1 min-w-0 justify-between md:justify-end md:gap-6">
                        <div className="flex flex-col text-left">
                            <span className="text-lg md:text-2xl font-black text-[#071C4B] tabular-nums">{formatTime(firstSegment.departure.at)}</span>
                            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{firstSegment.departure.iataCode}</span>
                        </div>
                        <div className="flex-1 px-2 md:px-4 flex flex-col items-center min-w-0">
                            <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative">
                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1.5 text-[8px] font-black text-gray-400">✈</span>
                            </div>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-lg md:text-2xl font-black text-[#071C4B] tabular-nums">{formatTime(lastSegment.arrival.at)}</span>
                            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{lastSegment.arrival.iataCode}</span>
                        </div>
                    </div>
                </div>

                {/* Route: cities + date + stopover cities */}
                <div className="mb-3">
                    <p className="text-[11px] md:text-xs font-semibold text-[#071C4B]">
                        {originPlace.city} ({firstSegment.departure.iataCode}) → {destPlace.city} ({lastSegment.arrival.iataCode})
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        {[originPlace.country, destPlace.country].filter(Boolean).join(" • ")}
                        {" · "}
                        {depDate.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
                        {!sameDay && ` – ${arrDate.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}`}
                    </p>
                    {stopsDetailLabel && (
                        <p className="text-[9px] md:text-[11px] text-gray-500 mt-0.5">
                            {stopsDetailLabel}
                        </p>
                    )}
                </div>

                {/* Chips: bags + details */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100/80">
                        {hasBaggage ? "Checked bag included" : "Hand baggage only"}
                    </span>
                    <button
                        type="button"
                        onClick={() => onViewDetails(offer, 'details')}
                        className="text-[10px] font-bold text-[#071C4B] cursor-pointer hover:underline uppercase tracking-wider"
                    >
                        Flight details →
                    </button>
                </div>
            </div>

            {/* Right: Price & Action */}
            <div className="w-full md:w-56 flex flex-col bg-gradient-to-b from-[#F8FAFC] to-gray-50/80 p-5 md:p-6 justify-center items-center border-t md:border-t-0 md:border-l border-gray-100/80">
                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center w-full gap-4">
                    <div className="flex flex-col items-start md:items-center">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total price</span>
                        {(offer as any).adjustment !== 0 && (offer as any).basePrice && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-gray-400 font-bold line-through">
                                    {formatCurrency((offer as any).basePrice, offer.price.currency, displayCurrency)}
                                </span>
                                <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                    +{(offer as any).adjustment}%
                                </span>
                            </div>
                        )}
                        <p className="text-xl md:text-2xl font-black text-[#071C4B] tracking-tight">
                            {formatCurrency(basePrice, offer.price.currency, displayCurrency)}
                        </p>
                    </div>
                    <button
                        onClick={() => onViewDetails(offer, 'details')}
                        className="w-full bg-[#071C4B] text-white font-black py-3.5 rounded-xl hover:bg-[#051535] active:scale-[0.98] transition-all shadow-lg shadow-[#071C4B]/15 text-[11px] uppercase tracking-widest"
                    >
                        Select
                    </button>
                </div>
                <div
                    onClick={() => onViewDetails(offer, 'seats')}
                    className="hidden md:block mt-4 text-[9px] font-bold text-[#071C4B]/80 hover:text-[#071C4B] cursor-pointer uppercase tracking-wider"
                >
                    + Extras (Bags / Seats)
                </div>
            </div>
        </div>
    );
}
