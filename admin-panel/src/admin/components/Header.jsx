import React from 'react';
import { Search, Bell, Menu, User, Sun, Moon, MessageSquare, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useColorMode from '../../hooks/useColorMode';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const [colorMode, setColorMode] = useColorMode();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const navigate = useNavigate();

    // Get user data from local storage or default to dummy
    const user = JSON.parse(localStorage.getItem('user')) || {
        name: 'Arun Verma',
        role: 'Super Admin',
        avatar: 'https://i.pinimg.com/564x/7f/6c/64/7f6c64f2d6c4f7f1f8c6f5c2cda6a0c4.jpg'
    };

    const handleLogout = () => {
        setIsLoggingOut(true);

        // Add a professional logout duration
        setTimeout(() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
        }, 1500); // 1.5 seconds duration
    };

    return (
        <>
            {/* Logout Loading Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-500">
                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <LogOut className="h-8 w-8 text-indigo-500" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-1">Logging out safely</h3>
                            <p className="text-slate-400 text-sm">Please wait a moment...</p>
                        </div>
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-40 flex w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex flex-grow items-center justify-between px-8 py-5">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSidebarOpen(!sidebarOpen);
                            }}
                            className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-800"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="hidden sm:block">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-96 rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-6 text-base outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/10 dark:focus:bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 border-r border-slate-200 pr-6 dark:border-slate-800">
                            {/* Theme Toggler */}
                            <button
                                onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
                                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
                            >
                                {colorMode === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                            </button>

                            {/* Notifications */}
                            <button className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-all">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900"></span>
                                </span>
                            </button>

                            {/* Messages */}
                            <button className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-all">
                                <MessageSquare className="h-6 w-6" />
                            </button>
                        </div>

                        {/* User Area */}
                        <div className="relative flex items-center gap-4 pl-2 group">
                            <div
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="hidden text-right lg:block cursor-pointer"
                            >
                                <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                <p className="text-xs font-medium text-slate-500">{user.role}</p>
                            </div>

                            <div className="relative">
                                <div
                                    onClick={() => navigate('/admin/profile')}
                                    className="h-12 w-12 rounded-full bg-indigo-100 overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-200 hover:ring-indigo-300 dark:ring-slate-700 dark:border-slate-800 transition-all cursor-pointer"
                                >
                                    <img src={user.avatar} alt="User" className="h-full w-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900 pointer-events-none"></div>
                            </div>

                            <ChevronDown
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={`h-5 w-5 text-slate-400 hover:text-slate-600 cursor-pointer transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                            />

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    {/* Click outside overlay to close */}
                                    <div
                                        className="fixed inset-0 z-0 h-screen w-screen"
                                        onClick={() => setDropdownOpen(false)}
                                    ></div>

                                    <div className="absolute right-0 top-full z-50 mt-4 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out origin-top-right">
                                        {/* Decorative Arrow */}
                                        <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"></div>

                                        {/* Dropdown Header */}
                                        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-800 mb-2 relative z-10 bg-white dark:bg-slate-900 rounded-t-2xl">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center dark:bg-indigo-900/30">
                                                <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                                <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Actions List */}
                                        <ul className="flex flex-col gap-1 relative z-10">
                                            <li>
                                                <button
                                                    onClick={() => { navigate('/admin/profile'); setDropdownOpen(false); }}
                                                    className="flex w-full items-center gap-3.5 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all rounded-xl group"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 transition-colors">
                                                        <User className="h-4.5 w-4.5" />
                                                    </div>
                                                    Personal Info
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => { navigate('/admin/settings'); setDropdownOpen(false); }}
                                                    className="flex w-full items-center gap-3.5 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all rounded-xl group"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 transition-colors">
                                                        <Settings className="h-4.5 w-4.5" />
                                                    </div>
                                                    Account Settings
                                                </button>
                                            </li>
                                            <li className="my-1 border-t border-slate-100 dark:border-slate-800"></li>
                                            <li>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-3.5 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all rounded-xl group"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                                                        <LogOut className="h-4.5 w-4.5" />
                                                    </div>
                                                    Log Out
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
