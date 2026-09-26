/**
 * Collabsight AV CRM - Pitch & Outreach Formatter Service
 * Generates tailored Cold Emails, WhatsApp messages, and 60-second Calling Scripts.
 */

const COMPANY_NAME = "Collabsight Technologies Pvt Ltd";

function generateColdEmail(lead) {
  const company = lead.company_name || "your team";
  const contact = lead.suggested_contact_name || "Sir/Madam";
  const role = lead.target_role || "Decision Maker";
  const vertical = lead.vertical || "corporate_it";
  const city = lead.city || "Mumbai MMR";
  const subRegion = lead.sub_region || city;
  const avNeed = lead.primary_av_need || "modern boardroom video conferencing";

  let subject = "";
  let body = "";

  if (vertical === "corporate_it") {
    subject = `Fixing meeting room audio & video hiccups at ${company}?`;
    body = `Hi ${contact},

I noticed ${company}'s growing team in ${subRegion}. As teams return to hybrid collaboration, one of the biggest productivity killers in mid-sized firms is meeting room tech friction — audio echo, laggy video calls, and messy cables on the boardroom table.

I'm with ${COMPANY_NAME}, a specialized Audio-Visual (AV) System Integrator based locally in the Mumbai Metropolitan Region (Kalyan / Thane).

We help companies like yours upgrade to one-touch Microsoft Teams / Zoom Rooms with:
• Zero-lag wireless presentation (no loose HDMI cables on the table)
• Smart 4K auto-framing cameras and beamforming ceiling/table mics
• Complete turnkey supply, cabling, commissioning, and on-site support

Are you free for a quick 10-minute on-site assessment or a live demo of a 4K video conferencing bar next Tuesday or Wednesday?

Best regards,

Enterprise AV Solutions Team
${COMPANY_NAME}
Kalyan & Thane | Mumbai MMR
Phone: +91 98200 XXXXX | Web: collabsight.in`;
  } else if (vertical === "architects_interior") {
    subject = `AV Subcontracting & Pre-wiring Partner for ${company}'s upcoming fit-outs`;
    body = `Dear ${contact},

I have been following ${company}'s impressive commercial and office interior projects across ${subRegion}.

A frequent challenge in commercial interior fit-outs is AV cabling and equipment planning happening too late in the design cycle — leading to exposed conduit lines, drywall cuts, or client disputes over sound clarity.

At ${COMPANY_NAME} (AV System Integrators in Mumbai MMR), we work as an extended technical AV arm for leading architects and interior contractors.

Here is how we support your studio:
1. Complimentary CAD AV Conduit & Low-Voltage Layouts before you pour screed or close false ceilings.
2. OEM Direct Pricing (Logitech, Neat, Poly, Maxhub, Shure, Crestron) with attractive referral margins for your firm.
3. Turnkey Execution: We supply, install, tune acoustics, and provide post-handover warranty so you have zero post-project headaches.

Could we schedule a brief 15-minute introductory coffee or call this week to explore how we can support your ongoing projects?

Warm regards,

Business Partnerships Lead
${COMPANY_NAME}
Kalyan / Thane | Mumbai MMR
Phone: +91 98200 XXXXX`;
  } else if (vertical === "education_coaching") {
    subject = `Replacing projectors with 75" 4K Interactive Flat Panels at ${company}?`;
    body = `Respected ${contact},

Teaching faculty and students today demand interactive, engaging visual tools. Yet, many classrooms still struggle with dim projector bulbs, dust-damaged filters, and disconnected audio.

I am writing from ${COMPANY_NAME}, an Audio-Visual System Integrator based right here in ${city}.

We specialize in Smart Classroom & Auditorium digital transformations, providing:
• 65", 75", and 86" 4K Interactive Flat Panels (IFPD) with built-in Android & Windows OPS
• Multi-touch digital whiteboarding and instant PDF/note sharing with students
• Lecture capture cameras for hybrid batch streaming
• Rapid 2-to-4 hour on-site technical support SLA

We would love to bring a live 75" Interactive Touch Panel to ${company} for a free, hands-on demonstration for your teachers and trustees.

Would Thursday afternoon work for a 20-minute live demonstration?

Sincerely,

Education AV Solutions Specialist
${COMPANY_NAME}
Phone: +91 98200 XXXXX | info@collabsight.in`;
  } else {
    subject = `Enhancing meeting spaces & audio-visual experience at ${company}`;
    body = `Dear ${contact},

For premier venues and workspaces like ${company} in ${subRegion}, smooth audio-visual infrastructure directly impacts member satisfaction and corporate event bookings.

At ${COMPANY_NAME}, we design and install high-performance AV systems for coworking spaces, boutique hotels, and banquet facilities across Mumbai MMR and Tier-2/3 commercial corridors:
• Plug-and-play BYOD meeting room video bars for flexible tenant calls
• Active LED Video Walls (P2.5 / P3) for impactful corporate presentations & banquets
• Multi-zone commercial background music (BGM) & crystal-clear PA systems
• Full AMC support with emergency same-day technician dispatch

Would you be open to a quick 10-minute conversation this week to discuss how we can assist with any upcoming AV upgrades or maintenance?

Warm regards,

Commercial AV Team
${COMPANY_NAME}
Phone: +91 98200 XXXXX`;
  }

  return { subject, body, fullText: `Subject: ${subject}\n\n${body}` };
}

