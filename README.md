# relevantwine.github.io

Static website for **Relevant Games** (on Google Play as RelevantWine), a one-person studio making Android games with Godot.
Served at https://relevantgames.fr (custom domain, `CNAME` on the GitHub repo).

## Structure

- `index.html`: the studio page. Masthead with the animated logo, then one section per game, each in that game's own look (Bendy Fenders, Satisfying Circles Deluxe, Sliding Penguins), house rules, contact.
- `privacy-policy.html`: the privacy policy for all the games. Play Console and AdMob link to this exact URL, so don't rename it.
- `app-ads.txt`: AdMob publisher line. AdMob reads it at the site root. Don't edit it.
- `style.css`: shared styles. The palette and fonts (Barlow, Barlow Condensed) are the studio logo's.
- `circles.js`: the small spinning-rings toy in the Circles section.
- `img/`: screenshots and icons (WebP, about 480px wide), `og.png` share card.

## Adding a game

1. Copy one of the `<section class="game ...">` blocks in `index.html`, then add a line to the `.shelf` list in the masthead.
2. Put 2 or 3 phone screenshots and a 256px icon in `img/` as WebP.
3. Add the game's section to `privacy-policy.html` (ads, purchases, what is stored) and bump "Last updated".

## Deployment

Hosted with GitHub Pages. Pushes to `main` are deployed automatically.
