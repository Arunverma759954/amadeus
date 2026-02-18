import React, { useState, useEffect } from 'react';
import { Breadcrumb } from './components/Breadcrumb';
import { Eye, Edit, Trash2, MoreVertical, Plus, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            // Fetch real users from profiles table (excluding admins)
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', false)
                .order('created_at', { ascending: false });

            // Also fetch bookings to show user activity
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (!profilesError && profilesData) {
                // Map profiles to users with booking info
                const usersList = profilesData.map(profile => {
                    // Find user's latest booking
                    const userBookings = bookingsData?.filter(b => b.user_id === profile.id) || [];
                    const latestBooking = userBookings[0];

                    return {
                        id: profile.id,
                        name: profile.full_name || profile.name || profile.email?.split('@')[0] || 'User',
                        email: profile.email || 'No email',
                        img: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.id}`,
                        trip: latestBooking?.flight_details ? `${latestBooking.flight_details.origin} - ${latestBooking.flight_details.destination}` : "No bookings yet",
                        date: latestBooking ? new Date(latestBooking.created_at).toLocaleDateString() : new Date(profile.created_at).toLocaleDateString(),
                        status: latestBooking?.status || 'Active',
                        bookingsCount: userBookings.length,
                        lastActivity: latestBooking?.created_at || profile.updated_at || profile.created_at
                    };
                });

                setUsers(usersList);
            } else {
                // Fallback: if profiles table doesn't exist or has no data, use bookings
                const { data: bookingsData } = await supabase
                    .from('bookings')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (bookingsData) {
                    const uniqueUsers = [];
                    const seen = new Set();
                    bookingsData.forEach(item => {
                        const userId = item.user_id || "GUEST";
                        if (!seen.has(userId)) {
                            seen.add(userId);
                            uniqueUsers.push({
                                id: userId.substring(0, 8),
                                name: item.user_id ? `User ${item.user_id.substring(0, 4)}` : "Guest Passenger",
                                email: item.user_id ? `user.${item.user_id.substring(0, 4)}@example.com` : "guest@visitor.com",
                                img: `https://i.pravatar.cc/150?u=${item.user_id || 'guest'}`,
                                trip: item.flight_details ? `${item.flight_details.origin} - ${item.flight_details.destination}` : "No Trip Info",
                                date: new Date(item.created_at).toLocaleDateString(),
                                status: item.status,
                                bookingsCount: 1
                            });
                        }
                    });
                    setUsers(uniqueUsers);
                }
            }
            setLoading(false);
        };

        fetchUsers();

        const profilesChannel = supabase
            .channel('users_profiles_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },
                () => fetchUsers())
            .subscribe();

        const bookingsChannel = supabase
            .channel('users_bookings_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' },
                () => fetchUsers())
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
            supabase.removeChannel(bookingsChannel);
        };
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900';
            case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
            case 'Cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Users & Bookings</h2>
                    <Breadcrumb pageName="Manage your passengers" />
                </div>
                <button className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-6 font-medium text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                    <Plus className="h-5 w-5" />
                    Add New User
                </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                {/* Filter/Search Bar */}
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/20"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm font-medium outline-none transition-all hover:border-indigo-600 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-indigo-500"
                            >
                                <option>All Status</option>
                                <option>Confirmed</option>
                                <option>Pending</option>
                                <option>Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-slate-50 text-left dark:bg-slate-800/50">
                                <th className="min-w-[220px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    User Info
                                </th>
                                <th className="min-w-[150px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    Booking ID / Flight
                                </th>
                                <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    Trip Date
                                </th>
                                <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">
                                    Status
                                </th>
                                <th className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching Live Users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-800">
                                                    <img src={user.img} alt="User" />
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-slate-900 dark:text-white">
                                                        {user.name}
                                                    </h5>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">#{user.id.substring(0, 8)}</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{user.trip}</p>
                                            {user.bookingsCount > 0 && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">{user.bookingsCount} booking{user.bookingsCount > 1 ? 's' : ''}</p>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{user.date}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button className="rounded-lg p-2 hover:bg-white hover:text-indigo-600 hover:shadow-sm dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all">
                                                    <Eye className="w-4.5 h-4.5" />
                                                </button>
                                                <button className="rounded-lg p-2 hover:bg-white hover:text-indigo-600 hover:shadow-sm dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all">
                                                    <Edit className="w-4.5 h-4.5" />
                                                </button>
                                                <button className="rounded-lg p-2 hover:bg-white hover:text-rose-600 hover:shadow-sm dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-all">
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-500">
                                        No users found matching your filters.
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

export default Users;
