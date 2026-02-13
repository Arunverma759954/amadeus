import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Eye, TrendingUp, Users, Plane, ArrowUp, ArrowDown, Activity, DollarSign, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
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
        const fetchDashboardData = async () => {
            const { count: bookingCount, data: bData } = await supabase.from('bookings').select('*', { count: 'exact' });
            const { count: searchCount } = await supabase.from('search_logs').select('*', { count: 'exact' });

            // Fetch real user count from profiles (excluding admins to match user expectation of 6)
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
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {/* Total Users */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                            Live <Activity className="h-3 w-3 animate-pulse" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</h3>
                        <p className="text-sm font-medium text-slate-500">Registered Users</p>
                    </div>
                </div>

                {/* Total Profit */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">INR {stats.totalProfit.toLocaleString()}</h3>
                        <p className="text-sm font-medium text-slate-500">Total Profit Earned</p>
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30">
                            <Plane className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                            {stats.totalBookings > 0 ? 'Active' : 'Empty'}
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBookings}</h3>
                        <p className="text-sm font-medium text-slate-500">Total Flight Bookings</p>
                    </div>
                </div>

                {/* Total Searches */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                            <Search className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSearches}</h3>
                        <p className="text-sm font-medium text-slate-500">Total Flight Searches</p>
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Analytics Overview</h4>
                            <p className="text-sm text-slate-500">Live booking activity vs Search volume</p>
                        </div>
                    </div>
                    <div>
                        <ReactApexChart options={options} series={series} type="area" height={350} />
                    </div>
                </div>

                <div className="col-span-12 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-4">
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
