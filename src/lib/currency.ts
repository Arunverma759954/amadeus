/**
 * Display currency: Australia (AUD), India (INR), US/dollar regions (USD).
 * Approximate rates; AUD is base for this project.
 */
const RATES_TO_AUD: Record<string, number> = {
    AUD: 1,
    INR: 0.0182,   // 1 INR = 0.0182 AUD (≈55 INR per AUD)
    USD: 1.54,     // 1 USD ≈ 1.54 AUD
};

function toAUD(amount: number, fromCurrency: string): number {
    const rate = RATES_TO_AUD[fromCurrency] ?? 1;
    return amount * rate;
}

function fromAUD(amountAUD: number, toCurrency: string): number {
    const rate = RATES_TO_AUD[toCurrency];
    if (rate == null || rate === 0) return amountAUD;
    return amountAUD / rate;
}

/** Convert amount from one currency to another (AUD, INR, USD). */
export function convertCurrency(
    amount: number | string,
    fromCurrency: string,
    toCurrency: string
): { value: number; currency: string } {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    const inAUD = toAUD(value, fromCurrency);
    const out = fromAUD(inAUD, toCurrency);
    return { value: out, currency: toCurrency };
}

/** Format amount in a target display currency (for UI). */
export function formatCurrency(
    amount: number | string,
    fromCurrency: string,
    displayCurrency?: string
): string {
    const target = displayCurrency || fromCurrency;
    const { value, currency } = convertCurrency(amount, fromCurrency, target);
    const locale = target === "INR" ? "en-IN" : target === "USD" ? "en-US" : "en-AU";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/** Supported display currencies (Australia-based app: AUD default, INR for India, USD for dollar regions). */
export type DisplayCurrency = "AUD" | "INR" | "USD";

/** Indian airport IATA codes – when both origin and destination are in this set, we show INR. */
const INDIAN_AIRPORTS = new Set([
    "DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "AMD", "COK", "GOI", "ATQ", "LKO", "JAI", "IXC",
    "GAU", "BBI", "PNQ", "IXB", "SXR", "TRV", "VNS", "IXE", "NAG", "IDR", "BHJ", "JDH", "RPR",
    "IXJ", "AJL", "IXD", "STV", "BHO", "JLR", "GOP", "DED", "KNU", "IMF", "IXR", "IXA", "IXS",
    "VTZ", "HBX", "BDQ", "RAJ", "BKB", "JGB", "RJA", "TIR", "CJB", "TRZ", "IXM", "IXZ", "IXL",
]);

/** Use INR when route is within India (e.g. Delhi–Ahmedabad). */
export function isIndiaRoute(origin?: string | null, destination?: string | null): boolean {
    if (!origin || !destination) return false;
    return INDIAN_AIRPORTS.has(origin.toUpperCase()) && INDIAN_AIRPORTS.has(destination.toUpperCase());
}
