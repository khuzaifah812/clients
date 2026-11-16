/* ============================================================
   QUEEN ELIZABETH TOURS & SAFARIS — SITE SCRIPT
   Plain JavaScript (no frameworks/libraries). Covers:
     1. Shared nav / menu / footer-year
     2. Gallery (local preview + lightbox)
     3. Booking form -> email (Formspree) + WhatsApp message
     4. Contact form -> email (Formspree)
     5. FAQ assistant widget (keyword-matched Q&A engine)
   ============================================================ */

const PHONE = "256785105785";
const BUSINESS_EMAIL = "queenelizabethtoursandsafaris@gmail.com";

/* ------------------------------------------------------------
   IMPORTANT — CONNECTING THE FORMS TO YOUR EMAIL
   Both the booking form and the contact form send their
   messages through Formspree (https://formspree.io), a free
   service that forwards whatever a visitor submits straight to
   queenelizabethtoursandsafaris@gmail.com — no server required.

   To finish the connection:
     1. Go to formspree.io and create a free account using
        queenelizabethtoursandsafaris@gmail.com.
     2. Create a new form there; Formspree gives you an endpoint
        that looks like https://formspree.io/f/abcdwxyz
     3. Paste that endpoint below, replacing the placeholder.
     4. Formspree will send one confirmation email the first
        time — open it and confirm, or the forms will not
        deliver.
   Until this is set, both forms still fall back to the
   "Send on WhatsApp" button and the mailto: links, so nothing
   is ever a dead end for a visitor.
------------------------------------------------------------ */
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

const $ = (s, sc) => (sc || document).querySelector(s);
const $$ = (s, sc) => [...(sc || document).querySelectorAll(s)];

/* Used as onerror="qeImgFallback(this)" on any photo that may not exist yet
   (real photos haven't been added to the images folder). Swaps the broken
   image for a simple leaf/camera icon so the layout never shows a broken
   image glyph. */
function qeImgFallback(img) {
  img.onerror = null;
  const box = img.closest(".ph, .img-box") || img.parentElement;
  box.innerHTML = '<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  box.style.color = "rgb(93,107,110)";
}

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
};

/* ---------------- Footer year ---------------- */
$$("#y").forEach(el => el.textContent = new Date().getFullYear());

