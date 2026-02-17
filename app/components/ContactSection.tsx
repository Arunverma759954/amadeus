"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const { error: err } = await supabase.from("crm_leads").insert([
      {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        message: message.trim() || null,
        source: "website",
        status: "new",
      },
    ]);
    setSending(false);
    if (err) {
      setError(err.message || "Could not send. Try again or call us.");
      return;
    }
    setSent(true);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <section id="contact" className="bg-white py-16 md:py-20 scroll-mt-20">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#071C4B] text-center mb-2 uppercase tracking-tighter">
          Get In Touch
        </h2>
        <p className="text-center text-gray-600 text-sm md:text-base mb-8">
          Fill the form below — we&apos;ll see it in our CRM and get back to you soon.
        </p>
        {sent ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center py-8 px-4">
            <p className="font-semibold">Message sent!</p>
            <p className="text-sm mt-1">Our team will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              placeholder="Your name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#071C4B] focus:ring-2 focus:ring-[#071C4B]/20 outline-none"
            />
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#071C4B] focus:ring-2 focus:ring-[#071C4B]/20 outline-none"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#071C4B] focus:ring-2 focus:ring-[#071C4B]/20 outline-none"
            />
            <textarea
              placeholder="Message (e.g. route, dates, budget)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#071C4B] focus:ring-2 focus:ring-[#071C4B]/20 outline-none resize-none"
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-[#071C4B] hover:bg-[#0a2463] text-white font-semibold py-3 px-4 disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
