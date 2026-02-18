import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Eye, TrendingUp, Users, Plane, ArrowUp, ArrowDown, Activity, DollarSign, Search, User, Mail, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
    const [adminInfo, setAdminInfo] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalSearches: 0,
        totalProfit: 0,
        totalUsers: 0,
        recentBookings: [],
        recentUsers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                setAdminInfo({
                    name: storedUser.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
                    email: user.email || storedUser.email || '',
                    role: storedUser.role || 'Super Admin',
                    avatar: storedUser.avatar || user.user_metadata?.avatar_url || 'https://i.pinimg.com/564x/7f/6c/64/7f6c64f2d6c4f7f1f8c6f5c2cda6a0c4.jpg',
                    lastLogin: user.last_sign_in_at || new Date().toISOString()
                });
            }
        };

        const fetchDashboardData = async () => {
            const { count: bookingCount, data: bData } = await supabase.from('bookings').select('*', { count: 'exact' });
            const { count: searchCount } = await supabase.from('search_logs').select('*', { count: 'exact' });

            // Fetch real user count from profiles (excluding admins)
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_admin', false);

            // Calculate total profit
            const totalProfitV = bData?.reduce((acc, b) => acc + (parseFloat(b.flight_details.price) / 2), 0) || 0;

            setStats({
                totalBookings: bookingCount || 0,
                totalSearches: searchCount || 0,
                totalProfit: totalProfitV,
                totalUsers: userCount || 0,
                recentBookings: bData?.slice(0, 4) || []
            });
            setLoading(false);
        };

        fetchAdminInfo();

        fetchDashboardData();

        // Subscribe to new bookings for real-time dashboard
        const bookingChannel = supabase
            .channel('dashboard_bookings')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' },
                () => fetchDashboardData())
            .subscribe();

        // Subscribe to new searches for real-time dashboard
        const searchChannel = supabase
            .channel('dashboard_searches')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'search_logs' },
                () => fetchDashboardData())
            .subscribe();

        // Subscribe to new users for real-time dashboard
        const profileChannel = supabase
            .channel('dashboard_profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },
                () => fetchDashboardData())
            .subscribe();

        return () => {
            supabase.removeChannel(bookingChannel);
            supabase.removeChannel(searchChannel);
            supabase.removeChannel(profileChannel);
        };
    }, []);

    const series = [
        {
            name: 'Flights Booked',
            data: [stats.totalBookings, 40, 28, 51, 42, 109, stats.totalBookings + 5],
        },
        {
            name: 'Searches',
            data: [stats.totalSearches, 32, 45, 32, 34, 52, stats.totalSearches + 10],
        },
    ];

    const options = {
        legend: { show: false },
        colors: ['#6366f1', '#818cf8'],
        chart: {
            type: 'area',
            fontFamily: 'Satoshi, sans-serif',
            height: 335,
            toolbar: { show: false },
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        },
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Admin Profile Card */}
            {adminInfo && (
                <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 sm:p-6 shadow-sm dark:border-indigo-800 dark:from-indigo-950/30 dark:to-blue-950/30">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ring-4 ring-white dark:ring-slate-900 overflow-hidden bg-white shrink-0">
                            <img src={adminInfo.avatar} alt={adminInfo.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{adminInfo.name}</h2>
                                <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">{adminInfo.role}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                    <span className="truncate">{adminInfo.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                    <span>Last login: {new Date(adminInfo.lastLogin).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
                {/* Total Users */}
                <div className="group rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                            Live <Activity className="h-3 w-3 animate-pulse" />
                        </span>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">Registered Users</p>
                    </div>
                </div>

                {/* Total Profit */}
                <div className="group rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate" title={stats.totalProfit.toLocaleString()}>INR {stats.totalProfit.toLocaleString()}</h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">Total Profit Earned</p>
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="group rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30">
                            <Plane className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                            {stats.totalBookings > 0 ? 'Active' : 'Empty'}
                        </span>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBookings}</h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">Total Flight Bookings</p>
                    </div>
                </div>

                {/* Total Searches */}
                <div className="group rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                            <Search className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSearches}</h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">Total Flight Searches</p>
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-12 gap-4 sm:gap-6">
                <div className="col-span-12 rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-8 min-w-0 overflow-hidden">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Analytics Overview</h4>
                            <p className="text-sm text-slate-500">Live booking activity vs Search volume</p>
                        </div>
                    </div>
                    <div className="min-w-0 overflow-x-auto">
                        <ReactApexChart options={options} series={series} type="area" height={350} />
                    </div>
                </div>

                <div className="col-span-12 rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-4 min-w-0">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h4>
                    <p className="text-sm text-slate-500 mb-6">Latest flight bookings intents</p>

                    <div className="flex flex-col gap-4">
                        {stats.recentBookings.map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-50 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                                        <Plane size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {item.flight_details.origin} ➔ {item.flight_details.destination}
                                        </p>
                                        <p className="text-[11px] text-slate-500">{item.flight_details.airline}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {item.flight_details.currency} {parseFloat(item.flight_details.price).toLocaleString()}
                                    </p>
                                    <p className={`text-[10px] font-bold ${item.status === 'Confirmed' ? 'text-emerald-500' : 'text-orange-500'}`}>{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-6 w-full rounded-xl border border-indigo-100 py-2 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950/30">
                        View Ledger
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
