import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaSpinner, FaShieldAlt } from "react-icons/fa";

// Note: Using localStorage authentication for the admin-panel
const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState(null);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check credentials (matching your logic from page.tsx)
            if (email === 'arunverma7599@gmail.com' || email === 'arunverma759954@gmail.com' || email === 'arunverma759959@gmail.com') {
                setIsLoggingIn(true);

                // Add a professional login duration
                setTimeout(() => {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('user', JSON.stringify({
                        name: 'Arun Verma',
                        email: email,
                        role: 'Super Admin',
                        avatar: 'https://i.pinimg.com/564x/7f/6c/64/7f6c64f2d6c4f7f1f8c6f5c2cda6a0c4.jpg'
                    }));

                    // Redirect to dashboard
                    navigate('/admin');
                }, 2000); // 2 seconds delay for premium feel
            } else {
                setLoading(false);
                throw new Error("Access Denied. You do not have admin privileges.");
            }
        } catch (err) {
            console.error("Admin Login Error:", err);
            setError(err.message || "Failed to login as admin");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden font-sans">
            {/* Login Loading Overlay */}
            {isLoggingIn && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl transition-all duration-500">
                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaShieldAlt className="h-10 w-10 text-blue-500" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-white italic tracking-widest uppercase mb-1">
                                AMADEUS <span className="text-blue-500">SECURE</span>
                            </h3>
                            <p className="text-blue-400 font-bold animate-pulse uppercase tracking-tighter text-sm">Verifying & Preparing Dashboard...</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-gray-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-blue-500/20">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600/20 p-4 rounded-full border-2 border-blue-500/50">
                        <FaShieldAlt className="text-blue-400 text-4xl" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2">
                        AMADEUS <span className="text-blue-400">ADMIN</span>
                    </h1>
                    <p className="text-gray-300 font-medium">Admin Access Portal</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30 flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
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
                        <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
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
                        {loading || isLoggingIn ? (
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
                    <a href="http://localhost:3000" className="text-blue-400 font-bold hover:underline">
                        Go to Main Site
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
