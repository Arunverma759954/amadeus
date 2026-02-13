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

            if (!error) setContent(data);

            // If empty, initialize some defaults
            if (data?.length === 0) {
                const defaults = [
                    { content_key: 'hero_title', content_value: 'Unlock Your Next Great Adventure', content_type: 'text' },
                    { content_key: 'hero_subtitle', content_value: 'Find and book the best flights to your favorite destinations.', content_type: 'text' },
                    { content_key: 'featured_deal_text', content_value: 'Special 20% Discount on Dubai Flights!', content_type: 'text' }
                ];
                await supabase.from('site_content').insert(defaults);
                setContent(defaults);
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
                    {content.map((item) => (
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
                    ))}
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
