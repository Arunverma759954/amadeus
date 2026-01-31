import apiClient from "./apiClient";
import { AxiosError } from "axios";

export interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    adults: number;
}

export const searchFlights = async (params: FlightSearchParams) => {
    try {
        const response = await apiClient.post("/flights/search", params);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || error.message || "Failed to search flights");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getFlightAncillaries = async (flightOffer: any) => {
    try {
        // Amadeus Pricing API expectation for ancillaries check
        const response = await apiClient.post("/flights/ancillaries", {
            data: {
                type: "flight-offers-pricing",
                flightOffers: [flightOffer]
            }
        });
        return response.data;
    } catch (error) {
        // If complex structure fails, try fallback or just log
        console.error("Ancillary fetch error", error);
        return null;
    }
};

export const getFlightSeatmaps = async (flightOffer: any) => {
    try {
        // Use pricing context structure for better compatibility
        const response = await apiClient.post("/flights/seatmaps", {
            data: {
                type: "flight-offers-pricing",
                flightOffers: [flightOffer]
            }
        });
        return response.data;
    } catch (error) {
        console.error("Seatmap fetch error", error);
        return null;
    }
};
