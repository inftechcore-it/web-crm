import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  MessageCircle,
  PhoneCall,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
  Building2,
  Sparkles
} from 'lucide-react';
import { fetchLeadPitch } from '../../services/api';

export default function PitchOutreachModal({
  isOpen,
  onClose,
  lead,
  initialTab = 'email'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [pitchData, setPitchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [openObjectionIdx, setOpenObjectionIdx] = useState(0);

  useEffect(() => {
    if (isOpen && lead?.id) {
      setActiveTab(initialTab);
      loadPitch(lead.id);
    }
  }, [isOpen, lead?.id, initialTab]);

  const loadPitch = async (leadId) => {
    setLoading(true);
    try {
      const data = await fetchLeadPitch(leadId);
      setPitchData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const coldEmail = pitchData?.coldEmail;
  const whatsapp = pitchData?.whatsapp;
  const script = pitchData?.callingScript;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">
                  AV Outreach Generator: {lead.company_name}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">
                  {lead.city}
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                Section 5: High-Converting Indian SMB Outreach Playbook
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-sky-100 bg-sky-50/60 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'border-sky-600 text-sky-700 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-sky-600" />
            <span>1-Click Cold Email</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Pitch</span>
          </button>

          <button
            onClick={() => setActiveTab('call')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'call'
                ? 'border-amber-600 text-amber-700 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-amber-600" />
            <span>60s Call Script & Objections</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-800">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Generating tailored pitch for {lead.company_name}...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: COLD EMAIL */}
              {activeTab === 'email' && coldEmail && (
                <div className="space-y-4">
                  {/* Subject Line */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject:</span>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{coldEmail.subject}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(coldEmail.subject, 'subject')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-sky-600 bg-white border border-slate-200 rounded-lg shrink-0 cursor-pointer"
                    >
                      {copied === 'subject' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Email Body */}
                  <div className="relative">
                    <pre className="w-full p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                      {coldEmail.body}
                    </pre>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Tailored for <span className="font-semibold text-slate-700">{lead.suggested_contact_name}</span> ({lead.target_role})
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(coldEmail.fullText, 'full_email')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          {copied === 'full_email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied === 'full_email' ? 'Copied Entire Email!' : 'Copy Full Email'}</span>
                        </button>

                        <a
                          href={`mailto:?subject=${encodeURIComponent(coldEmail.subject)}&body=${encodeURIComponent(coldEmail.body)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-600" />
                          <span>Open in Mail</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WHATSAPP PITCH */}
              {activeTab === 'whatsapp' && whatsapp && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold">WhatsApp Direct Link</span>
                      <span className="block text-[11px] text-emerald-700">
                        Phone: {lead.phone || 'No phone specified'}
                      </span>
                    </div>

                    <a
                      href={whatsapp.waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Web</span>
                    </a>
                  </div>

                  <div className="relative">
                    <pre className="w-full p-4 bg-emerald-950 text-emerald-100 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                      {whatsapp.text}
                    </pre>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => copyToClipboard(whatsapp.text, 'whatsapp')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        {copied === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === 'whatsapp' ? 'Copied Message!' : 'Copy WhatsApp Pitch'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 60-SECOND CALLING SCRIPT */}
              {activeTab === 'call' && script && (
                <div className="space-y-4">
                  {/* Step 1: Receptionist / Gatekeeper */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                      {script.step1Gatekeeper.title}
                    </span>
                    <p className="mt-1 font-medium text-slate-800 italic">
                      {script.step1Gatekeeper.dialogue}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {script.step1Gatekeeper.rebuttal}
                    </p>
                  </div>

                  {/* Step 2: 15-second hook */}
                  <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                      {script.step2Hook.title}
                    </span>
                    <p className="mt-1 font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                      {script.step2Hook.dialogue}
                    </p>
                  </div>

                  {/* Step 3: Room Scale Value Pitch */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      {script.step3Value.title}
                    </span>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {script.step3Value.smallRooms}
                    </p>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-200">
                      {script.step3Value.boardroom}
                    </p>
                  </div>

                  {/* Step 4: Objection Handling Accordion */}
                  <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-2">
                      Step 4: Top Objections & Live Rebuttals
                    </span>
                    
                    <div className="space-y-2">
                      {script.step4Objections.map((item, idx) => {
                        const isOpen = openObjectionIdx === idx;
                        return (
                          <div key={idx} className="bg-white rounded-lg border border-amber-200/80 overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setOpenObjectionIdx(isOpen ? -1 : idx)}
                              className="w-full p-2.5 flex items-center justify-between text-left font-semibold text-slate-800 hover:text-amber-800 cursor-pointer"
                            >
                              <span>Objection: {item.objection}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            {isOpen && (
                              <div className="p-2.5 pt-0 text-slate-700 text-xs border-t border-amber-100 bg-amber-50/30">
                                <span className="font-bold text-amber-900 block mb-0.5">Recommended Rebuttal:</span>
                                <p className="leading-relaxed">{item.rebuttal}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 5: Meeting Close */}
                  <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {script.step5Closing.title}
                    </span>
                    <p className="mt-1 font-semibold text-emerald-950 italic text-sm">
                      {script.step5Closing.dialogue}
                    </p>
                  </div>

                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Lead: <span className="font-semibold text-slate-800">{lead.company_name}</span> ({lead.vertical})
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
