import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Send, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const SUPPORT_EMAIL = "mvstudiosj@gmail.com";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  email: z.string().trim().email("Invalid email").max(160),
  subject: z.string().trim().min(3, "Subject too short").max(120),
  message: z.string().trim().min(10, "Message too short").max(2000),
});

const Help = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const errs: any = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      toast.error("Please fix the form errors");
      return;
    }
    setErrors({});
    const { name, email, subject, message } = parsed.data;
    const body = `From: ${name} <${email}>\n\n${message}\n\n---\nSent from Kissan Vision Help`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[Kissan Vision] ${subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    toast.success("Opening your email app...");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Help & Support</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Messages reach <span className="font-bold text-slate-700">{SUPPORT_EMAIL}</span></p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Your Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={80}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                placeholder="Vansh Kumar"
              />
            </Field>
            <Field label="Your Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={160}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Subject" error={errors.subject}>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                maxLength={120}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                placeholder="How can we help?"
              />
            </Field>
            <Field label="Message" error={errors.message}>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={2000}
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none"
                placeholder="Tell us about the issue or your question..."
              />
            </Field>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-sm transition shadow-md shadow-emerald-200"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
            <p className="text-xs text-slate-400 text-center">This will open your default email app pre-filled with your message.</p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
  </div>
);

export default Help;
