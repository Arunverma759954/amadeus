import { NextRequest, NextResponse } from "next/server";

const AMADEUS_TOKEN_URL = "https://api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://api.amadeus.com";

async function getAmadeusToken(): Promise<string> {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    const isPlaceholder = clientId === "your_amadeus_client_id" || clientSecret === "your_amadeus_client_secret";

    if (!clientId || !clientSecret || isPlaceholder) {
        throw new Error("AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are not configured or using placeholders in .env.local");
    }
    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
    });
    const res = await fetch(AMADEUS_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Amadeus token failed: ${res.status} ${t}`);
    }
    const data = await res.json();
    return data.access_token;
}

export interface AirportLocationItem {
    iataCode: string;
    name: string;
    detailedName?: string;
    cityName: string;
    countryName: string;
    countryCode?: string;
    subType: string;
}

export async function GET(request: NextRequest) {
    const keyword = request.nextUrl.searchParams.get("keyword")?.trim();
    if (!keyword || keyword.length < 1) {
        return NextResponse.json(
            { error: "Keyword required" },
            { status: 400 }
        );
    }

    // If Amadeus credentials are not set or are placeholders, return empty data so frontend uses its static list (no 500)
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    const isPlaceholder = clientId === "your_amadeus_client_id" || clientSecret === "your_amadeus_client_secret";

    if (!clientId || !clientSecret || isPlaceholder) {
        console.warn("Amadeus credentials are missing or using placeholders. Airport autocomplete will be limited.");
        return NextResponse.json({ data: [] });
    }

    try {
        const token = await getAmadeusToken();
        const url = new URL(`${AMADEUS_BASE}/v1/reference-data/locations`);
        url.searchParams.set("keyword", keyword);
        url.searchParams.set("subType", "AIRPORT,CITY");
        // More results so client sees rich dropdown (max 25)
        url.searchParams.set("page[limit]", "25");
        url.searchParams.set("view", "LIGHT");

        const res = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/vnd.amadeus+json",
            },
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Amadeus locations error:", res.status, errText);
            return NextResponse.json(
                { error: "Airport search failed" },
                { status: res.status }
            );
        }

        const json = await res.json();
        const data = (json.data || []).map((loc: any) => ({
            iataCode: loc.iataCode || "",
            name: loc.name || "",
            detailedName: loc.detailedName,
            cityName: loc.address?.cityName || "",
            countryName: loc.address?.countryName || "",
            countryCode: loc.address?.countryCode || "",
            subType: loc.subType || "AIRPORT",
        }));

        return NextResponse.json({ data });
    } catch (e: any) {
        console.error("airport-search error:", e);
        return NextResponse.json(
            { error: e.message || "Airport search failed" },
            { status: 500 }
        );
    }
}