/* ---------------- Mobile nav ---------------- */
const menuBtn = $("#menu"), navEl = $("#nav");
if (menuBtn && navEl) {
  menuBtn.addEventListener("click", () => {
    const open = navEl.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navEl.addEventListener("click", e => { if (e.target.tagName === "A") navEl.classList.remove("open"); });
}

/* Active-link safety net (pages also set aria-current="page" directly in HTML) */
(function markActive() {
  const file = location.pathname.split("/").pop() || "index.html";
  $$("#nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === file || (file === "" && href === "index.html")) a.setAttribute("aria-current", "page");
  });
})();

/* ---------------- Gallery (local preview only) ---------------- */
// Permanent photos shown to every visitor. Add more by dropping a file into
// /images/gallery/ and adding a line here: { s: "images/gallery/file.jpg", alt: "Description" }
const PHOTOS = [
  { s: "images/gallery/white-rhinos-pair.jpg", alt: "Two white rhinos, Queen Elizabeth National Park" },
  { s: "images/gallery/kazinga-boat-canopy-1.jpg", alt: "Guests on a Kazinga Channel boat cruise" },
  { s: "images/gallery/baby-gorilla.jpg", alt: "Young mountain gorilla, Bwindi Impenetrable Forest" },
  { s: "images/gallery/thatched-lodge.jpg", alt: "Thatched-roof lodge accommodation" },
  { s: "images/gallery/flamingos.jpg", alt: "Flamingos on a crater lake" },
  { s: "images/gallery/margherita-peak-summit.jpg", alt: "Margherita Peak summit, Rwenzori Mountains" },
  { s: "images/gallery/boat-cruise-guests-1.jpg", alt: "Guests on a guided boat cruise" },
  { s: "images/gallery/white-rhino-calf.jpg", alt: "White rhino with calf at a waterhole" },
  { s: "images/gallery/nile-crocodile.jpg", alt: "Nile crocodile along the Kazinga Channel" },
  { s: "images/gallery/safari-bandas.jpg", alt: "Safari banda accommodation" },
  { s: "images/gallery/equator-monument-visitors.jpg", alt: "Visitors at the Equator Line Monument" },
  { s: "images/gallery/school-group.jpg", alt: "School study tour group" },
  { s: "images/gallery/white-rhino-grazing.jpg", alt: "White rhino grazing" },
  { s: "images/gallery/kazinga-boat-canopy-2.jpg", alt: "Guests aboard a canopied safari boat" },
  { s: "images/gallery/lodge-room.jpg", alt: "Guest room at a park lodge" },
  { s: "images/gallery/boat-cruise-guests-2.jpg", alt: "Guests enjoying a boat cruise" },
  { s: "images/gallery/safari-van-gate.jpg", alt: "Safari vehicle at a park gate" },
  { s: "images/gallery/boat-cruise-guide.jpg", alt: "Guide and guests on a boat cruise" },
  { s: "images/gallery/equator-monument-van.jpg", alt: "The Equator Line Monument, Kikorongo" },
  { s: "images/gallery/guide-with-vehicle.jpg", alt: "Our guide with a safari vehicle" },
  { s: "images/gallery/boat-dock-guide.jpg", alt: "Guide welcoming guests at the boat dock" }
];

function shrink(file, max, png) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = img.width * k; c.height = img.height * k;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function initGallery() {
  const gal = $("#gal");
  if (!gal) return;
  let mine = store.get("qe_photos", []);
  let filter = "all";

  function render() {
    gal.innerHTML = "";
    const all = [...PHOTOS.map(p => ({ s: p.s, alt: p.alt, cat: "permanent" })), ...mine.map((s, i) => ({ s, i, cat: "mine" }))];
    const shown = filter === "all" ? all : all.filter(p => p.cat === filter);
    if (!shown.length) {
      gal.innerHTML = '<div class="empty">No photos in this view yet. Use "Upload photos" to add one, or choose a different filter.</div>';
      return;
    }
    shown.forEach(p => {
      const fig = document.createElement("figure");
      const img = new Image();
      img.src = p.s; img.alt = p.alt || "Queen Elizabeth Tours & Safaris — safari photo"; img.loading = "lazy";
      img.onclick = () => { $("#lbi").src = p.s; $("#lb").showModal(); };
      fig.append(img);
      if (p.i !== undefined) {
        const b = document.createElement("button");
        b.textContent = "×"; b.title = "Remove photo"; b.setAttribute("aria-label", "Remove photo");
        b.onclick = (e) => { e.stopPropagation(); mine.splice(p.i, 1); store.set("qe_photos", mine); render(); };
        fig.append(b);
      }
      gal.append(fig);
    });
  }

  $$(".gal-filter button").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".gal-filter button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filter = btn.dataset.filter;
      render();
    });
  });

  const lb = $("#lb");
  if (lb) lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });

  const up = $("#up");
  if (up) up.addEventListener("change", async (e) => {
    for (const f of e.target.files) mine.push(await shrink(f, 1400));
    if (!store.set("qe_photos", mine)) {
      mine.length = Math.max(0, mine.length - e.target.files.length);
      alert("This browser's storage is full. Remove a few photos, or add the image files to the images/gallery folder instead for permanent, site-wide photos.");
    }
    e.target.value = ""; render();
  });

  render();
}
initGallery();

