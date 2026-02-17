import React, { useState, useEffect } from 'react';
import { Breadcrumb } from './components/Breadcrumb';
import {
  Search,
  Plus,
  Users,
  UserPlus,
  Briefcase,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const TABS = [
  { id: 'leads', label: 'Leads', icon: UserPlus },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'deals', label: 'Deals', icon: Briefcase },
];

const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'converted', 'lost'];
const LEAD_SOURCES = ['website', 'call', 'whatsapp', 'email', 'other'];
const DEAL_STAGES = ['new', 'contacted', 'quoted', 'booked', 'paid', 'completed', 'lost'];

const CRM = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crmError, setCrmError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const [formLead, setFormLead] = useState({ name: '', email: '', phone: '', message: '', source: 'website', status: 'new' });
  const [formContact, setFormContact] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
  const [formDeal, setFormDeal] = useState({ title: '', description: '', amount: '', currency: 'AUD', stage: 'new', contact_id: '', lead_id: '' });

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('crm_leads').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('CRM fetch leads:', error);
      setCrmError(error.message);
      return;
    }
    setCrmError(null);
    setLeads(data || []);
  };
  const fetchContacts = async () => {
    const { data, error } = await supabase.from('crm_contacts').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('CRM fetch contacts:', error);
      return;
    }
    setContacts(data || []);
  };
  const fetchDeals = async () => {
    const { data, error } = await supabase.from('crm_deals').select('*').order('updated_at', { ascending: false });
    if (error) {
      console.error('CRM fetch deals:', error);
      return;
    }
    setDeals(data || []);
  };

  useEffect(() => {
    setLoading(true);
    setCrmError(null);
    Promise.all([fetchLeads(), fetchContacts(), fetchDeals()]).finally(() => setLoading(false));

    const ch = supabase
      .channel('crm_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, fetchLeads)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_contacts' }, fetchContacts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_deals' }, fetchDeals)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const resetForm = () => {
    setFormLead({ name: '', email: '', phone: '', message: '', source: 'website', status: 'new' });
    setFormContact({ name: '', email: '', phone: '', company: '', notes: '' });
    setFormDeal({ title: '', description: '', amount: '', currency: 'AUD', stage: 'new', contact_id: '', lead_id: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const saveLead = async (e) => {
    e.preventDefault();
    setCrmError(null);
    const { data, error } = editingId
      ? await supabase.from('crm_leads').update(formLead).eq('id', editingId).select()
      : await supabase.from('crm_leads').insert([formLead]).select();
    if (error) {
      setCrmError(error.message || 'Failed to save lead');
      return;
    }
    resetForm();
    setLeads((prev) => (data && data[0] ? [data[0], ...prev] : prev));
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setCrmError(null);
    const { data, error } = editingId
      ? await supabase.from('crm_contacts').update(formContact).eq('id', editingId).select()
      : await supabase.from('crm_contacts').insert([formContact]).select();
    if (error) {
      setCrmError(error.message || 'Failed to save contact');
      return;
    }
    resetForm();
    setContacts((prev) => (data && data[0] ? [data[0], ...prev] : prev));
  };

  const saveDeal = async (e) => {
    e.preventDefault();
    setCrmError(null);
    const payload = {
      ...formDeal,
      amount: formDeal.amount ? parseFloat(formDeal.amount) : null,
      contact_id: formDeal.contact_id || null,
      lead_id: formDeal.lead_id || null,
    };
    const { data, error } = editingId
      ? await supabase.from('crm_deals').update(payload).eq('id', editingId).select()
      : await supabase.from('crm_deals').insert([payload]).select();
    if (error) {
      setCrmError(error.message || 'Failed to save deal');
      return;
    }
    resetForm();
    setDeals((prev) => (data && data[0] ? [data[0], ...prev] : prev));
  };

  const convertToContact = async (lead) => {
    setCrmError(null);
    const { data: contactData, error: insertErr } = await supabase
      .from('crm_contacts')
      .insert([{ name: lead.name, email: lead.email || null, phone: lead.phone || null, company: '', notes: lead.message || null }])
      .select();
    if (insertErr) {
      setCrmError(insertErr.message || 'Failed to convert to contact');
      return;
    }
    await supabase.from('crm_leads').update({ status: 'converted' }).eq('id', lead.id);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: 'converted' } : l)));
    if (contactData && contactData[0]) setContacts((prev) => [contactData[0], ...prev]);
  };

  const deleteLead = async (id) => {
    if (window.confirm('Delete this lead?')) {
      await supabase.from('crm_leads').delete().eq('id', id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  };
  const deleteContact = async (id) => {
    if (window.confirm('Delete this contact?')) {
      await supabase.from('crm_contacts').delete().eq('id', id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };
  const deleteDeal = async (id) => {
    if (window.confirm('Delete this deal?')) {
      await supabase.from('crm_deals').delete().eq('id', id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const editLead = (row) => {
    setFormLead({ name: row.name, email: row.email || '', phone: row.phone || '', message: row.message || '', source: row.source || 'website', status: row.status || 'new' });
    setEditingId(row.id);
    setShowForm(true);
  };
  const editContact = (row) => {
    setFormContact({ name: row.name, email: row.email || '', phone: row.phone || '', company: row.company || '', notes: row.notes || '' });
    setEditingId(row.id);
    setShowForm(true);
  };
  const editDeal = (row) => {
    setFormDeal({
      title: row.title,
      description: row.description || '',
      amount: row.amount ?? '',
      currency: row.currency || 'AUD',
      stage: row.stage || 'new',
      contact_id: row.contact_id || '',
      lead_id: row.lead_id || '',
    });
    setEditingId(row.id);
    setShowForm(true);
  };

  const filterLeads = leads.filter(
    (l) =>
      (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone || '').includes(searchTerm)
  );
  const filterContacts = contacts.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm)
  );
  const filterDeals = deals.filter(
    (d) =>
      (d.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusClass = (s) => {
    if (['converted', 'completed', 'paid'].includes(s)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200';
    if (['lost'].includes(s)) return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200';
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">CRM</h2>
            <button
              type="button"
              onClick={() => setShowGuide((v) => !v)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              title="CRM kaise use karein"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
          <Breadcrumb pageName="Leads, contacts & deals" />
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormLead({ name: '', email: '', phone: '', message: '', source: 'website', status: 'new' });
            setFormContact({ name: '', email: '', phone: '', company: '', notes: '' });
            setFormDeal({ title: '', description: '', amount: '', currency: 'AUD', stage: 'new', contact_id: '', lead_id: '' });
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
        >
          <Plus className="h-4 w-4" />
          Add {activeTab === 'leads' ? 'Lead' : activeTab === 'contacts' ? 'Contact' : 'Deal'}
        </button>
      </div>

      {/* CRM Use Guide */}
      {showGuide && (
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-800 dark:bg-indigo-950/20">
          <button type="button" onClick={() => setShowGuide(false)} className="float-right rounded p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
            <ChevronUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </button>
          <h3 className="mb-3 font-semibold text-indigo-900 dark:text-indigo-200">CRM kya hai, aapko kya karna hai</h3>
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <p><strong>Automatic:</strong> Jo log aapki <strong>website</strong> par &quot;Get In Touch&quot; / contact form bharte hain, unki entry yahan <strong>Leads</strong> me khud aa jati hai (Source: website). Aapko kuch type nahi karna.</p>
            <p><strong>Manual (aapko ye karna hai):</strong> WhatsApp, call ya email se jo inquiry aaye, unko <strong>+ Add Lead</strong> se khud daalo — Name, Email, Phone, Source (whatsapp/call/email) choose karo. Baad me status update karo: New → Contacted → Quoted → Converted/Lost.</p>
            <p><strong>Lead se Contact:</strong> Jab koi serious ho jaye, us lead ki row me <strong>→ (arrow)</strong> dabao — Contact ban jayega, lead Converted ho jayega.</p>
            <p><strong>Contacts &amp; Deals:</strong> Contacts = customers; Deals = bookings/amount. Deal me amount aur stage (Quoted → Booked → Paid → Completed) rakho.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/20"
            />
          </div>
        </div>

        {crmError && (
          <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {crmError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            {/* Leads Table */}
            {activeTab === 'leads' && (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-slate-50 text-left dark:bg-slate-800/50">
                    <th className="min-w-[140px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Name</th>
                    <th className="min-w-[160px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Email / Phone</th>
                    <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Source</th>
                    <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                    <th className="min-w-[100px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                    <th className="py-4 px-6 text-right font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filterLeads.length > 0 ? (
                    filterLeads.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{row.name}</td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                          <div>{row.email || '—'}</div>
                          <div className="text-xs">{row.phone || '—'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{row.source || 'website'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(row.status)}`}>{row.status}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{new Date(row.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-right">
                          {row.status !== 'converted' && (
                            <button onClick={() => convertToContact(row)} title="Convert to Contact" className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400">
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => editLead(row)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteLead(row.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        {crmError ? 'Could not load leads. Check Supabase URL/key and that crm_leads table exists with RLS policies.' : 'No leads. Add one or run the SQL to create tables.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Contacts Table */}
            {activeTab === 'contacts' && (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-slate-50 text-left dark:bg-slate-800/50">
                    <th className="min-w-[140px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Name</th>
                    <th className="min-w-[180px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Email / Phone</th>
                    <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Company</th>
                    <th className="min-w-[100px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                    <th className="py-4 px-6 text-right font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filterContacts.length > 0 ? (
                    filterContacts.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{row.name}</td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                          <div>{row.email || '—'}</div>
                          <div className="text-xs">{row.phone || '—'}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{row.company || '—'}</td>
                        <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{new Date(row.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-right">
                          <button onClick={() => editContact(row)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteContact(row.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">No contacts yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Deals Table */}
            {activeTab === 'deals' && (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-slate-50 text-left dark:bg-slate-800/50">
                    <th className="min-w-[160px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Title</th>
                    <th className="min-w-[100px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                    <th className="min-w-[120px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Stage</th>
                    <th className="min-w-[100px] py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">Updated</th>
                    <th className="py-4 px-6 text-right font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filterDeals.length > 0 ? (
                    filterDeals.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-900 dark:text-white">{row.title}</div>
                          {row.description && <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{row.description}</div>}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                          {row.amount != null ? `${row.currency || 'AUD'} ${Number(row.amount).toLocaleString()}` : '—'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(row.stage)}`}>{row.stage}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{new Date(row.updated_at).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-right">
                          <button onClick={() => editDeal(row)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteDeal(row.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">No deals yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Lead */}
      {showForm && activeTab === 'leads' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Lead' : 'Add Lead'}</h3>
              <button onClick={resetForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveLead} className="flex flex-col gap-3">
              <input required placeholder="Name" value={formLead.name} onChange={(e) => setFormLead((p) => ({ ...p, name: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <input type="email" placeholder="Email" value={formLead.email} onChange={(e) => setFormLead((p) => ({ ...p, email: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <input placeholder="Phone" value={formLead.phone} onChange={(e) => setFormLead((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <textarea placeholder="Message" value={formLead.message} onChange={(e) => setFormLead((p) => ({ ...p, message: e.target.value }))} rows={2} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <select value={formLead.source} onChange={(e) => setFormLead((p) => ({ ...p, source: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={formLead.status} onChange={(e) => setFormLead((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" className="rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Contact */}
      {showForm && activeTab === 'contacts' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Contact' : 'Add Contact'}</h3>
              <button onClick={resetForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveContact} className="flex flex-col gap-3">
              <input required placeholder="Name" value={formContact.name} onChange={(e) => setFormContact((p) => ({ ...p, name: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <input type="email" placeholder="Email" value={formContact.email} onChange={(e) => setFormContact((p) => ({ ...p, email: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <input placeholder="Phone" value={formContact.phone} onChange={(e) => setFormContact((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <input placeholder="Company" value={formContact.company} onChange={(e) => setFormContact((p) => ({ ...p, company: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <textarea placeholder="Notes" value={formContact.notes} onChange={(e) => setFormContact((p) => ({ ...p, notes: e.target.value }))} rows={2} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <button type="submit" className="rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Deal */}
      {showForm && activeTab === 'deals' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Deal' : 'Add Deal'}</h3>
              <button onClick={resetForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveDeal} className="flex flex-col gap-3">
              <input required placeholder="Title" value={formDeal.title} onChange={(e) => setFormDeal((p) => ({ ...p, title: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <textarea placeholder="Description" value={formDeal.description} onChange={(e) => setFormDeal((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <div className="flex gap-2">
                <input type="number" step="0.01" placeholder="Amount" value={formDeal.amount} onChange={(e) => setFormDeal((p) => ({ ...p, amount: e.target.value }))} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                <select value={formDeal.currency} onChange={(e) => setFormDeal((p) => ({ ...p, currency: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <option value="AUD">AUD</option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <select value={formDeal.stage} onChange={(e) => setFormDeal((p) => ({ ...p, stage: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {DEAL_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" className="rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700">Save</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CRM;
