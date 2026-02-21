"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { DisplayCurrency } from "@/src/lib/currency";

// For now we always display prices in AUD (single dollar currency).
// Locale-based switching (INR/USD) is disabled.
function getDisplayCurrencyFromLocale(): DisplayCurrency {
    return "AUD";
}

interface CurrencyContextValue {
    displayCurrency: DisplayCurrency;
    setDisplayCurrency: (c: DisplayCurrency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>("AUD");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Always use AUD regardless of locale or previous stored value.
        const stored = (typeof localStorage !== "undefined" && localStorage.getItem("displayCurrency")) as DisplayCurrency | null;
        const initial: DisplayCurrency = stored === "AUD" ? "AUD" : "AUD";
        setDisplayCurrencyState(initial);
        if (typeof localStorage !== "undefined") localStorage.setItem("displayCurrency", initial);
        setMounted(true);
    }, []);

    const setDisplayCurrency = (c: DisplayCurrency) => {
        // Clamp to AUD so UI never switches to INR/USD.
        const safe: DisplayCurrency = "AUD";
        setDisplayCurrencyState(safe);
        if (typeof localStorage !== "undefined") localStorage.setItem("displayCurrency", safe);
    };

    const value = useMemo(
        () => ({ displayCurrency: mounted ? displayCurrency : "AUD", setDisplayCurrency }),
        [displayCurrency, mounted]
    );

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useDisplayCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        return {
            displayCurrency: "AUD",
            setDisplayCurrency: () => {},
        };
    }
    return ctx;
}
