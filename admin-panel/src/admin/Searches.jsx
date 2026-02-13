import React, { useState, useEffect } from 'react';
import { Breadcrumb } from './components/Breadcrumb';
import { Search, Filter, Plane, Calendar, User, ArrowRight, MoreHorizontal, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Searches = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [searchesData, setSearchesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearches = async () => {
            const { data, error } = await supabase
                .from('search_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setSearchesData(data);
            setLoading(false);
        };

        fetchSearches();

        const channel = supabase
            .channel('searches_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'search_logs' },
                (payload) => setSearchesData(prev => [payload.new, ...prev]))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const filteredSearches = searchesData.filter(item => {
        const matchesSearch = item.search_params.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.search_params.destination.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Booked': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900';
            case 'Active': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900';
            case 'Expired': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Flight Searches</h2>
                    <Breadcrumb pageName="Monitor user search activity" />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                {/* Filter/Search Bar */}
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by city or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/20"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm font-medium outline-none transition-all hover:border-indigo-600 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-indigo-500"
                            >
                                <option>All Types</option>
                                <option>Round Trip</option>
                                <option>One Way</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-slate-50 text-left dark:bg-slate-800/50">
                                <th className="min-w-[200px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    Route Information
                                </th>
                                <th className="min-w-[150px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    User
                                </th>
                                <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    Dates
                                </th>
                                <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    Details
                                </th>
                                <th className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    Status
                                </th>
                                <th className="py-4 px-6 text-right font-semibold text-slate-600 dark:text-slate-400">

                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filteredSearches.length > 0 ? (
                                filteredSearches.map((item) => (
                                    <tr key={item.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white uppercase">{item.search_params.origin}</span>
                                                    <ArrowRight className="h-3 w-3 text-slate-400" />
                                                    <span className="font-bold text-slate-900 dark:text-white uppercase">{item.search_params.destination}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                                                    <MapPin size={10} /> TRACKED
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {item.user_id ? `User ${item.user_id.substring(0, 6)}` : "Guest User"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    Depart: {item.search_params.departureDate}
                                                </span>
                                                <span className="text-slate-500">
                                                    {item.search_params.adults} Pax • {item.search_params.tripType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold leading-normal bg-indigo-100 text-indigo-600`}>
                                                Live Result
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500">
                                        No flight searches found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Searches;
