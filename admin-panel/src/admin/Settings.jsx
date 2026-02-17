import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Settings = () => {
    const [markup, setMarkup] = useState(0);
    const [settingsId, setSettingsId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('pricing_settings')
                .select('id, markup_value')
                .single();

            if (data) {
                setMarkup(data.markup_value);
                setSettingsId(data.id);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase
                .from('pricing_settings')
                .update({ markup_value: markup })
                .eq('id', settingsId);

            if (error) throw error;
            setMessage('Markup updated successfully!');
        } catch (err) {
            setMessage('Error updating markup: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-1">Global Flight Markup</h2>
                        <p className="text-sm text-gray-500 mb-4">Set the percentage markup applied to all flight search results.</p>

                        <div className="flex items-center gap-4 max-w-sm">
                            <input
                                type="number"
                                value={markup}
                                onChange={(e) => setMarkup(parseFloat(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-[#071C4B]"
                                placeholder="0.00"
                            />
                            <span className="text-xl font-bold text-gray-400">%</span>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-bold ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-[#071C4B] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 grayscale pointer-events-none">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2">System Currency</h3>
                    <p className="text-xs text-gray-400 uppercase font-black">AUD ($)</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2">API Provider</h3>
                    <p className="text-xs text-gray-400 uppercase font-black">Amadeus Live Data</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
