# Chelsea's Rentals - Finders

Three questionnaires that recommend the right item to hire, plus one script that opens them as a pop-out on chelseas-rentals.com.

| File | Finder | Link that opens it |
| --- | --- | --- |
| `index.html` | Mobility scooters | `#find-my-scooter` |
| `wheelchair.html` | Wheelchairs | `#find-my-wheelchair` |
| `stroller.html` | Strollers and wagons | `#find-my-stroller` |
| `popup.js` | Opens any of the three in an overlay | - |

## Where it runs

This repo deploys to Vercel at `scooter-finder.vercel.app`, also reachable at `finder.chelseas-rentals.com`.
Commit to `main` and Vercel redeploys on its own, usually within a minute. There is no build step: the files are served as they are.

On the website, Booqable loads the pop-out once, site-wide, from **Settings -> Additional scripts** (no `<script>` tags; Booqable adds them):

```
Booqable.loadScript('https://scooter-finder.vercel.app/popup.js');
```

To control where the floating button appears, put this line *above* it:

```
window.CR_FINDER = { floating: "mobility" };  // "mobility" (default), "all" or "none"
```

Any link ending in one of the three `#find-my-...` endings opens that finder as an overlay, so the visitor never leaves the site. Without the script the same link still works, opening the finder as its own page.

## Changing the scooter finder (`index.html`)

The fleet is the `SCOOTERS` array near the top of the script. One entry per scooter:

```
{ id:"EXP", name:"SuperHandy Explorer 16-mile", url:SITE+"/products/superhandy-explorer",
  maxKg:160, maxLabel:"160 kg (353 lb)", folds:true, range:"Up to 16 mi", weight:"29 kg (64 lb), folds flat",
  best:"Heavy-duty weight limit that still folds for a cab or boot",
  liftable:false, cab:false, boot:true, narrow:true }
```

- `maxKg` - maximum rider weight. A scooter is offered only if it is at or above the weight band the visitor picked.
- `liftable` - light enough to carry up steps. Only the ultralights (16-20 kg).
- `folds` - folds flat rather than coming apart in pieces. Drives the wording on the result page.
- `cab` - small enough to take on a train.
- `boot` - fits an Uber, minicab or car boot.
- `narrow` - fits a small, older lift.

`RULES` turns the answers into hard yes/no filters. `POINTS` ranks whatever survives, under `distance`, `priority`, `transport` and `access`. Highest score wins; ties go to the order of the `SCOOTERS` array.

If nothing passes the hard rules, the finder does not dead-end. It shows the closest option with a plain warning about what will not work and asks the visitor to WhatsApp first.

## Changing the wheelchair and stroller finders

These two are built differently from the scooter finder. Products live in a `P` object keyed by a short code, and the arrays below it (`SINGLES` and friends) say which codes belong in which group:

```
AERPLUS: { id:"AERPLUS", name:"Joolz AER+", url:"/products/joolz-aer-stroller", kg:22,
  best:"The lightest stroller we hire, from 6 months",
  specs:[["Child weight","6 months to 22 kg"],["Stroller weight","5 kg"],["Fold","One hand, one second"]],
  tags:{ light:3, fold:3, tube:3, cab:2, newborn:-5 } }
```

Adding a product means two edits: the entry in `P`, and its code in the right group array. Miss the second and it will never be recommended.

## Things that have caught us out

**Tags are scores, not filters.** In the stroller and wheelchair finders a tag adds points; it does not rule anything in or out. Leaving off `newborn` does **not** stop a stroller being recommended for a newborn. To genuinely exclude something, give it a negative weight, as the Joolz AER+ has: its seat unit is rated from 6 months, so `newborn:-5` keeps it out of newborn results.

**Check the claims in `best` against the rest of the fleet.** Adding the 5 kg AER+ made the Ickle Bubba Aries' "lightest stroller we rent" untrue, and two entries claimed the same thing.

**The finders do not know what is in stock.** They recommend by model, with no idea whether a unit is free on those dates. The visitor only finds out at the Booqable date picker.

**They drift from the real fleet.** The fleet here is a hardcoded copy. The Lightweight 6-mile sat in the scooter finder after it stopped being offered, and the Joolz AER+ and Maxi-Cosi Fame were on the website for a while before the stroller finder knew about them. Worth checking against the live collection pages every so often.

## After any change

Walk every answer path before committing, not just the one you changed. A weight limit or a tag can quietly make a product unreachable, or make one product the answer to almost everything. Check that every item can still come out top for at least one set of answers, and open the result page to read the wording it produces.

## Analytics

The pop-out sends `scooter_finder_open`, `scooter_finder_result` and `scooter_finder_book_click`. Note that none of the three finder pages load an analytics tag themselves, so confirm these events actually arrive before relying on them.