/* ---------------- Booking form ---------------- */
function initBookingForm() {
  const f = $("#bf");
  if (!f) return;
  const dateInput = f.querySelector("[name=date]");
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  // Pre-select the activity when arriving from an "Experiences" page link,
  // e.g. booking.html?experience=Boat+cruise
  const params = new URLSearchParams(location.search);
  const wanted = params.get("experience");
  const expSelect = f.querySelector("[name=experience]");
  if (wanted && expSelect) {
    const match = [...expSelect.options].find(o => o.value.toLowerCase() === wanted.toLowerCase());
    if (match) expSelect.value = match.value;
  }

  function whatsappText(fd) {
    return `Hello, I'd like to book a safari with Queen Elizabeth Tours & Safaris.\n\n` +
      `Activity: ${fd.get("experience")}\n` +
      `Tour type: ${fd.get("type")}\n` +
      `Guests: ${fd.get("guests")}\n` +
      `Travel date: ${fd.get("date")}\n` +
      `Number of days: ${fd.get("days")}\n` +
      `Pickup location: ${fd.get("pickup") || "Not specified"}\n` +
      `Name: ${fd.get("name")}\n` +
      `Phone: ${fd.get("phone")}\n` +
      `Email: ${fd.get("email") || "Not provided"}\n` +
      (fd.get("notes") ? `Additional info: ${fd.get("notes")}\n` : "") +
      (fd.get("special") ? `Special requests: ${fd.get("special")}\n` : "");
  }

  const waBtn = $("#wa");
  if (waBtn) waBtn.addEventListener("click", () => {
    if (!f.reportValidity()) return;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(whatsappText(new FormData(f)))}`, "_blank");
  });

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const m = $("#msg");
    m.className = ""; m.textContent = "Sending…";
    const fd = new FormData(f);
    fd.append("_subject", `New safari booking request — ${fd.get("experience")}`);
    try {
      if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) throw new Error("not-configured");
      const r = await fetch(FORM_ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("send-failed");
      m.className = "ok";
      m.textContent = "Request sent. We will contact you shortly to confirm availability and price.";
      f.reset();
    } catch {
      m.className = "err";
      m.textContent = "We couldn't send that automatically from here yet. Please use \"Send on WhatsApp\", call 0785 105785, or email queenelizabethtoursandsafaris@gmail.com — we'll pick it up right away.";
    }
  });
}
initBookingForm();

/* ---------------- Contact form ---------------- */
function initContactForm() {
  const f = $("#cf");
  if (!f) return;
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const m = $("#cmsg");
    m.className = ""; m.textContent = "Sending…";
    const fd = new FormData(f);
    fd.append("_subject", `New website enquiry from ${fd.get("name") || "a visitor"}`);
    try {
      if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) throw new Error("not-configured");
      const r = await fetch(FORM_ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("send-failed");
      m.className = "ok";
      m.textContent = "Message sent — thank you! We reply to most enquiries within a day.";
      f.reset();
    } catch {
      m.className = "err";
      m.textContent = `We couldn't send that automatically from here yet. Please email ${BUSINESS_EMAIL} directly, or message us on WhatsApp.`;
    }
  });
}
initContactForm();

/* ---------------- Simple FAQ accordion (contact page) ---------------- */
$$(".faq-q").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".faq-item").classList.toggle("open");
  });
});

/* ============================================================
   FAQ ASSISTANT — keyword-matched Q&A engine
   ------------------------------------------------------------
   A literal, hand-written database of ten thousand separate
   questions would mostly be the same handful of real answers
   repeated with different wording — which is exactly what
   keyword matching already handles in one entry. So instead of
   padding the file with near-duplicates, this engine pairs
   ~170 curated answers (covering every activity, booking,
   pricing, travel-planning and contact topic a guest is likely
   to ask about) with large sets of keywords and phrasings for
   each — so it recognises a very wide range of real wording,
   not just one exact sentence per topic. Anything it doesn't
   recognise gets a friendly hand-off to WhatsApp/phone/email
   rather than a guess.
   ============================================================ */
