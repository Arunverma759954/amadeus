"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect users who visit /admin to the integrated panel
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const adminUrl = isLocal ? 'http://localhost:5173' : '';
        window.location.href = `${adminUrl}/admin-panel/admin`;
    }, []);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center font-sans font-black tracking-widest text-[#071C4B] text-xs">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#071C4B] border-t-transparent rounded-full animate-spin"></div>
                PAUSE... REDIRECTING TO AMADEUS COMMAND CENTER...
            </div>
        </div>
    );
}
