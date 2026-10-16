# Chelsea's Rentals – Scooter Finder

Two files:

- **index.html** – the questionnaire. Works on its own as a page, or inside the pop-out.
- **popup.js** – opens the questionnaire in an overlay on top of chelseas-rentals.com, so visitors never leave the site.

## 1. Put it online (Vercel, free)

1. Create a new GitHub repository (e.g. `scooter-finder`) and upload both files.
2. At vercel.com/new, import that repository and click **Deploy**. Leave all settings as they are.
3. You'll get an address like `https://scooter-finder.vercel.app`. Open it to check the questionnaire works.

## 2. Make it pop out on the website

**Step A – load the pop-out script (once, site-wide).**
In Booqable go to **Settings → Additional scripts** and paste this one line (no `<script>` tags; Booqable adds them):

```
Booqable.loadScript('https://scooter-finder.vercel.app/popup.js');
```

To control where the floating "Find my scooter" button appears, put this line *above* it:

```
window.CR_FINDER = { floating: "mobility" };  // "mobility" (default), "all" or "none"
```

**Step B – add a button on the "Which scooter" page.**
In the page editor add a normal button, e.g. "Find my scooter in 60 seconds", linking to:

```
https://scooter-finder.vercel.app/
```

With the script loaded, clicking it opens the overlay. Any link ending in `#find-my-scooter` does the same, so you can add it to menus, blog posts and WhatsApp messages
(e.g. `https://chelseas-rentals.com/pages/which-mobility-scooter-should-i-hire#find-my-scooter` opens the page with the finder already showing).

**If Additional scripts doesn't run on your website pages** (it's a premium feature, and Booqable describes it mainly for checkout), the button from Step B still works: it opens the finder as its own page, styled to match, and every "book" link returns the visitor to the product page on chelseas-rentals.com.

## How a scooter is chosen

1. **Hard rules** remove any scooter that can't work:
   - Weight above the scooter's maximum user weight.
   - Steps → only scooters light enough to lift (the three ultralights, 16–20 kg).
   - Small lift → no wide heavy-duty scooters (the Heavyweight 6 mph at 560 mm is the only heavy one allowed).
   - Black cabs have ramps, so every scooter is allowed. Ubers, minicabs or your own car → ultralights or the dismantling lightweights (no heavy-duty). Trains → folding ultralights only.
   - Delivery → excludes the collection-only Heavyweight 20-mile. (This question is only asked when that scooter is still in the running.)
2. **Ranking** – the remaining scooters get points from the distance, priority, transport and lift answers (table `POINTS` in index.html). Highest score wins; ties go to the order on your comparison table.
3. **No exact match** (e.g. steps plus a rider over 124.7 kg) → the closest option is shown with a warning to WhatsApp before booking. Weight limits are never relaxed. Riders over 181 kg are asked to message you.

Every answer path has been tested (810 combinations). Each of the nine scooters is the top pick for at least one set of answers, for example:

| Top pick | Example answers |
|---|---|
| Ultralight Superhandy 13-mile | Up to 115 kg, steps, Ubers, short trips, light |
| Ultralight Carbon 15-mile | Up to 115 kg, steps, Ubers, half day, light |
| Ultralight 30-mile | Up to 115 kg, steps, Ubers, full day, light |
| Lightweight 6-mile | Up to 115 kg, small lift, own car, short trips, comfort |
| Lightweight 7.5-mile | Up to 115 kg, small lift, own car, half day, comfort |
| Heavyweight Class 2 (4 mph) | Step-free, ride everywhere, short trips, comfort, delivery |
| Heavyweight 6 mph | Small lift, ride everywhere, comfort |
| Heavyweight 8 mph | Step-free, ride everywhere, smooth ride, delivery |
| Heavyweight 20-mile | Step-free, ride everywhere, full day, smooth ride, collect |

## Updating

All scooter details sit at the top of the script in index.html (`SCOOTERS`). Change a weight limit, range or product link there and redeploy. If you add a scooter, give it an entry in `SCOOTERS` and, if needed, points in `POINTS`.

## Analytics

If Google Analytics is on the site, the pop-out sends three events: `scooter_finder_open`, `scooter_finder_result` (with the scooter recommended) and `scooter_finder_book_click`.