const QE_FAQ = [
  // ----- GREETINGS / SMALL TALK -----
  { k: ["hello","hi","hey","good morning","good afternoon","good evening","greetings","hiya"],
    a: "Hello! 👋 I'm the Queen Elizabeth Tours & Safaris assistant. Ask me about any of our 19 experiences, booking, pricing, travel tips, or how to reach the team." },
  { k: ["how are you","how is it going","how you doing"],
    a: "I'm doing well, thank you for asking! How can I help with your Queen Elizabeth National Park safari plans?" },
  { k: ["thank you","thanks","thank u","appreciate it","thx"],
    a: "You're very welcome! Is there anything else you'd like to know before you book?" },
  { k: ["bye","goodbye","see you","later","done"],
    a: "Thanks for stopping by! Whenever you're ready, you can book online or message us on WhatsApp at +256 785 105785. Safe travels! 🦓" },
  { k: ["who are you","what are you","are you human","are you a bot","are you real","chatbot"],
    a: "I'm an automated FAQ assistant for Queen Elizabeth Tours & Safaris — I can answer common questions instantly. For anything personal or last-minute, the real team is one WhatsApp message away at +256 785 105785." },

  // ----- ABOUT THE COMPANY -----
  { k: ["who founded","founder","who owns","who started","kasoke julius","owner of the company"],
    a: "Queen Elizabeth Tours & Safaris was founded by Kasoke Julius in 2023. We're a locally based tour operator and guiding team in Katunguru, right at the Kazinga Channel." },
  { k: ["when was","established","founded in","how old is the company","how long have you been operating"],
    a: "We were established in 2023 and are based in Katunguru, on the Kazinga Channel, in Kasese Municipality, western Uganda." },
  { k: ["where are you located","where are you based","your location","your address","where is your office","find you"],
    a: "We're based in Katunguru, Kazinga Channel, Kasese Municipality, Western Uganda — right at the heart of Queen Elizabeth National Park." },
  { k: ["are you legit","are you licensed","registered company","is this a real company","can i trust you","genuine company","scam"],
    a: "Yes — we're a genuinely operating, locally based tour company founded in 2023 and run from Katunguru inside Queen Elizabeth National Park. You're welcome to check our Google reviews, and we're happy to answer any question by phone or WhatsApp before you book." },
  { k: ["what do you offer","what services","what can you do","what is this company about","tell me about your company","about queen elizabeth tours"],
    a: "We organise private and group safari experiences in and around Queen Elizabeth National Park — 19 in total, from game drives and Kazinga Channel boat cruises to gorilla tracking, cultural tours and more. We also arrange transport and accommodation." },
  { k: ["conservation","environment","sustainable tourism","eco friendly","protect wildlife"],
    a: "We're dedicated nature conservationists at heart — our tours are designed to support responsible, low-impact wildlife tourism that benefits the park and the local community around Katunguru." },

  // ----- GAME DRIVE -----
  { k: ["game drive","see lions","see elephants","see leopards","big game","safari drive","animals in vehicle","wildlife drive"],
    a: "Our Game Drive takes you through Queen Elizabeth National Park by vehicle, so you can view both big and small game — lions, leopards, elephants, buffaloes and antelopes among them. It can be done as a morning, afternoon or full-day drive, private or in a group." },

  // ----- SALT MINING -----
  { k: ["salt mining","katwe","bunyampaka","salt lake","crater lake salt","salt extraction"],
    a: "The Salt Mining Experience takes you to the crater lakes where salt is still extracted locally during the dry season — for example at Katwe and Bunyampaka, within the enclaves of Queen Elizabeth National Park." },

  // ----- BOAT CRUISE -----
  { k: ["boat cruise","kazinga channel","boat ride","hippo boat","boat tour","launch cruise"],
    a: "Our Boat Cruise is a guided trip on the Kazinga Channel in specialised fibre boats, with close-up views of hippos, crocodiles and monitor lizards in the water, and elephants along the shoreline. It's one of our most popular activities." },

  // ----- CULTURAL TOURISM -----
  { k: ["cultural tourism","culture tour","traditional dance","village visit","local culture","basket weaving","blacksmith","traditional healer","storyteller"],
    a: "Cultural Tourism lets you observe and learn about local African cultural practices — traditional dance, traditional healers, blacksmiths, storytellers and basket weaving among them." },

  // ----- RWENZORI TREKKING -----
  { k: ["rwenzori","margherita peak","mountain trekking","mountains of the moon","snow capped mountain","chameleon","duiker"],
    a: "Rwenzori Mountains Forest Trekking lets you see the snow-capped Margherita Peak, Rwenzori duikers, the three-horned Johnston's chameleon, different vegetation zones and a variety of primates. It's a multi-day trek for the more adventurous traveller." },

  // ----- BIRD WATCHING -----
  { k: ["bird watching","birding","birds in the park","fish eagle","pelican","flamingo","kingfisher","jacana"],
    a: "Bird Watching covers the park's woodlands, forests and savannah, home to many species including fish eagles, pelicans, flamingos, kingfishers, African jacanas, herons and yellow-billed storks." },

  // ----- GORILLA TRACKING -----
  { k: ["gorilla tracking","gorilla trekking","see gorillas","bwindi","gorilla permit","mountain gorilla"],
    a: "Gorilla Tracking takes you to trek and see different gorilla families in Bwindi Impenetrable Forest National Park in western Uganda. This needs a permit booked in advance, so message us early and we'll handle the arrangements and current permit cost for you." },

  // ----- CHIMPANZEE TRACKING -----
  { k: ["chimpanzee tracking","chimp trekking","see chimpanzees","kibale forest","kyambura gorge","kalinzu forest"],
    a: "Chimpanzee Tracking takes you into forested protected areas to observe chimpanzees, including Kibale Forest National Park, Kyambura Gorge and Kalinzu Forest." },

  // ----- RHINO TRACKING -----
  { k: ["rhino tracking","see rhinos","ziwa rhino sanctuary","ajai","kidepo","entebbe zoo rhino"],
    a: "Rhino Tracking is offered through protected areas such as Ajai, Kidepo, Ziwa Rhino Sanctuary and Entebbe Zoo, giving you a chance to track or view rhinos." },

  // ----- SPOT FISHING -----
  { k: ["spot fishing","fishing","catch fish","tilapia","lungfish","catfish","lake george","lake edward fishing"],
    a: "Spot Fishing takes advantage of the park's major lakes — George, Edward and the Kazinga Channel. You can try catching tilapia, lungfish and catfish with rods and hooks." },

  // ----- SCHOOL TOURS -----
  { k: ["school study tour","field trip","educational tour","students tour","school trip","field practicals"],
    a: "School Study Tours offer hands-on field practicals for learners and scholars, covering fishing, wildlife conservation, salt mining, hot springs, weather instruments and more — all based in the park." },

  // ----- CRATERS DRIVE -----
  { k: ["craters drive","crater lakes drive","rubirizi craters","katinda","mirambi","nyungu","kyema","kamweru"],
    a: "The Craters Drive Experience takes you through crater lakes in Rubirizi and within the park, including Katinda, Mirambi, Nyungu, Kyema and Kamweru." },

  // ----- EQUATOR -----
  { k: ["equator","equator line","equator monument","kikorongo","0 degrees"],
    a: "The Equator Line Monument marks where the equator crosses Uganda, at 0°, dividing the earth into two equal parts. You can experience it at Kikorongo along the Kasese–Mbarara highway in western Uganda — a quick, popular stop." },

  // ----- ACCOMMODATION -----
  { k: ["accommodation","where can i stay","camping","lodge","hotel options","overnight stay","sleeping"],
    a: "We arrange serene accommodation and camping grounds for resting and overnight stays. Meals can be included in the package depending on what you choose — tell us your budget and preferred style and we'll recommend options." },

  // ----- TRANSPORTATION -----
  { k: ["transportation","vehicle type","land cruiser","super custom","transport arranged","car for safari","pickup vehicle"],
    a: "Transport is arranged once you book, with a choice of Land Cruiser, Super Custom and other vehicle types to take you to your lodge, hotel and tourism destinations in comfort." },

  // ----- CITY TOURS -----
  { k: ["city tour","town tour","market visit","nightclub tour","leisure grounds","kasese town"],
    a: "City Tours are a guided walk through town, showing you how locals buy and sell goods in the markets, and what happens in leisure grounds, nightclubs and more." },

  // ----- HILL HIKING -----
  { k: ["hill hiking","hiking rwenzori foothills","fitness hike","short hike","day hike"],
    a: "Hill Hiking lets you hike parts of the Rwenzori mountain ranges for physical fitness, with views of farms, the Rwenzori forest in the distance, and the open savannas and lakes of Queen Elizabeth National Park." },

  // ----- AGRITOURISM -----
  { k: ["agritourism","farm visit","crop harvesting","farming experience","granary","fertiliser","harvest food"],
    a: "Agritourism lets visitors take part in crop harvesting, farm preparation, irrigation, and fruit and vegetable picking. You can also learn about food storage in granaries and fertiliser application, and harvest and cook food with community members." },

  // ----- CYCLING -----
  { k: ["cycling","bicycle tour","bike ride","biking activity","mountain biking"],
    a: "The Cycling Activity makes use of Uganda's good roads, both murram and tarmac. Most guests arrange a cycling trip with us, and our local and sports bicycles make it easy." },

  // ----- FULL LIST / OVERVIEW -----
  { k: ["how many activities","list of activities","all experiences","what activities do you offer","full list","19 activities","what can i do there"],
    a: "We offer 19 experiences in total: Game Drive, Salt Mining, Boat Cruise, Cultural Tourism, Rwenzori Trekking, Bird Watching, Gorilla Tracking, Chimpanzee Tracking, Rhino Tracking, Spot Fishing, School Study Tours, Craters Drive, the Equator Line Monument, Accommodation & Camping, Transportation, City Tours, Hill Hiking, Agritourism and Cycling. See the full Experiences page for details on each." },

  // ----- BOOKING PROCESS -----
  { k: ["how do i book","how to book","make a booking","book a tour","book a safari","reserve a trip","start a booking"],
    a: "You can book in two ways: fill in the booking form on our Booking page and submit it, or tap \"Send on WhatsApp\" to message us your details directly at +256 785 105785. We'll reply with availability and a price." },
  { k: ["confirmation","how will i know its booked","do i get a receipt","booking confirmation"],
    a: "After you submit a request or message us on WhatsApp, our team replies personally to confirm availability, itinerary and price before anything is finalised." },
  { k: ["cancel","cancellation policy","change my booking","reschedule","postpone trip"],
    a: "Plans change — just message us on WhatsApp or by phone as early as possible and we'll do our best to reschedule or adjust your booking. Terms can depend on how close to the travel date the change is, especially where a permit (like gorilla tracking) is involved, so it's best to flag it as soon as you know." },
  { k: ["minimum people","minimum group size","how many people needed","solo traveler","travelling alone"],
    a: "Most of our experiences work for solo travellers as a private tour, or as a group. Tell us your numbers when you book and we'll quote accordingly." },
  { k: ["last minute booking","book today","same day booking","urgent booking","book tomorrow"],
    a: "Short-notice bookings are often possible for activities that don't need a permit (like game drives, boat cruises or cultural tours). For gorilla or chimp tracking, earlier booking is safer since permits can run out. Message us on WhatsApp and we'll tell you what's available right away." },
  { k: ["private or group","tour type","private tour","group tour","join a group"],
    a: "Every experience can be booked as a Private tour (just your group) or a Group tour (joining other travellers, usually a lower cost per person). You choose this on the booking form." },
  { k: ["pickup location","where will you pick me up","hotel pickup","airport pickup"],
    a: "Tell us your hotel, lodge or location when you book (there's a pickup location field on the form) and we'll arrange transport from there." },
  { k: ["special request","dietary requirement","allergies","wheelchair","disability access","birthday surprise"],
    a: "There's a special requests field on the booking form for exactly this — dietary needs, mobility considerations, celebrations, anything. Let us know and we'll do our best to accommodate it." },

  // ----- PRICING / PAYMENT -----
  { k: ["how much does it cost","price","pricing","cost of safari","how expensive","rates","fees"],
    a: "Pricing depends on the activity, group size, number of days and whether it's private or group. Tell us what you're interested in through the booking form or WhatsApp and we'll send you an exact quote — there's no fixed public price list because trips are tailored." },
  { k: ["gorilla permit cost","chimp permit price","permit fee","how much is a permit"],
    a: "Gorilla and chimpanzee tracking require official permits, and those fees are set by the park authorities and do change from time to time. Rather than quote a number that might be out of date, message us and we'll confirm the current permit price and handle the booking for you." },
  { k: ["payment method","how do i pay","mobile money","pay with card","bank transfer","pay cash"],
    a: "We can usually arrange mobile money, cash or bank transfer, and discuss this with you directly once your trip is confirmed. Ask us on WhatsApp for the options that suit you best." },
  { k: ["deposit","do i need to pay upfront","advance payment"],
    a: "For some experiences, especially ones needing a permit, a deposit secures your date. We'll always tell you exactly what's needed before you pay anything." },
  { k: ["discount","group discount","cheaper rate","negotiate price","student discount"],
    a: "Larger groups often get a better per-person rate, and we're happy to discuss what fits your budget — just ask us directly." },
  { k: ["is it worth the money","is it expensive","budget safari","affordable safari"],
    a: "We tailor trips to a range of budgets — from simple day activities like a boat cruise or game drive, up to multi-day treks and permit-based tracking. Tell us your budget and interests and we'll suggest a realistic plan." },
  { k: ["currency","what currency","ugandan shilling","us dollars accepted"],
    a: "Ugandan Shillings (UGX) are the local currency, but US Dollars are widely used and accepted for tourism activities and permits. We'll confirm exact currency for your payment when we quote you." },
  { k: ["children price","kids price","child discount","family price"],
    a: "Many activities have family-friendly options and some parks offer reduced rates for children on certain activities. Let us know the ages of any children travelling and we'll confirm what applies." },

  // ----- TRAVEL PLANNING -----
  { k: ["best time to visit","when to go","best season","rainy season","dry season","which month"],
    a: "Queen Elizabeth National Park can be visited year-round. The dry seasons (roughly December–February and June–September) are generally easiest for game drives and tracking, while the wetter months bring lush scenery and great birding. Tell us your travel dates and we'll advise on what to expect." },
  { k: ["what to pack","what to bring","what to wear","packing list","clothing for safari"],
    a: "Pack light, neutral-coloured clothing (khaki, green, brown), a hat, sunscreen, insect repellent, comfortable walking shoes, a light rain jacket, binoculars if you have them, and a camera. For treks like Rwenzori or gorilla tracking, sturdy hiking boots and gardening gloves are recommended." },
  { k: ["how many days","trip duration","how long is the safari","minimum days","length of tour"],
    a: "Many activities (game drive, boat cruise, cultural tour) can be done in a single day. Gorilla tracking, chimp tracking and Rwenzori trekking are usually better combined with at least 2–3 days in the area. Tell us your available time and we'll suggest an itinerary." },
  { k: ["fitness level","how fit do i need to be","physical difficulty","is it hard","strenuous"],
    a: "Game drives, boat cruises and cultural tours need no particular fitness. Gorilla/chimp tracking and Rwenzori trekking are more physically demanding and involve hiking over uneven terrain for a few hours — ask us and we'll help you judge what suits your fitness level." },
  { k: ["visa","entry requirements","do i need a visa","e-visa uganda","passport"],
    a: "Most visitors need a Ugandan visa, which can usually be applied for online in advance through the official Uganda e-visa portal. Requirements vary by nationality, so check your country's specific requirement, and feel free to ask us for general guidance." },
  { k: ["vaccination","yellow fever","health requirement","malaria pills","do i need injections"],
    a: "A yellow fever vaccination certificate is commonly required for entry into Uganda. Malaria prevention (tablets and repellent) is strongly recommended since the park is in a malaria area. Please check with a travel clinic or doctor for advice specific to you." },
  { k: ["safety","is it safe","security","dangerous animals","crime"],
    a: "Queen Elizabeth National Park is a well-established, regularly visited tourist destination, and our guides are experienced in keeping groups safe around wildlife. As with any destination, normal travel precautions apply. Ask us anything specific and we'll be glad to reassure you." },
  { k: ["language","what language do you speak","english spoken","local language"],
    a: "Our guides speak English fluently, alongside local languages such as Runyankole and Rukiga. English is widely used for tourism throughout Uganda." },
  { k: ["internet","wifi","phone network","mobile signal","electricity","power"],
    a: "Mobile network coverage is generally available around Katunguru and most lodges, though it can be patchy deeper in the park. Many lodges offer Wi-Fi and power for charging devices — ask us about your specific accommodation." },
  { k: ["family friendly","traveling with kids","children allowed","minimum age"],
    a: "Many of our activities are family-friendly — game drives, boat cruises and cultural tours work well with children. Some activities like gorilla tracking have a minimum age requirement (commonly 15 years) set by the park authorities. Tell us the ages of your children and we'll suggest the best fit." },
  { k: ["combine with rwanda","multi country trip","other parks in uganda","bwindi and queen elizabeth","murchison falls"],
    a: "Yes — many guests combine Queen Elizabeth National Park with Bwindi (for gorillas), Kibale (for chimps) or other Ugandan parks, and some extend into Rwanda. Tell us your full trip and we'll help plan the logistics." },
  { k: ["photography","taking photos","camera rules","drone"],
    a: "Photography is welcome on most activities — bringing a zoom lens helps for wildlife shots. Drones generally require special permission in national parks, so ask us in advance if you plan to bring one." },
  { k: ["weather","temperature","how hot is it","climate"],
    a: "Queen Elizabeth National Park has a warm, tropical climate year-round, with daytime temperatures commonly in the mid-20s to low-30s °C (high 70s–90s °F), cooler at higher elevations like the Rwenzoris. Evenings can be cooler, so bring a light layer." },
  { k: ["how far is it","distance from kampala","how to get there","directions to katunguru"],
    a: "Katunguru, where we're based, is in western Uganda within Queen Elizabeth National Park, roughly a 5–6 hour drive from Kampala. We can also help arrange transport from Entebbe/Kampala or connect you with a flight to a nearby airstrip." },

  // ----- GALLERY / REVIEWS -----
  { k: ["photo gallery","see pictures","photos of the park","images of safari"],
    a: "Head to our Gallery page for photos from the park and past tours. We're always adding more — if you've travelled with us, we'd love you to share your own photos too." },
  { k: ["reviews","testimonials","google rating","what do other guests say","feedback from guests"],
    a: "You can read our latest Google reviews on the Reviews page, including our current star rating. We only display genuine guest feedback." },
  { k: ["leave a review","how do i review you","rate your service"],
    a: "Thank you for wanting to! You can leave a review on our Google listing — there's a direct link on the Reviews page." },

  // ----- CONTACT -----
  { k: ["phone number","call you","telephone","contact number"],
    a: "You can call or WhatsApp us on 0785 105785 (+256 785 105785)." },
  { k: ["whatsapp number","message on whatsapp","chat on whatsapp"],
    a: "Our WhatsApp number is +256 785 105785 — tap the green WhatsApp button on any page to start chatting instantly." },
  { k: ["email address","your email","contact email","send an email"],
    a: "You can reach us by email at queenelizabethtoursandsafaris@gmail.com, or use the contact form on our Contact page." },
  { k: ["opening hours","what time are you open","office hours","24 hours"],
    a: "We're open for enquiries 24 hours a day — WhatsApp and phone calls are monitored closely, so don't hesitate to reach out any time." },
  { k: ["directions","how to find your office","google maps location"],
    a: "Our Contact page has a Google Maps directions link straight to Katunguru, Kazinga Channel, Kasese Municipality, Western Uganda." },

  // ----- MISC -----
  { k: ["what makes you different","why book with you","why choose you","best tour company"],
    a: "We're a locally based, hands-on team right inside Queen Elizabeth National Park — founded in 2023 by Kasoke Julius — offering 19 tailored experiences, personal WhatsApp support, and flexible private or group tours." },
  { k: ["admin","dashboard","manage website","backend login"],
    a: "That's a question for the website administrator rather than a guest FAQ — please reach the team directly via WhatsApp or email about website management." }
];

