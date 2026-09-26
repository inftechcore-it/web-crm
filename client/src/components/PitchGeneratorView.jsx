import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageCircle,
  PhoneCall,
  Send,
  Copy,
  Check,
  Building2,
  User,
  Sparkles,
  MapPin,
  Briefcase,
  Share2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { logLeadActivity } from '../services/api';
import { formatVerticalName, formatCurrencyLakhs } from '../utils/formatters';

const PLATFORMS = [
  { id: 'email', name: 'Cold Email', icon: Mail, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'linkedin', name: 'LinkedIn DM / Note', icon: Share2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'call', name: '60s Calling Script', icon: PhoneCall, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'sms', name: 'Quick SMS / Text', icon: Send, color: 'text-purple-600 bg-purple-50 border-purple-200' }
];

export default function PitchGeneratorView({ leads = [], onLeadActivityLogged }) {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [activePlatform, setActivePlatform] = useState('email');
  const [tone, setTone] = useState('consultative'); // consultative | roi | direct

  // Custom Prospect Input state
  const [customProspect, setCustomProspect] = useState({
    company_name: 'TechMatrix Solutions',
    suggested_contact_name: 'Mr. Rajesh Sharma',
    target_role: 'Head of IT & Infrastructure',
    vertical: 'corporate_it',
    city: 'Mumbai MMR',
    sub_region: 'BKC / Andheri',
    primary_av_need: 'Microsoft Teams Room Retrofit + Zero-Lag Wireless HDMI',
    phone: '+91 98200 12345'
  });

  const [copied, setCopied] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [logging, setLogging] = useState(false);

  // Active target lead (either from leads list or custom prospect)
  const activeLead = selectedLeadId
    ? leads.find(l => l.id === selectedLeadId) || customProspect
    : customProspect;

  // Handle lead selection
  const handleLeadSelect = (id) => {
    setSelectedLeadId(id);
    const found = leads.find(l => l.id === id);
    if (found) {
      setCustomProspect({
        company_name: found.company_name,
        suggested_contact_name: found.suggested_contact_name || 'Decision Maker',
        target_role: found.target_role || 'IT / Facility Admin',
        vertical: found.vertical,
        city: found.city,
        sub_region: found.sub_region || found.city,
        primary_av_need: found.primary_av_need,
        phone: found.phone || ''
      });
    }
  };

  // Dynamic Content Generators
  const getPitchContent = () => {
    const company = activeLead.company_name || 'your company';
    const contact = activeLead.suggested_contact_name || 'Sir/Madam';
    const city = activeLead.city || 'Mumbai MMR';
    const subRegion = activeLead.sub_region || city;
    const need = activeLead.primary_av_need || 'Audio-Visual System Modernization';
    const vertical = activeLead.vertical || 'corporate_it';

    switch (activePlatform) {
      case 'email': {
        const subject = vertical === 'architects_interior'
          ? `AV Subcontracting & Pre-wiring Partner for ${company}'s upcoming fit-outs`
          : vertical === 'education_coaching'
          ? `Upgrading classrooms at ${company} to 4K Interactive Flat Panels?`
          : `Fixing meeting room audio & video hiccups at ${company} (${subRegion})?`;

        const body = `Dear ${contact},

I noticed ${company}'s growing spaces in ${subRegion}. When teams gather for high-stakes hybrid meetings, technical friction — audio echoes, loose HDMI cables on the table, and fuzzy webcams — costs executive time and dilutes presentations.

At Collabsight Technologies Pvt Ltd, we are specialized Audio-Visual (AV) System Integrators based in the Mumbai Metropolitan Region (Kalyan & Thane, MMR).

We help organizations like yours solve these bottlenecks with turnkey installations:
• One-Touch Microsoft Teams & Zoom Rooms with 4K auto-framing cameras
• Concealed beamforming ceiling microphones with acoustic echo cancellation
• Zero-lag wireless screen presentation (Barco ClickShare / Yealink RoomCast)
• Rapid 2-to-4 hour local on-site SLA with OEM certified engineers

Targeted Solution for ${company}:
>> ${need}

Would you be open to a quick 10-minute on-site assessment or a live demonstration of our 4K video conferencing bar next Tuesday or Wednesday?

Best regards,

Enterprise AV Solutions Team
Collabsight Technologies Pvt Ltd
Kalyan & Thane | Mumbai MMR
Direct: +91 98200 XXXXX | Email: enterprise@collabsight.in`;

        return {
          title: 'Tailored Cold Email Pitch',
          subject,
          body,
          fullText: `Subject: ${subject}\n\n${body}`
        };
      }

      case 'whatsapp': {
        let text = `Hello ${contact}! 👋\n\nReaching out from *Collabsight Technologies* (Commercial AV System Integrators in Mumbai MMR).\n\nWe noticed *${company}* in ${subRegion}. We specialize in turnkey meeting room transformations: *${need}*.\n\nAre your teams facing any audio echo, messy cables, or video delays in hybrid conferences? We are offering a *complimentary on-site AV audit in ${subRegion}* this week.\n\nWould it be okay to share our 1-page solution catalog with trade pricing?`;

        if (vertical === 'architects_interior') {
          text = `Hello ${contact}! 👋\n\nReaching out from *Collabsight Technologies* (AV Integration Partners).\n\nWe partner with leading interior design & architectural studios like *${company}* for commercial fit-outs in ${subRegion}. We provide *free CAD AV conduit drawings* and direct OEM dealer margins (Logitech, Maxhub, Poly, Shure) so your projects get concealed wiring and zero post-handover AV complaints.\n\nCould we arrange a brief 10-minute introduction this week?`;
        }

        const cleanPhone = (activeLead.phone || '').replace(/[^0-9]/g, '');
        const waUrl = cleanPhone
          ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(text)}`
          : `https://wa.me/?text=${encodeURIComponent(text)}`;

        return {
          title: 'WhatsApp Direct Outreach',
          body: text,
          fullText: text,
          waUrl
        };
      }

      case 'linkedin': {
        const connectionNote = `Hi ${contact}, came across your leadership at ${company} in ${subRegion}. We provide turnkey AV & Teams Room integration for leading firms in MMR. Would love to connect and share low-voltage CAD schematics if ever relevant for your facilities!`;

        const inmail = `Hi ${contact},

Hope you are doing well.

I’ve been following ${company}'s growth across ${subRegion}. Managing hybrid collaboration infrastructure across meeting spaces often brings unexpected tech friction — dropped audio, multiple remotes, and cable clutter.

We specialize in turnkey enterprise AV systems:
• ${need}
• Certified Zoom / Microsoft Teams Rooms
• 4-Hour On-site technician SLA in Mumbai MMR

If you have 10 minutes next week, I'd love to share how similar regional enterprises upgraded their boardroom experience with zero downtime.

Best regards,
Collabsight Enterprise AV Team`;

        return {
          title: 'LinkedIn Outreach & Connection Note',
          subject: 'Connection Request Note (< 300 chars)',
          body: inmail,
          note: connectionNote,
          fullText: `CONNECTION NOTE:\n${connectionNote}\n\nFULL INMAIL MESSAGE:\n${inmail}`
        };
      }

      case 'call': {
        return {
          title: '60-Second Cold Call Script & Rebuttals',
          body: `COLD CALLING BLUEPRINT: ${company}
Contact: ${contact} (${activeLead.target_role || 'Decision Maker'})
Focus: ${need}

[STEP 1: RECEPTION / GATEKEEPER NAVIGATOR]
"Good morning! This is [Your Name] with Collabsight Technologies. Could you please connect me to ${contact} or the person who looks after your meeting rooms and IT facilities?"
>> If asked what it's regarding: "It is regarding the conference room audio-visual and video conferencing setup for your team in ${subRegion}."

[STEP 2: OPENING HOOK - FIRST 15 SECONDS]
"Hi ${contact}, this is [Your Name] from Collabsight Technologies. I know I'm calling out of the blue, but I'll be brief.
We are local AV System Integrators based right here in Kalyan/Thane. We work with companies like ${company} to eliminate typical boardroom frustrations — audio echo, messy cables on tables, or fuzzy cameras during hybrid calls.
Quick question: How many meeting or conference rooms do you currently operate?"

[STEP 3: TAILORED VALUE PROP]
"For your spaces, we specialize in: ${need}. We turn standard conference spaces into certified Teams/Zoom rooms in under 2 hours without breaking walls."

[STEP 4: COMMON OBJECTIONS & REBUTTALS]
• "We already have an AV vendor / AMC":
  "Understood! We aren't asking you to replace them. Many clients keep us as an emergency local specialist for rapid 2-hour callouts and direct OEM pricing that general IT vendors cannot match."
• "Send an email first":
  "Will do right away! To make sure I send exact pricing, which platform does your team use most — Teams, Zoom, or Google Meet?"

[STEP 5: CLOSING FOR THE MEETING]
"I will be visiting clients in ${subRegion} this Thursday. Could I stop by for 15 minutes to take a quick look at your room layout and drop off our catalog?"`,
          fullText: `Calling Script for ${company} (${contact}):\nFocus: ${need}`
        };
      }

      case 'sms': {
        const sms = `Collabsight AV: Hi ${contact}, upgrading meeting rooms at ${company}? We provide turnkey 4K Video Conferencing & Interactive displays with free local audit in ${subRegion}. Reply YES for catalog or call +91-98200-XXXXX.`;
        return {
          title: 'Quick SMS / Mobile Ping (160 Chars)',
          body: sms,
          fullText: sms
        };
      }

      default:
        return { title: 'Pitch', body: '', fullText: '' };
    }
  };

  const pitchData = getPitchContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchData.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogActivity = async () => {
    if (!selectedLeadId) return;
    setLogging(true);
    try {
      await logLeadActivity(selectedLeadId, {
        action_type: `${PLATFORMS.find(p => p.id === activePlatform)?.name || 'Outreach'} Generated`,
        summary: `Generated customized ${activePlatform} pitch targeting '${activeLead.primary_av_need}'`,
        outcome: 'Pitch ready for dispatch'
      });
      setLogSuccess(true);
      if (onLeadActivityLogged) onLeadActivityLogged();
      setTimeout(() => setLogSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                Requirement 2: Dedicated Section
              </span>
              <span className="text-xs text-sky-100">• All-Platform Outreach Suite</span>
            </div>
            <h2 className="text-2xl font-bold font-heading">
              🎯 Multi-Platform Pitch & Outreach Generator
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl mt-1">
              Generate battle-tested Cold Emails, WhatsApp messages, LinkedIn InMails, and 60-second Cold Call scripts customized to each business vertical, city, and AV requirement.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-sky-700 hover:bg-sky-50 transition-all cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Content!' : 'Copy Active Pitch'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Output Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Lead Selector & Custom Prospect Details (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Lead Selector from CRM */}
          <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-2xs">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                Select Existing Lead (CRM)
              </span>
              {selectedLeadId && (
                <button
                  onClick={() => setSelectedLeadId('')}
                  className="text-[11px] text-sky-600 hover:underline cursor-pointer lowercase"
                >
                  custom mode
                </button>
              )}
            </label>

            <select
              value={selectedLeadId}
              onChange={(e) => handleLeadSelect(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:border-sky-500 outline-hidden cursor-pointer"
            >
              <option value="">✍️ Custom Business Prospect (Type below)</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.company_name} — {l.city} ({formatVerticalName(l.vertical)})
                </option>
              ))}
            </select>
          </div>

          {/* Prospect Details Form */}
          <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-3.5 h-3.5 text-sky-600" />
              Prospect Information
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name</label>
              <input
                type="text"
                value={customProspect.company_name}
                onChange={(e) => setCustomProspect(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={customProspect.suggested_contact_name}
                  onChange={(e) => setCustomProspect(prev => ({ ...prev, suggested_contact_name: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Role</label>
                <input
                  type="text"
                  value={customProspect.target_role}
                  onChange={(e) => setCustomProspect(prev => ({ ...prev, target_role: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">City / Region</label>
                <input
                  type="text"
                  value={customProspect.city}
                  onChange={(e) => setCustomProspect(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sub-region / Hub</label>
                <input
                  type="text"
                  value={customProspect.sub_region}
                  onChange={(e) => setCustomProspect(prev => ({ ...prev, sub_region: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Industry Vertical</label>
              <select
                value={customProspect.vertical}
                onChange={(e) => setCustomProspect(prev => ({ ...prev, vertical: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-sky-500 outline-hidden cursor-pointer"
              >
                <option value="corporate_it">Corporate & IT/ITES</option>
                <option value="architects_interior">Architects & Interior Designers</option>
                <option value="education_coaching">Education & Coaching Hubs</option>
                <option value="hospitality_coworking">Hospitality & Coworking</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Primary AV Requirement</label>
              <textarea
                rows={2}
                value={customProspect.primary_av_need}
                onChange={(e) => setCustomProspect(prev => ({ ...prev, primary_av_need: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number (for WhatsApp)</label>
              <input
                type="text"
                value={customProspect.phone}
                onChange={(e) => setCustomProspect(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98XXXXXXXX"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* Activity Logger Button (if CRM lead selected) */}
          {selectedLeadId && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Log to CRM Activity Timeline</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Record this pitch creation directly into <strong>{activeLead.company_name}</strong>'s activity log.
              </p>
              <button
                type="button"
                onClick={handleLogActivity}
                disabled={logging}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                {logging ? 'Logging...' : logSuccess ? '✓ Recorded to Activity Log!' : 'Log Pitch Event'}
              </button>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Platform Selection & Generated Copy Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Platform Tab Buttons */}
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-sky-100 shadow-2xs">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isActive = activePlatform === platform.id;

              return (
                <button
                  key={platform.id}
                  onClick={() => setActivePlatform(platform.id)}
                  className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{platform.name}</span>
                </button>
              );
            })}
          </div>

          {/* Generated Content Box */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-6 space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{pitchData.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                    Target: {activeLead.company_name}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customized for {formatVerticalName(activeLead.vertical)} • {activeLead.city}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {activePlatform === 'whatsapp' && pitchData.waUrl && (
                  <a
                    href={pitchData.waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp</span>
                  </a>
                )}

                {activePlatform === 'email' && pitchData.subject && (
                  <a
                    href={`mailto:?subject=${encodeURIComponent(pitchData.subject)}&body=${encodeURIComponent(pitchData.body)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Mail App</span>
                  </a>
                )}
              </div>
            </div>

            {/* If Subject exists (Email / LinkedIn) */}
            {pitchData.subject && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  {activePlatform === 'email' ? 'Subject Line:' : 'Connection Request Note:'}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {activePlatform === 'linkedin' ? pitchData.note : pitchData.subject}
                </p>
              </div>
            )}

            {/* Body Content Display */}
            <div className="relative">
              <pre className="w-full p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-sky-500">
                {pitchData.body}
              </pre>
            </div>

            {/* Value Proposition Highlights Banner */}
            <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-sky-900 block">
                  Collabsight Winning Edge for this Pitch:
                </span>
                <span className="text-slate-600">
                  Highlight our <strong>local 2-to-4 hour SLA in MMR / Tier 2 hubs</strong> and <strong>OEM direct partner pricing (Logitech, Maxhub, Neat, Poly)</strong>. Clients switch to Collabsight because general IT vendors fail at acoustics and clean concealed wiring.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
