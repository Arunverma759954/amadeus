"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { FaLock, FaSpinner, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [linkExpired, setLinkExpired] = useState(false);

    useEffect(() => {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const params = new URLSearchParams(hash.replace("#", ""));
        const err = params.get("error_description") || params.get("error");
        if (err && (err.includes("expired") || err.includes("invalid"))) {
            setLinkExpired(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            setSuccess(true);
            setTimeout(() => {
                const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
                const adminUrl = isLocal ? 'http://localhost:5173' : '';
                window.location.href = `${adminUrl}/admin-panel/admin/login`;
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to set password.");
        } finally {
            setLoading(false);
        }
    };

    if (linkExpired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                    <div className="text-amber-500 text-5xl mb-4">⚠️</div>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Link expired or invalid</h1>
                    <p className="text-slate-600 mb-6">
                        Password reset links are valid for a short time. Request a new one from the admin login page.
                    </p>
                    <button
                        onClick={() => {
                            const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
                            const adminUrl = isLocal ? 'http://localhost:5173' : '';
                            window.location.href = `${adminUrl}/admin-panel/admin/login`;
                        }}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700"
                    >
                        <FaArrowLeft /> Go to Admin Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                    <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Password updated</h1>
                    <p className="text-slate-600">Redirecting to admin login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h1 className="text-xl font-bold text-slate-800 mb-2">Set new password</h1>
                <p className="text-slate-600 text-sm mb-6">Enter your new password below.</p>
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <><FaSpinner className="animate-spin" /> Updating...</> : "Set password"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    <button
                        onClick={() => {
                            const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
                            const adminUrl = isLocal ? 'http://localhost:5173' : '';
                            window.location.href = `${adminUrl}/admin-panel/admin/login`;
                        }}
                        className="text-indigo-600 hover:underline"
                    >
                        Back to Admin Login
                    </button>
                </p>
            </div>
        </div>
    );
}