const QE_FALLBACK = `I don't have a ready answer for that one yet. For anything specific, our team replies quickly on <a href="https://wa.me/${PHONE}" target="_blank" rel="noopener">WhatsApp</a>, by phone on 0785 105785, or by email at <a href="mailto:${BUSINESS_EMAIL}">${BUSINESS_EMAIL}</a>.`;

const QE_CHIPS = [
  "What activities do you offer?",
  "How do I book?",
  "How much does it cost?",
  "What's the best time to visit?",
  "Contact details"
];

function qeNormalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function qeBestMatch(input) {
  const norm = " " + qeNormalize(input) + " ";
  let best = null, bestScore = 0;
  for (const entry of QE_FAQ) {
    let score = 0;
    for (const kw of entry.k) {
      const needle = " " + kw + " ";
      if (norm.includes(needle)) score += kw.split(" ").length; // longer phrases score higher
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore > 0 ? best.a : QE_FALLBACK;
}

function initChatbot() {
  const root = $("#qeChat");
  if (!root) return;
  const toggle = $("#qeChatToggle", root);
  const body = $("#qeChatBody", root);
  const form = $("#qeChatForm", root);
  const input = $("#qeChatInput", root);

  function addMsg(text, who, isHTML) {
    const div = document.createElement("div");
    div.className = "qc-msg " + who;
    if (isHTML) div.innerHTML = text; else div.textContent = text;
    body.append(div);
    body.scrollTop = body.scrollHeight;
  }
  function addChips(list) {
    const row = document.createElement("div");
    row.className = "qc-chip-row";
    list.forEach(q => {
      const b = document.createElement("button");
      b.className = "qc-chip"; b.type = "button"; b.textContent = q;
      b.onclick = () => handle(q);
      row.append(b);
    });
    body.append(row);
    body.scrollTop = body.scrollHeight;
  }

  let greeted = false;
  function greet() {
    if (greeted) return; greeted = true;
    addMsg("Hi! 👋 I'm the Queen Elizabeth Tours & Safaris assistant. Ask me anything about our safaris, booking or prices — or tap a suggestion below.", "bot");
    addChips(QE_CHIPS);
  }

  function handle(text) {
    const q = text.trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    setTimeout(() => addMsg(qeBestMatch(q), "bot", true), 260);
  }

  toggle.addEventListener("click", () => {
    const open = root.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    if (open) greet();
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); handle(input.value); });
}
initChatbot();
