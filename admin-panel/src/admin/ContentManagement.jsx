import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Image as ImageIcon, Type, Layout } from 'lucide-react';

const ContentManagement = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            const { data, error } = await supabase
                .from('site_content')
                .select('*');

            if (!error && data) setContent(data);

            // If empty, initialize some defaults including top_destinations (for homepage cards)
            if (!error && data?.length === 0) {
                const defaults = [
                    { content_key: 'hero_title', content_value: 'Unlock Your Next Great Adventure', content_type: 'text' },
                    { content_key: 'hero_subtitle', content_value: 'Find and book the best flights to your favorite destinations.', content_type: 'text' },
                    { content_key: 'featured_deal_text', content_value: 'Special 20% Discount on Dubai Flights!', content_type: 'text' },
                    {
                        content_key: 'top_destinations',
                        content_type: 'json',
                        content_value: JSON.stringify([
                            { city: "London, UK", price: "From $339 r/t", image: "/OIP.webp" },
                            { city: "Paris, France", price: "From $477 r/t", image: "/OIP (1).webp" },
                            { city: "Rome, Italy", price: "From $479 r/t", image: "/OIP (2).webp" },
                            { city: "Frankfurt, Germany", price: "From $545 r/t", image: "/OIP (3).webp" },
                            { city: "Dubai, UAE", price: "From $610 r/t", image: "/OIP (4).webp" },
                            { city: "Singapore", price: "From $520 r/t", image: "/OIP (5).webp" },
                            { city: "Tokyo, Japan", price: "From $780 r/t", image: "/OIP (6).webp" },
                            { city: "New York, USA", price: "From $890 r/t", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" },
                        ])
                    }
                ];
                const { data: inserted } = await supabase.from('site_content').insert(defaults).select('*');
                setContent(inserted || defaults);
            }
            setLoading(false);
        };

        fetchContent();
    }, []);

    const handleUpdate = async (id, newValue) => {
        setContent(prev => prev.map(item => item.id === id ? { ...item, content_value: newValue } : item));
    };

    const saveChanges = async () => {
        setSaving(true);
        for (const item of content) {
            await supabase
                .from('site_content')
                .update({ content_value: item.content_value })
                .eq('id', item.id);
        }
        setSaving(false);
        alert("Content updated successfully!");
    };

    if (loading) return <div className="p-20 text-center">Loading content settings...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>
                    <p className="text-gray-500">Update homepage text and promotional banners</p>
                </div>
                <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 space-y-8">
                    {content.map((item) => {
                        // Special editor for top_destinations JSON (homepage cards)
                        if (item.content_type === 'json' && item.content_key === 'top_destinations') {
                            let destinations = [];
                            try {
                                const parsed = JSON.parse(item.content_value || "[]");
                                if (Array.isArray(parsed)) destinations = parsed;
                            } catch {
                                destinations = [];
                            }

                            const updateDestinations = (next) => {
                                handleUpdate(item.id, JSON.stringify(next));
                            };

                            return (
                                <div key={item.id} className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <ImageIcon size={14} />
                                        Home – Top Recommended Destinations (cards)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-1">
                                        Update city name, price text and image URL for each card. Changes reflect on the main website’s “Top Recommended Destinations” section.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {destinations.map((d, idx) => (
                                            <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                                        Card {idx + 1}
                                                    </span>
                                                    {destinations.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = destinations.filter((_, i) => i !== idx);
                                                                updateDestinations(next);
                                                            }}
                                                            className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    placeholder="City (e.g. London, UK)"
                                                    value={d.city || ""}
                                                    onChange={(e) => {
                                                        const next = destinations.slice();
                                                        next[idx] = { ...next[idx], city: e.target.value };
                                                        updateDestinations(next);
                                                    }}
                                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                                />
                                                <input
                                                    placeholder="Price text (e.g. From $339 r/t)"
                                                    value={d.price || ""}
                                                    onChange={(e) => {
                                                        const next = destinations.slice();
                                                        next[idx] = { ...next[idx], price: e.target.value };
                                                        updateDestinations(next);
                                                    }}
                                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                                />
                                                <input
                                                    placeholder="Image URL (relative like /OIP.webp or full https://...)"
                                                    value={d.image || ""}
                                                    onChange={(e) => {
                                                        const next = destinations.slice();
                                                        next[idx] = { ...next[idx], image: e.target.value };
                                                        updateDestinations(next);
                                                    }}
                                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const next = destinations.concat({
                                                city: "New Destination",
                                                price: "From $000 r/t",
                                                image: "/OIP.webp"
                                            });
                                            updateDestinations(next);
                                        }}
                                        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50"
                                    >
                                        + Add Destination Card
                                    </button>
                                </div>
                            );
                        }

                        // Default text editor for other content rows
                        return (
                            <div key={item.id} className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {item.content_type === 'text' ? <Type size={14} /> : <ImageIcon size={14} />}
                                    {item.content_key.replace(/_/g, ' ')}
                                </label>
                                <textarea
                                    value={item.content_value}
                                    onChange={(e) => handleUpdate(item.id, e.target.value)}
                                    className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all min-h-[100px]"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl text-indigo-600 shadow-sm">
                    <Layout size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900">Pro Tip: Live Updates</h4>
                    <p className="text-sm text-indigo-700 mt-1 leading-relaxed">
                        These changes are saved in real-time. Once you click "Save Changes", all visitors on your website will see the new content instantly without needing to refresh the page.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContentManagement;
