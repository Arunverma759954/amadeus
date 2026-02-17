"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { DisplayCurrency } from "@/src/lib/currency";

function getDisplayCurrencyFromLocale(): DisplayCurrency {
    if (typeof navigator === "undefined") return "AUD";
    const lang = navigator.language || (navigator as any).userLanguage || "";
    const tag = lang.toLowerCase();
    if (tag.startsWith("en-in") || tag.startsWith("hi")) return "INR";
    if (tag.startsWith("en-au")) return "AUD";
    if (tag.startsWith("en-us") || tag.startsWith("en-gb")) return "USD";
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
        const detected = getDisplayCurrencyFromLocale();
        const stored = (typeof localStorage !== "undefined" && localStorage.getItem("displayCurrency")) as DisplayCurrency | null;
        setDisplayCurrencyState(stored && ["AUD", "INR", "USD"].includes(stored) ? stored : detected);
        setMounted(true);
    }, []);

    const setDisplayCurrency = (c: DisplayCurrency) => {
        setDisplayCurrencyState(c);
        if (typeof localStorage !== "undefined") localStorage.setItem("displayCurrency", c);
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
