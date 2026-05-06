# Tytus Brzozowski — image prompts for the middle placeholders

Three middle-section illustrations to generate. The page already uses your two real images — Koneser daytime at the top, Brzeska night at the bottom. These middle pieces sit at golden-hour, dusk, and twilight in the page's time-progression. The colour temperature of each prompt matches where it appears on the scroll.

## STYLE LOCK (paste verbatim into every prompt)

> Watercolour painting in the exact style of Polish architectural illustrator Tytus Brzozowski (his Warsaw / Praga / Szmulki series). Translucent washes, wet-on-wet pigment bleeds, visible cold-press paper grain. Buildings rendered with delicate ink-line skeletons under loose colour washes — slightly crooked perspective, kamienice and churches stacked on thin pillars or floating against open sky. Drifting cumulus clouds. Tiny silhouetted human figures in colourful jackets — yellow ochre (#E9B13A), brick red (#C33718), purple (#5A3A6E), cobalt (#1F4E8C) — walking along cornices, rooftops, ledges; some standing beside small coloured rings (yellow, red, cyan) which fall slowly through the sky. Architecture palette: warm yellow ochre, brick red, cobalt blue accents on a wall, leaf green from courtyard trees, terracotta, cream stucco. NO photorealism, NO 3D, NO neon, NO clean vector look, NO heavy outlines. The image must feel hand-painted on cold-press watercolour paper.

---

## #1 — `images/middle-1.png` — Jamnik z lotu ptaka (golden hour, 1200 × 720)

> [STYLE LOCK]
>
> A long horizontal watercolour of "Jamnik" — Warsaw's longest residential building, 508 metres long, at ul. Kijowska 11 in Praga-Północ — depicted as one continuous slim concrete-grey slab stretching the full width of the frame, floating in late-afternoon golden-hour sky on impossibly thin painted pillars (Brzozowski's signature). Three or four rows of dozens of tiny windows along the slab, some lit warm yellow, most cobalt or empty. Loose watercolour washes for the building body — grey-violet shadows on one side, warm honey light on the other. Tiny silhouetted figures (yellow, red, purple, cobalt jackets) walk along the long roofline; a few stand on small balconies; two or three coloured rings fall slowly through the sky beside the building. In the distance, the brick twin towers of Bazylika Najświętszego Serca and the green-domed silhouette of Sobór św. Marii Magdaleny rise from clouds. A few small green trees grow from below, leaves rendered as loose wet-on-wet leaf-green dabs. Sky is warm cumulus, lit by low golden sun.

## #2 — `images/middle-2.png` — Stos kamienic Szmulek (dusk peach, 1000 × 720)

> [STYLE LOCK]
>
> A vertical-stacked composition in the style of Brzozowski's "Szmulki" mural: warm-yellow tenement, brick-red kamienica, cobalt-blue mural wall, green-domed Sobór św. Marii Magdaleny, the ochre-brick twin towers of Bazylika Najświętszego Serca on Kawęczyńska, a small terracotta turret-house — all stacked vertically and floating on thin painted pillars against a peach-pink dusk sky with mauve clouds. Tiny silhouetted figures in yellow / red / purple / cobalt jackets walk along the cornices and rooftops, some falling between buildings with coloured rings around them. Loose watercolour washes, ink-line skeletons under the colour, courtyard greenery sprouting from balconies. The light is warm sunset peach turning to mauve at the top.

## #3 — `images/middle-3.png` — Kapliczka i kapibara w bramie (twilight blue, 900 × 900)

> [STYLE LOCK]
>
> A square watercolour vignette set in twilight — deep blue-violet sky behind, last warm light fading. A Praga courtyard kapliczka (Marian shrine) inside a wrought-iron cage attached to a peeling-ochre tenement wall. The shrine has a small cream Madonna figure inside, surrounded by plastic flowers — pink, red, white — with a string of fairy lights wrapped around the cage glowing warm yellow against the violet evening, and a single lit candle in a red glass cup at the base. Green ivy climbs one side of the wall. The same brown capybara character from your reference (chunky build, friendly face, wearing the teal-purple-yellow tracksuit jacket) stands quietly in front of the kapliczka, head slightly tilted, holding a single sunflower in one paw. A black cat watches from a doorway in the background. Two tiny silhouetted figures in red and purple jackets walk past a far archway. Loose watercolour, ink contour, paper grain. The sky tells you it's late dusk.

---

## After generating

Drop each PNG at `design-previews/images/middle-1.png` (etc.). The placeholders in `parapetowka.html` show exactly where they go — replace each `<div class="ph">…</div>` with `<img src="images/middle-N.png" alt="…">` and the layout will continue to work.
