import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, Sparkles, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const PLANS = [
  {
    name: "Starter Consult",
    price: "₹499",
    period: "/ session",
    desc: "30-minute video call with a certified agronomist",
    features: ["1 crop diagnosis", "Custom treatment plan", "PDF report", "WhatsApp follow-up"],
    color: "from-emerald-400 to-emerald-600",
    popular: false,
  },
  {
    name: "Pro Field Visit",
    price: "₹1,999",
    period: "/ visit",
    desc: "Expert visits your farm for hands-on assessment",
    features: ["On-site soil & crop test", "Pest & disease audit", "3-month action plan", "Priority WhatsApp support", "2 follow-up calls"],
    color: "from-amber-400 to-orange-500",
    popular: true,
  },
  {
    name: "Season Partner",
    price: "₹4,999",
    period: "/ season",
    desc: "Full-season advisory with weekly check-ins",
    features: ["Unlimited diagnoses", "Weekly video calls", "Yield optimization plan", "Market price alerts", "Insurance guidance"],
    color: "from-indigo-400 to-purple-600",
    popular: false,
  },
];

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Phone is required").max(20),
  preferredDate: z.string().optional(),
  notes: z.string().trim().max(500).optional(),
});

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string; plan: string; name: string; email: string } | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", preferredDate: "", notes: "" });

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.from("consultation_bookings").insert({
        user_id: session?.user.id ?? null,
        plan_name: selectedPlan,
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        preferred_date: parsed.data.preferredDate || null,
        notes: parsed.data.notes || null,
      }).select("id").single();
      if (error) throw error;
      toast.success("Booking confirmed!");
      setConfirmation({
        id: data?.id ?? `KV-${Date.now()}`,
        plan: selectedPlan,
        name: parsed.data.fullName,
        email: parsed.data.email,
      });
      setSelectedPlan(null);
      setForm({ fullName: "", email: "", phone: "", preferredDate: "", notes: "" });
    } catch (err: any) {
      toast.error(`Booking failed: ${err?.message || "try again"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-4">
            <Sparkles className="w-3 h-3" /> BOOK A CONSULTANT
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Choose your advisory plan</h1>
          <p className="text-slate-500 max-w-xl mx-auto">Connect with certified agronomists for personalized crop guidance — from one-off advice to full-season partnerships.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-3xl p-8 shadow-lg ${plan.popular ? "ring-2 ring-emerald-500 shadow-emerald-200/60" : "shadow-slate-200/50"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} mb-4`} />
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-400 font-medium">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedPlan(plan.name)}
                className={`w-full py-3 rounded-2xl text-sm font-bold transition ${
                  plan.popular
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                Book {plan.name}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setSelectedPlan(null)}
          >
            <motion.form
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={submitBooking}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Booking</p>
                  <h2 className="text-xl font-extrabold text-slate-900">{selectedPlan}</h2>
                </div>
                <button type="button" onClick={() => setSelectedPlan(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text" placeholder="Full name *" required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                />
                <input
                  type="email" placeholder="Email *" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                />
                <input
                  type="tel" placeholder="Phone / WhatsApp *" required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                />
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                />
                <textarea
                  placeholder="Notes (crop, issue, location...)" rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm resize-none"
                />
              </div>

              <button
                type="submit" disabled={submitting}
                className="mt-5 w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-200"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Confirm Booking"}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plans;
