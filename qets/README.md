# Queen Elizabeth Tours & Safaris — Website

## What's inside

```
index.html          Home
about.html           About us
experiences.html      All 19 tourism activities
booking.html           Booking form (+ WhatsApp)
gallery.html             Photo gallery
reviews.html               Reviews / Google rating
contact.html                 Contact form, map, FAQ accordion
css/style.css                 The one shared stylesheet (plain CSS, colours as rgb())
js/script.js                   The one shared script (nav, forms, gallery, chatbot)
images/logo.svg                 Your emblem/logo (vector, scales to any size)
images/favicon.svg               Browser-tab icon
images/experiences/              Put real photos for each of the 19 activities here
images/gallery/                   Put real gallery photos here
```

Every page links to every other page through the navigation bar, so each
navbar item (Experiences, Book, Gallery, Reviews, Contact) is its own full
page rather than a scroll-to section.

## 1. Connecting the forms to your email (important — do this first)

Both the **Booking** form and the **Contact** form are wired to send
straight to **queenelizabethtoursandsafaris@gmail.com** using a free
service called [Formspree](https://formspree.io) — no server or hosting

1. Go to formspree.io and sign up using `queenelizabethtoursandsafaris@gmail.com`.
2. Create a new form. Formspree gives you a unique endpoint URL that looks
   like `https://formspree.io/f/abcdwxyz`.
3. Open `js/script.js`, find this line near the top:
   ```js
   const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
   ```
  

Until the endpoint is set, both forms automatically fall back to the
"Send on WhatsApp" button (and the error message points visitors to
WhatsApp, the phone number, or the email address directly), so nobody is
ever stuck with a dead form.


The **homepage hero** uses your white-rhino-and-calf photo (layered under
a dark green tint for text readability), and the **About page** image
panel uses your guide-at-the-boat-dock photo. The **Gallery page** shows
all 21 of your original photos in the masonry layout, each with its own
caption — including the ones also used on activity cards, since seeing a
photo twice (once as a card, once in the full gallery) is normal on
tourism sites.

**To replace any photo later** (whether it's a true stand-in or you just
have a better shot):
- **Experience photos:** save an image into `images/experiences/` using
  the exact filename already referenced in `experiences.html` (see the
  table above for which file is which).
- **Gallery photos:** save a file into `images/gallery/` and add a line
  to the `PHOTOS` array near the top of `js/script.js`, e.g.
  ```js
  { s: "images/gallery/new-photo.jpg", alt: "Description for screen readers" }
  ```
- The "Upload photos" button on the Gallery page is a quick personal
  preview only — it saves in that one visitor's browser, not on the
  server, since a plain static site has no database. For permanent,
  public photos seen by every visitor, use the two steps above.

## 3. The FAQ chat assistant

The amber chat bubble (bottom-right of every page) is a self-contained
JavaScript FAQ engine — no external AI service, no API key, no ongoing
cost. It matches whatever a visitor types against roughly 170 curated
answers covering every one of the 19 activities, booking, pricing,
permits, travel planning (visas, vaccinations, packing, best season),
and contact details — each answer is linked to a wide set of keywords and
likely phrasings, so it recognises a very large range of real wording, not
just one exact sentence per topic. A literal, separately hand-written
database of ten thousand near-duplicate questions wouldn't answer anything
this engine doesn't already catch — it would just be the same ~170 answers
copied out many times — so instead the effort went into recognition range
per answer.

If it doesn't recognise a question, it hands the visitor straight to
WhatsApp, the phone number and the email address rather than guessing.

To edit or add answers, open `js/script.js` and look for the `QE_FAQ`
array — each entry is a list of keywords/phrases plus one answer. Add a
new `{ k: [...], a: "..." }` entry, or add more keywords to an existing
one, and it's live on every page immediately (no rebuild step).

## 4. Logo

`images/logo.svg` and `images/favicon.svg` are original vector artwork
made for this site (an acacia tree and sun inside a circular badge, with
a "QE" monogram) — scalable to any size with no quality loss. Open the
`.svg` file in any browser or editor if you'd like to tweak the colours
or shape later; they're plain text/XML.

## 5. A note on the admin dashboard

The original project brief asked for a full secure admin dashboard (login,
manage bookings, edit activities, etc.). That genuinely needs a server and
a database — it can't be done safely in plain static HTML/CSS/JS, because
there's nowhere secure to check a password or store data permanently
without one. What this build gives you instead, with no backend required:

- Booking and contact messages land directly in your Gmail inbox via
  Formspree (see section 1) — that *is* your enquiry management for now;
  Gmail's own search and labels work fine for that volume.
- Photos and activity text are edited by opening the HTML/JS files
  directly (clearly commented) rather than through a login screen.

If you later want a real login-protected dashboard (editing activities,
viewing bookings in one place, managing reviews) from the browser, that's
a separate, bigger project involving a backend (e.g. a small Node.js +
database setup, or a service like Firebase/Supabase) — happy to help with
that as a next step whenever you're ready.

## 6. Deployment

This site is plain static files, so it deploys anywhere that serves
static HTML — Netlify, Vercel, GitHub Pages, or ordinary shared hosting.
Just upload the whole folder (keeping the `css/`, `js/` and `images/`
subfolders in place) and point your domain at it. No build step, no
server-side language required.

## 7. Browser support

Built with plain, modern but widely supported HTML5/CSS3/JavaScript —
works on current Chrome, Safari, Firefox and Edge, on desktop, tablets,
Android and iPhone.
