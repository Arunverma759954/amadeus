import React, { useState } from "react";
import { FaEnvelope, FaLock, FaSpinner, FaShieldAlt } from "react-icons/fa";
import { supabase } from "../lib/supabase";

// Allowed admin emails – login only works if Supabase Auth has this user and email is in list
const ALLOWED_ADMIN_EMAILS = [
    'arunverma7599@gmail.com',
    'arunverma759954@gmail.com',
    'arunverma759959@gmail.com',
];

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const MAIN_SITE_URL = isLocal ? 'http://localhost:3000' : window.location.origin;
const RESET_REDIRECT = `${MAIN_SITE_URL}/auth/reset-password`;

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [forgotSuccess, setForgotSuccess] = useState(null);

    const handleForgotPassword = async () => {
        const emailTrim = (email || '').trim().toLowerCase();
        if (!emailTrim) {
            setError('Enter your admin email above, then click Forgot password?');
            return;
        }
        if (!ALLOWED_ADMIN_EMAILS.includes(emailTrim)) {
            setError('This email is not authorised for admin. Use an allowed admin email.');
            return;
        }
        setError(null);
        setForgotSuccess(null);
        setLoading(true);
        try {
            const { error: err } = await supabase.auth.resetPasswordForEmail(emailTrim, { redirectTo: RESET_REDIRECT });
            if (err) throw err;
            setForgotSuccess('Check your email for the reset link. Click it and set a new password.');
        } catch (err) {
            setError(err?.message || 'Could not send reset email.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const emailTrim = (email || '').trim().toLowerCase();
            if (!ALLOWED_ADMIN_EMAILS.includes(emailTrim)) {
                setError("Access denied. This email is not authorised for admin.");
                setLoading(false);
                return;
            }

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: emailTrim,
                password: password,
            });

            if (authError) {
                setError(authError.message || "Invalid login credentials");
                setLoading(false);
                return;
            }

            const user = data?.user;
            const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({
                name,
                email: user?.email || emailTrim,
                role: 'Super Admin',
                avatar: user?.user_metadata?.avatar_url || 'https://i.pinimg.com/564x/7f/6c/64/7f6c64f2d6c4f7f1f8c6f5c2cda6a0c4.jpg'
            }));

            window.location.href = window.location.origin + '/admin';
        } catch (err) {
            console.error("Admin Login Error:", err);
            setError(err.message || "Invalid login credentials");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-x-hidden overflow-y-auto font-sans p-4 sm:p-6">
            {loading && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-24 w-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center">
                            <FaShieldAlt className="h-10 w-10 text-blue-500" />
                        </div>
                        <p className="text-blue-400 font-bold uppercase tracking-tighter text-sm">Verifying...</p>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md min-w-0 bg-gray-800/40 backdrop-blur-xl p-5 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-blue-500/20">
                <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="bg-blue-600/20 p-3 sm:p-4 rounded-full border-2 border-blue-500/50">
                        <FaShieldAlt className="text-blue-400 text-3xl sm:text-4xl" />
                    </div>
                </div>

                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white mb-2">
                        HIFI <span className="text-blue-400">ADMIN</span>
                    </h1>
                    <p className="text-gray-300 font-medium">Admin Access Portal</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30 flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}
                {forgotSuccess && (
                    <div className="bg-green-500/10 text-green-400 p-3 rounded-lg text-sm mb-4 border border-green-500/30">
                        {forgotSuccess}
                    </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Admin Email</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-400"><FaEnvelope /></span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-400"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-200">Password</label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs text-blue-400 hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-400"><FaLock /></span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Verifying...
                            </>
                        ) : (
                            <>
                                <FaShieldAlt /> Admin Login
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Not an admin?{" "}
                    <a href={MAIN_SITE_URL} className="text-blue-400 font-bold hover:underline">
                        Go to Main Site
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
