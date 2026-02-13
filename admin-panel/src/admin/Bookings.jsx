import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaPlane, FaUser, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setBookings(data);
      setLoading(false);
    };

    fetchBookings();

    // Subscribe to new bookings
    const channel = supabase
      .channel('bookings_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => setBookings(prev => [payload.new, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Flight Bookings</h1>
          <p className="text-gray-500">Real-time view of customer booking intents</p>
        </div>
        <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-bold">
          Total: {bookings.length}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-all">
              <div className="flex items-center gap-6">
                <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                  <FaPlane className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-800 text-lg uppercase">
                      {booking.flight_details.origin} → {booking.flight_details.destination}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                      {booking.flight_details.airline}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FaUser size={10} /> User ID: {booking.user_id?.substring(0, 8) || "Guest"}</span>
                    <span className="flex items-center gap-1"><FaClock size={10} /> {new Date(booking.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-right">
                  <div className="text-sm text-gray-400 font-bold uppercase mb-0.5">Amount</div>
                  <div className="text-xl font-black text-gray-800">
                    {booking.flight_details.currency} {parseFloat(booking.flight_details.price).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {booking.status === 'Confirmed' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {booking.status}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="bg-white p-20 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
              No bookings recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;