function generateWhatsAppPitch(lead) {
  const company = lead.company_name || "";
  const contact = lead.suggested_contact_name || "Sir/Madam";
  const vertical = lead.vertical || "corporate_it";
  const subRegion = lead.sub_region || lead.city || "your area";

  let text = "";
  if (vertical === "corporate_it") {
    text = `Hello ${contact}! 👋\n\nReaching out from *${COMPANY_NAME}* (AV System Integrators in Mumbai MMR / Kalyan-Thane).\n\nWe help companies like *${company}* eliminate meeting room friction with one-touch *Microsoft Teams / Zoom Room setups* and zero-cable wireless presentation systems.\n\nAre you facing any audio echo or video issues in your conference rooms? We are offering a *complimentary on-site AV audit* in ${subRegion} this week. Would it be okay to share a 1-page catalog?`;
  } else if (vertical === "architects_interior") {
    text = `Hello ${contact}! 👋\n\nReaching out from *${COMPANY_NAME}* (Commercial AV System Integrators).\n\nWe partner with leading interior design & architectural studios for upcoming office fit-outs in ${subRegion}. We provide *free CAD AV conduit layouts* and OEM dealer pricing (Logitech, Maxhub, Poly, Shure) so your projects get seamless concealed AV with zero wiring hassles.\n\nCould I drop by for a quick 10-minute introduction this week?`;
  } else if (vertical === "education_coaching") {
    text = `Respected ${contact} 🙏\n\nHope you are well. Reaching out from *${COMPANY_NAME}*.\n\nWe are helping schools and coaching institutes in ${subRegion} replace dim projectors with *75" 4K Interactive Flat Panels (Touch Smart Boards)* for better classroom engagement.\n\nCan we arrange a *free live on-site demo* of a 4K touch display at *${company}* this week for your faculty?`;
  } else {
    text = `Hello ${contact}! 👋\n\nReaching out from *${COMPANY_NAME}* (AV System Integrators).\n\nWe specialize in *Active LED Video Walls* and *multi-zone commercial sound systems* for banquets, hotels, and coworking spaces across ${subRegion}.\n\nWould you be open to seeing our recent venue installations and trade pricing?`;
  }

  // Sanitize phone number for WhatsApp link
  let cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;

  return { text, waUrl, phone: lead.phone };
}

function generateCallingScript(lead) {
  const company = lead.company_name || "the company";
  const contact = lead.suggested_contact_name || "the IT/Facility Manager";
  const role = lead.target_role || "Decision Maker";
  const subRegion = lead.sub_region || lead.city || "Mumbai MMR";
  const avNeed = lead.primary_av_need || "Boardroom AV / Interactive screens";

  const script = {
    header: `COLD CALLING SCRIPT: ${company} (${role})`,
    location: subRegion,
    solutionFocus: avNeed,
    step1Gatekeeper: {
      title: "Step 1: Gatekeeper / Receptionist Navigator",
      dialogue: `"Good morning! This is [Your Name] from Collabsight Technologies. Could you please connect me to ${contact} or the person who looks after your IT infrastructure and conference room facilities?"`,
      rebuttal: `(If asked what it's regarding):\n"It is regarding the audio-visual and video conferencing setup for your meeting rooms in ${subRegion}."`
    },
    step2Hook: {
      title: "Step 2: Opening Hook (First 15 Seconds)",
      dialogue: `"Hi ${contact}, this is [Your Name] from Collabsight Technologies. I know I'm calling out of the blue, but I'll be brief.\nWe are local AV System Integrators based in Kalyan/Thane. We work with companies like yours to solve the typical boardroom frustrations — things like audio echoes during Zoom/Teams calls, cables hanging off tables, or dim projector displays.\nQuick question: How many conference or meeting rooms do you currently operate at ${company}?"`
    },
    step3Value: {
      title: "Step 3: Value Pitch based on Room Scale",
      smallRooms: `• If 1 to 3 rooms:\n"Great. We specialize in compact, all-in-one 4K video bars with beamforming mics that turn any standard room into a certified Microsoft Teams or Zoom room in under 2 hours without breaking walls."`,
      boardroom: `• If 4+ rooms / Boardrooms:\n"Perfect. We handle end-to-end boardroom integrations with ceiling microphone arrays, dual 85-inch 4K displays, and wireless screen sharing so your leadership meetings run flawlessly."`
    },
    step4Objections: [
      {
        objection: `"We already have a TV / Projector and a webcam."`,
        rebuttal: `"Understood! Most firms start with that. But what clients tell us is people on the other end struggle to hear people seated at the back, or someone has to pass around a laptop. We can show you a 10-minute live demonstration of an intelligent auto-tracking bar right in your room so you can hear the difference."`
      },
      {
        objection: `"Send an email first."`,
        rebuttal: `"Absolutely, I will send over our executive profile right away. Just to ensure I send the most relevant pricing, what video platform does your team use most often — Teams, Zoom, or Google Meet?"`
      },
      {
        objection: `"We already have an AV vendor / AMC."`,
        rebuttal: `"That's great. We are not asking you to replace them. Many clients keep us as a secondary specialist for emergency 2-hour callouts and OEM direct warranty pricing that general IT vendors cannot match."`
      }
    ],
    step5Closing: {
      title: "Step 5: Closing for the On-site Meeting",
      dialogue: `"I will be visiting clients in ${subRegion} this coming Thursday. Could I stop by for 15 minutes to take a quick look at your room layout and drop off our catalog?"`
    }
  };

  return script;
}

module.exports = {
  generateColdEmail,
  generateWhatsAppPitch,
  generateCallingScript
};
