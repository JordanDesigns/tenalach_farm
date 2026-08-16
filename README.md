# Tenalach Farm

Static website for Tenalach Farm, Marshalltown, Nova Scotia.
Plain HTML, CSS and JavaScript. No build step, no dependencies. Upload the folder and it runs.

---

## Before it goes live

One thing still needs a real value. It is marked in the source so you can find it fast.

### Form endpoint (required, or the forms do not send)

Both forms post to a Formspree endpoint that is still a placeholder.

- `contact.html` and `cabins.html`, search for `REPLACE_WITH_YOUR_FORM_ID`
- Sign up at formspree.io, create a form, and swap in the real action URL:
  `action="https://formspree.io/f/xyzabcde"`

Until that is done the forms still validate, and then show a message telling the
visitor to email `TenalachFarm1@gmail.com` instead. Nothing is silently swallowed,
but nothing is delivered either, so this needs doing before launch.

If you would rather use Web3Forms, Netlify Forms or your own script, the submit
handler lives in `js/main.js` under `initForms()`.

---

## Airbnb listings (confirmed)

The two "View on Airbnb" buttons in `cabins.html` point at the real listings:

| Cabin | Listing |
|---|---|
| Breezy Hill Bunkie | `https://www.airbnb.ca/rooms/1099475593897881439` |
| Copper's Cabin | `https://www.airbnb.ca/rooms/1553978065386757835` |

These are the bare canonical URLs. The links were supplied as Airbnb share links
carrying `check_in`, `check_out`, `guests` and tracking IDs, which were stripped.
Leaving those on would have prefilled fixed dates and a single guest for every
visitor, and the tracking IDs go stale. If you ever replace these, take everything
after the `?` off first.

---

## Facebook page (confirmed)

Every page links to `https://www.facebook.com/TenalachFarm1`, supplied and confirmed.
It appears 19 times across the six HTML files, including the `sameAs` field in the
schema markup in `index.html`. If it ever changes, find and replace across all six.

---

## Details taken from the market banner photo

The address `634 Marshalltown Road` and the email `TenalachFarm1@gmail.com` were
read off the banner in `Market Photos/IMG_8244.JPG` and confirmed. They appear in
the footer of all six pages, on the contact page, and in the schema markup in
`index.html`. If either changes, find and replace across the site.

---

## Structure

```
index.html         Home
about.html         About Us, the name, Cheryl, the animals, markets
seedlings.html     Seedlings, cut flowers, herbs, how to buy
cabins.html        Breezy Hill Bunkie, Copper's Cabin, enquiry form
workshops.html     What the workshops are like, how to hear about them
contact.html       Contact form, details, quick answers

css/style.css      Everything. Mobile first, numbered sections, tokens at the top.
js/main.js         Nav, scroll reveal, lightbox, form handling. No dependencies.
images/            Resized and organised, see below.
robots.txt
sitemap.xml
```

## About the images

The supplied photos were **not** downsized. Several were 5 to 10 MB at 3373 x 1898,
which would have been unusable on mobile. Every photo has been re-encoded at a
1600px cap plus an 800px variant, JPEG quality 78, with EXIF rotation applied.

Total went from roughly 150 MB to 23 MB. Pages use `srcset` so phones pull the
800px file and desktops pull the 1600px one.

No HEIC files were used anywhere, as instructed.

**One limitation worth knowing:** the cabin interior photos were supplied at around
550 x 530 pixels. That is genuinely small. They look fine at gallery size but they
cannot be shown any larger, which is why the cabin galleries use small tiles rather
than a big showcase image. If Cheryl can send higher resolution cabin photos, that
page would benefit more than any other.

## Design notes

Colours are sampled straight from the supplied logo files:

| Token | Value | Where it came from |
|---|---|---|
| `--teal` | `#0fa2a8` | logo mark |
| `--sage` | `#8ad0aa` | logo mark |
| `--cream` | `#fffee0` | logo wordmark |
| `--blue` | `#345e7e` | supplied blue icon set |

The previous site used full colour backgrounds throughout. This one uses a warm
cream paper tone as the base with deep blue and teal bands breaking up the page,
which keeps body text easy to read for all ages while still reading as branded
rather than plain white.

Type is Playfair Display for headings and Nunito Sans for body, loaded from Google
Fonts with system fallbacks.

## Accessibility

- Skip link, landmarks, and a real focus ring on every interactive element
- Mobile nav traps focus, closes on Escape, and uses `inert` when hidden
- Lightbox is a proper dialog with arrow key and swipe navigation
- Body text is 17px minimum, form inputs are 16px so iOS does not zoom on focus
- Tap targets are at least 48px
- All animation is disabled under `prefers-reduced-motion`
- Colour contrast checked on the coloured bands

## Testing

Rendered and reviewed at 390px and 1440px in Chrome. Note that headless Chrome on
Windows clamps the layout viewport to 500px minimum, so if you screenshot this
yourself at 390px you will get a misleading result. Use real device emulation or an
iframe harness.
